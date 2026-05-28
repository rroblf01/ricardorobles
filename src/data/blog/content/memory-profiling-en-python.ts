export const content = `
## Introducción

Una fuga de memoria en Python es más sutil que en C (no tienes malloc/free), pero ocurre. Objetos que el GC no puede recolectar, caches sin límite, closures que capturan contexto, y referencias circulares con finalizadores son causas comunes.

En producción, una fuga de memoria se manifiesta como un crecimiento constante del RSS del proceso hasta que OOM Killer lo mata o tienes que reiniciar manualmente.

En este artículo voy a explicar las herramientas y técnicas que uso para encontrar y eliminar fugas de memoria en aplicaciones Python en producción.

## tracemalloc: el rastreador nativo

tracemalloc está incluido en la stdlib desde Python 3.4. Rastrea cada asignación de memoria y puede mostrar el stack trace de dónde se originó.

### Activar tracemalloc

\`\`\`python
import tracemalloc

tracemalloc.start(25)  # 25 frames de profundidad
\`\`\`

### Tomar snapshots

\`\`\`python
snapshot1 = tracemalloc.take_snapshot()

# ... ejecutar código que sospechas que pierde memoria ...

snapshot2 = tracemalloc.take_snapshot()

# Comparar
diff = snapshot2.compare_to(snapshot1, 'lineno')
for stat in diff[:10]:
    print(stat)
\`\`\`

Esto te muestra qué líneas de código están asignando más memoria entre un snapshot y otro.

### Ejemplo real

\`\`\`python
import tracemalloc
import gc

def detectar_fuga():
    tracemalloc.start()
    gc.collect()

    antes = tracemalloc.get_traced_memory()
    # Ejecutar la funcionalidad sospechosa
    datos = procesar_lote()
    gc.collect()
    despues = tracemalloc.get_traced_memory()

    if despues[0] - antes[0] > 10 * 1024 * 1024:  # > 10 MB
        snapshot = tracemalloc.take_snapshot()
        top = snapshot.statistics('lineno')
        for stat in top[:5]:
            print(stat)
\`\`\`

## objgraph: visualización de grafos de objetos

objgraph permite inspeccionar el grafo de referencias entre objetos. Es excelente para encontrar qué mantiene vivo un objeto que debería haber sido recolectado.

\`\`\`bash
pip install objgraph
\`\`\`

### Encontrar referencias a un objeto

\`\`\`python
import objgraph

# ¿Qué tiene referencias a este objeto sospechoso?
obj = obtener_objeto_sospechoso()
objgraph.show_backrefs([obj], max_depth=5, filename='backrefs.png')
\`\`\`

### Mostrar los objetos más comunes

\`\`\`python
objgraph.show_most_common_types(limit=20)
\`\`\`

Si ves miles de objetos del mismo tipo que no deberían acumularse, has encontrado la fuga.

## pympler: el suizo de la memoria

pympler es la herramienta más completa para análisis de memoria:

\`\`\`bash
pip install pympler
\`\`\`

### Resumen de memoria

\`\`\`python
from pympler import summary, muppy

all_objects = muppy.get_objects()
sumario = summary.summarize(all_objects)
summary.print_(sumario)
\`\`\`

### Rastrear un objeto específico

\`\`\`python
from pympler import tracker

tr = tracker.SummaryTracker()
tr.print_diff()  # Muestra cambios desde la última llamada
\`\`\`

### Class Tracker

\`\`\`python
from pympler import classtracker

tr = classtracker.ClassTracker()
tr.track_class(MyClass)
tr.create_snapshot('antes')
# ... código ...
tr.create_snapshot('despues')
tr.stats.print_subtracks()
\`\`\`

## gc: el módulo del garbage collector

El módulo \`gc\` te da control directo sobre el GC generacional de Python:

\`\`\`python
import gc

# Desactivar GC temporalmente (útil para benchmarks)
gc.disable()

# Contar objetos por generación
print(gc.get_count())

# Encontrar objetos inalcanzables
gc.collect()
print(gc.garbage)  # Objetos con __del__ en ciclos

# Debug: rastrear todas las colecciones
gc.set_debug(gc.DEBUG_LEAK)
\`\`\`

## Patrones comunes de fuga

### Caché sin límite

\`\`\`python
# Mal
_cache = {}
def obtener_datos(clave):
    if clave not in _cache:
        _cache[clave] = computacion_costosa(clave)
    return _cache[clave]

# Bien (con límite LRU)
from functools import lru_cache

@lru_cache(maxsize=1000)
def obtener_datos(clave):
    return computacion_costosa(clave)
\`\`\`

### Closures que capturan contexto

\`\`\`python
def crear_handlers():
    handlers = []
    for i in range(1000):
        # Cada closure captura el entorno del bucle
        def handler():
            return i  # ¡Error! i se evalúa al final
        handlers.append(handler)
    return handlers
\`\`\`

### Callbacks no liberados

Si registras callbacks y nunca los deregistras, los objetos referenciados por el callback nunca se liberan.

## Estrategia de debugging

1. **Reproducir localmente**: Ejecuta la funcionalidad sospechosa en un bucle
2. **Monitorear RSS**: \`watch -n 1 'ps -o rss,pid -p $PID'\`
3. **Tomar snapshots**: Usa tracemalloc para comparar antes/después
4. **Identificar el objeto**: Usa objgraph para ver qué mantiene vivo al objeto
5. **Corregir**: Eliminar la referencia que mantiene vivo al objeto

## Conclusión

Las fugas de memoria en Python no son comunes, pero cuando ocurren son difíciles de diagnosticar sin las herramientas adecuadas. tracemalloc, objgraph y pymyler deberían estar en tu caja de herramientas. La clave: monitoriza el RSS en producción y actúa antes de que OOM Killer actúe por ti.
`;