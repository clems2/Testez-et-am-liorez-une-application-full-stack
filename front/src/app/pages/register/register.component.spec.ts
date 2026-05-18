import { expect, jest } from '@jest/globals';
import { RegisterComponent } from './register.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';


// Account creation tests, Error on required fields, error on email already taken

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        BrowserAnimationsModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Vérifie que le composant s'instancie correctement.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Plan de tests — Register : vérifie que le formulaire est invalide quand tous les champs sont vides.
  it('should have an invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  // Plan de tests — Register : vérifie que le bouton Submit est désactivé tant que le formulaire est invalide.
  it('should disable submit button when form is invalid', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  // Plan de tests — Register : vérifie que le formulaire devient valide quand tous les champs obligatoires sont correctement remplis.
  it('should have a valid form when all fields are filled', () => {
    component.form.setValue({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    expect(component.form.valid).toBe(true);
  });

  // Plan de tests — Register : vérifie que le bouton Submit est activé quand le formulaire est valide.
  it('should enable submit button when form is valid', async () => {
    component.form.setValue({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(false);
  });

  // Plan de tests — Register : vérifie que la création de compte réussie
  // Redirige l'utilisateur vers /login.
  it('should navigate to login on successful register', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.form.setValue({
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  // Plan de tests — Register : vérifie que onError passe à true quand le back-end retourne une erreur (ex: email déjà pris).
  it('should set onError to true on failed register', async () => {
    component.form.setValue({
      email: 'existing@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/register');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.onError()).toBe(true);
  });

  // Plan de tests — Register : vérifie que le message d'erreur s'affiche dans le template quand onError est true.
  it('should display error message when onError is true', async () => {
    component.form.setValue({
      email: 'existing@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/register');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('An error occurred');
  });
});