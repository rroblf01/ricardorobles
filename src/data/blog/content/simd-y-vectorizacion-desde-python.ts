export const content = `
## Introducción

Tu CPU no ejecuta una instrucción a la vez. Los procesadores modernos tienen unidades SIMD (Single Instruction, Multiple Data) que pueden operar sobre múltiples datos con una sola instrucción. AVX-512 puede procesar 16 operaciones de 32 bits simultáneamente.

Aprovechar SIMD desde Python no es directo (Python es interpretado), pero hay caminos: numpy usa SIMD internamente, Numba puede generarlo, y puedes escribir extensiones en C/Rust que lo usen explícitamente.

## ¿Qué es SIMD?

SIMD permite paralelismo a nivel de datos. Una instrucción como \`_mm256_add_ps\` suma 8 pares de floats en un solo ciclo de CPU:

\`\`\`c
// Sin SIMD: 8 instrucciones
for (int i = 0; i < 8; i++) c[i] = a[i] + b[i];

// Con AVX2: 1 instrucción
__m256 va = _mm256_loadu_ps(a);
__m256 vb = _mm256_loadu_ps(b);
__m256 vc = _mm256_add_ps(va, vb);
_mm256_storeu_ps(c, vc);
\`\`\`

## SIMD en numpy

numpy usa SIMD extensivamente. Operaciones vectorizadas (\`arr1 + arr2\`) se traducen a bucles C optimizados que el compilador auto-vectoriza:

\`\`\`python
import numpy as np

# Esto usa SIMD internamente
a = np.random.rand(10**7).astype(np.float32)
b = np.random.rand(10**7).astype(np.float32)
c = a + b  # ~10ms, usa AVX2/AVX-512 si está disponible
\`\`\`

### Verificar qué SIMD usa numpy

\`\`\`python
import numpy as np
np.show_config()
\`\`\`

Busca líneas como \`-mavx2\`, \`-mavx512f\`, \`-mfma\`.

## SIMD con Numba

Numba puede generar código vectorizado automáticamente:

\`\`\`python
from numba import njit
import numpy as np

@njit
def suma_vectorizada(a, b):
    return a + b  # Numba puede vectorizar esto

# O explícitamente con ufunc
from numba import vectorize

@vectorize(['float32(float32, float32)'], target='parallel')
def suma_simd(x, y):
    return x + y
\`\`\`

## SIMD con Cython

Cython puede generar código SIMD si el compilador lo soporta:

\`\`\`cython
# setup.py con flags
from distutils.core import setup
from distutils.extension import Extension
from Cython.Build import cythonize

ext = Extension(
    "procesar",
    ["procesar.pyx"],
    extra_compile_args=["-mavx2", "-mfma"]
)
\`\`\`

## SIMD con PyO3 (Rust)

Rust tiene control explícito sobre SIMD mediante intrinsics o crates como \`wide\`:

\`\`\`rust
use pyo3::prelude::*;
use wide::*;

#[pyfunction]
fn suma_simd(a: Vec<f32>, b: Vec<f32>) -> Vec<f32> {
    a.chunks(8)
        .zip(b.chunks(8))
        .flat_map(|(ca, cb)| {
            let va = f32x8::from_slice_unaligned(ca);
            let vb = f32x8::from_slice_unaligned(cb);
            (va + vb).to_array()
        })
        .collect()
}
\`\`\`

Este código procesa 8 floats por instrucción, potencialmente 8x más rápido que un bucle escalar.

## Auto-vectorización

El compilador de C (GCC, Clang) puede auto-vectorizar bucles simples si se lo permites:

\`\`\`c
// GCC con -O3 -mavx2 auto-vectoriza esto
void suma(float *a, float *b, float *c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
\`\`\`

Condiciones para auto-vectorización:
- Bucles con contador simple
- Sin dependencias entre iteraciones
- Acceso a memoria contiguo
- Tipos de datos conocidos

## Cuándo SIMD ayuda y cuándo no

### Ayuda

- Operaciones aritméticas en arrays grandes
- Procesamiento de imágenes (píxeles)
- Filtros digitales, convoluciones
- Transformaciones geométricas
- Búsquedas y comparaciones

### No ayuda

- Operaciones I/O-bound
- Algoritmos con branching complejo (if/else)
- Estructuras de datos no contiguas
- Operaciones en datos pequeños (< 100 elementos)

## Conclusión

SIMD no es algo que uses directamente desde Python, pero puedes beneficiarte de él usando numpy, Numba, Cython o extensiones nativas. Para algoritmos numéricos intensivos, la ganancia típica de SIMD es de 2-8x respecto a código escalar optimizado.

Mi recomendación: empieza con numpy vectorizado (ya usa SIMD), escala a Numba si necesitas más control, y solo baja a C/Rust con SIMD explícito si los perfiles muestran que es necesario.
`;