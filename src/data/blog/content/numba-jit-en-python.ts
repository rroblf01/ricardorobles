export const content = `
## Introducción

Python puro es lento para bucles numéricos. Un bucle que procesa un millón de elementos puede tardar segundos en Python puro cuando en C sería milisegundos. Numba resuelve este problema: es un compilador JIT (Just-In-Time) que convierte funciones Python decoradas en código máquina optimizado.

Numba está construido sobre LLVM, el mismo backend de compilación que usan Rust, Swift y Julia. Toma tu función Python, la analiza, infiere tipos, y genera código nativo optimizado.

En este artículo voy a explicar cómo usar Numba para acelerar algoritmos numéricos sin salir del ecosistema Python.

## Cómo funciona Numba

### JIT decoration

\`\`\`python
from numba import jit
import numpy as np

@jit(nopython=True)
def suma_cuadrados(arr):
    total = 0.0
    for i in range(len(arr)):
        total += arr[i] ** 2
    return total

arr = np.random.rand(10**7)
resultado = suma_cuadrados(arr)
\`\`\`

El decorador \`@jit(nopython=True)\` indica a Numba que compile la función sin recurrir al intérprete Python ("nopython mode"). Si no puede compilar algo, lanza un error en lugar de caer en modo objeto (lento).

### Compilación diferida

La primera vez que llamas a la función, Numba compila en el momento. Las siguientes llamadas usan el código compilado:

\`\`\`python
# Primera llamada: compila (~1s)
resultado = suma_cuadrados(arr)

# Llamadas siguientes: código nativo (~5ms)
resultado = suma_cuadrados(arr)
\`\`\`

### Inferencia de tipos

Numba infiere los tipos de los argumentos y las variables en tiempo de compilación. Si llamas a la función con diferentes tipos, compila versiones separadas:

\`\`\`python
suma_cuadrados(np.random.rand(10**6).astype(np.float32))  # Compila para float32
suma_cuadrados(np.random.rand(10**6).astype(np.float64))  # Compila para float64
\`\`\`

## Rendimiento

Comparación de la función \`suma_cuadrados\`:

| Implementación | Tiempo (10⁷ elementos) | Speedup |
|---------------|----------------------|---------|
| Python puro | 1.2s | 1x |
| numpy (vectorizado) | 0.03s | 40x |
| Numba @jit | 0.02s | 60x |
| Cython | 0.025s | 48x |

Numba compite directamente con Cython y supera a numpy vectorizado en muchos casos porque evita la creación de arrays temporales.

## Características avanzadas

### Funciones universales (ufuncs)

\`\`\`python
from numba import vectorize

@vectorize(['float64(float64, float64)'])
def funcion_especial(x, y):
    return x ** 2 + y ** 2 + x * y

# Se aplica a arrays completos como una ufunc de numpy
resultado = funcion_especial(arr1, arr2)
\`\`\`

### Paralelización automática

\`\`\`python
from numba import njit, prange

@njit(parallel=True)
def suma_paralela(arr):
    total = 0.0
    for i in prange(len(arr)):
        total += arr[i] ** 2
    return total
\`\`\`

\`prange\` distribuye las iteraciones entre múltiples hilos. Para operaciones CPU-bound, el speedup es casi lineal con el número de cores.

### CUDA (GPU)

\`\`\`python
from numba import cuda

@cuda.jit
def kernel_gpu(arr):
    idx = cuda.grid(1)
    if idx < arr.size:
        arr[idx] = arr[idx] ** 2
\`\`\`

## Limitaciones

### Qué NO soporta Numba

- La mayoría de la stdlib de Python
- Clases de Python (a menos que sean @jitclass)
- Funciones que crean objetos Python dinámicamente
- Manejo de errores complejo
- Tipos de datos arbitrarios

### Cuándo NO usar Numba

- Cuando el cuello de botella no es CPU
- Cuando la función es demasiado simple (el overhead de llamada domina)
- Cuando dependes de bibliotecas no soportadas

## Estrategia de uso

1. **Identifica el cuello de botella**: Usa cProfile o py-spy
2. **Aísla la función**: Extrae el bucle crítico a una función independiente
3. **Añade @jit**: Empieza con \`@jit(nopython=True)\` 
4. **Benchmark**: Compara antes y después
5. **Optimiza gradualmente**: Añade parallel=True, ajusta tipos, elimina overhead

### Ejemplo: procesamiento de imágenes

\`\`\`python
import numpy as np
from numba import njit

@njit(parallel=True)
def filtro_mediana(imagen, tamaño_ventana=3):
    alto, ancho = imagen.shape
    resultado = np.zeros_like(imagen)
    margen = tamaño_ventana // 2
    for y in prange(margen, alto - margen):
        for x in range(margen, ancho - margen):
            ventana = imagen[y-margen:y+margen+1, x-margen:x+margen+1]
            resultado[y, x] = np.median(ventana)
    return resultado

# 10x más rápido que Python puro
imagen = np.random.rand(1024, 1024).astype(np.float32)
resultado = filtro_mediana(imagen)
\`\`\`

## Conclusión

Numba es la herramienta más sencilla para acelerar código numérico en Python. A diferencia de Cython (requiere compilación manual) o PyO3 (requiere Rust), Numba solo necesita un decorador.

Mi recomendación: perfila primero, aísla el cuello de botella, aplica Numba. Para bucles numéricos intensivos, el speedup típico es de 10-100x. Si necesitas más control, migra a Cython o PyO3.
`;