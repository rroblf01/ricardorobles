import { content as fastapiVSDjango } from "./fastapi-vs-django-cuando-usar-cada-uno.ts";
import { content as migrarGo } from "./migrar-aplicaciones-python-a-go.ts";
import { content as escribirRust } from "./escribir-librerias-python-en-rust.ts";
import { content as integraUv } from "./integra-uv-en-tus-aplicaciones-de-python.ts";
import { content as devcontainers } from "./beneficios-de-los-devcontainers.ts";
import { content as postgres } from "./postgres-la-base-de-datos-todoterreno.ts";
import { content as redis } from "./redis-el-poder-del-cache.ts";
import { content as asgiVsWsgi } from "./python-asgi-vs-wsgi.ts";
import { content as dockerfile } from "./mejora-tus-dockerfile.ts";
import { content as arm } from "./deberia-interesarme-arm-en-el-mundo-cloud.ts";
import { content as cpython } from "./cpython-por-dentro.ts";
import { content as gil } from "./el-gil-en-profundidad.ts";
import { content as perfEbpf } from "./perf-strace-ebpf-para-python.ts";
import { content as memoryProfiling } from "./memory-profiling-en-python.ts";
import { content as zeroCopy } from "./zero-copy-en-python.ts";
import { content as numba } from "./numba-jit-en-python.ts";
import { content as syscall } from "./como-funciona-un-syscall-desde-python.ts";
import { content as simd } from "./simd-y-vectorizacion-desde-python.ts";
import { content as cacheCPU } from "./cache-cpu-y-rendimiento.ts";
import { content as kernelTuning } from "./linux-kernel-tuning-para-backend.ts";
import { content as explainAnalyze } from "./postgres-explain-analyze.ts";
import { content as connectionPooling } from "./connection-pooling-profundo.ts";
import { content as arquitecturasCache } from "./arquitecturas-de-cache-multi-nivel.ts";
import { content as disenoAPIs } from "./diseno-de-apis-eficientes.ts";
import { content as extensionesNativas } from "./extensiones-nativas-en-rust-cython-zig.ts";
import { content as pyo3Avanzado } from "./pyo3-avanzado.ts";
import { content as cleanCode } from "./clean-code-practico.ts";
import { content as starlette } from "./starlette-middlewares-profundo.ts";
import { content as sqlalchemy } from "./sqlalchemy-errores-comunes.ts";
import { content as replicacionLogica } from "./replicacion-logica-postgres-16.ts";
import { content as uvicorn } from "./uvicorn-configuracion-avanzada.ts";
import { content as dockerPython } from "./docker-python-produccion.ts";
import { content as redisCaching } from "./redis-caching-python-backend.ts";

export const contentMap: Record<string, string> = {
  "fastapi-vs-django-cuando-usar-cada-uno": fastapiVSDjango,
  "migrar-aplicaciones-python-a-go": migrarGo,
  "escribir-librerias-python-en-rust": escribirRust,
  "integra-uv-en-tus-aplicaciones-de-python": integraUv,
  "beneficios-de-los-devcontainers": devcontainers,
  "postgres-la-base-de-datos-todoterreno": postgres,
  "redis-el-poder-del-cache": redis,
  "python-asgi-vs-wsgi": asgiVsWsgi,
  "mejora-tus-dockerfile": dockerfile,
  "deberia-interesarme-arm-en-el-mundo-cloud": arm,
  "cpython-por-dentro": cpython,
  "el-gil-en-profundidad": gil,
  "perf-strace-ebpf-para-python": perfEbpf,
  "memory-profiling-en-python": memoryProfiling,
  "zero-copy-en-python": zeroCopy,
  "numba-jit-en-python": numba,
  "como-funciona-un-syscall-desde-python": syscall,
  "simd-y-vectorizacion-desde-python": simd,
  "cache-cpu-y-rendimiento": cacheCPU,
  "linux-kernel-tuning-para-backend": kernelTuning,
  "postgres-explain-analyze": explainAnalyze,
  "connection-pooling-profundo": connectionPooling,
  "arquitecturas-de-cache-multi-nivel": arquitecturasCache,
  "diseno-de-apis-eficientes": disenoAPIs,
  "extensiones-nativas-en-rust-cython-zig": extensionesNativas,
  "pyo3-avanzado": pyo3Avanzado,
  "clean-code-practico": cleanCode,
  "starlette-middlewares-profundo": starlette,
  "sqlalchemy-errores-comunes": sqlalchemy,
  "replicacion-logica-postgres-16": replicacionLogica,
  "uvicorn-configuracion-avanzada": uvicorn,
  "docker-python-produccion": dockerPython,
  "redis-caching-python-backend": redisCaching,
};

export function getContent(slug: string): string {
  return contentMap[slug] || "";
}

export function getWordCount(slug: string): number {
  const text = getContent(slug);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function getReadingTime(slug: string): string {
  const words = getWordCount(slug);
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min de lectura`;
}
