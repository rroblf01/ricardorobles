import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ExperienceComponent } from './experience.component';

// 1. Mock TimelineComponent
@Component({
  selector: 'app-timeline', // Matches the selector used in ExperienceComponent's template
  template: '' // Empty template as we are not testing its rendering here
})
class MockTimelineComponent {
  @Input() title: string = ''; // Initialize to avoid undefined issues if not set
  @Input() elements: any[] = []; // Initialize to avoid undefined issues if not set
}

describe('ExperienceComponent', () => {
  let component: ExperienceComponent;
  let fixture: ComponentFixture<ExperienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // If ExperienceComponent is standalone, it goes into imports.
      // If it's not standalone and part of a module, then ExperienceComponent and MockTimelineComponent go into declarations.
      // Assuming ExperienceComponent is standalone based on previous examples:
      imports: [ExperienceComponent],
      declarations: [MockTimelineComponent] // MockTimelineComponent needs to be declared
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExperienceComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges() will be called in tests or specific beforeEach blocks
    // especially after setting up spies or before checking DOM/child components.
  });

  // 2. Component Creation
  it('should create', () => {
    fixture.detectChanges(); // Initial detection for ngOnInit if any
    expect(component).toBeTruthy();
  });

  // 3. Data Initialization
  describe('Data Initialization', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure ngOnInit has run if it affects these properties
    });

    it('should have correct titles', () => {
      expect(component.studiesTitle).toBe('Estudios');
      expect(component.experienceTitle).toBe('Experiencia');
    });

    it('should have experience data initialized', () => {
      expect(component.experience).toBeInstanceOf(Array);
      expect(component.experience.length).toBeGreaterThan(0);
      // Check structure of the first item
      if (component.experience.length > 0) {
        const firstExperience = component.experience[0];
        expect(firstExperience.title).toBeDefined();
        expect(typeof firstExperience.title).toBe('string');
        expect(firstExperience.company).toBeDefined();
        expect(typeof firstExperience.company).toBe('string');
        expect(firstExperience.date).toBeDefined();
        expect(typeof firstExperience.date).toBe('string');
        expect(firstExperience.description).toBeDefined();
        expect(typeof firstExperience.description).toBe('string');
      }
    });

    it('should have studies data initialized', () => {
      expect(component.studies).toBeInstanceOf(Array);
      expect(component.studies.length).toBeGreaterThan(0);
      // Check structure of the first item
      if (component.studies.length > 0) {
        const firstStudy = component.studies[0];
        expect(firstStudy.title).toBeDefined();
        expect(typeof firstStudy.title).toBe('string');
        expect(firstStudy.institution).toBeDefined();
        expect(typeof firstStudy.institution).toBe('string');
        expect(firstStudy.date).toBeDefined();
        expect(typeof firstStudy.date).toBe('string');
        expect(firstStudy.description).toBeDefined();
        expect(typeof firstStudy.description).toBe('string');
      }
    });
  });

  // 4. getExperience() Method Logic
  describe('getExperience() method', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure component data is ready
    });

    it('should transform experience data correctly', () => {
      const rawExperience = component.experience;
      expect(rawExperience.length).toBeGreaterThan(0); // Prerequisite

      const transformedExperience = component.getExperience();
      expect(transformedExperience.length).toBe(rawExperience.length);

      // Check the first element's transformation
      const firstRaw = rawExperience[0];
      const firstTransformed = transformedExperience[0];

      expect(firstTransformed.title).toBe(`${firstRaw.title} - ${firstRaw.company}`);
      expect(firstTransformed.subtitle).toBe(firstRaw.date);
      expect(firstTransformed.description).toBe(firstRaw.description);
    });
  });

  // 5. getStudies() Method Logic
  describe('getStudies() method', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure component data is ready
    });

    it('should transform studies data correctly', () => {
      const rawStudies = component.studies;
      expect(rawStudies.length).toBeGreaterThan(0); // Prerequisite

      const transformedStudies = component.getStudies();
      expect(transformedStudies.length).toBe(rawStudies.length);

      // Check the first element's transformation
      const firstRaw = rawStudies[0];
      const firstTransformed = transformedStudies[0];

      expect(firstTransformed.title).toBe(`${firstRaw.title} - ${firstRaw.institution}`);
      expect(firstTransformed.subtitle).toBe(firstRaw.date);
      expect(firstTransformed.description).toBe(firstRaw.description);
    });
  });

  // 6. TimelineComponent Integration
  describe('TimelineComponent Integration', () => {
    beforeEach(() => {
      fixture.detectChanges(); // This is crucial to render child components and set their inputs
    });

    it('should render two MockTimelineComponent instances', () => {
      const timelineDirectives = fixture.debugElement.queryAll(By.directive(MockTimelineComponent));
      expect(timelineDirectives.length).toBe(2);
    });

    it('should pass correct data to the first MockTimelineComponent (Experience)', () => {
      const timelineDirectives = fixture.debugElement.queryAll(By.directive(MockTimelineComponent));
      expect(timelineDirectives.length).toBeGreaterThanOrEqual(1); // Ensure it exists

      const experienceTimelineInstance = timelineDirectives[0].componentInstance as MockTimelineComponent;
      expect(experienceTimelineInstance.title).toBe(component.experienceTitle);
      expect(experienceTimelineInstance.elements).toEqual(component.getExperience());
    });

    it('should pass correct data to the second MockTimelineComponent (Studies)', () => {
      const timelineDirectives = fixture.debugElement.queryAll(By.directive(MockTimelineComponent));
      expect(timelineDirectives.length).toBeGreaterThanOrEqual(2); // Ensure it exists

      const studiesTimelineInstance = timelineDirectives[1].componentInstance as MockTimelineComponent;
      expect(studiesTimelineInstance.title).toBe(component.studiesTitle);
      expect(studiesTimelineInstance.elements).toEqual(component.getStudies());
    });
  });
});
