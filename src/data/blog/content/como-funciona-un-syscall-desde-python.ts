export const content = `
## Introducción

Cuando ejecutas \`open("archivo.txt").read()\` en Python, no solo ocurre lo que ves en tu código. Detrás de escena, Python hace una llamada al sistema (syscall) que atraviesa capas del kernel, maneja buffers, cambia el estado del proceso y vuelve. Entender este camino es clave para escribir código de I/O eficiente.

En este artículo vamos a seguir el rastro de una operación de I/O desde tu función Python hasta el kernel de Linux.

## La traza de un read()

### En Python

\`\`\`python
with open("datos.txt", "rb") as f:
    data = f.read(4096)
\`\`\`

### La syscall

\`\`\`python
# Aproximadamente, CPython hace:
import os
fd = os.open("datos.txt", os.O_RDONLY)
buf = os.read(fd, 4096)
os.close(fd)
\`\`\`

Cada una de esas funciones C que CPython llama internamente (open, read, close) invoca un syscall.

### En el kernel

Cuando el kernel recibe la syscall \`read(fd, buf, 4096)\`:

1. **Modo de usuario → modo kernel**: La CPU cambia de modo, guarda el contexto
2. **Verificación de permisos**: ¿El proceso tiene permiso para leer el archivo?
3. **Resolución de ruta**: Si no está en caché, recorre el filesystem
4. **Page cache**: ¿Los datos ya están en caché? Si no, lectura de disco
5. **DMA**: Si es necesario, el controlador DMA copia datos del disco a RAM
6. **Copia a usuarios**: Copia los datos del buffer del kernel al buffer de usuario
7. **Retorno**: Vuelve a modo usuario con los datos

Cada paso tiene coste. La parte más cara es el cambio de modo (user→kernel→user).

## El coste de las syscalls

Medir el coste de una syscall vacía:

\`\`\`bash
perf stat -e cycles,instructions,cache-misses \\
    python -c "import os; [os.getpid() for _ in range(100000)]"
\`\`\`

En un sistema moderno, una syscall cuesta aproximadamente 100-200ns más el overhead del cambio de contexto. Para I/O de disco, el tiempo de la syscall es despreciable comparado con la latencia del disco.

## epoll: I/O sin bloqueo

El problema con el modelo síncrono es que mientras esperas un \`read\`, todo tu proceso (o hilo) está bloqueado. Para manejar múltiples conexiones, nació \`epoll\`.

### Cómo funciona epoll

\`\`\`python
import select
import socket

# Crear un socket no bloqueante
sock = socket.socket()
sock.setblocking(False)
sock.bind(('0.0.0.0', 8000))
sock.listen()

# Crear epoll
epoll = select.epoll()
epoll.register(sock.fileno(), select.EPOLLIN)

while True:
    events = epoll.poll(timeout=1)
    for fd, event in events:
        if fd == sock.fileno():
            conn, addr = sock.accept()
            conn.setblocking(False)
            epoll.register(conn.fileno(), select.EPOLLIN)
        else:
            data = fd.read(4096)
\`\`\`

epoll te dice qué file descriptors están listos para leer/escribir SIN BLOQUEAR. En lugar de 10,000 syscalls bloqueantes, haces una llamada a \`epoll_wait\` que te devuelve solo los FDs listos.

### Edge-triggered vs Level-triggered

- **Level-triggered** (por defecto): epoll te notifica mientras el FD tenga datos
- **Edge-triggered**: epoll te notifica solo cuando hay datos NUEVOS. Más eficiente pero requiere leer todo de golpe.

## asyncio y la loop de eventos

asyncio en Python 3.4+ usa epoll (o kqueue en macOS, IOCP en Windows) internamente:

\`\`\`python
import asyncio

async def servidor():
    reader, writer = await asyncio.open_connection('localhost', 8000)
    writer.write(b"hola")
    data = await reader.read(100)
    writer.close()
\`\`\`

asyncio.Future, await, async def... todo se reduce a epoll en el fondo. La loop de eventos llama a \`epoll.poll()\`, y cuando un socket está listo, reanuda la corrutina que estaba esperando.

## sendfile: zero-copy en el kernel

Una optimización importante para servidores de archivos: \`sendfile\` copia datos de un file descriptor a otro socket directamente en el kernel, sin pasar por el espacio de usuario:

\`\`\`python
import os

# Sin sendfile: datos viajan disco→kernel→user→kernel→red
with open("video.mp4", "rb") as f:
    while chunk := f.read(65536):
        sock.send(chunk)

# Con sendfile: datos viajan disco→kernel→red (zero-copy)
os.sendfile(sock.fileno(), fd.fileno(), offset, count)
\`\`\`

sendfile reduce las copias de memoria de 4 a 2 y elimina el cambio de contexto innecesario.

## Buffers y tuning

El kernel tiene buffers configurables:

\`\`\`bash
# Tamaño máximo del buffer de socket
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216

# Tamaño del buffer de pipe
sysctl -w fs.pipe-max-size=1048576
\`\`\`

En Python:

\`\`\`python
# Tamaño del buffer de lectura
sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 65536)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 65536)
\`\`\`

## Conclusión

Cada operación de I/O en Python es una travesía que atraviesa capas del kernel. Entender este camino te permite optimizar donde realmente importa:

- Usa buffers grandes (64KB+ para lecturas de disco)
- Prefiere I/O asíncrona para alta concurrencia
- Usa sendfile para servir archivos
- Configura los buffers del kernel para tu carga de trabajo

La regla de oro: cada copia de datos y cada cambio de contexto tienen coste. Minimízalos.
`;