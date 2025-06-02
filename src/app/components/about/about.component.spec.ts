import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgOptimizedImage } from '@angular/common';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent, NgOptimizedImage]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges() will be called in individual tests or specific beforeEach blocks
    // if we need to spy on methods called during construction or ngOnInit.
  });

  it('should create', () => {
    fixture.detectChanges(); // Initial change detection
    expect(component).toBeTruthy();
  });

  describe('Initial Time Calculation', () => {
    let calculateTimeSpy: jasmine.Spy;

    beforeEach(() => {
      calculateTimeSpy = spyOn(AboutComponent.prototype, 'calculateTime').and.callThrough();
      // Recreate component for this describe block to ensure spy is attached before constructor/ngOnInit
      fixture = TestBed.createComponent(AboutComponent);
      component = fixture.componentInstance;
    });

    it('should call calculateTime in the constructor', () => {
      // The constructor is called when createComponent is executed.
      // We need to ensure fixture.detectChanges() is called to trigger ngOnInit if calculateTime is moved there.
      // However, the component's constructor itself calls calculateTime.
      expect(calculateTimeSpy).toHaveBeenCalled();
    });

    it('should have time properties as numbers >= 0 after ngOnInit', () => {
      fixture.detectChanges(); // Trigger ngOnInit
      expect(component.years).toEqual(jasmine.any(Number));
      expect(component.years).toBeGreaterThanOrEqual(0);
      expect(component.months).toEqual(jasmine.any(Number));
      expect(component.months).toBeGreaterThanOrEqual(0);
      expect(component.days).toEqual(jasmine.any(Number));
      expect(component.days).toBeGreaterThanOrEqual(0);
      expect(component.hours).toEqual(jasmine.any(Number));
      expect(component.hours).toBeGreaterThanOrEqual(0);
      expect(component.minutes).toEqual(jasmine.any(Number));
      expect(component.minutes).toBeGreaterThanOrEqual(0);
      expect(component.seconds).toEqual(jasmine.any(Number));
      expect(component.seconds).toBeGreaterThanOrEqual(0);
    });
  });

  // Placeholder for HTML Rendering Tests
  describe('HTML Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure component is rendered
    });

    it('should display the main heading', () => {
      const headingElement = fixture.nativeElement.querySelector('h1');
      expect(headingElement).toBeTruthy();
      expect(headingElement.textContent).toContain('¡Hola!, Me llamo Ricardo Robles.');
    });

    it('should display the subheading', () => {
      const subheadingElement = fixture.nativeElement.querySelector('h2');
      expect(subheadingElement).toBeTruthy();
      expect(subheadingElement.textContent).toContain('Programador Back-end');
    });

    it('should display the introductory paragraph', () => {
      const paragraphElement = fixture.nativeElement.querySelector('p');
      expect(paragraphElement).toBeTruthy();
      expect(paragraphElement.textContent).toContain('Ingeniero Informático y apasionado por la tecnología.');
    });

    it('should display the experience duration string with initial time values', () => {
      const experienceElement = fixture.nativeElement.querySelector('.text-gray-400.text-sm.mb-6'); // Using a more specific selector if possible
      expect(experienceElement).toBeTruthy();
      const textContent = experienceElement.textContent;
      expect(textContent).toContain(`${component.years} años`);
      expect(textContent).toContain(`${component.months} meses`);
      expect(textContent).toContain(`${component.days} días`);
      expect(textContent).toContain(`${component.hours} horas`);
      expect(textContent).toContain(`${component.minutes} minutos`);
      expect(textContent).toContain(`${component.seconds} segundos`);
    });

    it('should display the profile image with correct attributes', () => {
      const imgElement = fixture.nativeElement.querySelector('img');
      expect(imgElement).toBeTruthy();
      expect(imgElement.getAttribute('ng-reflect-ng-src')).toBe('assets/ricardo.webp'); // ngSrc is reflected as ng-reflect-ng-src
      expect(imgElement.alt).toBe('Ricardo Robles');
      expect(imgElement.getAttribute('width')).toBe('200'); // Check width attribute
      expect(imgElement.getAttribute('height')).toBe('200'); // Check height attribute
    });
  });

  describe('Time Update Simulation', () => {
    it('should update time properties and rerender after 1 second', fakeAsync(() => {
      fixture.detectChanges(); // Initial detection

      const initialSeconds = component.seconds;

      tick(1000); // Advance time by 1 second
      fixture.detectChanges(); // Trigger change detection to update the view

      expect(component.seconds).not.toBe(initialSeconds); // Check if seconds changed

      // Verify that the DOM reflects the updated seconds
      // This requires calculateTime to produce a different seconds value,
      // which it should as time progresses.
      const experienceElement = fixture.nativeElement.querySelector('.text-gray-400.text-sm.mb-6');
      expect(experienceElement).toBeTruthy();
      expect(experienceElement.textContent).toContain(`${component.seconds} segundos`);

      // It's also good practice to ensure other parts of the time string are still present
      // and potentially updated if a minute/hour/day boundary was crossed.
      // For simplicity, we're focusing on seconds changing here.
      // If calculateTime is very precise, seconds might roll over to 0 if a minute passes.
      // A more robust test might check if the total time in seconds has increased.

      // Clean up any timers managed by fakeAsync
      // This is important if the interval is not cleared by ngOnDestroy or afterEach
      // However, our main afterEach should handle clearInterval for component.intervalId
      // For fakeAsync, tick() itself manages the passage of time for scheduled functions.
      // If there are pending timers, flush can be used, but here tick(1000) is specific.
    }));
  });

  afterEach(() => {
    if (component.intervalId) {
      clearInterval(component.intervalId);
    }
  });
});
