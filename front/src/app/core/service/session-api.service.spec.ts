import { expect } from '@jest/globals';
import { Session } from '../models/session.interface';
import { SessionApiService } from './session-api.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

// Session fictive réutilisée dans plusieurs tests.
const mockSession: Session = {
  id: 1,
  name: 'Yoga session',
  description: 'A great session',
  date: new Date(),
  teacher_id: 1,
  users: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), //fournit un HTTPClient réel pour le service mais on va intercepter les requêtes avec provideHttpClientTesting
        provideHttpClientTesting(),
        SessionApiService
      ]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Plan de tests — Sessions : vérifie qu'un GET récupère la liste des sessions.
  it('all should GET api/session and return list of sessions', () => {
    const mockSessions: Session[] = [mockSession];
    service.all().subscribe(sessions => {
      expect(sessions).toEqual(mockSessions);
    });
    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  // Plan de tests — Informations session : vérifie qu'un GET récupère les détails d'une session par son id.
  it('detail should GET api/session/:id and return a session', () => {
    service.detail('1').subscribe(session => {
      expect(session).toEqual(mockSession);
    });
    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSession);
  });

  // Plan de tests — Suppression session : vérifie qu'un DELETE est envoyé vers api/session/:id pour supprimer une session.
  it('delete should DELETE api/session/:id', () => {
    service.delete('1').subscribe();
    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Plan de tests — Création session : vérifie qu'un POST crée une session avec les bonnes données dans le body.
  it('create should POST api/session with session body', () => {
    service.create(mockSession).subscribe(session => {
      expect(session).toEqual(mockSession);
    });
    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSession);
    req.flush(mockSession);
  });

  // Plan de tests — Modification session : vérifie qu'un PUT envoie les nouvelles données pour mettre à jour une session existante.
  it('update should PUT api/session/:id with session body', () => {
    service.update('1', mockSession).subscribe(session => {
      expect(session).toEqual(mockSession);
    });
    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockSession);
    req.flush(mockSession);
  });

  // Plan de tests — Informations session : vérifie qu'un POST inscrit un utilisateur à une session (participation).
  it('participate should POST api/session/:id/participate/:userId', () => {
    service.participate('1', '2').subscribe();
    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('POST');
    req.flush(null); // null car renvoie void et on ne veut pas laisser de requête en attente pour le test afterEach
  });

  // Plan de tests — Informations session : vérifie qu'un DELETE désinscrit un utilisateur d'une session.
  it('unParticipate should DELETE api/session/:id/participate/:userId', () => {
    service.unParticipate('1', '2').subscribe();
    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});