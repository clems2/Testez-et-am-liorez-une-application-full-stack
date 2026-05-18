import { expect } from '@jest/globals';
import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from "@angular/common/http";
import { RegisterRequest } from '../models/registerRequest.interface';
import { LoginRequest } from '../models/loginRequest.interface';
import { SessionInformation } from '../models/sessionInformation.interface';



describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Configure un module de test avec un HttpClient mocké.
  // provideHttpClientTesting intercepte tous les appels HTTP, on peut donc les contrôler sans faire de vrais appels réseau.
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // S'assure qu'aucune requête HTTP n'a été oubliée à la fin de chaque test.
  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Plan de tests — Register : vérifie qu'un POST est envoyé vers /api/auth/register avec le bon payload, et que la réponse est bien propagée.
  it('register should POST to /api/auth/register with the request body', () => {
    const registerRequest: RegisterRequest = {
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password'
    };

    service.register(registerRequest).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(null);
  });

  // Plan de tests — Login : vérifie qu'un POST est envoyé vers /api/auth/login et que la réponse (SessionInformation avec token) est bien retournée.
  it('login should POST to /api/auth/login and return SessionInformation', () => {
    const loginRequest: LoginRequest = {
      email: 'test@test.com',
      password: 'password'
    };
    const mockResponse: SessionInformation = {
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: false
    };

    service.login(loginRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockResponse);
  });
});