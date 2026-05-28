export const content = `
## Introducción

Si has trabajado con Python para servir aplicaciones web, probablemente has oído hablar de WSGI. Es el estándar que ha permitido que frameworks como Django y Flask funcionen con servidores como Gunicorn y uWSGI. Pero el mundo ha cambiado: las aplicaciones web modernas necesitan websockets, HTTP/2, streaming, y conexiones concurrentes. WSGI se queda corto.

Aquí entra ASGI (Asynchronous Server Gateway Interface). Es la evolución de WSGI que soporta tanto peticiones síncronas como asíncronas, websockets, y eventos en tiempo real.

En este artículo voy a explicar las diferencias clave entre ASGI y WSGI, cuándo migrar y cómo hacerlo sin romper tu aplicación.

## ¿Qué es WSGI?

WSGI (Web Server Gateway Interface) es un estándar definido en PEP 3333. Especifica cómo un servidor web (como Gunicorn) se comunica con una aplicación Python (como Django o Flask).

### Cómo funciona

WSGI es síncrono y secuencial. Cada petición ocupa un worker (proceso o hilo) hasta que se completa. El servidor llama a la aplicación con el entorno y una función callback, y la aplicación devuelve la respuesta.

\`\`\`python
def app(environ, start_response):
    status = '200 OK'
    headers = [('Content-Type', 'text/plain')]
    start_response(status, headers)
    return [b"Hello, World!"]
\`\`\`

### Limitaciones

1. **Sin soporte para websockets**: WSGI solo maneja el modelo request-response HTTP tradicional. No hay forma de mantener una conexión abierta.

2. **Sin soporte para HTTP/2**: El estándar WSGI no contempla las características de HTTP/2 como multiplexación o server push.

3. **Sin streaming eficiente**: Para enviar datos en streaming, WSGI requiere soluciones complejas y poco eficientes.

4. **Concurrencia limitada**: Cada petición bloquea un worker. Para alta concurrencia necesitas muchos workers, lo que consume mucha memoria.

5. **Sin soporte para eventos asíncronos**: No puedes ejecutar tareas en segundo plano dentro de la misma petición.

## ¿Qué es ASGI?

ASGI (Asynchronous Server Gateway Interface) es la evolución de WSGI para el mundo asíncrono. Definido originalmente en la especificación del proyecto Django Channels, ASGI se ha convertido en el estándar para aplicaciones Python asíncronas.

### Cómo funciona

ASGI es asíncrono y basado en eventos. En lugar de una llamada síncrona, ASGI utiliza un modelo de eventos con un scope (similar al environ de WSGI pero más rico), y eventos de envío y recepción.

\`\`\`python
async def app(scope, receive, send):
    assert scope['type'] == 'http'
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [(b'content-type', b'text/plain')],
    })
    await send({
        'type': 'http.response.body',
        'body': b"Hello, World!",
    })
\`\`\`

### Ventajas

1. **Websockets nativos**: ASGI soporta websockets de forma nativa, permitiendo aplicaciones en tiempo real.

2. **HTTP/2 y Server-Sent Events**: El modelo de eventos permite manejar múltiples protocolos.

3. **Concurrencia real**: Con ASGI, un solo worker puede manejar cientos de conexiones simultáneas usando asyncio.

4. **Streaming eficiente**: Puedes enviar datos a medida que se generan, sin necesidad de buffers completos.

5. **Tareas en segundo plano**: Puedes ejecutar código asíncrono mientras la petición está en curso.

## Comparativa directa

### Rendimiento

En benchmarks de concurrencia, ASGI gana claramente. Un servidor ASGI como Uvicorn con un worker puede manejar 5,000-10,000 conexiones concurrentes. Un servidor WSGI como Gunicorn con 4 workers maneja aproximadamente 200-500 conexiones simultáneas.

### Latencia

Para peticiones individuales sin I/O, la diferencia es mínima. Pero cuando hay operaciones de I/O (llamadas a APIs externas, consultas a base de datos, lectura de archivos), ASGI puede manejar muchas más peticiones concurrentes con la misma latencia.

### Complejidad

WSGI es más simple. El modelo síncrono es más fácil de entender y debuggear. ASGI requiere entender asyncio, async/await, y event loops.

### Ecosistema

WSGI tiene un ecosistema maduro. Cualquier framework o librería Python funciona con WSGI. ASGI tiene un ecosistema creciente, pero todavía hay librerías que no soportan async.

## Cuándo migrar a ASGI

### Migra si:

1. **Necesitas websockets**: Chat en tiempo real, notificaciones push, juegos multijugador.

2. **Tienes alta concurrencia**: Tu aplicación maneja muchas conexiones simultáneas y necesitas eficiencia.

3. **Usas HTTP/2 o HTTP/3**: El estándar ASGI soporta mejor estos protocolos.

4. **Haces streaming**: Procesamiento de video, audio, o datos en tiempo real.

5. **Tu aplicación es I/O-bound**: Muchas llamadas a APIs externas, consultas a base de datos, o lectura de archivos.

### No migres si:

1. **Tu aplicación es simple y funciona bien**: No arregles lo que no está roto.

2. **Dependes de librerías no asíncronas**: Algunas librerías populares (como Django ORM en ciertos contextos) no funcionan bien con async.

3. **Tu equipo no conoce asyncio**: La migración requiere aprendizaje y puede introducir bugs difíciles de depurar.

4. **Tu aplicación es CPU-bound**: ASGI no mejora el rendimiento de operaciones intensivas en CPU.

## Cómo migrar de WSGI a ASGI

### Paso 1: Preparar el entorno

Necesitas un servidor ASGI. Uvicorn es la opción más popular:

\`\`\`bash
pip install uvicorn
\`\`\`

### Paso 2: Migrar Django

Django 3.0+ tiene soporte ASGI. Necesitas un archivo \`asgi.py\`:

\`\`\`python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    # Aquí irían los websockets si los necesitas
})
\`\`\`

### Paso 3: Migrar FastAPI

FastAPI ya es ASGI nativamente. Solo necesitas ejecutarlo con un servidor ASGI:

\`\`\`bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

### Paso 4: Usar middleware asíncrono

\`\`\`python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

class MiMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Lógica asíncrona antes de la petición
        response = await call_next(request)
        # Lógica asíncrona después
        return response
\`\`\`

### Paso 5: Usar base de datos asíncrona

\`\`\`python
# Con SQLAlchemy asíncrono
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")

async def get_users():
    async with engine.connect() as conn:
        result = await conn.execute(select(User))
        return result.fetchall()
\`\`\`

## Herramientas del ecosistema

### Servidores

- **Uvicorn**: El servidor ASGI más popular. Rápido, estable, con soporte para HTTP/1.1 y WebSockets.
- **Daphne**: El servidor ASGI original del proyecto Django Channels.
- **Hypercorn**: Servidor ASGI con soporte para HTTP/1.1, HTTP/2 y WebSockets.

### Frameworks

- **FastAPI**: Framework moderno con soporte nativo ASGI.
- **Starlette**: Framework ASGI ligero que sirve como base para FastAPI.
- **Django Channels**: Extiende Django para soportar ASGI, websockets y async.
- **Quart**: Versión asíncrona de Flask.

## Conclusión

ASGI no es un reemplazo directo de WSGI, sino una evolución para un mundo de aplicaciones más complejas y exigentes. WSGI sigue siendo perfectamente válido para aplicaciones tradicionales, pero ASGI abre posibilidades que WSGI simplemente no puede ofrecer.

Mi recomendación: para nuevos proyectos, empieza con ASGI. FastAPI o Django + Channels te darán más flexibilidad sin perder las ventajas de WSGI. Para proyectos existentes que funcionan bien con WSGI, no hay prisa por migrar. Evalúa si realmente necesitas las ventajas de ASGI antes de embarcarte en una migración.

El ecosistema Python avanza hacia lo asíncrono. ASGI es el presente y el futuro de las aplicaciones web Python. Tarde o temprano, todos migraremos.
`;