import { Component } from "@angular/core";
import { NgOptimizedImage } from '@angular/common'

const TECHS = {
  django: { path: "assets/django.svg", name: "Django" },
  python: { path: "assets/python.svg", name: "Python" },
  nuxt: { path: "assets/nuxt.svg", name: "Nuxt" },
  typescript: { path: "assets/typescript.svg", name: "TypeScript" },
  angular: { path: "assets/angular.svg", name: "Angular" },
  fastapi: { path: "assets/fastapi.svg", name: "FastAPI" },
  html: { path: "assets/html.svg", name: "HTML" },
  css: { path: "assets/css.svg", name: "CSS" },
  javascript: { path: "assets/javascript.svg", name: "JavaScript" },
  pydantic_ai: { path: "assets/pydantic-ai.svg", name: "Pydantic AI" },
};

@Component({
    selector: "app-projects",
    imports: [NgOptimizedImage],
    templateUrl: "./projects.component.html"
})
export class ProjectsComponent {
  projects: {
    url: string;
    title: string;
    description: string;
    imgPath: string;
    sources: { url: string; text: string }[];
    techs: { path: string; name: string }[];
  }[] = [
    {
      url: "https://rabbiat.ricardorobles.es/",
      title: "RabbIAt",
      description:
        "Una aplicación que busca crear una prueba de concepto sobre cómo se integran los MCPs y respuesta estructurada con LLMs. Se puede probar una demo con el usuario guest y contraseña test-123",
      imgPath: "assets/rabbiat.webp",
      sources: [
        {url: "https://github.com/rroblf01/rabbiat", text: "Code"},
      ],
  techs: [TECHS.django, TECHS.python, TECHS.pydantic_ai]
    },
    {
      url: "https://ricardo-scheduler.fastapicloud.dev/",
      title: "Bunny Scheduler",
      description:
        "Una aplicación que simula un sistema de reservas en un calendario. Permite crear usuarios, crear reservas y proponer intercambios en las reservas.",
      imgPath: "assets/scheduler.webp",
      sources: [
        {url: "https://github.com/rroblf01/bunny-scheduler", text: "Code"},
      ],
  techs: [TECHS.django, TECHS.python]
    },
    {
      url: "https://sushi-bunny.onrender.com/",
      title: "Sushi Bunny",
      description:
        "Una simulación de una mesa en un restaurante de sushi, donde puedes reunirte con amigos y contar cuanto sushi has comido.",
      imgPath: "assets/sushi-bunny.webp",
      sources: [
        {url: "https://github.com/rroblf01/sushi-bunny", text: "Code"},
      ],
  techs: [TECHS.django, TECHS.python]
    },
    {
      url: "https://github.com/rroblf01/bunnyhopapi",
      title: "Bunny Estimates",
      description:
        "Framework http escrito en python desde cero. Swagger automático, CORS, validación de tipos y excelente rendimiento.",
      imgPath: "assets/bunnyhopapi.webp",
      sources: [
        {url: "https://github.com/rroblf01/bunnyhopapi", text: "Framework Code"},
      ],
  techs: [TECHS.python]
    },
    {
      url: "https://github.com/rroblf01/bunny-estimates",
      title: "Bunny Estimates",
      description:
        "Una herramienta para calcular el precio de un proyecto, está hecha con Nuxt y Django.",
      imgPath: "assets/poker.webp",
      sources: [
        {url: "https://github.com/rroblf01/bunny-estimates", text: "Code"},
      ],
  techs: [TECHS.django, TECHS.python, TECHS.nuxt, TECHS.typescript]
    },
    {
      url: "https://ricardo-password-manager.deno.dev/",
      title: "Password Manager",
      description:
        "Un gestor de contraseñas creado con Angular y Hono. He usado JWT para la autenticación y la base de datos de Deno KV.",
      imgPath: "assets/password-manager.webp",
      sources: [
        {url: "https://github.com/rroblf01/ricardo-password-manager", text: "Front Code"},
        {url: "https://github.com/rroblf01/ricardo-passwords", text: "Back Code"}
      ],
  techs: [TECHS.angular, TECHS.typescript]
    },
    {
      url: "https://ricardotypefast.deno.dev/",
      title: "Type Fast",
      description: "Una herramienta destinada a saber qué tan rápido eres escribiendo, está hecha con Angular.",
      imgPath: "assets/typefast.webp",
      sources: [
        {url: "https://github.com/rroblf01/typefast", text: "Code"},
      ],
  techs: [TECHS.angular, TECHS.typescript]
    },
    {
      url: "https://ricardo-wordle.vercel.app/",
      title: "Fast Wordle",
      description: "Un clon de Wordle hecho con FastAPI y HTML/CSS/JS vanilla.",
      imgPath: "assets/fastwordle.webp",
      sources: [
        {url: "https://github.com/rroblf01/fast-wordle", text: "Code"},
      ],
  techs: [TECHS.fastapi, TECHS.python, TECHS.html, TECHS.css, TECHS.javascript]
    },
    {
      url: "https://ricardorobles.deno.dev/",
      title: "Portafolio",
      description: "Este mismo portafolio, para ello he usado Angular.",
      imgPath: "assets/portafolio.webp",
      sources: [
        {url: "https://github.com/rroblf01/ricardorobles", text: "Code"},
      ],
  techs: [TECHS.angular, TECHS.typescript]
    },
    {
      url: "https://ricardo-image-compressor.deno.dev/",
      title: "Image Compressor",
      description:
        "Un simple y rápido compresor de imágenes en línea hecho con Javascript vanilla.",
      imgPath: "assets/compress.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-compress", text: "Code"},
      ],
  techs: [TECHS.html, TECHS.css, TECHS.javascript]
    },
    {
      url: "https://ricardo-api-mock.deno.dev/",
      title: "Mock API",
      description:
        "Una herramienta para Mockear una API, para ello he usado Javascript y la base de datos de Deno KV.",
      imgPath: "assets/mock-api.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-mock-api", text: "Code"},
      ],
  techs: [TECHS.html, TECHS.css, TECHS.javascript]
    },
    {
      url: "https://ricardo-jsontointerface.deno.dev/",
      title: "JSON to Interface",
      description:
        "Una herramienta para convertir un JSON en una interfaz de TypeScript, para ello he usado Javascript.",
      imgPath: "assets/json-interface.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-jsontointerface", text: "Code"},
      ],
  techs: [TECHS.html, TECHS.css, TECHS.javascript, TECHS.typescript]
    },
  ];
}