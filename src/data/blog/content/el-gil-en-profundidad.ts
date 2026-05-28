export const content = `
## Introducción

El GIL (Global Interpreter Lock) es probablemente el aspecto más controvertido de CPython. Es un mutex que protege el acceso a los objetos Python, asegurando que solo un hilo ejecute bytecode a la vez. Sin él, las estructuras internas de CPython se corromperían por accesos concurrentes.

En este artículo vamos a explorar el GIL en detalle: qué protege exactamente, cómo afecta al rendimiento, qué alternativas existen y hacia dónde se dirige.

## ¿Qué protege el GIL?

El GIL protege:

1. **El contador de referencias**: Si dos hilos modifican \`ob_refcnt\` simultáneamente, el contador se corrompe y los objetos se liberan antes de tiempo o nunca.

2. **Las estructuras internas**: Listas, diccionarios, conjuntos y otros tipos internos no son thread-safe sin el GIL.

3. **El estado global del intérprete**: El GC generacional, el caché de objetos pequeños y otras estructuras globales.

## ¿Qué NO protege el GIL?

Es importante entender que el GIL no protege tu código Python. Si dos hilos acceden a la misma variable sin sincronización, puedes tener race conditions a nivel de tu aplicación. El GIL solo protege las estructuras internas de CPython.

\`\`\`python
import threading

contador = 0

def incrementar():
    global contador
    for _ in range(100000):
        contador += 1  # Esto NO es atómico

hilos = [threading.Thread(target=incrementar) for _ in range(10)]
for h in hilos: h.start()
for h in hilos: h.join()

print(contador)  # No será 1000000
\`\`\`

## Impacto en el rendimiento

### CPU-bound

Para tareas intensivas en CPU, el GIL es un cuello de botella severo. Sin GIL, \`n\` hilos podrían ejecutar \`n×\` operaciones en paralelo. Con GIL, solo un hilo ejecuta a la vez, y los otros esperan.

### I/O-bound

Para tareas de I/O (lectura de archivos, requests HTTP, consultas a BD), el GIL se libera durante la operación de I/O. Esto significa que los hilos pueden solaparse eficientemente: mientras un hilo espera I/O, otro hilo ejecuta CPU.

\`\`\`python
import threading
import time

def io_task():
    time.sleep(1)  # I/O: el GIL se libera

def cpu_task():
    sum(i * i for i in range(10**7))  # CPU: el GIL bloquea

# I/O-bound: 10 hilos en ~1 segundo (casi perfecto)
hilos_io = [threading.Thread(target=io_task) for _ in range(10)]
start = time.time()
for h in hilos_io: h.start()
for h in hilos_io: h.join()
print(f"I/O: {time.time() - start:.2f}s")

# CPU-bound: 10 hilos ocupados compitiendo por el GIL
hilos_cpu = [threading.Thread(target=cpu_task) for _ in range(10)]
start = time.time()
for h in hilos_cpu: h.start()
for h in hilos_cpu: h.join()
print(f"CPU: {time.time() - start:.2f}s")
\`\`\`

## Estrategias para mitigar el GIL

### multiprocessing

Cada proceso tiene su propio GIL. \`multiprocessing\` evita el GIL completamente:

\`\`\`python
from multiprocessing import Pool

def tarea_cpu(n):
    return sum(i * i for i in range(n))

with Pool(4) as p:
    resultados = p.map(tarea_cpu, [10**7] * 4)
\`\`\`

### Hilos en extensiones C

Las extensiones C pueden liberar el GIL explícitamente cuando ejecutan código que no necesita acceso a objetos Python:

\`\`\`c
Py_BEGIN_ALLOW_THREADS
// Código C que no toca objetos Python
resultado = computacion_intensiva(datos);
Py_END_ALLOW_THREADS
\`\`\`

Esto es lo que hacen numpy, pandas y otras bibliotecas numéricas para lograr paralelismo real.

### asyncio

Para I/O, asyncio es más eficiente que hilos porque usa cooperación en lugar de concurrencia preventiva. No hay GIL porque todo ocurre en un solo hilo.

### free-threaded Python (3.13+)

Python 3.13 introdujo un modo experimental "free-threaded" (sin GIL) como característica opcional. Se activa con el flag \`--disable-gil\` al compilar. En este modo:

- Los hilos pueden ejecutar bytecode en paralelo real
- El contador de referencias se protege con técnicas más finas (biased reference counting)
- Hay overhead adicional para operaciones de un solo hilo (5-10%)

## Conclusión

El GIL no es el demonio que muchos pintan. Para aplicaciones I/O-bound (la mayoría de backends web), el impacto es mínimo. Para CPU-bound, hay alternativas maduras (multiprocessing, extensiones C, asyncio).

El futuro free-threaded de Python 3.13+ promete eliminar el GIL completamente, pero el camino es largo. Mientras tanto, entender el GIL te ayuda a tomar mejores decisiones de arquitectura.
`;