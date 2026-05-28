export const content = `
## Introducción

Python es lento para ciertas tareas. Es un hecho. Pero no tienes que resignarte: puedes escribir extensiones nativas en Rust, Cython o Zig y llamarlas desde Python como si fueran módulos normales.

La diferencia de rendimiento puede ser de 10x a 100x en código numérico intensivo.

## Rust con PyO3

PyO3 permite escribir extensiones Python en Rust con una sintaxis limpia.

\`\`\`rust
// Cargo.toml
// [lib]
// name = "mi_extension"
// crate-type = ["cdylib"]
// 
// [dependencies]
// pyo3 = { version = "0.21", features = ["extension-module"] }

use pyo3::prelude::*;

#[pyfunction]
fn fibonacci(n: u64) -> u64 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[pymodule]
fn mi_extension(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(fibonacci, m)?)?;
    Ok(())
}
\`\`\`

\`\`\`bash
# Build con maturin
pip install maturin
maturin develop  # build e instalar en el entorno actual
\`\`\`

\`\`\`python
# Uso desde Python
from mi_extension import fibonacci
print(fibonacci(40))  # ~0.2s vs ~30s en Python puro
\`\`\`

## Cython

Cython compila Python a C.

\`\`\`cython
# fib.pyx
def fibonacci(int n):
    cdef int i
    cdef long long a = 0, b = 1, temp
    if n == 0:
        return 0
    for i in range(2, n + 1):
        temp = a + b
        a = b
        b = temp
    return b
\`\`\`

\`\`\`bash
# setup.py
from setuptools import setup
from Cython.Build import cythonize

setup(ext_modules=cythonize("fib.pyx"))
\`\`\`

\`\`\`python
# Uso
from fib import fibonacci
print(fibonacci(40))
\`\`\`

## Zig

Zig es un lenguaje moderno que puede compilar a bibliotecas C compatibles con Python.

\`\`\`zig
// fib.zig
export fn fibonacci(n: u64) u64 {
    if (n <= 1) return n;
    var a: u64 = 0;
    var b: u64 = 1;
    for (0..n-1) |_| {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
\`\`\`

\`\`\`bash
zig build-lib fib.zig -dynamic
\`\`\`

\`\`\`python
import ctypes
lib = ctypes.CDLL("./libfib.so")
lib.fibonacci.restype = ctypes.c_uint64
print(lib.fibonacci(40))
\`\`\`

## ¿Cuándo usar cuál?

| Criterio | Rust/PyO3 | Cython | Zig/ctypes |
|----------|-----------|--------|------------|
| Curva de aprendizaje | Media-Alta | Baja | Alta |
| Rendimiento | Excelente | Muy bueno | Excelente |
| Seguridad de memoria | Garantizada | Manual | Manual |
| Ecosistema | PyO3 maduro | Maduro | Básico |
| Debugging | Bueno | Complejo | Bueno |

## Conclusión

Las tres opciones funcionan. Mi recomendación:
- **PyO3** para extensiones nuevas (seguridad de memoria, ecosistema activo)
- **Cython** para acelerar código Python existente (mínimo cambio)
- **Zig** para proyectos donde ya usas Zig o necesitas control total
`;