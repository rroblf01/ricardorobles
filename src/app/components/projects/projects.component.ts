import { Component } from "@angular/core";
import { NgOptimizedImage } from '@angular/common'

@Component({
  selector: "app-projects",
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: "./projects.component.html",
})
export class ProjectsComponent {
  projects: {
    url: string;
    title: string;
    description: string;
    imgPath: string;
    sources: { url: string; text: string }[];
  }[] = [
    {
      url: "https://ricardo-password-manager.deno.dev/",
      title: "Password Manager",
      description:
        "Un gestor de contraseñas creado con Angular y Hono. He usado JWT para la autenticación y la base de datos de Deno KV.",
      imgPath: "assets/password-manager.webp",
      sources: [
        {url: "https://github.com/rroblf01/ricardo-password-manager", text: "Front Code"},
        {url: "https://github.com/rroblf01/ricardo-passwords", text: "Back Code"}
      ]
    },
    {
      url: "https://ricardotypefast.deno.dev/",
      title: "Type Fast",
      description: "Una herramienta destinada a saber qué tan rápido eres escribiendo, está hecha con Angular.",
      imgPath: "assets/typefast.webp",
      sources: [
        {url: "https://github.com/rroblf01/typefast", text: "Code"},
      ]
    },
    {
      url: "https://ricardo-wordle.vercel.app/",
      title: "Fast Wordle",
      description: "Un clon de Wordle hecho con FastAPI y HTML/CSS/JS vanilla.",
      imgPath: "assets/fastwordle.webp",
      sources: [
        {url: "https://github.com/rroblf01/fast-wordle", text: "Code"},
      ]
    },
    {
      url: "https://ricardorobles.deno.dev/",
      title: "Portafolio",
      description: "Este mismo portafolio, para ello he usado Angular.",
      imgPath: "assets/portafolio.webp",
      sources: [
        {url: "https://github.com/rroblf01/ricardorobles", text: "Code"},
      ]
    },
    {
      url: "https://ricardo-image-compressor.deno.dev/",
      title: "Image Compressor",
      description:
        "Un simple y rápido compresor de imágenes en línea hecho con Javascript vanilla.",
      imgPath: "assets/compress.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-compress", text: "Code"},
      ]
    },
    {
      url: "https://ricardo-api-mock.deno.dev/",
      title: "Mock API",
      description:
        "Una herramienta para Mockear una API, para ello he usado Javascript y la base de datos de Deno KV.",
      imgPath: "assets/mock-api.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-mock-api", text: "Code"},
      ]
    },
    {
      url: "https://ricardo-jsontointerface.deno.dev/",
      title: "JSON to Interface",
      description:
        "Una herramienta para convertir un JSON en una interfaz de TypeScript, para ello he usado Javascript.",
      imgPath: "assets/json-interface.webp",
      sources: [
        {url: "https://github.com/rroblf01/deno-jsontointerface", text: "Code"},
      ]
    },
  ];
}
