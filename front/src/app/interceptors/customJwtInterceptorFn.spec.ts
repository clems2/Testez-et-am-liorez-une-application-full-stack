import { expect, jest } from '@jest/globals';
import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { SessionInformation } from "../core/models/sessionInformation.interface";
import { SessionService } from "../core/service/session.service";
import { of } from "rxjs";
import { TestBed } from "@angular/core/testing";
import { customJwtInterceptorFn } from "./customJwtInterceptorFn";

const mockSessionInformation: SessionInformation = {
  token: 'fake-jwt-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  admin: false
};

describe('customJwtInterceptorFn', () => {
  let sessionService: SessionService;

  // next est une fonction qui simule le handler suivant dans la chaîne d'intercepteurs.
  // Elle reçoit la requête (potentiellement modifiée) et retourne un Observable vide.
  const nextMock: HttpHandlerFn = (req) =>
    of({} as HttpEvent<unknown>);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService]
    });
    sessionService = TestBed.inject(SessionService);
  });

  // Vérifie que le header Authorization est ajouté quand l'utilisateur est connecté.
  // L'intercepteur doit injecter le JWT dans chaque requête HTTP pour authentifier l'utilisateur auprès du back-end.
  it('should add Authorization header when user is logged in', () => {
    sessionService.logIn(mockSessionInformation);
    const request = new HttpRequest('GET', '/api/test');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (req) => {
      capturedRequest = req as HttpRequest<unknown>;
      return of({} as HttpEvent<unknown>);
    };
    TestBed.runInInjectionContext(() => {
      customJwtInterceptorFn(request, next).subscribe();
    });

    expect(capturedRequest?.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
  });

  // Vérifie que la requête n'est PAS modifiée quand l'utilisateur n'est pas connecté.
  // Les requêtes publiques (login, register) doivent partir sans header Authorization.
  it('should not add Authorization header when user is not logged in', () => {
    sessionService.isLogged = false;
    const request = new HttpRequest('GET', '/api/test');
    let capturedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandlerFn = (req) => {
      capturedRequest = req as HttpRequest<unknown>;
      return of({} as HttpEvent<unknown>);
    };
    TestBed.runInInjectionContext(() => {
      customJwtInterceptorFn(request, next).subscribe();
    });

    expect(capturedRequest?.headers.get('Authorization')).toBeNull();
  });

  // Vérifie que l'intercepteur passe bien la requête au handler suivant
  // dans les deux cas (connecté ou non). La chaîne d'intercepteurs ne doit pas être rompue.
  it('should call next handler', () => {
    const nextSpy = jest.fn().mockReturnValue(of({} as HttpEvent<unknown>));
    const request = new HttpRequest('GET', '/api/test');
    TestBed.runInInjectionContext(() => {
      customJwtInterceptorFn(request, nextSpy as unknown as HttpHandlerFn).subscribe();
    });

    expect(nextSpy).toHaveBeenCalled();
  });
});