import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgOptimizedImage } from '@angular/common';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent, NgOptimizedImage]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Initialization', () => {
    it('should have projects initialized as a non-empty array', () => {
      expect(Array.isArray(component.projects)).toBeTrue();
      expect(component.projects.length).toBeGreaterThan(0);
    });

    it('should have the first project with correct properties and types', () => {
      expect(component.projects.length).toBeGreaterThan(0); // Ensure there's a project to check
      const firstProject = component.projects[0];

      expect(firstProject.url).toBeDefined();
      expect(typeof firstProject.url).toBe('string');

      expect(firstProject.title).toBeDefined();
      expect(typeof firstProject.title).toBe('string');

      expect(firstProject.description).toBeDefined();
      expect(typeof firstProject.description).toBe('string');

      expect(firstProject.imgPath).toBeDefined();
      expect(typeof firstProject.imgPath).toBe('string');

      expect(firstProject.sources).toBeDefined();
      expect(Array.isArray(firstProject.sources)).toBeTrue();
    });

    it('should have correct properties for sources if they exist', () => {
      expect(component.projects.length).toBeGreaterThan(0);
      const firstProject = component.projects[0];

      if (firstProject.sources.length > 0) {
        const firstSource = firstProject.sources[0];
        expect(firstSource.url).toBeDefined();
        expect(typeof firstSource.url).toBe('string');
        expect(firstSource.text).toBeDefined();
        expect(typeof firstSource.text).toBe('string');
      } else {
        // Optional: could log a message if you expect sources for the first project,
        // but for this test, it's fine if sources are empty.
        // console.log('First project has no sources to check.');
        expect(true).toBeTrue(); // Test passes if no sources to check
      }
    });
  });

  describe('HTML Rendering (with projects)', () => {
    let projectCardElements: NodeListOf<Element>;
    let nativeElement: HTMLElement;

    beforeEach(() => {
      nativeElement = fixture.nativeElement;
      // Assuming project cards are direct div children of a div with class 'grid'
      projectCardElements = nativeElement.querySelectorAll('div.grid > div');
    });

    it('should display the main heading', () => {
      const headingElement = nativeElement.querySelector('h3');
      expect(headingElement).toBeTruthy();
      expect(headingElement.textContent).toContain('Proyectos que he desarrollado ultimamente.');
    });

    it('should render a card for each project', () => {
      expect(projectCardElements.length).toBe(component.projects.length);
    });

    it('should render correct details for each project card', () => {
      component.projects.forEach((project, index) => {
        const card = projectCardElements[index];
        expect(card).toBeTruthy();

        // Image link and ngSrc
        const imgLinkElement = card.querySelector(`a[href="${project.url}"]`);
        expect(imgLinkElement).toBeTruthy('Image link `a` tag not found for project url: ' + project.url);
        if (imgLinkElement) {
          const imgElement = imgLinkElement.querySelector('img');
          expect(imgElement).toBeTruthy('`img` tag not found within project link for: ' + project.url);
          if (imgElement) {
            expect(imgElement.getAttribute('ng-reflect-ng-src')).toBe(project.imgPath);
          }
        }

        // Title
        const titleElement = card.querySelector('h4');
        expect(titleElement).toBeTruthy();
        expect(titleElement.textContent).toContain(project.title);

        // Description - Assuming first <p> after h4 is description
        const descriptionElement = card.querySelector('h4 + p');
        expect(descriptionElement).toBeTruthy();
        expect(descriptionElement.textContent).toContain(project.description);

        // Project URL link text and href
        // This might be tricky if there are multiple 'a' tags. Let's try to be specific.
        // Find 'a' tags that are not the image link, and whose href matches project.url
        const urlLinkElements = Array.from(card.querySelectorAll('a')).filter(
          (a: HTMLAnchorElement) => a.href === project.url && a !== imgLinkElement
        );
        // We expect one such link that displays the project URL as text
        const projectUrlAnchor = urlLinkElements.find(a => a.textContent?.trim() === project.url);
        expect(projectUrlAnchor).toBeTruthy(`Project URL link with text "${project.url}" not found`);
        if(projectUrlAnchor) {
            expect(projectUrlAnchor.href).toBe(project.url); // Already filtered by href, but good for clarity
        }


        // Sources
        const sourceElementsContainer = card.querySelector('div > div:not([class])'); // The container for sources
        if (project.sources.length > 0) {
          expect(sourceElementsContainer).toBeTruthy("Sources container not found");
          if(sourceElementsContainer){
            const sourceTextElements = sourceElementsContainer.querySelectorAll('p');
            const sourceLinkElements = sourceElementsContainer.querySelectorAll('a');

            expect(sourceTextElements.length).toBe(project.sources.length, "Mismatch in number of source text <p> tags");
            expect(sourceLinkElements.length).toBe(project.sources.length, "Mismatch in number of source link <a> tags");

            project.sources.forEach((source, sourceIndex) => {
              const sourceTextElement = sourceTextElements[sourceIndex];
              expect(sourceTextElement).toBeTruthy();
              expect(sourceTextElement.textContent).toContain(source.text);

              const sourceLinkElement = sourceLinkElements[sourceIndex];
              expect(sourceLinkElement).toBeTruthy();
              expect(sourceLinkElement.href).toBe(source.url);
              expect(sourceLinkElement.textContent?.trim()).toBe(source.url);
            });
          }
        } else if (sourceElementsContainer) {
            // If there are no sources, the container might exist but be empty, or not exist at all.
            // Depending on HTML structure, this might need adjustment.
            // For now, if container exists, check it has no <p> or <a> for sources.
            expect(sourceElementsContainer.querySelectorAll('p').length).toBe(0);
            expect(sourceElementsContainer.querySelectorAll('a').length).toBe(0);
        }
      });
    });
  });

  describe('HTML Rendering (no projects)', () => {
    beforeEach(() => {
      component.projects = [];
      fixture.detectChanges(); // Re-render
    });

    it('should still display the main heading', () => {
      const headingElement = fixture.nativeElement.querySelector('h3');
      expect(headingElement).toBeTruthy();
      expect(headingElement.textContent).toContain('Proyectos que he desarrollado ultimamente.');
    });

    it('should not render any project cards', () => {
      const projectCardElements = fixture.nativeElement.querySelectorAll('div.grid > div');
      expect(projectCardElements.length).toBe(0);
    });
  });
});
