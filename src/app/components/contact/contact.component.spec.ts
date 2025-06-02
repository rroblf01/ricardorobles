import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('HTML Rendering', () => {
    let nativeElement: HTMLElement;

    beforeEach(() => {
      nativeElement = fixture.nativeElement;
    });

    it('should display the main heading', () => {
      const headingElement = nativeElement.querySelector('h3');
      expect(headingElement).toBeTruthy();
      expect(headingElement.textContent).toContain('¡Contacta conmigo!');
    });

    describe('Email Information', () => {
      let emailParagraph: HTMLElement | null;

      beforeEach(() => {
        // Find the paragraph containing the email. This might need adjustment based on actual HTML structure.
        // A common approach is to look for a paragraph that contains "Correo:".
        const paragraphs = nativeElement.querySelectorAll('p');
        emailParagraph = Array.from(paragraphs).find(p => p.textContent?.includes('Correo:')) || null;
      });

      it('should display the "Correo:" label', () => {
        expect(emailParagraph).toBeTruthy();
        if (emailParagraph) { // TypeScript type guard
          expect(emailParagraph.textContent).toContain('Correo:');
        }
      });

      it('should have a correctly configured email link', () => {
        expect(emailParagraph).toBeTruthy();
        if (emailParagraph) { // TypeScript type guard
          const anchorElement = emailParagraph.querySelector('a');
          expect(anchorElement).toBeTruthy();
          if (anchorElement) { // TypeScript type guard
            expect(anchorElement.href).toBe('mailto:ricardo.r.f@hotmail.com');
            expect(anchorElement.textContent).toBe('ricardo.r.f@hotmail.com');
          }
        }
      });
    });

    describe('LinkedIn Information', () => {
      let linkedinParagraph: HTMLElement | null;

      beforeEach(() => {
        // Find the paragraph containing LinkedIn info.
        const paragraphs = nativeElement.querySelectorAll('p');
        linkedinParagraph = Array.from(paragraphs).find(p => p.textContent?.includes('Linkedin:')) || null;
      });

      it('should display the "Linkedin:" label', () => {
        expect(linkedinParagraph).toBeTruthy();
        if (linkedinParagraph) { // TypeScript type guard
          expect(linkedinParagraph.textContent).toContain('Linkedin:');
        }
      });

      it('should have a correctly configured LinkedIn link', () => {
        expect(linkedinParagraph).toBeTruthy();
        if (linkedinParagraph) { // TypeScript type guard
          const anchorElement = linkedinParagraph.querySelector('a');
          expect(anchorElement).toBeTruthy();
          if (anchorElement) { // TypeScript type guard
            expect(anchorElement.href).toBe('https://linkedin.com/in/ricardoroblesfernandez/');
            expect(anchorElement.textContent).toBe('Ricardo Robles Fernández');
          }
        }
      });
    });
  });
});
