export const content = `
## Introducción

Tienes una consulta SQL lenta. Sabes que es lenta porque tu API tarda 3 segundos en responder. Pero no sabes por qué. Ahí entra EXPLAIN ANALYZE.

PostgreSQL puede mostrarte el plan de ejecución de cualquier consulta: qué índices usa, cómo junta las tablas, cuántas filas procesa, y dónde pasa el tiempo. Saber leer EXPLAIN ANALYZE es la habilidad más importante para cualquier desarrollador backend que trabaje con PostgreSQL.

## Sintaxis básica

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM usuarios WHERE email = 'test@ejemplo.com';
\`\`\`

\`EXPLAIN\` muestra el plan. \`ANALYZE\` lo ejecuta y muestra tiempos reales. Sin ANALYZE solo ves estimaciones.

## Estructura de un plan de ejecución

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM usuarios WHERE email = 'test@ejemplo.com';
\`\`\`

Salida típica:

\`\`\`
                                                       QUERY PLAN
------------------------------------------------------------------------------------------------------------------------
 Index Scan using idx_usuarios_email on usuarios  (cost=0.42..8.44 rows=1 width=72) (actual time=0.030..0.031 rows=1 loops=1)
   Index Cond: (email = 'test@ejemplo.com'::text)
   Buffers: shared read=2
 Planning Time: 0.085 ms
 Execution Time: 0.048 ms
\`\`\`

### Componentes

1. **Nodo**: \`Index Scan\`, \`Seq Scan\`, \`Hash Join\`, etc.
2. **Coste estimado**: \`cost=0.42..8.44\` (primera fila..todas las filas)
3. **Filas estimadas**: \`rows=1\`
4. **Ancho**: \`width=72\` bytes por fila
5. **Tiempo real**: \`actual time=0.030..0.031\`
6. **Filas reales**: \`rows=1\`
7. **Iteraciones**: \`loops=1\`

## Los nodos más comunes

### Sequential Scan (Seq Scan)

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM usuarios WHERE nombre = 'Juan';
\`\`\`

\`\`\`
Seq Scan on usuarios  (cost=0.00..234.00 rows=50 width=72) (actual time=0.012..2.345 rows=50 loops=1)
  Filter: (nombre = 'Juan'::text)
  Rows Removed by Filter: 10000
\`\`\`

**Señal de alarma**: \`Seq Scan\` en una tabla grande. Significa que no hay índice para \`nombre\`. PostgreSQL lee toda la tabla.

### Index Scan

\`\`\`sql
CREATE INDEX idx_usuarios_email ON usuarios(email);
EXPLAIN ANALYZE SELECT * FROM usuarios WHERE email = 'test@ejemplo.com';
\`\`\`

\`\`\`
Index Scan using idx_usuarios_email on usuarios  (cost=0.42..8.44 rows=1 width=72) (actual time=0.030..0.031 rows=1 loops=1)
\`\`\`

**Bueno**: Acceso directo por índice. Tiempo bajo (>1ms).

### Index Only Scan

\`\`\`sql
EXPLAIN ANALYZE SELECT email FROM usuarios WHERE email LIKE 'test%';
\`\`\`

\`\`\`
Index Only Scan using idx_usuarios_email on usuarios  (cost=0.42..4.44 rows=5 width=22)
\`\`\`

**Óptimo**: No toca la tabla, solo el índice. Solo posible si todas las columnas necesarias están en el índice.

### Nested Loop Join

Para tablas pequeñas con índices:

\`\`\`
Nested Loop  (cost=0.42..16.88 rows=5 width=100)
  -> Index Scan using idx_usuarios on usuarios
  -> Index Scan using idx_pedidos_usuario on pedidos
\`\`\`

### Hash Join

Para tablas medianas sin índices adecuados:

\`\`\`
Hash Join  (cost=100.00..500.00 rows=1000 width=100)
  -> Seq Scan on usuarios
  -> Hash
      -> Seq Scan on pedidos
\`\`\`

PostgreSQL construye una tabla hash de la tabla más pequeña y luego escanea la grande.

### Merge Join

Para tablas grandes ordenadas:

\`\`\`
Merge Join  (cost=0.42..1000.00 rows=5000 width=100)
  -> Index Scan on usuarios
  -> Index Scan on pedidos
\`\`\`

Útil cuando ambas tablas ya están ordenadas por la clave de join.

## Métricas clave en EXPLAIN ANALYZE

### actual time

\`\`\`
actual time=0.030..0.031
\`\`\`

Primer valor: tiempo hasta la primera fila. Segundo: tiempo hasta la última fila. Si el segundo es mucho mayor que el primero, el cuello de botella está en transmitir muchas filas.

### rows vs rows est

Compara filas reales vs estimadas:

\`\`\`
rows=50 rows est=1000
\`\`\`

Si la estimación es muy diferente de la realidad, las estadísticas de PostgreSQL están desactualizadas. Ejecuta \`ANALYZE;\`.

### Buffers

\`\`\`
Buffers: shared hit=5 read=2
\`\`\`

- \`hit\`: Bloques encontrados en caché (bueno)
- \`read\`: Bloques leídos de disco (malo, puede ser lento)

Alto \`read\` significa que los datos no caben en memoria o que la caché está fría.

## Patrones de problemas

### 1. Seq Scan en tabla grande

\`\`\`
Seq Scan on orders  (cost=0.00..10000.00 rows=100000 width=100)
\`\`\`

**Solución**: Añadir índice.

### 2. Nested Loop con muchas iteraciones

\`\`\`
Nested Loop (actual time=0.5..500.0 rows=1000 loops=1)
  -> Seq Scan on small_table (actual time=0.1..2.0 rows=1000 loops=1)
  -> Index Scan on big_table (actual time=0.3..0.4 rows=1 loops=1000)
\`\`\`

1000 loops en el índice, cada uno rápido (0.4ms), pero 1000 × 0.4 = 400ms. 

**Solución**: A veces un Hash Join es mejor aunque el coste estimado sea mayor.

### 3. Sort en disco

\`\`\`
Sort  (actual time=500.0..600.0 rows=50000)
  Sort Key: fecha
  Sort Method: external merge  Disk: 4096kB
\`\`\`

**Solución**: Aumentar \`work_mem\` para que el sort quepa en memoria.

### 4. Filtro ineficiente

\`\`\`
Seq Scan on usuarios  (actual time=0.1..5.0 rows=50 loops=1)
  Filter: ((edad > 18) AND (activo = true))
  Rows Removed by Filter: 9950
\`\`\`

Se leen 10000 filas para encontrar 50. Índice compuesto \`(edad, activo)\` ayudaría.

## work_mem y otros GUC

\`\`\`sql
-- Ver configuración actual
SHOW work_mem;
SHOW shared_buffers;
SHOW effective_cache_size;

-- Ajustar para la sesión
SET work_mem = '64MB';
SET enable_seqscan = off;  -- temporal, para debugging
\`\`\`

## Herramientas visuales

- **pgAdmin**: Muestra planes gráficamente
- **explain.depesz.com**: Pega tu EXPLAIN ANALYZE y lo analiza
- **pev2**: Herramienta web para visualizar planes

## Conclusión

EXPLAIN ANALYZE es tu mejor amigo para optimizar consultas PostgreSQL. Léelo de abajo arriba (los nodos más internos se ejecutan primero), compara filas reales vs estimadas, y busca Seq Scans en tablas grandes.

Practica: toma una consulta lenta de tu aplicación, añade EXPLAIN ANALYZE (con BUFFERS y FORMAT JSON para más detalle), identifica el nodo más costoso, y atácalo.
`;