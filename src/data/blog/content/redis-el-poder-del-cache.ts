export const content = `
## Introducción

Hay herramientas que parecen simples pero que, cuando las entiendes bien, transforman tu forma de diseñar sistemas. Redis es una de ellas.

A primera vista, Redis es un almacén de clave-valor en memoria. Pero si solo lo usas para guardar strings, te estás perdiendo el 90% de su potencial. Redis es una plataforma de datos en memoria que puede funcionar como caché, base de datos, cola de mensajes, broker de pub/sub, almacén de sesiones, rate limiter, y mucho más.

En este artículo voy a explicar los patrones de uso más importantes de Redis y cómo aplicarlos en aplicaciones backend reales.

## ¿Qué es Redis?

Redis (Remote Dictionary Server) es un almacén de estructuras de datos en memoria, de código abierto, que se utiliza como base de datos, caché y broker de mensajería. Soporta múltiples tipos de datos: strings, hashes, listas, sets, sorted sets, streams, HyperLogLog, y más.

Su principal característica es la velocidad: todas las operaciones se ejecutan en memoria, con tiempos de respuesta submilisegundo.

### Tipos de datos

\`\`\`
STRING    → cached:miapp:usuario:1 → {"nombre": "Juan"}
HASH      → usuario:1 → {nombre, email, edad}
LIST      → cola:emails → ["email1", "email2", "email3"]
SET       → tags:python → {"fastapi", "django", "flask"}
ZSET      → ranking → {"user1": 100, "user2": 85}
STREAM    → eventos → mensajes ordenados con ID autoincremental
\`\`\`

## Patrones de uso esenciales

### 1. Caché de consultas a base de datos

El uso más común de Redis es cachear resultados de consultas lentas:

\`\`\`python
import redis.asyncio as aioredis
import json

cache = aioredis.from_url("redis://localhost", decode_responses=True)

async def get_articulo(articulo_id: int):
    # Intentar obtener de caché
    clave = f"articulo:{articulo_id}"
    cached = await cache.get(clave)
    if cached:
        return json.loads(cached)

    # Fallback a base de datos
    articulo = await db.query(Articulo).get(articulo_id)
    if articulo:
        # Guardar en caché por 1 hora
        await cache.setex(clave, 3600, json.dumps(articulo.to_dict()))
    return articulo
\`\`\`

### 2. Rate limiting

Redis es perfecto para controlar el número de requests por usuario:

\`\`\`python
async def check_rate_limit(user_id: str, max_requests: int = 100, window: int = 60):
    clave = f"rate_limit:{user_id}:{int(time.time() / window)}"
    count = await cache.incr(clave)
    if count == 1:
        await cache.expire(clave, window + 1)
    return count <= max_requests
\`\`\`

### 3. Colas de tareas con Listas

Usando listas como colas FIFO:

\`\`\`python
# Productor
await cache.lpush("cola:procesamiento", json.dumps(tarea))

# Consumidor
tarea = await cache.brpop("cola:procesamiento", timeout=30)
\`\`\`

### 4. Publicación/suscripción (Pub/Sub)

Para notificaciones en tiempo real:

\`\`\`python
# Publicador
await cache.publish("canal:notificaciones", mensaje)

# Suscriptor
pubsub = cache.pubsub()
await pubsub.subscribe("canal:notificaciones")
async for mensaje in pubsub.listen():
    procesar(mensaje)
\`\`\`

### 5. Sesiones de usuario

Almacenar sesiones con expiración automática:

\`\`\`python
async def crear_sesion(user_id: int):
    sesion_id = secrets.token_hex(32)
    await cache.hset(
        f"sesion:{sesion_id}",
        mapping={
            "user_id": user_id,
            "created_at": time.time(),
            "ip": request.client.host
        }
    )
    await cache.expire(f"sesion:{sesion_id}", 86400)  # 24h
    return sesion_id
\`\`\`

### 6. Leaderboards y rankings

Con sorted sets:

\`\`\`python
# Añadir puntuación
await cache.zincrby("ranking:puntos", 10, "usuario:1")

# Obtener top 10
top = await cache.zrevrange("ranking:puntos", 0, 9, withscores=True)

# Obtener posición de un usuario
pos = await cache.zrevrank("ranking:puntos", "usuario:1")
\`\`\`

### 7. Bloom filters para prevención de duplicados

Útil para evitar procesar elementos repetidos sin gastar mucha memoria:

\`\`\`bash
BF.ADD filtro:emails email@ejemplo.com
BF.EXISTS filtro:emails email@ejemplo.com  # → 1 si ya existe
\`\`\`

## Estrategias de cacheo

### Cache-Aside (Lazy Loading)

Es la estrategia más común. La aplicación primero consulta Redis, y si no encuentra el dato, consulta la base de datos y lo guarda en Redis.

### Write-Through

Cada escritura en la base de datos se refleja inmediatamente en Redis. Esto asegura que la caché siempre está actualizada, pero ralentiza las escrituras.

### Write-Behind

Las escrituras se hacen primero en Redis y luego se propagan asíncronamente a la base de datos. Muy rápido para escrituras, pero hay riesgo de pérdida de datos si Redis falla antes de la propagación.

## Gestión de memoria

Redis tiene varias políticas de desalojo cuando la memoria se llena:

\`\`\`
noeviction        → Error si la memoria se llena
allkeys-lru       → Elimina las claves menos usadas (recomendado)
allkeys-lfu       → Elimina las claves menos frecuentes
volatile-lru      → Elimina solo las que tienen TTL
volatile-ttl      → Elimina las que expiran antes
\`\`\`

## Persistencia

Aunque Redis es en memoria, ofrece persistencia opcional:

- **RDB** (Redis Database): Snapshots periódicos del dataset. Bueno para backups, pero puedes perder datos del último snapshot.
- **AOF** (Append Only File): Cada operación de escritura se registra. Más seguro que RDB, pero más lento y ocupa más espacio.
- **Combinado**: Usar RDB para backups y AOF para recuperación ante fallos.

## Alta disponibilidad

### Redis Sentinel

Proporciona alta disponibilidad monitorizando instancias y promoviendo réplicas automáticamente:

\`\`\`
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
\`\`\`

### Redis Cluster

Proporciona escalabilidad horizontal distribuyendo los datos entre múltiples nodos. Cada nodo gestiona una parte del hash slot. Soporta replicación automática y failover.

\`\`\`bash
redis-cli --cluster create \\
    127.0.0.1:7000 127.0.0.1:7001 \\
    127.0.0.1:7002 127.0.0.1:7003 \\
    --cluster-replicas 1
\`\`\`

## Buenas prácticas

### Nombrado de claves

\`\`\`python
# Bueno
cache.set("usuario:123:perfil", data)

# Malo
cache.set("123perfil", data)
\`\`\`

Usa dos puntos para crear jerarquías lógicas.

### TTL siempre

Todas las claves deberían tener un TTL a menos que tengas una razón muy específica para no hacerlo. Esto evita que la memoria se llene con datos obsoletos.

### Evitar claves demasiado grandes

Redis es monohilo para operaciones de comando. Una clave de 10MB ralentizará todas las operaciones. Si necesitas almacenar datos grandes, considera fragmentarlos o usar otro almacenamiento.

### Monitorización

Usa \`INFO\` y \`MONITOR\` para entender qué está pasando:

\`\`\`bash
redis-cli INFO stats
redis-cli INFO memory
redis-cli --bigkeys
\`\`\`

## Conclusión

Redis es mucho más que un simple caché. Es una plataforma de datos en memoria que resuelve problemas comunes de rendimiento y escalabilidad de forma elegante y eficiente.

Mi recomendación: integra Redis en tu stack aunque solo sea para caché. Una vez que lo tengas, empezarás a encontrar otros usos: colas, rate limiting, sesiones, pub/sub. Redis es de esas herramientas que, una vez que las tienes, no entiendes cómo trabajabas sin ellas.

Para empezar, configura Redis con la política de desalojo \`allkeys-lru\`, usa TTL en todas tus claves, y monitoriza el uso de memoria. Con eso tienes el 80% del camino recorrido.
`;