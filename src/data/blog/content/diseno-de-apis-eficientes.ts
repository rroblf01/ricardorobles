export const content = `
## Introducción

Una API REST bien diseñada no solo es fácil de usar. También escala. En este artículo voy a cubrir patrones de diseño que he visto marcar la diferencia en APIs con millones de peticiones diarias.

## Paginación

### Offset-based (tradicional)

\`\`\`python
@app.get("/posts")
async def get_posts(page: int = 1, per_page: int = 20):
    offset = (page - 1) * per_page
    posts = await db.execute(
        select(Post).offset(offset).limit(per_page).order_by(Post.id)
    )
    total = await db.execute(select(func.count(Post.id)))
    return {
        "data": posts.scalars().all(),
        "page": page,
        "per_page": per_page,
        "total": total.scalar(),
        "total_pages": ceil(total.scalar() / per_page),
    }
\`\`\`

Problema: \`OFFSET\` es ineficiente en tablas grandes. PostgreSQL tiene que escanear y saltar filas.

### Cursor-based (recomendado)

\`\`\`python
@app.get("/posts")
async def get_posts(cursor: str = None, per_page: int = 20):
    query = select(Post).order_by(Post.id).limit(per_page + 1)
    
    if cursor:
        query = query.where(Post.id > cursor)
    
    posts = (await db.execute(query)).scalars().all()
    
    has_more = len(posts) > per_page
    posts = posts[:per_page]
    
    next_cursor = posts[-1].id if has_more else None
    
    return {
        "data": [serialize(p) for p in posts],
        "next_cursor": next_cursor,
        "has_more": has_more,
    }
\`\`\`

Ventajas:
- Consultas eficientes (usa índices)
- Consistente aunque se añadan filas
- Sin problemas de páginas saltadas

## Partial responses (sparse fieldsets)

Permite al cliente elegir qué campos recibir:

\`\`\`python
@app.get("/users/{user_id}")
async def get_user(user_id: int, fields: str = None):
    user = await get_user_by_id(user_id)
    
    # Todos los campos disponibles
    all_fields = {
        "id": user.id,
        "nombre": user.nombre,
        "email": user.email,
        "avatar": user.avatar,
        "bio": user.bio,
        "ultimo_acceso": user.ultimo_acceso.isoformat(),
        "total_posts": user.total_posts,
        "total_comentarios": user.total_comentarios,
    }
    
    if fields:
        requested = set(fields.split(","))
        return {k: v for k, v in all_fields.items() if k in requested}
    
    return all_fields
\`\`\`

Si el cliente solo necesita \`id\` y \`nombre\`: \`GET /users/1?fields=id,nombre\`

## Bulk endpoints

Para operaciones en lote, evita N requests:

\`\`\`python
# Malo: N requests
for user_id in [1, 2, 3, 4, 5]:
    response = await client.get(f"/users/{user_id}")

# Bueno: 1 request
@app.get("/users/bulk")
async def get_users_bulk(ids: str):
    user_ids = [int(id) for id in ids.split(",")]
    users = await db.execute(
        select(User).where(User.id.in_(user_ids))
    )
    return [serialize(u) for u in users.scalars().all()]
\`\`\`

## Rate limiting

### Token bucket

\`\`\`python
import time
from collections import defaultdict

class TokenBucket:
    def __init__(self, rate: float, burst: int):
        self.rate = rate  # tokens por segundo
        self.burst = burst  # máximo de tokens acumulables
        self.tokens = defaultdict(lambda: burst)
        self.last_refill = defaultdict(time.time)
    
    def consume(self, key: str, tokens: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_refill[key]
        self.tokens[key] = min(
            self.burst,
            self.tokens[key] + elapsed * self.rate
        )
        self.last_refill[key] = now
        
        if self.tokens[key] >= tokens:
            self.tokens[key] -= tokens
            return True
        return False

rate_limiter = TokenBucket(rate=10, burst=20)

@app.get("/api/data")
async def get_data(request):
    client_ip = request.client.host
    if not rate_limiter.consume(client_ip):
        return JSONResponse(
            {"error": "too_many_requests", "retry_after": 1},
            status_code=429,
            headers={"Retry-After": "1"}
        )
    return JSONResponse({"data": "valuable"})
\`\`\`

## Conclusión

Una API eficiente se construye con:
1. **Cursor-based pagination**: escala mejor que offset
2. **Sparse fieldsets**: menos datos en la red
3. **Bulk endpoints**: menos round trips
4. **Rate limiting**: protege tu backend
5. **Cache headers**: reduce peticiones al servidor
`;