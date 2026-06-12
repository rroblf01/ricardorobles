const TECHS = {
  zig: { path: "/assets/zig.svg", name: "Zig" },
  django: { path: "/assets/django.svg", name: "Django" },
  python: { path: "/assets/python.svg", name: "Python" },
  nuxt: { path: "/assets/nuxt.svg", name: "Nuxt" },
  typescript: { path: "/assets/typescript.svg", name: "TypeScript" },
  angular: { path: "/assets/angular.svg", name: "Angular" },
  golang: { path: "/assets/golang.svg", name: "Golang" },
  fastapi: { path: "/assets/fastapi.svg", name: "FastAPI" },
  html: { path: "/assets/html.svg", name: "HTML" },
  css: { path: "/assets/css.svg", name: "CSS" },
  javascript: { path: "/assets/javascript.svg", name: "JavaScript" },
  pydantic_ai: { path: "/assets/pydantic-ai.svg", name: "Pydantic AI" },
  rust: { path: "/assets/rust.svg", name: "Rust" },
  astro: { path: "/assets/astro.svg", name: "Astro" },
};

export interface Project {
  url: string;
  title: string;
  description: string;
  imgPath: string;
  sources: { url: string; text: string }[];
  techs: { path: string; name: string }[];
}

export const projects: Project[] = [
  {
    url: "https://github.com/rroblf01/zig-maturin",
    title: "zig-maturin",
    description:
      "Compilador y framework para crear extensiones de Python en Zig con soporte nativo de compilación cruzada zero-config y rendimiento extremo.",
    imgPath: "/assets/zig-maturin.webp",
    sources: [
      {url: "https://github.com/rroblf01/zig-maturin", text: "Code"},
    ],
    techs: [TECHS.python, TECHS.zig]
  },
  {
    url: "https://github.com/rroblf01/rabbitinspect/",
    title: "rabbitinspect",
    description:
      "Un perf y analizador de rendimiento de código Python escrito en Rust (a través de PyO3).",
    imgPath: "/assets/rabbitinspect.webp",
    sources: [
      {url: "https://github.com/rroblf01/rabbitinspect", text: "Code"},
    ],
    techs: [TECHS.python, TECHS.rust]
  },
  {
    url: "https://github.com/rroblf01/gofly/",
    title: "gofly",
    description:
      "Servidor de archivos estáticos y reverse proxy de alto rendimiento desarrollado en Go (pure stdlib).",
    imgPath: "/assets/gofly.webp",
    sources: [
      {url: "https://github.com/rroblf01/gofly", text: "Code"},
    ],
    techs: [TECHS.golang]
  },
  {
    url: "https://rroblf01.github.io/lapinq/",
    title: "lapinq",
    description:
      "Una cola de tareas ligera con backend PostgreSQL — reemplazando Celery + RabbitMQ con un solo contenedor.",
    imgPath: "/assets/lapinq.webp",
    sources: [
      {url: "https://github.com/rroblf01/lapinq", text: "Code"},
    ],
    techs: [TECHS.python, TECHS.rust]
  },
  {
    url: "https://github.com/rroblf01/whitesnout",
    title: "Whitesnout",
    description:
      "Es un servidor ASGI de ficheros estáticos escrito en Rust y Python. Es muy rápido y ligero, ideal para servir archivos estáticos en producción.",
    imgPath: "/assets/whitesnout.webp",
    sources: [
      {url: "https://github.com/rroblf01/whitesnout", text: "Code"},
    ],
    techs: [TECHS.python, TECHS.rust]
  },
  {
    url: "https://jirrabit.ricardorobles.es/",
    title: "Jirrabit",
    description:
      "Es una aplicación inspirada en Jira pero con un enfoque en la simplicidad y el rendimiento. Puedes probar la demo con el usuario alice_pm y contraseña demopass",
    imgPath: "/assets/jirrabit.webp",
    sources: [
      {url: "https://github.com/rroblf01/jirrabit", text: "Code"},
    ],
    techs: [TECHS.django, TECHS.python, TECHS.javascript, TECHS.html, TECHS.css]
  },
  {
    url: "https://github.com/rroblf01/saltare",
    title: "Saltare",
    description:
      "Un Servidor HTTP ASGI para python escrito desde cero en Zig. Tiene un rendimiento excelente y un consumo de RAM muy bajo.",
    imgPath: "/assets/saltare.webp",
    sources: [
      {url: "https://github.com/rroblf01/saltare", text: "Code"},
    ],
    techs: [TECHS.python, TECHS.zig]
  },
  {
    url: "https://rroblf01.github.io/d-orm/",
    title: "djanorm",
    description:
      "Un ORM al estilo Django para Python con async de primera clase, schemas de Pydantic listos para FastAPI y un CLI dorm ligero. Sin dependencia del runtime de Django.",
    imgPath: "/assets/djanorm.webp",
    sources: [
      {url: "https://github.com/rroblf01/d-orm", text: "Code"},
    ],
    techs: [TECHS.python]
  },
  {
    url: "https://gopress.ricardorobles.es/cms",
    title: "Gopress",
    description:
      "Una aplicación para crear páginas estáticas, inspirada en Wordpress pero con un enfoque en la simplicidad y el rendimiento. Está hecha con Go. Permite crear páginas y gestionar los estilos dependiendo la resolución. Está hecha con Go y el framework Fiber.",
    imgPath: "/assets/gopress.webp",
    sources: [
      {url: "https://github.com/rroblf01/gopress", text: "Code"},
    ],
    techs: [TECHS.golang]
  },
  {
    url: "https://rabbiat.ricardorobles.es/",
    title: "RabbIAt",
    description:
      "Una aplicación que busca crear una prueba de concepto sobre cómo se integran los MCPs y respuesta estructurada con LLMs. Se puede probar una demo con el usuario guest y contraseña test-123",
    imgPath: "/assets/rabbiat.webp",
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
    imgPath: "/assets/scheduler.webp",
    sources: [
      {url: "https://github.com/rroblf01/bunny-scheduler", text: "Code"},
    ],
    techs: [TECHS.django, TECHS.python]
  },
  {
    url: "https://sushi.ricardorobles.es/",
    title: "Sushi Bunny",
    description:
      "Una simulación de una mesa en un restaurante de sushi, donde puedes reunirte con amigos y contar cuanto sushi has comido.",
    imgPath: "/assets/sushi-bunny.webp",
    sources: [
      {url: "https://github.com/rroblf01/sushi-bunny", text: "Code"},
    ],
    techs: [TECHS.fastapi, TECHS.python]
  },
  {
    url: "https://github.com/rroblf01/bunnyhopapi",
    title: "BunnyHopAPI",
    description:
      "Framework http escrito en python desde cero. Swagger automático, CORS, validación de tipos y excelente rendimiento.",
    imgPath: "/assets/bunnyhopapi.webp",
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
    imgPath: "/assets/poker.webp",
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
    imgPath: "/assets/password-manager.webp",
    sources: [
      {url: "https://github.com/rroblf01/ricardo-password-manager", text: "Front Code"},
      {url: "https://github.com/rroblf01/ricardo-passwords", text: "Back Code"}
    ],
    techs: [TECHS.angular, TECHS.typescript]
  },
  {
    url: "https://ricardotypefast.deno.dev/",
    title: "Type Fast",
    description:
      "Una herramienta destinada a saber qué tan rápido eres escribiendo, está hecha con Angular.",
    imgPath: "/assets/typefast.webp",
    sources: [
      {url: "https://github.com/rroblf01/typefast", text: "Code"},
    ],
    techs: [TECHS.angular, TECHS.typescript]
  },
  {
    url: "https://ricardo-wordle.vercel.app/",
    title: "Fast Wordle",
    description:
      "Un clon de Wordle hecho con FastAPI y HTML/CSS/JS vanilla.",
    imgPath: "/assets/fastwordle.webp",
    sources: [
      {url: "https://github.com/rroblf01/fast-wordle", text: "Code"},
    ],
    techs: [TECHS.fastapi, TECHS.python, TECHS.html, TECHS.css, TECHS.javascript]
  },
  {
    url: "https://ricardorobles.es/",
    title: "Portafolio",
    description:
      "Este mismo portafolio, para ello he usado Astro.",
    imgPath: "/assets/portafolio.webp",
    sources: [
      {url: "https://github.com/rroblf01/ricardorobles", text: "Code"},
    ],
    techs: [TECHS.astro, TECHS.typescript]
  },
  {
    url: "https://ricardo-image-compressor.rroblf01.deno.net/",
    title: "Image Compressor",
    description:
      "Un simple y rápido compresor de imágenes en línea hecho con Javascript vanilla.",
    imgPath: "/assets/compress.webp",
    sources: [
      {url: "https://github.com/rroblf01/deno-compress", text: "Code"},
    ],
    techs: [TECHS.html, TECHS.css, TECHS.javascript]
  },
  {
    url: "https://ricardo-api-mock.rroblf01.deno.net/",
    title: "Mock API",
    description:
      "Una herramienta para Mockear una API, para ello he usado Javascript y la base de datos de Deno KV.",
    imgPath: "/assets/mock-api.webp",
    sources: [
      {url: "https://github.com/rroblf01/deno-mock-api", text: "Code"},
    ],
    techs: [TECHS.html, TECHS.css, TECHS.javascript]
  },
  {
    url: "https://ricardo-jsontointerface.rroblf01.deno.net/",
    title: "JSON to Interface",
    description:
      "Una herramienta para convertir un JSON en una interfaz de TypeScript, para ello he usado Javascript.",
    imgPath: "/assets/json-interface.webp",
    sources: [
      {url: "https://github.com/rroblf01/deno-jsontointerface", text: "Code"},
    ],
    techs: [TECHS.html, TECHS.css, TECHS.javascript, TECHS.typescript]
  },
];
