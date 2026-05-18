import { expect, jest } from '@jest/globals';
import { TestBed } from "@angular/core/testing";
import { SessionService } from "../core/service/session.service";
import { AuthGuard } from "./auth.guard";
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionService: SessionService;
  let routerMock: { navigate: jest.Mock };

  // On mocke le Router pour vérifier les redirections
  // sans avoir besoin d'un vrai module de routing.
  beforeEach(() => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        SessionService,
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // Vérifie que l'accès est autorisé quand l'utilisateur est connecté.
  // canActivate doit retourner true → la navigation vers la route protégée est permise.
  it('should return true when user is logged in', () => {
    sessionService.isLogged = true;
    expect(guard.canActivate()).toBe(true);
  });

  // Vérifie que l'accès est refusé quand l'utilisateur n'est pas connecté.
  // canActivate doit retourner false → l'utilisateur ne peut pas accéder à la route.
  it('should return false when user is not logged in', () => {
    sessionService.isLogged = false;
    expect(guard.canActivate()).toBe(false);
  });

  // Vérifie que l'utilisateur non connecté est redirigé vers /login.
  // C'est le comportement attendu pour protéger les routes privées.
  it('should redirect to login when user is not logged in', () => {
    sessionService.isLogged = false;
    guard.canActivate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['login']); // Jest enregistre les appels à navigate, on vérifie qu'il n'a pas été appelé
  });

  // Vérifie qu'aucune redirection n'a lieu quand l'utilisateur est connecté.
  // L'utilisateur connecté accède directement à la route sans être redirigé.
  it('should not redirect when user is logged in', () => {
    sessionService.isLogged = true;
    guard.canActivate();
    expect(routerMock.navigate).not.toHaveBeenCalled(); // Jest enregistre les appels à navigate, on vérifie qu'il n'a pas été appelé
  });
});