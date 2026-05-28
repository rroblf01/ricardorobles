export const content = `
## Introducción

Si has trabajado con Python el tiempo suficiente, conoces el ritual: creas un entorno virtual con \`venv\`, activas, instalas dependencias con \`pip\`, esperas... y esperas. Luego llega \`pip-compile\` o \`poetry\` o \`pdm\` porque pip solo no es suficiente para proyectos serios. Y entonces aparece uv.

uv es un gestor de paquetes y proyectos Python escrito en Rust por la misma gente que creó Ruff (el linter/formateador que está reemplazando a Black, Flake8 e isort). Se lanzó en 2024 y rápidamente está ganando adopción porque resuelve problemas reales: velocidad, reproducibilidad y simplicidad.

En este artículo te voy a contar por qué uv merece un lugar en tu toolchain, cómo empezar a usarlo y cómo integrarlo en proyectos existentes sin romper nada.

## ¿Qué hace uv especial?

### Velocidad

uv está escrito en Rust y compila a código nativo. Esto significa que instalar dependencias con uv es entre 10x y 100x más rápido que con pip. No es una exageración. He probado proyectos con cientos de dependencias donde pip tardaba 3-4 minutos en resolver e instalar, y uv lo hace en segundos.

¿Cómo lo consigue? Varios factores:

1. **Resolución de dependencias en paralelo**: uv resuelve el árbol de dependencias concurrentemente, aprovechando múltiples cores.
2. **Caché agresiva**: uv cachea paquetes descargados y los reutiliza entre proyectos.
3. **Sin overhead de Python**: pip está escrito en Python, y su resolución de dependencias implica arrancar el intérprete de Python múltiples veces. uv es un binario nativo que no depende de Python para funcionar.

### Compatibilidad con pip

uv es compatible con pip. Puedes usar \`uv pip install\` como reemplazo directo de \`pip install\` y funcionará. Esto significa que no necesitas reescribir tus workflows existentes: uv funciona con \`requirements.txt\`, \`setup.py\`, \`pyproject.toml\`, y cualquier formato que ya uses.

### Gestión de proyectos

Además de ser un reemplazo de pip, uv también gestiona proyectos completos. Con \`uv init\` creas la estructura de un proyecto Python, \`uv add\` añade dependencias, \`uv sync\` las instala, y \`uv run\` ejecuta comandos en el contexto del proyecto.

\`\`\`bash
# Crear un proyecto nuevo
uv init mi-proyecto
cd mi-proyecto

# Añadir dependencias
uv add fastapi sqlalchemy psycopg2-binary

# Ejecutar
uv run uvicorn main:app
\`\`\`

### Gestión de versiones de Python

uv también puede gestionar versiones de Python. Con \`uv python install 3.12\` descargas e instalas una versión específica de Python. Con \`uv python pin 3.12\` fijas la versión para un proyecto. Esto elimina la necesidad de herramientas como pyenv.

## Integración en proyectos existentes

### Reemplazar pip

La forma más sencilla de empezar con uv es usarlo como reemplazo directo de pip:

\`\`\`bash
# En lugar de:
pip install -r requirements.txt

# Usa:
uv pip install -r requirements.txt
\`\`\`

### Migrar de Poetry

Si usas Poetry, uv puede importar tu configuración:

\`\`\`bash
uv sync --dev
\`\`\`

Esto lee el \`pyproject.toml\` y crea un lockfile compatible. La migración es transparente.

### CI/CD

En pipelines de CI, uv brilla porque no necesita instalar pip ni configurar entornos virtuales:

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv sync --dev
      - run: uv run pytest
\`\`\`

## Casos de uso reales

### Proyecto Django con uv

He migrado varios proyectos Django de pip+venv a uv. El resultado: los builds de CI pasaron de 4 minutos a 45 segundos. En desarrollo, \`uv sync\` tarda 2 segundos donde pip tardaba 30 segundos.

\`\`\`toml
[project]
name = "mi-django-app"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "django>=5.0",
    "djangorestframework>=3.15",
    "psycopg2-binary>=2.9",
    "celery>=5.3",
]
\`\`\`

\`\`\`bash
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
\`\`\`

### Múltiples proyectos con diferentes versiones de Python

Uno de mis casos de uso favoritos: tengo proyectos que necesitan Python 3.11, 3.12 y 3.13. Con uv, puedo tenerlos todos sin conflictos:

\`\`\`bash
cd proyecto-a
uv python pin 3.11
uv sync

cd ../proyecto-b
uv python pin 3.12
uv sync
\`\`\`

Cada proyecto tiene su propia versión de Python gestionada por uv, sin interferencias.

## Desventajas y consideraciones

uv no es perfecto. Algunas cosas a tener en cuenta:

1. **Ecosistema joven**: uv se lanzó en 2024 y aunque está madurando rápido, todavía hay edge cases que pip maneja mejor.

2. **Plugins de pip**: Algunas herramientas que se integran con pip (como \`pip-audit\` para auditoría de seguridad) pueden no funcionar directamente con uv.

3. **Dependencias privadas**: Si usas repositorios privados con autenticación compleja, uv puede requerir configuración adicional.

4. **Lockfile propio**: uv genera \`uv.lock\`, que es incompatible con \`poetry.lock\` o \`Pipfile.lock\`. Si cambias de herramienta, el lockfile se regenera.

## Conclusión

uv es, probablemente, la herramienta de gestión de paquetes Python más importante que ha aparecido en los últimos años. Su velocidad, compatibilidad con el ecosistema existente y características integradas lo convierten en un reemplazo convincente para pip, poetry y pyenv.

Mi recomendación: pruébalo en un proyecto pequeño primero. Migra un requirements.txt y compara la velocidad. Una vez que veas la diferencia, querrás usarlo en todos tus proyectos.

No es necesario migrar todo hoy, pero uv debería estar en tu radar. El ecosistema Python se mueve hacia herramientas más rápidas escritas en Rust (Ruff, uv, PyO3), y estar al día te dará una ventaja significativa en productividad.
`;