import { Component } from "@angular/core";

@Component({
  selector: "app-tech",
  standalone: true,
  imports: [],
  templateUrl: "./tech.component.html",
})
export class TechComponent {
  techs: { title: string; subtitle: string; imgPath: string }[] = [
    {
      title: "Python",
      subtitle:
        "El lenguaje con el que me siento más cómodo trabajándo. Usado profesionalmente desde 2020.",
      imgPath: "assets/python.svg",
    },
    {
      title: "Django",
      subtitle:
        "El framework con el que me siento más cómodo trabajando. Usado profesionalmente desde 2022.",
      imgPath: "assets/django.svg",
    },
    {
      title: "Docker",
      subtitle: "Usado profesionalmente desde 2020.",
      imgPath: "assets/docker.svg",
    },
    {
      title: "PostgreSQL",
      subtitle:
        "La base de datos que más he usado. Usado profesionalmente desde 2020.",
      imgPath: "assets/postgresql.svg",
    },
    {
      title: "Javascript",
      subtitle:
        "Lenguaje que uso para scripts o Front con Frameworks o vanilla. Usado profesionalmente desde 2020.",
      imgPath: "assets/javascript.svg",
    },
    {
      title: "Typescript",
      subtitle:
        "Lenguaje que uso para scripts o Front con Frameworks. Usado profesionalmente desde 2020.",
      imgPath: "assets/typescript.svg",
    },
    {
      title: "Git",
      subtitle:
        "Controlador de versiones más usado. Usado profesionalmente desde 2020.",
      imgPath: "assets/git.svg",
    },
  ];
}
