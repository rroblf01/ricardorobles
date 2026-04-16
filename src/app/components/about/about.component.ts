import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from "@angular/core";
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: "app-about",
    imports: [NgOptimizedImage],
    templateUrl: "./about.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit, OnDestroy {
  years = signal(0);
  months = signal(0);
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  private timerInterval: any;

  ngOnInit() {
    this.calculateTime();
    this.timerInterval = setInterval(() => this.calculateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  calculateTime() {
    const startDate = new Date("2020-02-01");
    const currentDate = new Date();
    const diff = currentDate.getTime() - startDate.getTime();
    
    const diffInSeconds = diff / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;
    
    this.years.set(Math.floor(diffInDays / 365.25));
    this.months.set(Math.floor((diffInDays % 365.25) / 30.44));
    this.days.set(Math.floor((diffInDays % 365.25) % 30.44));
    this.hours.set(Math.floor(diffInHours % 24));
    this.minutes.set(Math.floor(diffInMinutes % 60));
    this.seconds.set(Math.floor(diffInSeconds % 60));
  }
}
