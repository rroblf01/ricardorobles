export const content = `
## Introducción

Uvicorn es el servidor ASGI más popular para Python. Es rápido, minimalista y potente. Pero la configuración por defecto no siempre es la óptima para producción.

En este artículo voy a cubrir las configuraciones avanzadas de Uvicorn: workers, timeouts, buffering, logging, y cómo integrarlo con procesos de sistema.

## Workers y concurrencia

### Uvicorn solo (single process)

\`\`\`bash
uvicorn app:app --host 0.0.0.0 --port 8000
\`\`\`

Un solo proceso. Aprovecha async IO, pero solo usa un core.

### Uvicorn con workers (multi-process)

\`\`\`bash
# Workers = 2-4 × cores
uvicorn app:app --workers 4 --host 0.0.0.0 --port 8000
\`\`\`

Cada worker es un proceso separado. Comparten el puerto. Robusto para producción.

### Gunicorn + Uvicorn Workers

\`\`\`bash
pip install gunicorn uvicorn

gunicorn app:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 4 \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --keep-alive 5 \
  --max-requests 10000 \
  --max-requests-jitter 1000
\`\`\`

Ventajas sobre uvicorn --workers:
- Gestión de workers más madura (Gunicorn)
- \`--max-requests\`: Reinicia workers periódicamente (evita memory leaks)
- \`--timeout\`: Mata workers colgados
- Graceful shutdown más controlado

Recomiendo Gunicorn + UvicornWorker para producción sobre uvicorn solo.

## Timeouts

\`\`\`bash
gunicorn app:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 30          # Timeout por worker (default 30)
  --graceful-timeout 30 # Tiempo para shutdown graceful
  --keep-alive 5        # Keep alive connections
\`\`\`

### Timeout en la app

\`\`\`python
import asyncio
from starlette.responses import JSONResponse

async def slow_endpoint(request):
    try:
        result = await asyncio.wait_for(
            slow_operation(),
            timeout=5.0
        )
        return JSONResponse({"result": result})
    except asyncio.TimeoutError:
        return JSONResponse(
            {"error": "timeout"},
            status_code=504
        )
\`\`\`

## Logging

### Configurar logging en Uvicorn

\`\`\`python
import logging
import sys

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
            "datefmt": "%Y-%m-%dT%H:%M:%S%z",
        },
        "json": {
            "format": '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
            "datefmt": "%Y-%m-%dT%H:%M:%S%z",
        },
    },
    "handlers": {
        "stdout": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
        },
        "stderr": {
            "class": "logging.StreamHandler",
            "stream": sys.stderr,
            "formatter": "json",
        },
    },
    "loggers": {
        "uvicorn": {"handlers": ["stdout"], "level": "INFO"},
        "uvicorn.access": {"handlers": ["stderr"], "level": "INFO"},
        "app": {"handlers": ["stdout"], "level": "DEBUG"},
    },
}

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        log_config=LOGGING_CONFIG,
    )
\`\`\`

## SSL/TLS directo

\`\`\`bash
uvicorn app:app \
  --ssl-keyfile /etc/ssl/private/key.pem \
  --ssl-certfile /etc/ssl/certs/cert.pem \
  --ssl-keyfile-password "password"  # opcional
\`\`\`

O con Gunicorn:

\`\`\`bash
gunicorn app:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --certfile /etc/ssl/certs/cert.pem \
  --keyfile /etc/ssl/private/key.pem
\`\`\`

## Configuración de buffers

\`\`\`python
import uvicorn

uvicorn.run(
    "app:app",
    host="0.0.0.0",
    port=8000,
    limit_concurrency=1000,     # Conexiones concurrentes máximas
    limit_max_requests=10000,   # Requests por worker antes de reiniciar
    backlog=2048,               # Cola de conexiones pendientes
    h11_max_incomplete_size=65536,  # Tamaño máximo de request incompleto
)
\`\`\`

Con Gunicorn:

\`\`\`bash
gunicorn app:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --worker-connections 1000 \
  --backlog 2048 \
  --max-requests 10000 \
  --max-requests-jitter 1000
\`\`\`

## Lifecycle hooks

### Con Uvicorn

\`\`\`python
from contextlib import asynccontextmanager
from starlette.applications import Starlette

@asynccontextmanager
async def lifespan(app):
    # Startup
    print("Iniciando conexiones...")
    db.connect()
    cache.connect()
    yield
    # Shutdown
    print("Cerrando conexiones...")
    db.close()
    cache.close()

app = Starlette(lifespan=lifespan)
\`\`\`

### Con Gunicorn

\`\`\`python
# gunicorn_conf.py
def on_starting(server):
    print("Gunicorn iniciando...")

def on_exit(server):
    print("Gunicorn finalizando...")

def when_ready(server):
    print("Gunicorn listo para recibir peticiones")
\`\`\`

\`\`\`bash
gunicorn app:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --config gunicorn_conf.py
\`\`\`

## Integración con systemd

\`\`\`ini
# /etc/systemd/system/app.service
[Unit]
Description=App ASGI
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/app
Environment=PATH=/opt/app/.venv/bin
ExecStart=/opt/app/.venv/bin/gunicorn app:app \\
  --worker-class uvicorn.workers.UvicornWorker \\
  --workers 4 \\
  --bind 0.0.0.0:8000 \\
  --timeout 30 \\
  --max-requests 10000 \\
  --access-logfile /var/log/app/access.log \\
  --error-logfile /var/log/app/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
\`\`\`

## Conclusión

Uvicorn es simple pero configurable. Para producción:
1. Usa Gunicorn + UvicornWorker (mejor gestión de procesos)
2. Configura timeouts (30s es buen default)
3. Activa max-requests para evitar memory leaks
4. Logging estructurado (formato JSON)
5. Systemd para gestión de procesos

Y recuerda: el servidor ASGI es solo una pieza. Detrás necesitas nginx como reverse proxy, y delante un CDN o balanceador.
`;