export const content = `
## Introducción

Docker ha cambiado la forma en que desplegamos aplicaciones. Pero una imagen mal construida puede tener 2GB, tardar 5 minutos en construir, y exponer vulnerabilidades innecesarias.

En este artículo voy a cubrir las mejores prácticas para construir imágenes Docker para aplicaciones Python, con foco en tamaño, seguridad y velocidad de build.

## Usa imágenes base pequeñas

### Evita python:3.12 (1.1GB)

\`\`\`dockerfile
FROM python:3.12
\`\`\`

### Usa python:3.12-slim (150MB)

\`\`\`dockerfile
FROM python:3.12-slim-bookworm
\`\`\`

### O python:3.12-alpine (50MB)

\`\`\`dockerfile
FROM python:3.12-alpine
RUN apk add --no-cache gcc musl-dev  # depende de las dependencias
\`\`\`

Alpine es más pequeña pero usa musl en vez de glibc. Algunas wheels no están compiladas para musl y hay que compilarlas desde source, lo que alarga el build.

### Mi recomendación

\`python:3.12-slim-bookworm\` para la mayoría de proyectos. Tamaño razonable (150MB), glibc, y todas las wheels disponibles.

## Multi-stage builds

\`\`\`dockerfile
# Stage 1: build
FROM python:3.12-slim-bookworm AS builder
RUN pip install --user pipx && pipx install poetry
COPY pyproject.toml poetry.lock .
RUN poetry export -f requirements.txt --output requirements.txt
RUN pip install --user --no-warn-script-location -r requirements.txt

# Stage 2: runtime
FROM python:3.12-slim-bookworm
COPY --from=builder /root/.local /root/.local
COPY . /app
WORKDIR /app
CMD ["python", "app.py"]
\`\`\`

## Aprovecha la caché de Docker

Ordena las instrucciones de menos a más cambiantes:

\`\`\`dockerfile
# 1. Sistema base (casi nunca cambia)
FROM python:3.12-slim-bookworm

# 2. Dependencias del sistema (rara vez cambian)
RUN apt-get update && apt-get install -y \\
    gcc \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# 3. Dependencias de Python (cambian con cada requisito nuevo)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Código de la app (cambia constantemente)
COPY . .

# 5. Usuario no root (seguridad)
RUN useradd -m appuser
USER appuser

CMD ["python", "app.py"]
\`\`\`

## Instalación optimizada de dependencias

\`\`\`dockerfile
# Solo dependencias de producción (sin dev)
COPY requirements.txt .
RUN pip install --no-cache-dir --no-deps -r requirements.txt

# O mejor: usa pip-compile para fijar versiones
RUN pip install pip-tools && \\
    pip-compile requirements.in > requirements.txt
\`\`\`

Pip install --no-cache-dir evita llenar la capa con el caché de pip.

## Seguridad

### Ejecutar como no-root

\`\`\`dockerfile
RUN addgroup --system --gid 1001 appgroup && \\
    adduser --system --uid 1001 --gid 1001 appuser
USER appuser
\`\`\`

### Escanear vulnerabilidades

\`\`\`bash
# Trivy (rápido y popular)
trivy image mi-app:latest

# Docker Scout (integrado en Docker Desktop)
docker scout cves mi-app:latest

# CVE scanner (listado de CVEs)
grype mi-app:latest
\`\`\`

### Capas innecesarias

\`\`\`dockerfile
# Malo: archivos sensibles en capas intermedias
COPY .env .
RUN python app.py setup
RUN rm .env

# Bueno: multi-stage, el .env nunca llega a la imagen final
FROM python:3.12-slim AS builder
COPY .env .
RUN python app.py setup

FROM python:3.12-slim AS runtime
COPY --from=builder /app/config.json .
\`\`\`

## Optimización de tamaño

### .dockerignore

\`\`\`
__pycache__
*.pyc
*.pyo
.env
.git
.gitignore
*.md
venv
.venv
.idea
.vscode
tests/
docker-compose.yml
\`\`\`

### Limpiar en la misma capa

\`\`\`dockerfile
RUN apt-get update && apt-get install -y \\
    gcc \\
    && pip install -r requirements.txt \\
    && apt-get purge -y gcc \\
    && apt-get autoremove -y \\
    && rm -rf /var/lib/apt/lists/* /tmp/*
\`\`\`

### Sin etiquetas de versión

\`\`\`dockerfile
# Malo: etiqueta enorme (1.1GB)
FROM python:3.12

# Bueno: slim
FROM python:3.12-slim-bookworm

# Mejor: alpine si las dependencias lo permiten
FROM python:3.12-alpine
\`\`\`

## Dockerfile completo (producción)

\`\`\`dockerfile
FROM python:3.12-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim-bookworm

RUN addgroup --system --gid 1001 appgroup && \\
    adduser --system --uid 1001 --gid 1001 appuser

COPY --from=builder /root/.local /root/.local
COPY --chown=appuser:appgroup . /app

WORKDIR /app
USER appuser

ENV PATH=/root/.local/bin:$PATH \\
    PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["python", "app.py"]
\`\`\`

## Conclusión

Una buena imagen Docker para Python se construye con:
1. Imagen base pequeña (slim-bookworm)
2. Multi-stage para separar build de runtime
3. Orden de capas que maximice caché
4. Usuario no-root
5. .dockerignore completo
6. HEALTHCHECK
7. Sin capas innecesarias (PYTHONDONTWRITEBYTECODE, --no-cache-dir)

Tu imagen debería pesar <200MB y construirse en <30 segundos (en el segundo build con caché caliente).
`;