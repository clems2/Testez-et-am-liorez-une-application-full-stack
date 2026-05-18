import { expect, jest } from '@jest/globals';
import { AppComponent } from './app.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionService } from './core/service/session.service';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent
      ],
      providers: [
        SessionService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Vérifie que le composant racine s'instancie correctement.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Plan de tests — Logout : vérifie que isLogged$ expose bien l'état de connexion depuis le SessionService.
  it('should expose isLogged$ from SessionService', (done) => {
    component.isLogged$.subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });

  // Plan de tests — Logout : vérifie que logout() appelle bien logOut() sur le SessionService et redirige vers la racine.
  it('logout should call sessionService.logOut and navigate to root', () => {
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.logout();
    expect(logOutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });

  // Plan de tests — Sessions : vérifie que les liens Login et Register sont affichés quand l'utilisateur n'est pas connecté.
  it('should display login and register links when not logged in', async () => {
    sessionService.logOut();
    fixture.detectChanges();
    await fixture.whenStable();
    const loginLink = fixture.debugElement.query(By.css('[routerLink="/login"]'));
    const registerLink = fixture.debugElement.query(By.css('[routerLink="/register"]'));
    expect(loginLink).toBeTruthy();
    expect(registerLink).toBeTruthy();
  });

  // Plan de tests — Sessions : vérifie que les liens Sessions, Account et Logout sont affichés quand l'utilisateur est connecté.
  it('should display sessions, account and logout links when logged in', async () => {
    sessionService.logIn({
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sessions');
    expect(compiled.textContent).toContain('Account');
    expect(compiled.textContent).toContain('Logout');
  });
});