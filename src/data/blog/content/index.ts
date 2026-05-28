import { content as fastapiVSDjango } from "./fastapi-vs-django-cuando-usar-cada-uno.ts";
import { content as migrarGo } from "./migrar-aplicaciones-python-a-go.ts";
import { content as escribirRust } from "./escribir-librerias-python-en-rust.ts";

export const contentMap: Record<string, string> = {
  "fastapi-vs-django-cuando-usar-cada-uno": fastapiVSDjango,
  "migrar-aplicaciones-python-a-go": migrarGo,
  "escribir-librerias-python-en-rust": escribirRust,
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