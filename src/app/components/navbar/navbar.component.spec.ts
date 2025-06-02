import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Initialization', () => {
    it('should have routes initialized as a non-empty array', () => {
      expect(Array.isArray(component.routes)).toBeTrue();
      expect(component.routes.length).toBeGreaterThan(0);
    });

    it('should have correct data for specific routes', () => {
      // Assuming component.routes is populated as expected.
      // From navbar.component.ts:
      // { path: "#about", label: "Sobre mí" },
      // { path: "#experience", label: "Experiencia" },
      // { path: "#certs", label: "Certificaciones" },
      // { path: "#contact", label: "Contacto" }
      const expectedRoutes = [
        { path: "#about", label: "Sobre mí" },
        { path: "#experience", label: "Experiencia" },
        { path: "#certs", label: "Certificaciones" },
        { path: "#contact", label: "Contacto" }
      ];

      expect(component.routes.length).toBe(expectedRoutes.length);

      // Check first route
      expect(component.routes[0].path).toBe(expectedRoutes[0].path);
      expect(component.routes[0].label).toBe(expectedRoutes[0].label);

      // Check last route
      const lastRouteIndex = component.routes.length - 1;
      const expectedLastRouteIndex = expectedRoutes.length - 1;
      expect(component.routes[lastRouteIndex].path).toBe(expectedRoutes[expectedLastRouteIndex].path);
      expect(component.routes[lastRouteIndex].label).toBe(expectedRoutes[expectedLastRouteIndex].label);
    });

    it('should have the expected total number of routes', () => {
      // Based on the component's actual routes array
      expect(component.routes.length).toBe(4); // Adjust if the number of routes changes
    });
  });

  describe('HTML Rendering (Navigation Links)', () => {
    let anchorElements: NodeListOf<HTMLAnchorElement>;

    beforeEach(() => {
      // fixture.detectChanges() is already called in the main beforeEach
      anchorElements = fixture.nativeElement.querySelectorAll('a');
    });

    it('should render the correct number of anchor tags', () => {
      expect(anchorElements.length).toBe(component.routes.length);
    });

    it('should render anchor tags with correct href and text content', () => {
      expect(anchorElements.length).toBe(component.routes.length); // Ensure we can iterate

      component.routes.forEach((route, index) => {
        const anchor = anchorElements[index];
        expect(anchor).toBeTruthy();
        // The href will be the full URL including the domain, so we check if it contains the path.
        expect(anchor.href).toContain(route.path);
        expect(anchor.textContent?.trim()).toBe(route.label);
      });
    });
  });
});
