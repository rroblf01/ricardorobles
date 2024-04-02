import { Component } from "@angular/core";
import { TimelineComponent } from "../timeline/timeline.component";

@Component({
  selector: "app-experience",
  standalone: true,
  imports: [TimelineComponent],
  templateUrl: "./experience.component.html",
})
export class ExperienceComponent {
  studiesTitle: string = "Estudios";
  experienceTitle: string = "Experiencia";
  experience: { place: string; title: string; start: string; end: string }[] = [
    {
      place: "QDQmedia",
      title: "Programador Back-end",
      start: "02/2022",
      end: "Actualidad",
    },
    {
      place: "HP SCDS",
      title: "Ingeniero del Software",
      start: "06/2020",
      end: "02/2022",
    },
    {
      place: "Salvis",
      title: "Full-Stack",
      start: "10/2019",
      end: "01/2020",
    },
  ];
  studies: { place: string; status: string; title: string }[] = [
    {
      place: "Universidad de León",
      status: "Finalizado",
      title: "Ingeniería informatica",
    },
    {
      place: "IES Juan del Enzina",
      status: "Finalizado",
      title: "Bachillerato científico",
    },
  ];

  getExperience() {
    return this.experience.map((exp) => ({
      title: `${exp.place}, ${exp.title}`,
      subtitle: `${exp.start} - ${exp.end}`,
    }));
  }

  getStudies() {
    return this.studies.map((study) => ({
      title: `${study.title}, ${study.status}`,
      subtitle: study.place,
    }));
  }
}
