export const content = `
## Introducción

Un solo nivel de caché rara vez es suficiente. Cuando tu aplicación crece, necesitas una jerarquía: caché en la aplicación, luego Redis, luego CDN, y al final la base de datos.

Cada nivel tiene diferentes características de velocidad, coste y volatilidad. El truco está en diseñar la jerarquía para que el 90% de los aciertos ocurran en el nivel más rápido.

## La jerarquía de caché

### Nivel 1: Caché en aplicación (in-process)

La más rápida (nanosegundos), pero limitada a un proceso:

\`\`\`python
from functools import lru_cache
import time

@lru_cache(maxsize=128)
def get_expensive_data(key: str):
    # Simula operación costosa
    time.sleep(1)
    return {"key": key, "value": "expensive"}

# Primer llamado: 1 segundo
# Llamados siguientes: nanosegundos
print(get_expensive_data("test"))
\`\`\`

**Ventajas**: Sin red, sin serialización, latencia ~0.1μs.
**Desventajas**: No compartido entre procesos, memoria limitada, se pierde al reiniciar.

### Nivel 2: Caché distribuida (Redis)

Compartido entre procesos y servidores, latencia ~1ms:

\`\`\`python
import redis.asyncio as redis

class CacheLevel2:
    def __init__(self):
        self.redis = redis.Redis(host="redis", port=6379, decode_responses=True)
    
    async def get(self, key: str):
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ttl: int = 300):
        await self.redis.setex(key, ttl, value)
\`\`\`

**Ventajas**: Compartido, persistente opcional, TTLs.
**Desventajas**: Latencia de red, serialización.

### Nivel 3: CDN (CloudFront, Cloudflare, Fastly)

Para contenido estático o respuestas cacheadas a nivel HTTP:

\`\`\`python
from starlette.responses import Response

async def api_response(request):
    response = Response(
        content=json.dumps({"data": "valuable"}),
        headers={
            "Cache-Control": "public, max-age=300, s-maxage=600",
            "CDN-Cache-Control": "public, max-age=600",
        }
    )
    return response
\`\`\`

### Nivel 4: Base de datos

La más lenta pero la fuente de verdad.

## Diseño multi-nivel

\`\`\`python
class MultiLevelCache:
    def __init__(self):
        self.local = {}  # dict simple como ejemplo
        self.redis = redis.Redis(decode_responses=True)
    
    async def get(self, key: str, fetch_func):
        # Nivel 1: local
        if key in self.local:
            return self.local[key]
        
        # Nivel 2: Redis
        cached = await self.redis.get(key)
        if cached:
            self.local[key] = cached
            return cached
        
        # Nivel 3: fuente original
        value = await fetch_func()
        await self.redis.setex(key, 300, value)
        self.local[key] = value
        return value
    
    def invalidate(self, key: str):
        self.local.pop(key, None)
        # Redis invalidation
        # async - usually handled by event/message
\`\`\`

## TTL por nivel

Cada nivel puede tener un TTL diferente. Normalmente:

- **Local**: TTL muy corto (segundos), porque la memoria es limitada y la inconsistencia entre servidores es aceptable a corto plazo.
- **Redis**: TTL medio (minutos), porque Redis aguanta más carga que la BD.
- **CDN**: TTL largo (horas), porque invalidar un CDN es costoso.

## Invalidación en cascada

Cuando un dato cambia, hay que invalidar todos los niveles:

\`\`\`python
async def on_data_updated(key: str):
    # 1. Invalidar CDN (API call)
    await invalidate_cdn(f"/api/data/{key}")
    
    # 2. Invalidar Redis
    await redis.delete(f"data:{key}")
    
    # 3. Invalidar local (broadcast a otros servidores)
    await redis.publish("cache:invalidate", f"data:{key}")
\`\`\`

## Conclusión

El diseño multi-nivel no es complejo, pero requiere pensar en:
- **Latencia**: Local > Redis > CDN > BD
- **Coste**: RAM local < Redis < CDN < BD
- **Consistencia**: Cuanto más arriba en la jerarquía, más tolerancia a datos obsoletos

Empieza con Redis, añade local cuando el hit rate de Redis sea alto (>95%), y añade CDN cuando necesites servir contenido estático global.
`;