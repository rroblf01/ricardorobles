export const content = `
## Introducción

Tu CPU tiene una jerarquía de memoria: registros → L1 → L2 → L3 → RAM → disco. Cada nivel es más grande pero más lento. Acceder a L1 cuesta ~1ns, a RAM ~100ns, a disco ~10ms. La diferencia entre un acierto en L1 y un fallo que va a RAM puede ser de 10-50 ciclos de CPU.

El código que es "cache-friendly" organiza el acceso a datos para maximizar aciertos en los niveles superiores de caché. En lenguajes de alto nivel como Python no tienes control directo sobre la caché, pero entender cómo funciona te ayuda a escribir código que se comporte bien.

## Jerarquía de caché

En un procesador moderno (ej. AMD Zen 4):

| Nivel | Tamaño | Latencia | Asociatividad |
|-------|--------|----------|--------------|
| L1 (datos) | 32 KB | ~1ns (4 ciclos) | 8-way |
| L1 (instrucciones) | 32 KB | ~1ns | 8-way |
| L2 | 1 MB | ~4ns (14 ciclos) | 8-way |
| L3 | 32 MB | ~14ns (45 ciclos) | 16-way |
| RAM | 32 GB+ | ~100ns | - |

### Líneas de caché

La unidad mínima de transferencia entre RAM y caché es una "cache line": 64 bytes. Cuando accedes a una variable, la CPU carga los 64 bytes que la contienen. Acceder a datos cercanos (misma línea) es gratis después de la primera carga.

## Implicaciones para Python

### Listas vs arrays densos

En Python puro, las listas son arrays de punteros a objetos PyObject. Cada elemento implica una indirección:

\`\`\`python
lista = [1, 2, 3, 4, 5]
# En memoria: [ptr_to_obj1, ptr_to_obj2, ...]
# Los enteros están en ubicaciones dispersas del heap
\`\`\`

Con numpy, los datos son contiguos en memoria:

\`\`\`python
import numpy as np
arr = np.array([1, 2, 3, 4, 5], dtype=np.int64)
# En memoria: [1, 2, 3, 4, 5] contiguo
\`\`\`

La diferencia de rendimiento entre recorrer una lista de Python y un array de numpy no es solo por C vs Python: también es por el patrón de acceso a memoria.

### Acceso por filas vs columnas

En una matriz 2D almacenada en orden row-major (C-order, el de numpy por defecto):

\`\`\`python
matriz = np.random.rand(10000, 10000)

# Bueno: accede por filas (contiguo en memoria)
for i in range(10000):
    for j in range(10000):
        _ = matriz[i, j]

# Malo: accede por columnas (saltos grandes)
for j in range(10000):
    for i in range(10000):
        _ = matriz[i, j]
\`\`\`

El segundo bucle es 10-50x más lento porque cada acceso salta 80000 bytes (10000 × 8), destruyendo la localidad espacial.

### False sharing

Cuando dos hilos modifican variables que están en la misma cache line, el hardware invalida la línea en ambos cores, causando que tengan que recargarla constantemente:

\`\`\`python
import threading
import numpy as np

# Dos contadores que pueden compartir cache line
contadores = np.zeros(2, dtype=np.int64)

def inc(i):
    for _ in range(10**7):
        contadores[i] += 1  # False sharing si están en misma línea

t1 = threading.Thread(target=inc, args=(0,))
t2 = threading.Thread(target=inc, args=(1,))
\`\`\`

La solución: separar los contadores con suficiente espacio (más de 64 bytes) para que estén en diferentes cache lines. numpy facilita esto: \`np.zeros(2, dtype=np.int64)\` con padding.

## Cómo escribir código cache-friendly

### 1. Acceso secuencial

\`\`\`python
# Bueno: acceso secuencial (prefetch funciona)
for v in array:
    procesar(v)

# Malo: saltos aleatorios
for idx in indices_aleatorios:
    procesar(array[idx])
\`\`\`

### 2. Bloquear operaciones

Para operaciones que exceden la caché L2/L3, divide los datos en bloques:

\`\`\`python
def multiplicacion_bloques(A, B, tam_bloque=256):
    n = A.shape[0]
    C = np.zeros((n, n))
    for i in range(0, n, tam_bloque):
        for j in range(0, n, tam_bloque):
            for k in range(0, n, tam_bloque):
                C[i:i+tam_bloque, j:j+tam_bloque] += \\
                    A[i:i+tam_bloque, k:k+tam_bloque] @ \\
                    B[k:k+tam_bloque, j:j+tam_bloque]
    return C
\`\`\`

Cada bloque cabe en L2 → reduce los fallos de caché drásticamente.

### 3. Estructuras de datos compactas

\`\`\`python
# Malo: objetos dispersos en memoria
class Punto:
    def __init__(self, x, y):
        self.x = x
        self.y = y
puntos = [Punto(i, i*2) for i in range(10**6)]

# Bueno: arrays paralelos contiguos
xs = np.arange(10**6, dtype=np.float64)
ys = np.arange(10**6, dtype=np.float64) * 2
\`\`\`

### 4. Prefetching

La CPU tiene instrucciones de prefetch que cargan datos antes de que se necesiten. numpy y Numba las usan automáticamente para acceso secuencial.

## Medir fallos de caché

\`\`\`bash
# Con perf
perf stat -e cache-misses,cache-references python app.py

# Cache misses por kilociclo
perf stat -e cache-misses,cycles python app.py
\`\`\`

Una tasa de miss superior al 5-10% indica que tu código no es cache-friendly.

\`\`\`python
# Desde Python (con PMU disponible)
import os

def get_cache_misses():
    with open('/sys/devices/cpu/events/cache-misses', 'r') as f:
        event = f.read().strip()
    os.system(f'perf stat -e {event} python -c "..."')
\`\`\`

## Conclusión

La caché de la CPU es invisible desde Python, pero sus efectos son medibles. Un código que accede a memoria secuencialmente, usa arrays contiguos (numpy) y evita accesos aleatorios puede ser 10-100x más rápido que uno que no.

Para backends Python, la lección práctica: usa numpy para datos grandes, prefiere acceso secuencial, evita objetos dispersos, y mide los fallos de caché cuando sospeches de rendimiento subóptimo.
`;