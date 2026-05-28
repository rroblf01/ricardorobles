export const content = `
## Introducción

Python es lento. Todos lo sabemos. Pero es tan productivo y tiene un ecosistema tan rico que a menudo compensa su falta de velocidad. Sin embargo, hay ocasiones en las que necesitas rendimiento puro: procesar millones de requests, analizar terabytes de datos, o ejecutar algoritmos en tiempo real.

Históricamente, la solución era escribir extensiones en C o Cython. Pero C es peligroso (segmentación de fallos, desbordamiento de búfer, gestión manual de memoria) y Cython requiere aprender un dialecto Python/C híbrido.

Rust ha emergido como la alternativa moderna. Es tan rápido como C, pero con garantías de seguridad de memoria en tiempo de compilación. Y gracias a PyO3 y maturin, escribir extensiones nativas para Python en Rust es más fácil que nunca.

En este artículo voy a explicar cómo crear una librería Python en Rust, con ejemplos prácticos y consejos basados en mi experiencia real.

## Por qué Rust para extensiones Python

### Rendimiento sin concesiones

Rust compila a código nativo y no tiene runtime ni garbage collector. Esto significa que tu librería Python escrita en Rust puede ser entre 10x y 100x más rápida que la misma implementación en Python puro, especialmente en operaciones CPU-bound.

### Seguridad de memoria

El borrow checker de Rust garantiza que no haya use-after-free, double-free, ni data races en tiempo de compilación. Esto elimina una clase entera de bugs que son comunes en extensiones C.

### Interoperabilidad excelente

PyO3 proporciona binding directo con la API de Python. Puedes crear clases Python desde Rust, lanzar excepciones Python, y convertir tipos entre ambos lenguajes de forma natural.

### Ecosistema moderno

Maturin gestiona todo el pipeline: compila tu código Rust, genera wheels para múltiples plataformas, y publica en PyPI. Con un solo comando puedes tener tu extensión funcionando.

## Configuración del proyecto

Lo primero que necesitas es instalar maturin. Es la herramienta que orquesta la construcción de paquetes Python con Rust:

\`\`\`bash
pip install maturin
\`\`\`

Luego creas un nuevo proyecto:

\`\`\`bash
maturin init --bindings pyo3
\`\`\`

Esto genera la estructura del proyecto con todo lo necesario:

\`\`\`
mi-libreria/
├── Cargo.toml
├── pyproject.toml
├── src/
│   └── lib.rs
└── .github/
    └── workflows/
        └── CI.yml
\`\`\`

### El Cargo.toml

El archivo Cargo.toml define las dependencias Rust. Para PyO3, necesitas:

\`\`\`toml
[package]
name = "mi_libreria"
version = "0.1.0"
edition = "2021"

[lib]
name = "mi_libreria"
crate-type = ["cdylib"]

[dependencies]
pyo3 = { version = "0.22", features = ["extension-module"] }
\`\`\`

## Primer ejemplo: función matemática intensiva

Vamos a crear una función que calcule números primos. En Python puro:

\`\`\`python
def es_primo(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

def contar_primos(hasta: int) -> int:
    return sum(1 for n in range(2, hasta) if es_primo(n))
\`\`\`

En Rust, con PyO3:

\`\`\`rust
use pyo3::prelude::*;

#[pyfunction]
fn es_primo(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    let limite = (n as f64).sqrt() as u64;
    for i in 2..=limite {
        if n % i == 0 {
            return false;
        }
    }
    true
}

#[pyfunction]
fn contar_primos(hasta: u64) -> u64 {
    (2..hasta).filter(|&n| es_primo(n)).count() as u64
}

#[pymodule]
fn mi_libreria(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(es_primo, m)?)?;
    m.add_function(wrap_pyfunction!(contar_primos, m)?)?;
    Ok(())
}
\`\`\`

### Resultados de rendimiento

Para contar primos hasta 100.000:
- Python puro: 2.3 segundos
- Rust + PyO3: 0.04 segundos

**57x más rápido.** Y sin escribir nada exótico: es el mismo algoritmo, solo que en Rust.

## Trabajando con tipos complejos

PyO3 permite convertir tipos Python a Rust de forma automática. Por ejemplo, trabajar con listas y diccionarios:

\`\`\`rust
use pyo3::prelude::*;
use pyo3::types::PyDict;

#[pyfunction]
fn procesar_datos(py: Python, datos: Vec<Vec<f64>>) -> PyResult<Vec<f64>> {
    let resultados: Vec<f64> = datos
        .iter()
        .map(|fila| {
            let suma: f64 = fila.iter().sum();
            let media = suma / fila.len() as f64;
            let varianza: f64 = fila
                .iter()
                .map(|v| (v - media).powi(2))
                .sum::<f64>()
                / fila.len() as f64;
            varianza.sqrt()
        })
        .collect();
    Ok(resultados)
}
\`\`\`

Esta función recibe una lista de listas de floats y devuelve la desviación estándar de cada fila. La versión Rust es aproximadamente 40x más rápida que la equivalente en Python puro.

## Clases Python desde Rust

Puedes definir clases Python directamente en Rust:

\`\`\`rust
use pyo3::prelude::*;

#[pyclass]
struct Contador {
    valor: u64,
}

#[pymethods]
impl Contador {
    #[new]
    fn new() -> Self {
        Contador { valor: 0 }
    }

    fn incrementar(&mut self) -> PyResult<()> {
        self.valor += 1;
        Ok(())
    }

    fn obtener(&self) -> PyResult<u64> {
        Ok(self.valor)
    }
}

#[pymodule]
fn mi_libreria(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Contador>()?;
    Ok(())
}
\`\`\`

Desde Python se usa como cualquier clase:

\`\`\`python
from mi_libreria import Contador
c = Contador()
c.incrementar()
c.incrementar()
print(c.obtener())  # 2
\`\`\`

## Manejo de errores

PyO3 permite lanzar excepciones Python desde Rust:

\`\`\`rust
use pyo3::exceptions::PyValueError;

#[pyfunction]
fn dividir(a: f64, b: f64) -> PyResult<f64> {
    if b == 0.0 {
        return Err(PyValueError::new_err("No se puede dividir por cero"));
    }
    Ok(a / b)
}
\`\`\`

## Publicación en PyPI

Una vez que tienes tu librería funcionando, publicarla es sencillo con maturin:

\`\`\`bash
# Construir wheels para la plataforma actual
maturin build

# Publicar en PyPI
maturin publish
\`\`\`

Maturin también puede generar wheels para Linux, macOS y Windows usando cross-compilation o CI/CD con GitHub Actions. De hecho, el proyecto generado por \`maturin init\` ya incluye un workflow de CI que construye wheels para todas las plataformas.

## Casos de uso reales

### Procesamiento de texto

Librerías como \`tokenizers\` (usada por Hugging Face) están escritas en Rust y envolventes para Python. Procesan texto a velocidades imposibles en Python puro.

### Operaciones con arrays

Bibliotecas como \`numpy\` están escritas en C, pero cada vez más alternativas Rust como \`ndarray\` y \`polars\` están ganando tracción. Polars, por ejemplo, es significativamente más rápido que pandas para muchas operaciones.

### Criptografía

Librerías criptográficas se benefician enormemente del rendimiento y seguridad de Rust. \`cryptography\` ya usa Rust en partes críticas.

### Procesamiento de imágenes

Operaciones como redimensionado, filtros, y conversiones de formato son órdenes de magnitud más rápidas en Rust.

## Cuándo NO usar Rust para extensiones Python

### Operaciones I/O-bound

Si tu función pasa la mayor parte del tiempo esperando (lectura de archivos, requests HTTP, consultas a BD), Rust no va a dar mucha ventaja. Python puede manejar I/O de forma eficiente con asyncio.

### Prototipos y código exploratory

Para explorar datos o prototipar algoritmos, Python puro es más rápido de escribir. La optimización debe llegar cuando ya tienes el algoritmo funcionando y has identificado el cuello de botella.

### APIs simples

Si solo estás haciendo wrapper de APIs REST o consultas a bases de datos, Python es perfectamente adecuado. No necesitas Rust para eso.

## Mi experiencia personal

Escribí mi primera extensión Rust para Python hace dos años: un procesador de logs que tenía que analizar 10GB de logs por minuto en tiempo real. En Python puro, el procesamiento tardaba unos 45 segundos por lote. Con la extensión Rust, bajó a 1.2 segundos. Una mejora de 37x.

El desarrollo de la extensión me llevó una semana, principalmente aprendiendo PyO3. El código Rust es más verboso que Python, pero la seguridad de tipos y la velocidad compensan con creces.

## Conclusión

PyO3 y maturin han hecho que escribir extensiones Python en Rust sea accesible para cualquier desarrollador con conocimientos básicos de Rust. No necesitas ser un experto en sistemas ni conocer los detalles internos de CPython.

Mi recomendación: identifica los cuellos de botella de rendimiento en tus proyectos Python. Si hay operaciones CPU-bound que se ejecutan con frecuencia, considera reescribir solo esa función en Rust. No necesitas migrar todo el proyecto; con una sola función optimizada puedes obtener ganancias enormes.

Rust no va a reemplazar a Python, pero sí puede hacer que ciertas partes de tu código sean órdenes de magnitud más rápidas. Y con PyO3, la integración es tan fluida que apenas notarás la diferencia.
`;