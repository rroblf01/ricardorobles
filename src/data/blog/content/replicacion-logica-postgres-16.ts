export const content = `
## Introducción

¿Alguna vez has tenido dos bases de datos PostgreSQL y has necesitado que ciertos datos viajen de una a otra? No me refiero a un dump/restore, sino a replicación lógica: tablas específicas, transformaciones, o filtrado por filas.

PostgreSQL soporta replicación lógica nativa desde la versión 10. En la versión 16+ (lanzada en 2023) ha mejorado significativamente: más rendimiento, mejor manejo de conflictos, y nuevas capacidades.

## ¿Qué es la replicación lógica?

A diferencia de la replicación física (que replica el clúster completo a nivel de bloques), la replicación lógica trabaja a nivel de tablas y transacciones. Publicas cambios de ciertas tablas y te suscribes a ellos desde otro servidor.

Casos de uso:
- Migrar datos entre servidores sin downtime
- Mantener réplicas parciales (solo ciertas tablas)
- Agregar datos en un data warehouse (ETL en tiempo real)
- Actualizar PostgreSQL con cero downtime
- Replicación bidireccional (en versiones recientes)

## Cómo funciona

\`\`\`sql
-- Publisher: define qué datos compartir
CREATE PUBLICATION mi_publicacion
FOR TABLE usuarios, pedidos;

-- Subscriber: recibe los cambios
CREATE SUBSCRIPTION mi_suscripcion
CONNECTION 'host=publicador.db port=5432 dbname=app user=replicador password=secreto'
PUBLICATION mi_publicacion;
\`\`\`

## Implementación paso a paso

### 1. Configurar el publicador

\`\`\`conf
# postgresql.conf
wal_level = logical
max_replication_slots = 5    # 1 por suscripción
max_wal_senders = 5          # 1 por suscripción
\`\`\`

### 2. Crear usuario de replicación

\`\`\`sql
CREATE USER replicador WITH REPLICATION LOGIN PASSWORD 'secreto';
GRANT SELECT ON usuarios, pedidos TO replicador;
\`\`\`

### 3. Publicar tablas

\`\`\`sql
-- Publicar tablas específicas
CREATE PUBLICATION mi_pub FOR TABLE usuarios, pedidos;

-- Publicar todas las tablas
CREATE PUBLICATION todas FOR ALL TABLES;

-- Publicar con filtro de filas
CREATE PUBLICATION usuarios_activos
FOR TABLE usuarios WHERE (activo = true);

-- Publicar con filtro de columnas
CREATE PUBLICATION usuarios_parcial
FOR TABLE usuarios (id, nombre, email);
\`\`\`

### 4. Configurar el suscriptor

\`\`\`conf
# postgresql.conf (en el suscriptor)
max_replication_slots = 5
\`\`\`

### 5. Crear las tablas en el suscriptor

Las tablas deben existir en el suscriptor con la misma estructura (o compatible):

\`\`\`sql
CREATE TABLE usuarios (LIKE publicador.usuarios INCLUDING ALL);
CREATE TABLE pedidos (LIKE publicador.pedidos INCLUDING ALL);
\`\`\`

### 6. Crear suscripción

\`\`\`sql
CREATE SUBSCRIPTION mi_sub
CONNECTION 'host=publicador port=5432 dbname=app user=replicador password=secreto'
PUBLICATION mi_pub;
\`\`\`

## Novedades en PostgreSQL 16+

### Filtrado de filas mejorado

En PG16 puedes usar WHERE en publicaciones y columnas, con mejor rendimiento que antes:

\`\`\`sql
CREATE PUBLICATION ventas_2024
FOR TABLE ventas WHERE (fecha >= '2024-01-01');
\`\`\`

### Replicación bidireccional

PG16 mejora la detección de conflictos para replicación bidireccional:

\`\`\`sql
-- En ambos servidores
CREATE SUBSCRIPTION sub_a
CONNECTION '...'
PUBLICATION pub_b
WITH (origin = none);  -- Ignora cambios que vinieron de esta sub

CREATE SUBSCRIPTION sub_b
CONNECTION '...'
PUBLICATION pub_a
WITH (origin = none);
\`\`\`

### Rendimiento

PG16 introdujo mejoras significativas en la aplicación de cambios en el suscriptor:

\`\`\`sql
CREATE SUBSCRIPTION mi_sub
WITH (
    binary = true,         -- Transferencia binaria (más rápida)
    streaming = parallel,  -- Aplicación paralela de transacciones
    max_parallel = 4       -- Número de workers paralelos
);
\`\`\`

### Sincronización inicial más rápida

\`\`\`sql
CREATE SUBSCRIPTION mi_sub
WITH (
    copy_data = true,
    max_parallel = 4  -- Copia inicial en paralelo
);
\`\`\`

## Monitorización

\`\`\`sql
-- Estado de las publicaciones
SELECT * FROM pg_publication;
SELECT * FROM pg_publication_tables;

-- Estado de las suscripciones
SELECT * FROM pg_subscription;
SELECT * FROM pg_stat_subscription;

-- Slots de replicación
SELECT slot_name, slot_type, active, restart_lsn
FROM pg_replication_slots;

-- Latencia de replicación (en bytes de WAL)
SELECT slot_name,
       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) as lag
FROM pg_replication_slots;
\`\`\`

## Manejo de conflictos

En replicación bidireccional o desde múltiples fuentes:

\`\`\`sql
-- PG16: registrar conflictos
CREATE SUBSCRIPTION mi_sub
WITH (conflict_resolution = latest_timestamp_xact);
\`\`\`

Estrategias:
- \`latest_timestamp_xact\`: Gana el cambio más reciente
- \`apply_parallel\`: Sin resolución automática, detiene la replicación

## Conclusión

La replicación lógica en PostgreSQL 16+ es madura, rápida y flexible. Casos de uso reales:

- **Zero-downtime upgrades**: Replica lógicamente a un servidor PG16, corta el DNS
- **ETL en tiempo real**: Publica solo las tablas necesarias para analytics
- **Réplicas parciales**: No necesitas todo el clúster en desarrollo
- **Integración de sistemas**: Publica cambios desde tu app a un data warehouse

Y lo mejor: no necesitas extensiones externas. Es PostgreSQL nativo, configurable desde SQL.
`;