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