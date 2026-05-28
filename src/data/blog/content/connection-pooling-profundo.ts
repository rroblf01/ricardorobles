export const content = `
## Introducción

Todo backend que usa una base de datos necesita gestionar conexiones. Abrir una conexión PostgreSQL cuesta ~1-2ms y consume recursos del servidor (memoria, sockets, procesos). Para aplicaciones con decenas o cientos de peticiones concurrentes, abrir y cerrar conexiones por petición no escala.

Ahí entran los poolers de conexión: herramientas que mantienen un conjunto de conexiones abiertas a la base de datos y las reutilizan entre peticiones. pgBouncer y Pgpool-II son los más populares.

En este artículo voy a explicar cómo funcionan, sus modos de operación y cuándo usarlos.

## ¿Por qué necesitas un pooler?

### Sin pooler

\`\`\`python
# Cada petición: abrir conexión, hacer query, cerrar
import psycopg2

def get_user(user_id):
    conn = psycopg2.connect(
        host="localhost",
        dbname="app",
        user="app",
        password="secret"
    )  # ~2ms
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
    result = cur.fetchone()
    conn.close()
    return result
\`\`\`

Problemas: el tiempo de conexión se suma a cada petición, y bajo alta carga el servidor PostgreSQL se satura con procesos de conexión.

### Con pooler (local)

\`\`\`python
from psycopg2 import pool

# Pool de conexiones en el mismo proceso
pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=2, maxconn=10,
    host="localhost", dbname="app"
)

def get_user(user_id):
    conn = pool.getconn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
    result = cur.fetchone()
    pool.putconn(conn)
    return result
\`\`\`

### Con pooler externo (pgBouncer)

\`\`\`python
# El pooler escucha en un puerto, la app se conecta a él
conn = psycopg2.connect(
    host="localhost",
    port=6432,  # pgBouncer
    dbname="app"
)
# pgBouncer reutiliza conexiones al PostgreSQL real
\`\`\`

## pgBouncer: el pooler ligero

pgBouncer es un pooler de conexiones liviano, con un solo proceso y muy eficiente.

### Modos de operación

#### Session pooling

El modo por defecto. La conexión se asigna a un cliente hasta que el cliente la cierra:

\`\`\`ini
# pgBouncer.ini
[databases]
app = host=localhost port=5432 dbname=app

[pgbouncer]
pool_mode = session
default_pool_size = 25
\`\`\`

**Ventaja**: Compatible con todo, soporta prepared statements.
**Desventaja**: Una conexión ocupada mientras el cliente esté conectado (aunque no haga nada).

#### Transaction pooling

La conexión se devuelve al pool después de cada transacción:

\`\`\`ini
pool_mode = transaction
\`\`\`

**Ventaja**: Mucho más escalable. Una conexión sirve a muchos clientes por turnos.
**Desventaja**: No soporta prepared statements, SET, LISTEN/NOTIFY, o cursores fuera de transacción.

**Recomendado para**: APIs REST sin estado o con sesiones cortas.

#### Statement pooling

La conexión se devuelve después de cada statement. El más restrictivo pero más eficiente:

\`\`\`ini
pool_mode = statement
\`\`\`

### Configuración recomendada

\`\`\`ini
# pgBouncer.ini
[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
pool_mode = transaction
default_pool_size = 25
max_client_conn = 200
max_db_connections = 50
query_timeout = 30
idle_transaction_timeout = 60
server_idle_timeout = 600
tcp_keepalive = 1
\`\`\`

### Monitorización

\`\`\`sql
-- Conectarse a pgBouncer (base de datos especial)
psql -p 6432 -U pgbouncer pgbouncer

-- Ver estadísticas
SHOW STATS;
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW DATABASES;
\`\`\`

## Pgpool-II: el pooler completo

Pgpool-II es más pesado pero ofrece más funcionalidades:

### Modos de funcionamiento

1. **Session mode**: Similar a pgBouncer session, pero con más features
2. **Transaction mode**: Similar a pgBouncer transaction
3. **Statement mode**: Similar a pgBouncer statement

### Características adicionales

- **Load balancing**: Distribuye lecturas entre réplicas
- **Failover automático**: Detecta caídas y promueve réplicas
- **Connection pooling nativo**
- **Watchdog**: Alta disponibilidad del propio Pgpool
- **Query caching**: Cachea resultados de consultas SELECT

### Configuración básica

\`\`\`
# pgpool.conf
listen_addresses = '0.0.0.0'
port = 9999
backend_hostname0 = 'postgres-primary'
backend_port0 = 5432
backend_weight0 = 1
backend_hostname1 = 'postgres-replica'
backend_port1 = 5432
backend_weight1 = 3  # 3x más tráfico de lecturas a la réplica

num_init_children = 32
max_pool = 4
\`\`\`

## ¿Cuándo un pooler empeora las cosas?

### 1. Prepared statements en transaction pooling

Si usas SQLAlchemy con prepared statements y pgBouncer en modo transaction, los statements preparados se pierden entre transacciones:

\`\`\`python
# Error con pgBouncer transaction mode
cursor.execute("PREPARE mi_plan AS SELECT * FROM usuarios WHERE id = $1")
cursor.execute("EXECUTE mi_plan(1)")
# La conexión se devuelve al pool...
cursor.execute("EXECUTE mi_plan(2)")  # ¡PREPARE no existe!
\`\`\`

### 2. SET statements

\`\`\`sql
SET myapp.user_id = 123;
SELECT * FROM pedidos;
-- La conexión vuelve al pool, el SET se pierde
\`\`\`

En transaction pooling, los SET solo duran la transacción.

### 3. LISTEN/NOTIFY

\`\`\`python
cursor.execute("LISTEN canales")
# ... con pooler transaction, la conexión se pierde
\`\`\`

### 4. Conexiones largas

Si tu aplicación mantiene conexiones abiertas por minutos (websockets, streaming), session pooling consume conexiones del pool.

## Estrategia recomendada

Para la mayoría de APIs REST:

1. **pgBouncer en modo transaction** en el mismo servidor que la app
2. Pool de 25-50 conexiones (suficiente para 200-500 peticiones concurrentes)
3. \`default_pool_size\` = número de cores × 4
4. Monitorizar con \`SHOW POOLS\`

Para aplicaciones con prepared statements, sesiones largas, o LISTEN/NOTIFY:

1. **pgBouncer en modo session** o pooler local con SQLAlchemy
2. Pool de 10-20 conexiones (más conservador)

## Conclusión

Los poolers de conexión no son opcionales en producción. Sin ellos, cada petición paga el coste de abrir una conexión y PostgreSQL se satura con procesos de conexión.

pgBouncer es la opción ligera y recomendada para la mayoría de casos. Pgpool-II añade load balancing y failover si tu arquitectura lo requiere. La clave: elegir el modo correcto (transaction vs session) según el patrón de acceso de tu aplicación.
`;