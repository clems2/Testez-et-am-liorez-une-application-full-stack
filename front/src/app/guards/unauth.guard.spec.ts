import { expect, jest } from '@jest/globals';
import { SessionService } from "../core/service/session.service";
import { UnauthGuard } from "./unauth.guard";
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let sessionService: SessionService;
  let routerMock: { navigate: jest.Mock };

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        UnauthGuard,
        SessionService,
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(UnauthGuard);
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // Vérifie que l'accès est autorisé quand l'utilisateur n'est PAS connecté.
  // Les routes "non-auth" (login, register) sont accessibles uniquement aux utilisateurs non connectés.
  it('should return true when user is not logged in', () => {
    sessionService.isLogged = false;
    expect(guard.canActivate()).toBe(true);
  });

  // Vérifie que l'accès est refusé quand l'utilisateur est déjà connecté.
  // Un utilisateur connecté ne doit pas pouvoir accéder à /login ou /register.
  it('should return false when user is logged in', () => {
    sessionService.isLogged = true;
    expect(guard.canActivate()).toBe(false);
  });

  // Vérifie que l'utilisateur connecté est redirigé (vers /rentals selon le code actuel).
  // Cela évite qu'un utilisateur connecté revienne sur la page de login.
  it('should redirect when user is logged in', () => {
    sessionService.isLogged = true;
    guard.canActivate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['rentals']);
  });

  // Vérifie qu'aucune redirection n'a lieu quand l'utilisateur n'est pas connecté.
  // L'utilisateur non connecté accède librement aux routes publiques.
  it('should not redirect when user is not logged in', () => {
    sessionService.isLogged = false;
    guard.canActivate();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});