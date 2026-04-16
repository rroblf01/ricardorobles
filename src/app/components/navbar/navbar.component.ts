import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-navbar",
    imports: [],
    templateUrl: "./navbar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  routes = [
    { path: "#about", label: "Sobre mí" },
    { path: "#experience", label: "Experiencia" },
    { path: "#certs", label: "Certificados" },
    { path: "#projects", label: "Proyectos" },
    { path: "#tech", label: "Tecnologías" },
    { path: "#contact", label: "Contáctame" },
  ];
}
