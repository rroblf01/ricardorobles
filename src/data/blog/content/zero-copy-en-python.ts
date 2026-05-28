export const content = `
## Introducción

Cuando trabajas con datos grandes en Python, una de las fuentes más comunes de ineficiencia son las copias innecesarias de datos. Cada vez que conviertes un \`bytes\` a \`bytearray\`, haces un slice de una lista grande, o concatenas strings en un bucle, estás copiando memoria que podría evitarse.

Zero-copy es un conjunto de técnicas que permiten manipular datos sin copiarlos, compartiendo buffers de memoria subyacentes. En Python, el protocolo de búfer y \`memoryview\` son las herramientas clave.

## El protocolo de búfer

El protocolo de búfer permite que diferentes objetos Python compartan acceso a la misma zona de memoria sin copiar datos. Un objeto que implementa el protocolo expone su memoria interna de forma segura.

### Objetos que lo implementan

\`\`\`python
# bytes, bytearray, array.array, numpy.ndarray
# memoryview envuelve cualquiera de estos

data = bytearray(b"Hello, World!")
view = memoryview(data)
print(view.nbytes)  # 13
print(view.readonly)  # False (bytearray es mutable)
\`\`\`

### El problema de los slices

En Python, un slice de una lista crea una COPIA:

\`\`\`python
lista_grande = list(range(10**7))
sublista = lista_grande[500:600]  # Copia 100 elementos
\`\`\`

Con memoryview, los slices NO copian:

\`\`\`python
import array
datos = array.array('i', range(10**7))
view = memoryview(datos)
subview = view[500:600]  # Sin copia, comparte memoria
print(subview.nbytes)  # 400 bytes (100 ints × 4)
\`\`\`

## memoryview en acción

### Concatenación eficiente

Mal: concatenar bytes repetidamente crea nuevas copias:

\`\`\`python
partes = [b"hola", b" ", b"mundo"]
resultado = b""
for parte in partes:
    resultado += parte  # Copia todo cada iteración → O(n²)
\`\`\`

Bien: preasignar con bytearray:

\`\`\`python
partes = [b"hola", b" ", b"mundo"]
total = sum(len(p) for p in partes)
buf = bytearray(total)
pos = 0
for parte in partes:
    buf[pos:pos + len(parte)] = parte
    pos += len(parte)
\`\`\`

O mejor: memoryview para escribir directamente:

\`\`\`python
total = sum(len(p) for p in partes)
buf = bytearray(total)
view = memoryview(buf)
pos = 0
for parte in partes:
    n = len(parte)
    view[pos:pos + n] = parte
    pos += n
\`\`\`

### Casting de tipos sin copia

\`\`\`python
import struct

data = bytearray(b"\\x01\\x00\\x00\\x00\\x02\\x00\\x00\\x00")
view = memoryview(data)

# Interpretar los mismos bytes como enteros de 32 bits
ints = view.cast('I')  # 'I' = unsigned int 32 bits
print(ints[0])  # 1
print(ints[1])  # 2
\`\`\`

## numpy y zero-copy

numpy usa el protocolo de búfer extensivamente. Puedes crear arrays numpy sin copiar datos:

\`\`\`python
import numpy as np
from array import array

datos = array('d', range(10**6))  # double precision floats

# Crear array numpy SIN copiar
arr = np.frombuffer(datos, dtype=np.float64)

# Modificar datos afecta a ambos
datos[0] = 999.0
print(arr[0])  # 999.0 (misma memoria)
\`\`\`

## Serialización zero-copy

Con pickle 5+ y el protocolo de búfer, puedes serializar objetos grandes sin copiar:

\`\`\`python
import pickle

# Protocolo 5 soporta out-of-band data
data = bytearray(10**8)  # 100 MB
buffers = []
pickle.dumps(data, protocol=5, buffer_callback=buffers.append)
# Los datos grandes viajan como buffers separados sin copia
\`\`\`

### Zero-copy en redes

\`\`\`python
import socket
import array

# Enviar datos sin copiar al socket
datos = array.array('i', range(100000))
sock = socket.socket()
sock.sendall(memoryview(datos))
\`\`\`

## El nuevo protocolo \`__buffer__\`

Python 3.12+ introdujo el protocolo \`__buffer__\` que permite a clases Python exponer su buffer interno de forma estándar:

\`\`\`python
class MiBuffer:
    def __buffer__(self, flags):
        # Crear y devolver un Py_buffer
        ...
\`\`\`

Esto permite que cualquier clase Python participe en operaciones zero-copy con memoryview, numpy, sockets, etc.

## Benchmark

\`\`\`python
import time
import array

# Sin zero-copy: 100 slices copiando
data = list(range(10**6))
start = time.perf_counter()
for i in range(1000):
    _ = data[i*100:(i+1)*100]  # Copia 100 elementos
print(f"Con copia: {time.perf_counter() - start:.3f}s")

# Con zero-copy (memoryview)
data_arr = array.array('i', range(10**6))
view = memoryview(data_arr)
start = time.perf_counter()
for i in range(1000):
    _ = view[i*100:(i+1)*100]  # Sin copia
print(f"Zero-copy: {time.perf_counter() - start:.3f}s")
\`\`\`

Resultado típico: 10-50x más rápido con zero-copy para operaciones de slicing repetido.

## Conclusión

Zero-copy no es magia: es compartir buffers de memoria en lugar de duplicarlos. \`memoryview\`, el protocolo de búfer, y las técnicas de preasignación son las herramientas clave.

¿Cuándo usarlas? Siempre que trabajes con datos grandes (>1 MB) y hagas operaciones de slicing, concatenación o transformación de tipos. En esos casos, zero-copy puede ser la diferencia entre 100ms y 2s.
`;