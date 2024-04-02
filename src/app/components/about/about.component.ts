import { Component } from "@angular/core";

@Component({
  selector: "app-about",
  standalone: true,
  imports: [],
  templateUrl: "./about.component.html",
})
export class AboutComponent {
  years: number = 4;
  months: number = 0;
  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  constructor() {
    this.calculateTime();
    setInterval(() => this.calculateTime(), 1000);
  }

  calculateTime() {
    const startDate = new Date("2020-02-01");
    const currentDate = new Date();
    const diff = currentDate.getTime() - startDate.getTime();
    const diffInSeconds = diff / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    const diffInMonths = diffInDays / 30;
    const diffInYears = diffInMonths / 12;

    this.years = Math.floor(diffInYears);
    this.months = Math.floor(diffInMonths % 12);
    this.days = Math.floor(diffInDays % 30);
    this.hours = Math.floor(diffInHours % 24);
    this.minutes = Math.floor(diffInMinutes % 60);
    this.seconds = Math.floor(diffInSeconds % 60);
  }
}
