import { Component } from "@angular/core";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  routes = [
    { path: "#about", label: "Sobre mí" },
    { path: "#experience", label: "Experiencia" },
    { path: "#projects", label: "Proyectos" },
    { path: "#tech", label: "Tecnologías" },
    { path: "#contact", label: "Contáctame" },
  ];
}
