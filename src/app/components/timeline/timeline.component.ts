import { Component, Input } from "@angular/core";

@Component({
  selector: "app-timeline",
  standalone: true,
  imports: [],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent {
  @Input()
  title: string = "";
  @Input()
  elements: { title: string; subtitle: string }[] = [];
}
