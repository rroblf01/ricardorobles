export const content = `
## Introducción

Cuando tu aplicación Python va lenta en producción y no sabes por qué, las herramientas de profiling a nivel de aplicación (cProfile, py-spy) son útiles pero a veces no dan toda la imagen. El problema puede estar en el kernel: syscalls bloqueantes, page faults, contención de I/O o scheduling ineficiente.

Perf, strace y eBPF son herramientas de Linux que te permiten observar lo que ocurre a nivel de sistema operativo. Con ellas puedes ver exactamente qué syscalls hace tu proceso, cuánto tiempo pasa en cada una y qué está haciendo el kernel.

En este artículo voy a explicar cómo usar estas tres herramientas para depurar aplicaciones Python en producción.

## strace: el rastreador de syscalls

strace intercepta y registra las llamadas al sistema que hace un proceso. Es la herramienta más básica pero increíblemente útil.

### Uso básico

\`\`\`bash
# Ejecutar y trazar
strace -f -c python app.py

# Adjuntar a proceso en ejecución
strace -p PID -e trace=network

# Filtrar por tipo de syscall
strace -e trace=open,read,write python app.py
\`\`\`

### Ejemplo práctico

Imagina que tu aplicación tarda mucho en iniciar. Con strace puedes ver qué archivos abre:

\`\`\`bash
strace -e trace=openat,stat -o /tmp/trace.log python app.py
\`\`\`

Si ves cientos de intentos de abrir archivos que no existen, tienes un problema de resolución de imports o de carga de configuración.

### Limitaciones

strace tiene un overhead significativo (5-10x más lento). No lo uses en producción sin cuidado. Para entornos productivos, prefiere eBPF.

## perf: el profiler del kernel

perf usa contadores de rendimiento de la CPU y puntos de muestreo del kernel para hacer profiling con mínimo overhead (1-2%).

### Uso básico

\`\`\`bash
# Registrar muestras de CPU de un proceso
perf record -p PID -g -- sleep 30

# Ver el reporte
perf report

# Contar eventos de caché
perf stat -e cache-misses,cache-references -p PID sleep 10
\`\`\`

### Flame graphs con perf

Una de las visualizaciones más útiles:

\`\`\`bash
# Capturar stacks
perf record -F 99 -p PID -g -- sleep 60
perf script > stacks.perf

# Generar flame graph (necesita FlameGraph de Brendan Gregg)
stackcollapse-perf.pl stacks.perf > stacks.folded
flamegraph.pl stacks.folded > flame.svg
\`\`\`

El flame graph te muestra exactamente dónde pasa el tiempo tu aplicación. Las barras más anchas son los cuellos de botella.

### Ejemplo: encontrar un bucle ineficiente

\`\`\`bash
perf record -F 99 -g python app.py
perf report
\`\`\`

Si ves que el 40% del tiempo está en \`PyEval_EvalFrameDefault\` y dentro en \`PyLong_Add\>, probablemente tienes un bucle numérico en Python puro que deberías mover a numpy o C.

## eBPF: observabilidad del kernel sin instrumentación

eBPF (Extended Berkeley Packet Filter) permite ejecutar programas sandbox en el kernel sin modificarlo. Es la herramienta más potente y segura para observabilidad en producción.

### BCC (BPF Compiler Collection)

BCC proporciona herramientas listas para usar:

\`\`\`bash
# ¿Qué está haciendo mi proceso?
sudo python3 /usr/share/bcc/tools/top -p PID

# ¿Cuánto tiempo pasa en syscalls?
sudo python3 /usr/share/bcc/tools/syscount -p PID

# Latencia de disco
sudo python3 /usr/share/bcc/tools/biolatency

# Stacks de I/O
sudo python3 /usr/share/bcc/tools/offcputime -p PID
\`\`\`

### Herramientas clave para Python

**profile**: Muestreo de stacks similar a perf pero con eBPF:

\`\`\`bash
sudo /usr/share/bcc/tools/profile -adF 99 -p PID 30
\`\`\`

**runqlat**: Latencia de scheduling (cuánto espera tu proceso para obtener CPU):

\`\`\`bash
sudo /usr/share/bcc/tools/runqlat -p PID
\`\`\`

Si la latencia es alta, tu proceso compite con otros procesos por la CPU y necesitas más cores o ajustar prioridades.

### Caso real: Python lento en producción

Una aplicación Django en producción tenía picos de latencia de 10 segundos. cProfile no mostraba nada claro. Con eBPF descubrimos:

1. \`runqlat\` mostraba latencias de scheduling de 3-5 segundos
2. Otro proceso (backup) consumía toda la CPU
3. Solución: migrar el backup a otra máquina y aislar la app con cgroups

## Resumen de herramientas

| Herramienta | Overhead | Persistencia | Uso principal |
|-------------|----------|-------------|---------------|
| strace | Alto (5-10x) | Sesión | Debug temporal |
| perf | Bajo (1-2%) | Sesión | Profiling CPU |
| eBPF | Muy bajo | Permanente | Producción |

## Conclusión

Para diagnóstico de rendimiento en producción, empieza por eBPF (mínimo overhead), usa perf para profiling CPU detallado y reserva strace para debugging temporal. Con estas tres herramientas puedes diagnosticar prácticamente cualquier problema de rendimiento, desde un syscall bloqueante hasta contención de CPU o I/O lenta.
`;