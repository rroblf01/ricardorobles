export const content = `
## Introducción

Starlette es uno de los frameworks ASGI más infravalorados. FastAPI está construido sobre él, pero Starlette por sí solo es potente, rápido y minimalista. Entenderlo te da control total sobre tu aplicación web.

## ¿Qué es Starlette?

Starlette es un framework ASGI ligero para Python. Pip install \`starlette\` y tienes routing, middleware, WebSocket, GraphQL, testing, y más.

\`\`\`python
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

async def homepage(request):
    return JSONResponse({"message": "Hola, mundo"})

app = Starlette(routes=[
    Route("/", endpoint=homepage)
])
\`\`\`

## Middleware personalizado

### Logging de peticiones

\`\`\`python
import time
from starlette.middleware.base import BaseHTTPMiddleware

class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        elapsed = time.time() - start
        print(f"{request.method} {request.url.path} - {elapsed:.4f}s")
        return response

app.add_middleware(RequestLogMiddleware)
\`\`\`

### Limitación de tasa (rate limiting)

\`\`\`python
from collections import defaultdict
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests=100, window=60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window
        self.requests = defaultdict(list)

    async def dispatch(self, request, call_next):
        client_ip = request.client.host
        now = time.time()
        
        # Limpiar entradas viejas
        self.requests[client_ip] = [
            t for t in self.requests[client_ip]
            if now - t < self.window
        ]
        
        if len(self.requests[client_ip]) >= self.max_requests:
            return JSONResponse(
                {"error": "Rate limit exceeded"},
                status_code=429
            )
        
        self.requests[client_ip].append(now)
        return await call_next(request)
\`\`\`

### CORS personalizado

\`\`\`python
from starlette.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ejemplo.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization"],
    max_age=3600  # Cache preflight 1 hora
)
\`\`\`

## Manejo de errores global

\`\`\`python
from starlette.exceptions import HTTPException
from starlette.requests import Request

async def error_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        {"error": exc.detail, "path": request.url.path},
        status_code=exc.status_code
    )

app.add_exception_handler(HTTPException, error_handler)
\`\`\`

## Subidas de archivos con streaming

\`\`\`python
from starlette.datastructures import UploadFile

async def upload_file(request):
    form = await request.form()
    file: UploadFile = form["file"]
    
    # Streaming directo a disco sin cargar en memoria
    with open(f"uploads/{file.filename}", "wb") as f:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            f.write(chunk)
    
    return JSONResponse({"file": file.filename})
\`\`\`

## WebSockets

\`\`\`python
from starlette.endpoints import WebSocketEndpoint
from starlette.routing import WebSocketRoute

class EchoEndpoint(WebSocketEndpoint):
    async def on_receive(self, websocket, data):
        await websocket.send_text(f"Echo: {data}")

routes = [
    WebSocketRoute("/ws", endpoint=EchoEndpoint)
]
\`\`\`

## Background tasks

\`\`\`python
from starlette.background import BackgroundTask

async def send_email_task(user_id):
    # Lógica de envío de email
    pass

async def create_user(request):
    data = await request.json()
    user = await save_user(data)
    task = BackgroundTask(send_email_task, user.id)
    return JSONResponse({"id": user.id}, background=task)
\`\`\`

## Testing integrado

\`\`\`python
from starlette.testclient import TestClient

def test_homepage():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hola, mundo"}
\`\`\`

## Conclusión

Starlette es la base perfecta para construir APIs. Es minimalista, rápido y bien diseñado. Antes de añadir FastAPI a tu proyecto, considera si realmente necesitas todo lo que FastAPI añade (validación automática, OpenAPI, etc.) o si Starlette es suficiente. Muchas veces lo es.
`;