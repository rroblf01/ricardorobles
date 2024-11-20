import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { AboutComponent } from "./components/about/about.component";
import { ProjectsComponent } from "./components/projects/projects.component";
import { ContactComponent } from "./components/contact/contact.component";
import { ExperienceComponent } from "./components/experience/experience.component";
import { TechComponent } from "./components/tech/tech.component";
import { CertsComponent } from "./components/certs/certs.component";

@Component({
    selector: "app-root",
    imports: [
        RouterOutlet,
        NavbarComponent,
        AboutComponent,
        ProjectsComponent,
        ContactComponent,
        ExperienceComponent,
        TechComponent,
        CertsComponent
    ],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css"
})
export class AppComponent {
  title = "ricardo-portafolios";
}
