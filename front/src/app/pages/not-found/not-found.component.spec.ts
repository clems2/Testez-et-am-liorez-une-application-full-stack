import { expect } from '@jest/globals';
import { NotFoundComponent } from './not-found.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  // Pour un composant standalone, on l'importe directement dans imports[] au lieu de le déclarer dans declarations[].
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Vérifie que le composant s'instancie correctement.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Plan de tests — vérifie que la page 404 affiche bien un message indiquant que la page n'a pas été trouvée.
  it('should display a not found message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Page not found'); // Vérifie que le message "Page not found" est présent dans le contenu du composant
  });
});