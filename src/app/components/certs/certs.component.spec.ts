import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgOptimizedImage } from '@angular/common';

import { CertsComponent } from './certs.component';

describe('CertsComponent', () => {
  let component: CertsComponent;
  let fixture: ComponentFixture<CertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertsComponent, NgOptimizedImage]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Initialization', () => {
    it('should initialize certs as an array', () => {
      expect(Array.isArray(component.certs)).toBeTrue();
    });

    it('should have default certifications loaded', () => {
      expect(component.certs.length).toBeGreaterThan(0);
    });

    it('should have certification objects with correct properties', () => {
      // Assuming there's at least one cert by default
      if (component.certs.length > 0) {
        const firstCert = component.certs[0];
        expect(firstCert.title).toBeDefined();
        expect(typeof firstCert.title).toBe('string');
        expect(firstCert.description).toBeDefined();
        expect(typeof firstCert.description).toBe('string');
        expect(firstCert.imgPath).toBeDefined();
        expect(typeof firstCert.imgPath).toBe('string');
      } else {
        // Fail the test if there are no certs to check,
        // because the previous test 'should have default certifications loaded' should catch this.
        // However, this makes the check explicit for properties.
        fail('No default certifications found to check properties.');
      }
    });
  });

  describe('HTML Rendering', () => {
    it('should display the main heading "Certificaciones"', () => {
      const headingElement = fixture.nativeElement.querySelector('h3');
      expect(headingElement).toBeTruthy();
      expect(headingElement.textContent).toContain('Certificaciones');
    });

    describe('When certifications are present', () => {
      // These tests assume component.certs has items, which is covered by 'Data Initialization' tests.
      // fixture.detectChanges() is already called in the global beforeEach.

      it('should render a card for each certification', () => {
        const cardElements = fixture.nativeElement.querySelectorAll('.grid > div[class*="bg-gray-800"]'); // Selector for cards
        expect(cardElements.length).toBe(component.certs.length);
      });

      it('should render correct title, description, and image for each certification', () => {
        const cardElements = fixture.nativeElement.querySelectorAll('.grid > div[class*="bg-gray-800"]'); // Selector for cards
        component.certs.forEach((cert, index) => {
          const cardElement = cardElements[index];
          expect(cardElement).toBeTruthy();

          const titleElement = cardElement.querySelector('h4');
          expect(titleElement).toBeTruthy();
          expect(titleElement.textContent).toContain(cert.title);

          const descriptionElement = cardElement.querySelector('p');
          expect(descriptionElement).toBeTruthy();
          expect(descriptionElement.textContent).toContain(cert.description);

          const imgElement = cardElement.querySelector('img');
          expect(imgElement).toBeTruthy();
          // For ngSrc with NgOptimizedImage, the actual src might be complex if preconnect is used or if it's a data URL.
          // ng-reflect-ng-src holds the original binding.
          expect(imgElement.getAttribute('ng-reflect-ng-src')).toBe(cert.imgPath);
          expect(imgElement.alt).toBe('image'); // As per requirement
        });
      });
    });

    describe('When no certifications are present', () => {
      beforeEach(() => {
        // Override component data for this specific test suite
        component.certs = [];
        fixture.detectChanges(); // Re-render the component with no certs
      });

      it('should not render any certification cards', () => {
        const cardElements = fixture.nativeElement.querySelectorAll('.grid > div[class*="bg-gray-800"]');
        expect(cardElements.length).toBe(0);
      });

      it('should still render the main heading', () => {
        const headingElement = fixture.nativeElement.querySelector('h3');
        expect(headingElement).toBeTruthy();
        expect(headingElement.textContent).toContain('Certificaciones');
      });
    });
  });
});
