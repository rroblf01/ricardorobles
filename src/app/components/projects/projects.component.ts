import { Component } from "@angular/core";

@Component({
  selector: "app-projects",
  standalone: true,
  imports: [],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.css",
})
export class ProjectsComponent {
  projects: {
    url: string;
    title: string;
    description: string;
    imgPath: string;
  }[] = [
    {
      url: "https://ricardo-image-compressor.deno.dev/",
      title: "Image Compressor",
      description:
        "Un simple y rápido compresor de imágenes en línea hecho con Javascript vanilla.",
      imgPath: "assets/compress.webp",
    },
    {
      url: "https://ricardo-api-mock.deno.dev/",
      title: "Mock API",
      description:
        "Una herramienta para Mockear una API, para ello he usado Javascript y la base de datos de Deno KV.",
      imgPath: "assets/mock-api.webp",
    },
    {
      url: "https://ricardo-jsontointerface.deno.dev/",
      title: "JSON to Interface",
      description:
        "Una herramienta para convertir un JSON en una interfaz de TypeScript, para ello he usado Javascript.",
      imgPath: "assets/json-interface.webp",
    },
  ];
}
