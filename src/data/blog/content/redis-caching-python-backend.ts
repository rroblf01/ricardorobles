export const content = `
## Introducción

Redis es mucho más que un simple caché clave-valor. Bien usado, puede reducir la latencia de tu API de 200ms a 2ms y absorber picos de tráfico sin sudar.

En este artículo voy a cubrir patrones avanzados de caching con Redis para aplicaciones Python, incluyendo casos de uso reales, estrategias de invalidación, y cómo evitar los problemas más comunes.

## Patrones básicos de caching

### Cache-aside (lazy loading)

El patrón más común. La app primero mira en Redis, y si no encuentra, va a la BD y llena el caché.

\`\`\`python
import redis.asyncio as redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

async def get_user(user_id: int) -> dict:
    cache_key = f"user:{user_id}"
    
    # 1. Intentar desde caché
    cached = await r.get(cache_key)
    if cached is not None:
        return json.loads(cached)
    
    # 2. Si no está, ir a BD
    user = await db.query(User).filter(User.id == user_id).first()
    if user is None:
        return None
    
    # 3. Guardar en caché con TTL (5 minutos)
    user_dict = {"id": user.id, "nombre": user.nombre, "email": user.email}
    await r.setex(cache_key, 300, json.dumps(user_dict))
    
    return user_dict
\`\`\`

### Read-through cache

El caché se llena automáticamente cuando se accede por primera vez. Redis no lo hace nativo, pero puedes implementarlo:

\`\`\`python
async def get_or_compute(key: str, compute_func, ttl: int = 300):
    cached = await r.get(key)
    if cached is not None:
        return json.loads(cached)
    
    value = await compute_func()
    await r.setex(key, ttl, json.dumps(value))
    return value

# Uso
user = await get_or_compute(
    f"user:{user_id}",
    lambda: fetch_user_from_db(user_id),
    ttl=300
)
\`\`\`

### Write-through cache

Cada escritura va primero a Redis y luego a la BD. Garantiza que el caché siempre esté actualizado.

\`\`\`python
async def update_user(user_id: int, data: dict):
    cache_key = f"user:{user_id}"
    
    # 1. Actualizar Redis primero
    user_dict = await r.get(cache_key)
    if user_dict:
        user_data = json.loads(user_dict)
        user_data.update(data)
        await r.setex(cache_key, 300, json.dumps(user_data))
    
    # 2. Actualizar BD después
    user = await db.query(User).filter(User.id == user_id).first()
    for key, value in data.items():
        setattr(user, key, value)
    await db.commit()
\`\`\`

## Estrategias de invalidación

### TTL (Time To Live)

El método más simple y efectivo:

\`\`\`python
# TTL corto para datos volátiles
await r.setex(f"session:{token}", 3600, session_data)  # 1 hora

# TTL largo para datos estables
await r.setex(f"pais:{codigo}", 86400, pais_data)  # 24 horas

# Sin TTL para datos que nunca cambian
await r.set(f"config:version", "1.0.0")
\`\`\`

### Invalidación por evento

Cuando los datos cambian, eliminas la clave del caché:

\`\`\`python
async def on_user_updated(user_id: int):
    # Invalidar todas las claves relacionadas con este usuario
    await r.delete(f"user:{user_id}")
    await r.delete(f"user:{user_id}:posts")
    await r.delete(f"user:{user_id}:stats")
    
    # También se puede invalidar patrones (usar con cuidado)
    # await r.delete_pattern(f"user:{user_id}:*")  # No nativo, requiere Lua
\`\`\`

### Cache stampede

Cuando muchos requests piden la misma clave que expiró al mismo tiempo, todos van a la BD:

\`\`\`python
async def get_user_stampede_protected(user_id: int):
    cache_key = f"user:{user_id}"
    
    # 1. Intentar caché
    cached = await r.get(cache_key)
    if cached is not None:
        return json.loads(cached)
    
    # 2. Lock distribuido para evitar stampede
    lock_key = f"lock:{cache_key}"
    lock = await r.setnx(lock_key, "locked")
    
    if lock:
        await r.expire(lock_key, 10)  # Timeout del lock
        user = await fetch_user_from_db(user_id)
        await r.setex(cache_key, 300, json.dumps(user))
        await r.delete(lock_key)
        return user
    
    # 3. Esperar a que otro proceso llene el caché
    await asyncio.sleep(0.1)
    return await get_user_stampede_protected(user_id)
\`\`\`

## Caching de listas y colecciones

### Paginación con caché

\`\`\`python
async def get_paginated_posts(page: int, per_page: int = 20):
    cache_key = f"posts:page:{page}:per:{per_page}"
    
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    posts = await db.query(Post).order_by(Post.fecha.desc()) \\
        .offset((page - 1) * per_page).limit(per_page).all()
    
    posts_list = [{"id": p.id, "titulo": p.titulo} for p in posts]
    await r.setex(cache_key, 120, json.dumps(posts_list))
    
    return posts_list
\`\`\`

### Caching de queries agregadas

\`\`\`python
async def get_user_stats(user_id: int):
    cache_key = f"user:{user_id}:stats"
    
    cached = await r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    stats = {
        "total_posts": await db.query(func.count(Post.id)) \\
            .filter(Post.user_id == user_id).scalar(),
        "total_comments": await db.query(func.count(Comment.id)) \\
            .filter(Comment.user_id == user_id).scalar(),
        "ultimo_acceso": await db.query(func.max(Post.fecha)) \\
            .filter(Post.user_id == user_id).scalar(),
    }
    
    await r.setex(cache_key, 600, json.dumps(stats))
    return stats
\`\`\`

## Redis como rate limiter

\`\`\`python
async def check_rate_limit(user_id: int, max_requests: int = 100, window: int = 60):
    key = f"ratelimit:{user_id}:{int(time.time() / window)}"
    
    current = await r.incr(key)
    if current == 1:
        await r.expire(key, window + 1)
    
    return current <= max_requests

# Uso en middleware
async def rate_limit_middleware(request, call_next):
    user_id = request.state.user_id
    if not await check_rate_limit(user_id):
        return JSONResponse(
            {"error": "rate_limit_exceeded"},
            status_code=429
        )
    return await call_next(request)
\`\`\`

## Redis para sesiones

\`\`\`python
import hashlib
import secrets

async def create_session(user_id: int) -> str:
    token = secrets.token_hex(32)
    session_data = {
        "user_id": user_id,
        "created_at": time.time(),
        "ip": request.client.host,
    }
    await r.setex(f"session:{token}", 86400, json.dumps(session_data))
    return token

async def validate_session(token: str) -> dict:
    session = await r.get(f"session:{token}")
    if session is None:
        return None
    return json.loads(session)

async def invalidate_session(token: str):
    await r.delete(f"session:{token}")
\`\`\`

## Estrategias de serialización

### JSON (lento pero portable)

\`\`\`python
data = json.dumps({"id": 1, "nombre": "Ricardo"})
await r.set("key", data)
\`\`\`

### pickle (rápido pero inseguro)

\`\`\`python
# Solo si confías en los datos
data = pickle.dumps({"id": 1, "nombre": "Ricardo"})
await r.set("key", data)
result = pickle.loads(await r.get("key"))
\`\`\`

### MessagePack (rápido y seguro)

\`\`\`python
import msgpack

data = msgpack.dumps({"id": 1, "nombre": "Ricardo"})
await r.set("key", data)
result = msgpack.loads(await r.get("key"))
\`\`\`

MessagePack es 2-3x más rápido que JSON y produce datos más compactos.

## Monitorización

\`\`\`bash
# Redis CLI
redis-cli INFO stats
redis-cli INFO keyspace
redis-cli MONITOR  # No en producción

# Hit rate
redis-cli INFO stats | grep keyspace_
keyspace_hits:1500
keyspace_misses:100
# Hit rate = 1500/(1500+100) = 93.7%
\`\`\`

Si tu hit rate es <80%, revisa tus TTLs y estrategias de invalidación.

## Conclusión

Redis es una herramienta increíble para caching, pero hay que usarla con cabeza:
1. **Empieza con cache-aside + TTL**: es simple y funciona
2. **Protege contra stampede**: lock distribuido
3. **Serializa con MessagePack**: más rápido que JSON si el rendimiento importa
4. **Monitoriza el hit rate**: si es bajo, algo estás haciendo mal
5. **No cachees todo**: algunos datos no merecen el overhead

El mejor caché es el que no necesitas invalidar porque los datos no cambian. Diseña tus TTLs en consecuencia.
`;