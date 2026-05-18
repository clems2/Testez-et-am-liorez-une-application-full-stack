import { expect } from '@jest/globals';
import { User } from '../models/user.interface';
import { UserService } from './user.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

const mockUser: User = {
  id: 1,
  email: 'test@test.com',
  lastName: 'Doe',
  firstName: 'John',
  admin: false,
  password: 'password',
  createdAt: new Date()
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserService
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Plan de tests — Account : la page Account affiche les infos de l'utilisateur.
  // Vérifie qu'un GET récupère un utilisateur par son id.
  it('getById should GET api/user/:id and return a user', () => {
    service.getById('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  // Plan de tests — Account : permet à un utilisateur non-admin de supprimer son propre compte depuis la page Account. Vérifie qu'un DELETE est envoyé.
  it('delete should DELETE api/user/:id', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});