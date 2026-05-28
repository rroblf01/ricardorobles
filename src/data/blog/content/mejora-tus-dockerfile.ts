export const content = `
## Introducción

Los Dockerfile son como las recetas de cocina: puedes seguir una receta básica y obtener un resultado aceptable, o puedes optimizar cada paso para obtener un plato estrella. La mayoría de los Dockerfile que veo en proyectos reales son funcionales, pero están lejos de ser óptimos.

Un Dockerfile bien optimizado significa: builds más rápidos, imágenes más pequeñas, menos vulnerabilidades, y despliegues más seguros. No son optimizaciones triviales: una reducción de 1GB a 200MB en el tamaño de la imagen puede suponer un ahorro significativo en costes de almacenamiento y ancho de banda.

En este artículo voy a compartir las técnicas que uso para optimizar Dockerfile en proyectos Python, basadas en años de experiencia en producción.

## Fundamentos: capas y caché

Cada instrucción en un Dockerfile crea una capa. Docker cachea cada capa y solo reconstruye las que cambian. Aprovechar este mecanismo es la clave para builds rápidos.

\`\`\`dockerfile
# Malo: todo en una capa
RUN apt-get update && apt-get install -y build-essential
RUN pip install -r requirements.txt

# Bueno: agrupar comandos relacionados
RUN apt-get update && apt-get install -y build-essential \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

## Orden de las instrucciones

Coloca las instrucciones que cambian menos frecuentemente al principio. Así aprovechas mejor la caché:

\`\`\`dockerfile
# 1. Sistema base (rara vez cambia)
FROM python:3.12-slim

# 2. Dependencias del sistema (cambia poco)
RUN apt-get update && apt-get install -y libpq-dev && rm -rf /var/lib/apt/lists/*

# 3. Dependencias Python (cambia con requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Código fuente (cambia constantemente)
COPY . .
\`\`\`

## Multi-stage builds

La técnica más importante para reducir el tamaño de las imágenes es usar multi-stage builds. Consiste en usar múltiples etapas donde las primeras contienen herramientas de compilación y la última solo lo necesario para ejecutar:

\`\`\`dockerfile
# Etapa 1: Compilación
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y build-essential curl \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# Etapa 2: Ejecución
FROM python:3.12-slim

COPY --from=builder /wheels /wheels
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

COPY . .

CMD ["python", "app.py"]
\`\`\`

## Imágenes base mínimas

Elegir la imagen base correcta puede reducir drásticamente el tamaño:

\`\`\`dockerfile
# 1.1 GB (full Python)
FROM python:3.12

# 160 MB (slim)
FROM python:3.12-slim

# 50 MB (Alpine Linux, requiere compilación)
FROM python:3.12-alpine
\`\`\`

Para la mayoría de proyectos, \`slim\` es el mejor balance entre tamaño y compatibilidad. Alpine puede dar problemas con algunas librerías que requieren compilación.

## Reducir el número de capas

Cada capa ocupa espacio. Aunque las capas se compartan, es buena práctica minimizar su número:

\`\`\`dockerfile
# Malo
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
RUN rm -rf /var/lib/apt/lists/*

# Bueno
RUN apt-get update && apt-get install -y package1 package2 \\
    && rm -rf /var/lib/apt/lists/*
\`\`\`

## Caché de dependencias Python

Las dependencias Python cambian menos frecuentemente que el código. Copia \`requirements.txt\` antes que el código para aprovechar la caché:

\`\`\`dockerfile
# Malo: copiar todo el código antes de instalar dependencias
COPY . .
RUN pip install -r requirements.txt

# Bueno: copiar requirements primero
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
\`\`\`

## No ejecutar como root

Por seguridad, ejecuta la aplicación con un usuario no privilegiado:

\`\`\`dockerfile
RUN groupadd -r appuser && useradd -r -g appuser appuser
USER appuser

# O en versiones modernas de Python
FROM python:3.12-slim
RUN addgroup --system app && adduser --system --group app
USER app
\`\`\`

## Exponer solo lo necesario

No expongas puertos que no sean necesarios:

\`\`\`dockerfile
EXPOSE 8000
# No: EXPOSE 22 8000 9000
\`\`\`

## Usar .dockerignore

Un buen .dockerignore evita que archivos innecesarios se copien al contexto de build:

\`\`\`
.git/
__pycache__/
*.pyc
.env
.venv/
venv/
node_modules/
dist/
*.md
tests/
\`\`\`

## HEALTHCHECK

Añade un healthcheck para que Docker pueda monitorizar la aplicación:

\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
\`\`\`

## Labels

Añade metadatos a la imagen:

\`\`\`dockerfile
LABEL org.opencontainers.image.source="https://github.com/user/repo"
LABEL org.opencontainers.image.description="API de mi aplicación"
LABEL org.opencontainers.image.licenses="MIT"
\`\`\`

## Ejemplo completo optimizado

\`\`\`dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential curl \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim

RUN addgroup --system app && adduser --system --group app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq5 \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

COPY . .

RUN mkdir -p /app/static && chown -R app:app /app
USER app

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

LABEL org.opencontainers.image.source="https://github.com/user/repo"
LABEL org.opencontainers.image.description="API optimizada"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

## Análisis de tamaño

Para identificar qué ocupa espacio en tu imagen:

\`\`\`bash
docker history --human --no-trunc mi-imagen
docker system df
docker build --no-cache -t test .
\`\`\`

Usa \`dive\` para una inspección visual:

\`\`\`bash
dive mi-imagen
\`\`\`

## Buenas prácticas de seguridad

1. **No almacenar secrets en el build**: Usa \`--secret\` de Docker BuildKit si necesitas credenciales.
2. **Escanea vulnerabilidades**: \`docker scout\` o \`trivy\`.
3. **Imágenes base oficiales**: Usa imágenes oficiales y mantenidas.
4. **Actualiza regularmente**: Las imágenes base contienen vulnerabilidades conocidas.
5. **Mínimo privilegio**: Usa \`USER\` no root, \`chmod\` restrictivos.

## Conclusión

Optimizar un Dockerfile no es difícil, pero requiere conocer las técnicas adecuadas. Multi-stage builds, orden de capas, imágenes base slim, y ejecución no root son las prácticas más impactantes.

Mi recomendación: empieza por medir. Antes de optimizar, ejecuta \`docker images\` y \`dive\` para entender qué ocupa espacio en tu imagen actual. Luego aplica las optimizaciones una por una, midiendo el impacto de cada cambio.

Un Dockerfile bien optimizado no solo ahorra espacio y tiempo de build, sino que también mejora la seguridad y la mantenibilidad del proyecto. Es una inversión que se amortiza rápidamente.
`;