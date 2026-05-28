export const content = `
## Introducción

¿Cuántas veces has oído "en mi máquina funciona"? Es la frase más temida en el desarrollo de software. Y es comprensible: cada desarrollador tiene una configuración diferente, versiones distintas de herramientas, sistemas operativos variados. Lo que funciona en un entorno puede fallar misteriosamente en otro.

Los devcontainers (contenedores de desarrollo) resuelven este problema de raíz. En lugar de instalar herramientas y dependencias en tu máquina, defines un entorno de desarrollo completo en un contenedor Docker. Cada desarrollador del equipo obtiene exactamente el mismo entorno, con las mismas versiones, independientemente de su sistema operativo.

En este artículo voy a explicar qué son los devcontainers, cómo configurarlos y por qué deberías considerarlos para tu próximo proyecto.

## ¿Qué es un devcontainer?

Un devcontainer es un contenedor Docker configurado específicamente para el desarrollo de software. Contiene todo lo necesario para trabajar en un proyecto: runtime, compiladores, linters, extensiones del editor, herramientas de línea de comandos, y dependencias del proyecto.

La especificación de devcontainers es un estándar abierto mantenido por la comunidad. Visual Studio Code lo popularizó, pero ahora es compatible con múltiples editores y entornos: VS Code, GitHub Codespaces, JetBrains IDEs, y herramientas CLI.

## Cómo funciona

### Estructura básica

Un devcontainer se define con dos archivos:

\`\`\`
.projeto/
├── .devcontainer/
│   ├── devcontainer.json
│   └── Dockerfile
\`\`\`

El \`devcontainer.json\` configura el comportamiento del contenedor: qué imagen usar, qué extensiones instalar, qué puertos exponer, y qué comandos ejecutar al iniciar.

\`\`\`json
{
  "name": "Python 3.12 Dev",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "charliermarsh.ruff"
      ]
    }
  },
  "postCreateCommand": "pip install -r requirements.txt",
  "forwardPorts": [8000]
}
\`\`\`

El Dockerfile define el entorno base. Puedes usar imágenes oficiales o crear las tuyas:

\`\`\`dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    postgresql-client \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt
\`\`\`

### Flujo de trabajo

1. Abres el proyecto en VS Code
2. VS Code detecta la carpeta \`.devcontainer\`
3. Te pregunta si quieres reabrir en contenedor
3. Aceptas y VS Code construye el contenedor
4. En segundos/minutos, tienes un entorno completo y aislado
5. Trabajas normalmente: editas código, ejecutas tests, haces commits
6. Todo lo que haces ocurre dentro del contenedor, usando sus herramientas

## Beneficios clave

### Entorno reproducible

Cada desarrollador, cada CI pipeline, cada reviewer obtiene exactamente el mismo entorno. Se acabaron los problemas de "funciona en mi máquina".

### Onboarding instantáneo

Un nuevo desarrollador se une al equipo. En lugar de pasar el primer día instalando herramientas, configura su máquina y resolviendo dependencias, simplemente abre el proyecto en un devcontainer. En 5 minutos está escribiendo código.

### Aislamiento entre proyectos

Tienes un proyecto que necesita Python 3.11, otro que necesita Node 20, y otro que usa Go 1.22. Con devcontainers, cada proyecto tiene su propio entorno aislado. No hay conflictos de versiones, no hay instalaciones globales, no hay dolores de cabeza.

### Coincidencia con producción

Puedes configurar el devcontainer para que refleje el entorno de producción: mismo sistema operativo base, mismas herramientas, mismas versiones. Esto reduce la probabilidad de bugs que solo aparecen en producción.

### Versionado del entorno

El devcontainer está versionado junto con el código. Puedes hacer checkout de cualquier commit y obtener el entorno de desarrollo exacto de ese momento. Esto es increíblemente útil para debugging de bugs antiguos o revisión de PRs.

## Ejemplos prácticos

### Devcontainer para Django

\`\`\`dockerfile
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y \\
    build-essential libpq-dev gettext \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
\`\`\`

\`\`\`json
{
  "name": "Django Dev",
  "build": { "dockerfile": "Dockerfile" },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "batisteo.vscode-django",
        "charliermarsh.ruff"
      ]
    }
  },
  "postCreateCommand": "python manage.py migrate",
  "forwardPorts": [8000]
}
\`\`\`

### Devcontainer con múltiples servicios

\`\`\`json
{
  "name": "Full Stack Dev",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-azuretools.vscode-docker"
      ]
    }
  }
}
\`\`\`

Con \`docker-compose.yml\`:

\`\`\`yaml
services:
  app:
    build: .
    depends_on:
      - db
      - redis
    ports:
      - "8000:8000"
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: secret
  redis:
    image: redis:7-alpine
\`\`\`

Esto levanta tu aplicación junto con PostgreSQL y Redis, todo desde el devcontainer.

## Integración con CI/CD

Los devcontainers no son solo para desarrollo local. También puedes usarlos en CI:

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build devcontainer
        uses: devcontainers/ci@v0.3
        with:
          runCmd: |
            pytest
            ruff check
\`\`\`

Esto asegura que los tests se ejecutan exactamente en el mismo entorno que usas en desarrollo.

## Desventajas

Los devcontainers no son perfectos:

1. **Consumo de recursos**: Ejecutar un contenedor completo consume más RAM y CPU que trabajar nativo, especialmente en macOS/Windows con Docker Desktop.

2. **Complejidad inicial**: Configurar un devcontainer bien requiere tiempo y conocimiento de Docker.

3. **Editor dependency**: Aunque el estándar es abierto, la experiencia varía según el editor. VS Code es el mejor soportado.

4. **Rendimiento de I/O**: En macOS y Windows, el rendimiento de archivos entre el host y el contenedor puede ser lento.

## Conclusión

Los devcontainers representan un cambio fundamental en cómo configuramos entornos de desarrollo. En lugar de luchar con configuraciones locales, definimos el entorno como código y lo compartimos con el equipo.

Para equipos de cualquier tamaño, los beneficios en productividad y consistencia superan con creces los costes iniciales de configuración. Para proyectos open source, los devcontainers eliminan la barrera de entrada para nuevos contribuyentes.

Si aún no los has probado, empieza con un proyecto personal. Configura un devcontainer básico y experimenta. Una vez que veas lo fácil que es tener un entorno reproducible, querrás usarlos en todos tus proyectos.
`;