export const blogPosts = [
  {
    slug: "fastapi-vs-django-cuando-usar-cada-uno",
    title: "FastAPI vs Django: Cuándo usar cada uno",
    date: "2026-05-28",
    description: "Comparativa detallada entre FastAPI y Django para elegir el framework adecuado según tu proyecto backend.",
    tags: ["Python", "FastAPI", "Django", "Backend"]
  },
  {
    slug: "migrar-aplicaciones-python-a-go",
    title: "¿Migrar aplicaciones Python a Go?",
    date: "2026-05-28",
    description: "Análisis profundo sobre cuándo y cómo migrar de Python a Go, considerando rendimiento, ecosistema y complejidad.",
    tags: ["Python", "Go", "Migración", "Rendimiento"]
  },
  {
    slug: "escribir-librerias-python-en-rust",
    title: "Escribir Librerías de Python en Rust",
    date: "2026-05-28",
    description: "Guía práctica para crear extensiones de Python usando Rust con PyO3 y maturin, mejorando rendimiento donde más importa.",
    tags: ["Python", "Rust", "PyO3", "Extensiones", "Rendimiento"]
  },
  {
    slug: "integra-uv-en-tus-aplicaciones-de-python",
    title: "Integra uv en tus aplicaciones de Python",
    date: "2026-05-28",
    description: "Descubre cómo uv, el gestor de paquetes escrito en Rust, puede acelerar tus proyectos Python y simplificar la gestión de dependencias.",
    tags: ["Python", "uv", "Herramientas", "Rendimiento"]
  },
  {
    slug: "beneficios-de-los-devcontainers",
    title: "Beneficios de los devcontainers",
    date: "2026-05-28",
    description: "Cómo los contenedores de desarrollo estandarizan entornos, facilitan onboarding y eliminan el clásico 'en mi máquina funciona'.",
    tags: ["Docker", "DevOps", "Herramientas", "Productividad"]
  },
  {
    slug: "postgres-la-base-de-datos-todoterreno",
    title: "Postgres: La base de datos todoterreno",
    date: "2026-05-28",
    description: "Exploración de PostgreSQL como base de datos relacional, sus características avanzadas y por qué es la elección preferida en proyectos modernos.",
    tags: ["PostgreSQL", "Bases de datos", "Backend"]
  },
  {
    slug: "redis-el-poder-del-cache",
    title: "Redis: El poder del caché",
    date: "2026-05-28",
    description: "Aprende a usar Redis como caché, cola de mensajes y base de datos en memoria para acelerar tus aplicaciones backend.",
    tags: ["Redis", "Caché", "Rendimiento", "Backend"]
  },
  {
    slug: "python-asgi-vs-wsgi",
    title: "Python ASGI vs WSGI",
    date: "2026-05-28",
    description: "Diferencias clave entre ASGI y WSGI, cuándo migrar al estándar asíncrono y cómo afecta al rendimiento de tus aplicaciones.",
    tags: ["Python", "ASGI", "WSGI", "Rendimiento", "Backend"]
  },
  {
    slug: "mejora-tus-dockerfile",
    title: "Mejora tus Dockerfile",
    date: "2026-05-28",
    description: "Técnicas avanzadas para optimizar Dockerfiles: multi-stage builds, caching, reducción de tamaño y mejores prácticas de seguridad.",
    tags: ["Docker", "DevOps", "Rendimiento", "Seguridad"]
  },
  {
    slug: "deberia-interesarme-arm-en-el-mundo-cloud",
    title: "¿Debería interesarme ARM en el mundo cloud?",
    date: "2026-05-28",
    description: "Análisis del ecosistema ARM en cloud: AWS Graviton, costes, rendimiento y cuándo tiene sentido migrar tus cargas de trabajo.",
    tags: ["ARM", "Cloud", "AWS", "Rendimiento", "Infraestructura"]
  },
  {
    slug: "cpython-por-dentro",
    title: "CPython por dentro: bytecode, pila y ciclo de vida de objetos",
    date: "2026-05-28",
    description: "Viaje al interior del intérprete CPython: cómo funciona el bytecode, la evaluación en pila y cómo nacen y mueren los objetos.",
    tags: ["Python", "CPython", "Rendimiento", "Bajo nivel"]
  },
  {
    slug: "el-gil-en-profundidad",
    title: "El GIL en profundidad: qué bloquea y cómo esquivarlo",
    date: "2026-05-28",
    description: "Análisis detallado del GIL de Python, sus efectos reales en concurrencia y las estrategias para mitigarlo.",
    tags: ["Python", "GIL", "Concurrencia", "Rendimiento"]
  },
  {
    slug: "perf-strace-ebpf-para-python",
    title: "Perf, strace y eBPF para depurar Python en producción",
    date: "2026-05-28",
    description: "Herramientas de sistema para diagnosticar problemas de rendimiento en aplicaciones Python a nivel de kernel.",
    tags: ["Python", "Rendimiento", "eBPF", "Linux"]
  },
  {
    slug: "memory-profiling-en-python",
    title: "Memory profiling en producción con Python",
    date: "2026-05-28",
    description: "Técnicas y herramientas para encontrar fugas de memoria en aplicaciones Python en entornos productivos.",
    tags: ["Python", "Memoria", "Rendimiento", "Producción"]
  },
  {
    slug: "zero-copy-en-python",
    title: "Zero-copy en Python: buffers, memoryview y el protocolo de búfer",
    date: "2026-05-28",
    description: "Cómo evitar copias innecesarias de datos usando memoryview, el protocolo de búfer y técnicas de cero copias.",
    tags: ["Python", "Rendimiento", "Bajo nivel", "Memoria"]
  },
  {
    slug: "numba-jit-en-python",
    title: "Numba: compilación JIT para Python numérico",
    date: "2026-05-28",
    description: "Acelera algoritmos numéricos en Python usando compilación just-in-time con Numba sin salir del ecosistema Python.",
    tags: ["Python", "Numba", "JIT", "Rendimiento"]
  },
  {
    slug: "como-funciona-un-syscall-desde-python",
    title: "Cómo funciona un syscall desde Python: I/O, epoll y el kernel",
    date: "2026-05-28",
    description: "Qué ocurre dentro del kernel cuando haces una operación de I/O desde Python: syscalls, buffers y llamadas al sistema.",
    tags: ["Python", "Linux", "Kernel", "I/O", "Bajo nivel"]
  },
  {
    slug: "simd-y-vectorizacion-desde-python",
    title: "SIMD y vectorización desde Python: exprime tu CPU",
    date: "2026-05-28",
    description: "Cómo aprovechar instrucciones SIMD de la CPU desde Python mediante numpy, Cython y extensiones nativas.",
    tags: ["Python", "SIMD", "Rendimiento", "CPU"]
  },
  {
    slug: "cache-cpu-y-rendimiento",
    title: "Caché CPU y su impacto en el rendimiento de tu backend",
    date: "2026-05-28",
    description: "Cómo la jerarquía de caché de la CPU afecta al rendimiento de aplicaciones Python y cómo escribir código cache-friendly.",
    tags: ["Python", "CPU", "Caché", "Rendimiento", "Bajo nivel"]
  },
  {
    slug: "linux-kernel-tuning-para-backend",
    title: "Linux kernel tuning para aplicaciones backend",
    date: "2026-05-28",
    description: "Ajustes del kernel Linux que mejoran el rendimiento de aplicaciones backend Python: page cache, TCP, scheduler y más.",
    tags: ["Linux", "Kernel", "Rendimiento", "Backend"]
  },
  {
    slug: "postgres-explain-analyze",
    title: "PostgreSQL: leyendo EXPLAIN ANALYZE como un experto",
    date: "2026-05-28",
    description: "Guía para interpretar planes de ejecución en PostgreSQL y encontrar cuellos de botella en consultas SQL.",
    tags: ["PostgreSQL", "SQL", "Rendimiento", "Backend"]
  },
  {
    slug: "connection-pooling-profundo",
    title: "Connection pooling profundo: pgBouncer, Pgpool y más allá",
    date: "2026-05-28",
    description: "Cuándo y cómo usar poolers de conexión, sus modos de operación y por qué a veces un pool empeora las cosas.",
    tags: ["PostgreSQL", "Bases de datos", "Rendimiento", "Backend"]
  },
  {
    slug: "arquitecturas-de-cache-multi-nivel",
    title: "Arquitecturas de caché multi-nivel: diseño eficiente",
    date: "2026-05-28",
    description: "Cómo diseñar una jerarquía de caché con Redis, CDN y aplicación para maximizar aciertos y minimizar latencia.",
    tags: ["Redis", "Caché", "Arquitectura", "Rendimiento"]
  },
  {
    slug: "diseno-de-apis-eficientes",
    title: "Diseño de APIs eficientes: paginación, partial responses y rate limiting",
    date: "2026-05-28",
    description: "Técnicas para construir APIs REST que escalan: cursor-based pagination, sparse fieldsets, bulk endpoints y rate limiting sin dolor.",
    tags: ["API", "REST", "Rendimiento", "Backend"]
  },
  {
    slug: "extensiones-nativas-en-rust-cython-zig",
    title: "Extensiones nativas en Rust, Cython y Zig para Python",
    date: "2026-05-28",
    description: "Comparativa práctica de las tres vías para acelerar Python con código nativo: cuándo usar cada una y cómo empezar.",
    tags: ["Python", "Rust", "Cython", "Zig", "Extensiones", "Rendimiento"]
  },
  {
    slug: "pyo3-avanzado",
    title: "PyO3 avanzado: GIL, errores, tipos complejos y publicación",
    date: "2026-05-28",
    description: "Técnicas avanzadas de PyO3 para extensiones Python en Rust: manejo del GIL, excepciones, tipos nativos y publicación en PyPI.",
    tags: ["Python", "Rust", "PyO3", "Extensiones", "Rendimiento"]
  },
  {
    slug: "clean-code-practico",
    title: "Clean Code práctico: principios para código Python mantenible",
    date: "2026-05-28",
    description: "Principios de código limpio aplicados a Python: nombres, funciones pequeñas, manejo de errores y el equilibrio entre DRY y duplicación.",
    tags: ["Python", "Clean Code", "Buenas prácticas", "Backend"]
  },
  {
    slug: "starlette-middlewares-profundo",
    title: "Starlette y middlewares a fondo: logging, rate limiting, CORS",
    date: "2026-05-28",
    description: "Configuración avanzada de Starlette: middlewares personalizados, manejo de errores global, WebSockets y testing integrado.",
    tags: ["Python", "Starlette", "ASGI", "Middleware", "Backend"]
  },
  {
    slug: "sqlalchemy-errores-comunes",
    title: "SQLAlchemy: errores comunes y cómo evitarlos",
    date: "2026-05-28",
    description: "Los 7 errores más frecuentes con SQLAlchemy en producción: N+1 queries, session management, bulk operations y optimización de consultas.",
    tags: ["Python", "SQLAlchemy", "ORM", "PostgreSQL", "Rendimiento"]
  },
  {
    slug: "replicacion-logica-postgres-16",
    title: "Replicación lógica en PostgreSQL 16+: guía completa",
    date: "2026-05-28",
    description: "Implementación de replicación lógica en PostgreSQL 16: publicación, suscripción, filtrado, bidireccional y monitorización.",
    tags: ["PostgreSQL", "Replicación", "Bases de datos", "DevOps"]
  },
  {
    slug: "uvicorn-configuracion-avanzada",
    title: "Uvicorn en producción: configuración avanzada para ASGI",
    date: "2026-05-28",
    description: "Workers, timeouts, logging, SSL y lifecycle hooks en Uvicorn para ejecutar aplicaciones ASGI Python en producción.",
    tags: ["Python", "Uvicorn", "ASGI", "Producción", "DevOps"]
  },
  {
    slug: "docker-python-produccion",
    title: "Docker para Python en producción: mejores prácticas",
    date: "2026-05-28",
    description: "Imágenes Docker optimizadas para Python: multi-stage builds, seguridad, reducción de tamaño y configuración para producción.",
    tags: ["Docker", "Python", "DevOps", "Seguridad", "Producción"]
  },
  {
    slug: "redis-caching-python-backend",
    title: "Redis caching patterns para Python backend",
    date: "2026-05-28",
    description: "Patrones avanzados de caching con Redis en Python: cache-aside, write-through, rate limiting, sesiones y serialización eficiente.",
    tags: ["Redis", "Caché", "Python", "Rendimiento", "Backend"]
  }
];