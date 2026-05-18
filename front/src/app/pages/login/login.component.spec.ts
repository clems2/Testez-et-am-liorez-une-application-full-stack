import { expect, jest } from '@jest/globals';
import { LoginComponent } from './login.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SessionService } from 'src/app/core/service/session.service';
import { provideRouter, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';

const mockSessionInformation: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  admin: false
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  // On importe directement LoginComponent (standalone). provideHttpClient + provideHttpClientTesting pour intercepter l'appel HTTP du login sans toucher le vrai back-end.
  // BrowserAnimationsModule requis par Angular Material.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        BrowserAnimationsModule
      ],
      providers: [
        SessionService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
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

  // Plan de tests — Login : vérifie que le formulaire est invalide quand les champs sont vides, ce qui doit désactiver le bouton Submit.
  it('should have an invalid form when fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  // Plan de tests — Login : vérifie que le bouton Submit est désactivé tant que le formulaire est invalide (champs vides ou mal remplis).
  it('should disable submit button when form is invalid', () => {
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(true);
  });

  // Plan de tests — Login : vérifie que le formulaire devient valide quand email et password sont correctement remplis.
  it('should have a valid form when fields are filled', () => {
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });
    expect(component.form.valid).toBe(true);
  });

  // Plan de tests — Login : vérifie que le bouton Submit est activé quand le formulaire est valide.
  it('should enable submit button when form is valid', async () => {
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(button.nativeElement.disabled).toBe(false);
  });

  // Plan de tests — Login : vérifie que la connexion réussie appelle sessionService.logIn avec les données reçues du back-end.
  // Redirige l'utilisateur vers /sessions.
  it('should call sessionService.logIn and navigate to sessions on successful login', async () => {
    const logInSpy = jest.spyOn(sessionService, 'logIn');
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.form.setValue({
      email: 'test@test.com',
      password: 'password123'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockSessionInformation);
    await fixture.whenStable();

    expect(logInSpy).toHaveBeenCalledWith(mockSessionInformation);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  // Plan de tests — Login : vérifie que onError passe à true quand le back-end retourne une erreur (mauvais identifiants).
  // Le message d'erreur doit alors s'afficher dans le template.
  it('should set onError to true on failed login', async () => {
    component.form.setValue({
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.onError()).toBe(true);
  });

  // Plan de tests — Login : vérifie que le message d'erreur est affiché dans le template quand onError est true.
  it('should display error message when onError is true', async () => {
    component.form.setValue({
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });
    component.submit();
    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('An error occurred');
  });
});