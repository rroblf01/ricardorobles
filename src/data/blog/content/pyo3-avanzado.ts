export const content = `
## Introducción

Ya sabes lo básico de PyO3: crear funciones, retornar valores, y llamarlas desde Python. Pero en producción necesitas más: manejar errores correctamente, gestionar el GIL, trabajar con tipos complejos, y publicar en PyPI.

En este artículo voy a cubrir las técnicas avanzadas que necesitas para escribir extensiones PyO3 robustas y publicables.

## Manejo del GIL

Cuando llamas a Rust desde Python, el GIL está adquirido. Pero si tu función Rust tarda mucho, bloqueas todos los hilos de Python.

### Liberar el GIL para operaciones largas

\`\`\`rust
use pyo3::prelude::*;
use pyo3::types::PyList;

#[pyfunction]
fn procesar_lote(py: Python, items: Vec<i64>) -> Vec<i64> {
    // Liberar el GIL para la operación pesada
    let result = py.allow_threads(|| {
        items.into_iter().map(|x| x * 2).collect::<Vec<_>>()
    });
    result
}
\`\`\`

### Readear el GIL cuando necesitas llamar a Python

\`\`\`rust
#[pyfunction]
fn mixto(py: Python) -> PyResult<()> {
    // Liberamos el GIL para trabajo pesado
    let data = py.allow_threads(|| {
        trabajo_pesado()
    });
    
    // Re-adquirimos el GIL para llamar a Python
    let result = Python::with_gil(|py| {
        let json = py.import("json")?;
        json.call_method1("dumps", (data,))
    })?;
    
    Ok(())
}
\`\`\`

## Manejo de errores

### Errores Python desde Rust

\`\`\`rust
use pyo3::exceptions::PyValueError;

#[pyfunction]
fn dividir(a: f64, b: f64) -> PyResult<f64> {
    if b == 0.0 {
        return Err(PyValueError::new_err("División por cero"));
    }
    Ok(a / b)
}
\`\`\`

### Errores personalizados

\`\`\`rust
#[pyclass]
#[derive(Debug)]
struct MiError {
    mensaje: String,
    codigo: i32,
}

#[pymethods]
impl MiError {
    #[new]
    fn new(mensaje: String, codigo: i32) -> Self {
        MiError { mensaje, codigo }
    }
    
    fn __str__(&self) -> String {
        format!("[{}] {}", self.codigo, self.mensaje)
    }
}

impl std::error::Error for MiError {}
impl std::fmt::Display for MiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[{}] {}", self.codigo, self.mensaje)
    }
}
\`\`\`

## Tipos complejos

### Diccionarios anidados

\`\`\`rust
use std::collections::HashMap;
use pyo3::types::PyDict;

#[pyfunction]
fn procesar_usuario(py: Python, data: HashMap<String, String>) -> PyResult<PyObject> {
    let dict = PyDict::new(py);
    dict.set_item("nombre", &data["nombre"])?;
    dict.set_item("procesado", true)?;
    
    Ok(dict.into())
}
\`\`\`

### Clases Python desde Rust

\`\`\`rust
#[pyclass]
struct Analizador {
    nombre: String,
    datos: Vec<f64>,
}

#[pymethods]
impl Analizador {
    #[new]
    fn new(nombre: String) -> Self {
        Analizador {
            nombre,
            datos: Vec::new(),
        }
    }
    
    fn agregar(&mut self, valor: f64) {
        self.datos.push(valor);
    }
    
    fn promedio(&self) -> f64 {
        if self.datos.is_empty() {
            return 0.0;
        }
        self.datos.iter().sum::<f64>() / self.datos.len() as f64
    }
    
    fn __repr__(&self) -> String {
        format!("Analizador({}, {} datos)", self.nombre, self.datos.len())
    }
}
\`\`\`

## Publicación en PyPI

### Configuración con maturin

\`\`\`toml
# pyproject.toml
[build-system]
requires = ["maturin>=1.0,<2.0"]
build-backend = "maturin"

[project]
name = "mi-extension"
version = "0.1.0"
requires-python = ">=3.8"
\`\`\`

### Build y publicación

\`\`\`bash
# Build wheels para todas las plataformas
maturin build --release

# Publicar en PyPI
maturin publish --skip-existing

# Build cross-platform (requiere docker)
maturin build --release --manylinux  # Linux x86_64 + aarch64
maturin build --release --target aarch64-apple-darwin  # Apple Silicon
maturin build --release --target x86_64-pc-windows-msvc  # Windows
\`\`\`

### CI/CD con GitHub Actions

\`\`\`yaml
name: Build and Publish

on:
  release:
    types: [published]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    runs-on: \${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      
      - name: Build wheels
        uses: PyO3/maturin-action@v1
        with:
          command: build
          args: --release --out dist
      
      - name: Upload wheels
        uses: actions/upload-artifact@v4
        with:
          name: wheels-\${{ matrix.os }}-\${{ matrix.python-version }}
          path: dist
\`\`\`

## Benchmarks

Siempre mide:

\`\`\`python
import time
from mi_extension import fast_function
from mi_modulo import slow_function

start = time.perf_counter()
fast_result = fast_function(data)
fast_time = time.perf_counter() - start

start = time.perf_counter()
slow_result = slow_function(data)
slow_time = time.perf_counter() - start

print(f"Rust: {fast_time:.4f}s, Python: {slow_time:.4f}s, {slow_time/fast_time:.1f}x más rápido")
\`\`\`

## Conclusión

PyO3 avanzado te permite:
1. Controlar el GIL para no bloquear Python
2. Manejar errores correctamente
3. Crear tipos complejos (clases, diccionarios)
4. Publicar en PyPI con maturin CI/CD

La clave: prueba que la extensión realmente mejora el rendimiento antes de publicarla. No todo necesita ser nativo.
`;