export const content = `
## Introducción

Linux es el sistema operativo dominante en servidores, y sus configuraciones por defecto están pensadas para escritorios o cargas de trabajo generales. Para un backend Python con alta concurrencia, los valores por defecto pueden ser subóptimos.

Ajustar el kernel no es magia, pero puede marcar la diferencia entre una aplicación que responde en 10ms y una que sufre picos de latencia de 500ms. En este artículo voy a cubrir los ajustes más impactantes para aplicaciones backend.

## Page cache

Linux cachea las lecturas de disco en RAM (page cache). La primera vez que lees un archivo, va a disco. Las siguientes, desde page cache.

### Ajustes

\`\`\`bash
# Cuánta memoria puede usar page cache (default: 100)
sysctl -w vm.vfs_cache_pressure=50

# Porcentaje de memoria para page cache (default: 30)
sysctl -w vm.dirty_ratio=20
sysctl -w vm.dirty_background_ratio=5
\`\`\`

- \`vfs_cache_pressure=50\`: El kernel tarda más en liberar caché de inodos/dentries. Bueno para servidores con muchos archivos pequeños.
- \`dirty_ratio=20\`: Hasta 20% de RAM puede tener páginas sucias antes de bloquear escrituras.
- \`dirty_background_ratio=5\": Cuando se alcanza 5%, pdflush escribe en segundo plano.

### Swap

Para servidores, minimiza el swap:

\`\`\`bash
sysctl -w vm.swappiness=10
\`\`\`

\`swappiness=10\` solo swapea cuando es absolutamente necesario. Para apps Python con GC, swap es devastador: un solo acceso a página swapeada puede tardar 10ms.

## TCP tuning

### Buffer de socket

\`\`\`bash
# Tamaño máximo del buffer de recepción (default: 212992)
sysctl -w net.core.rmem_max=16777216

# Tamaño máximo del buffer de envío
sysctl -w net.core.wmem_max=16777216

# Tamaños automáticos para TCP (min, default, max)
sysctl -w net.ipv4.tcp_rmem="4096 131072 16777216"
sysctl -w net.ipv4.tcp_wmem="4096 65536 16777216"
\`\`\`

### Conexiones

\`\`\`bash
# Reutilizar conexiones en TIME_WAIT
sysctl -w net.ipv4.tcp_tw_reuse=1

# Rango de puertos efímeros
sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Cola de conexiones pendientes (default: 128)
sysctl -w net.core.somaxconn=4096

# Habilitar TCP Fast Open
sysctl -w net.ipv4.tcp_fastopen=3
\`\`\`

### Congestión

\`\`\`bash
# Algoritmo de control de congestión (BBR para enlaces de alto ancho de banda)
sysctl -w net.ipv4.tcp_congestion_control=bbr

# Habilitar BBR (necesita módulo)
modprobe tcp_bbr

# Cola de backlog en listen()
sysctl -w net.core.netdev_max_backlog=10000
\`\`\`

## I/O scheduler

Para SSD (la mayoría de servidores modernos):

\`\`\`bash
# Ver el scheduler actual
cat /sys/block/sda/queue/scheduler

# Usar none (o noop) para SSD, sin reordenamiento
echo none > /sys/block/sda/queue/scheduler

# Elevar prioridad de peticiones de apps interactivas
sysctl -w block/queue/iosched/slice_idle=0
\`\`\`

## Scheduler de CPU

### Para baja latencia (backends web)

\`\`\`bash
# Latency-sensitive workload
sysctl -w kernel.sched_min_granularity_ns=3000000
sysctl -w kernel.sched_latency_ns=12000000
sysctl -w kernel.sched_wakeup_granularity_ns=2000000
sysctl -w kernel.sched_migration_cost_ns=500000
\`\`\`

### Para throughput

\`\`\`bash
# CPU-intensive workload
sysctl -w kernel.sched_min_granularity_ns=10000000
sysctl -w kernel.sched_wakeup_granularity_ns=15000000
\`\`\`

## Transparent Huge Pages (THP)

THP puede causar latencia impredecible porque el kernel compacta memoria en segundo plano:

\`\`\`bash
# Desactivar THP (recomendado para apps de baja latencia)
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
\`\`\`

Para aplicaciones Python con GC frecuente, THP puede aumentar la latencia de las pausas de GC.

## cgroups y aislamiento

Para asegurar recursos a tu backend:

\`\`\`bash
# Crear grupo para la app
cgcreate -g cpu,memory,blkio:/aplicacion

# Límite de CPU (500ms de cada 1000ms = 0.5 cores)
cgset -r cpu.cfs_quota_us=50000 aplicacion

# Límite de memoria (2 GB)
cgset -r memory.limit_in_bytes=2G aplicacion

# Límite de I/O (10 MB/s)
cgset -r blkio.throttle.read_bps_device="8:0 10485760" aplicacion

# Ejecutar la app en el grupo
cgexec -g cpu,memory,blkio:/aplicacion python app.py
\`\`\`

## sysctl.conf completo

\`\`\`conf
# /etc/sysctl.d/99-backend.conf

vm.swappiness=10
vm.vfs_cache_pressure=50
vm.dirty_ratio=20
vm.dirty_background_ratio=5

net.core.somaxconn=4096
net.core.rmem_max=16777216
net.core.wmem_max=16777216
net.core.netdev_max_backlog=10000

net.ipv4.tcp_rmem=4096 131072 16777216
net.ipv4.tcp_wmem=4096 65536 16777216
net.ipv4.tcp_tw_reuse=1
net.ipv4.ip_local_port_range=1024 65535
net.ipv4.tcp_fastopen=3
net.ipv4.tcp_congestion_control=bbr

kernel.sched_min_granularity_ns=3000000
kernel.sched_latency_ns=12000000
kernel.sched_wakeup_granularity_ns=2000000
\`\`\`

## Monitorización

Mide antes y después:

\`\`\`bash
# Latencia de scheduling
sudo /usr/share/bcc/tools/runqlat

# Syscalls lentas
sudo /usr/share/bcc/tools/syscount -L

# Page faults
perf stat -e page-faults python app.py
\`\`\`

## Conclusión

Ajustar el kernel no es necesario para todos los proyectos, pero cuando tu aplicación empieza a tener problemas de latencia o throughput, estos ajustes pueden darte ganancias significativas sin cambiar una línea de código.

Mi recomendación: empieza siempre midiendo. Identifica si el cuello de botella es CPU, I/O, red, o memoria. Luego aplica el ajuste específico para ese problema, no todos a la vez.
`;