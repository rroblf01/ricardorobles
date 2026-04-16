import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "app-timeline",
    imports: [],
    templateUrl: "./timeline.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  @Input()
  title: string = "";
  @Input()
  elements: { title: string; subtitle: string }[] = [];
}
