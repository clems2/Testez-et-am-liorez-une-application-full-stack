import { expect } from '@jest/globals';
import { SessionInformation } from '../models/sessionInformation.interface';
import { SessionService } from './session.service';

const mockSessionInformation: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'John',
  lastName: 'Doe',
  admin: false
};

describe('SessionService', () => {
  let service: SessionService;

  // Crée une instance fraîche du service avant chaque test
  // pour garantir l'isolation : aucun test n'est pollué par l'état du précédent.
  // On instancie directement sans TestBed car SessionService n'a aucune dépendance externe.
  beforeEach(() => {
    service = new SessionService();
  });

  // ========================
  // Tests unitaires - Etat initial du service sans interaction
  // ========================

  // Vérifie que le service s'instancie correctement.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Vérifie que l'utilisateur n'est pas connecté au démarrage.
  it('should have isLogged set to false initially', () => {
    expect(service.isLogged).toBe(false);
  });

  // Vérifie qu'aucune information de session n'est présente au démarrage.
  it('should have sessionInformation undefined initially', () => {
    expect(service.sessionInformation).toBeUndefined();
  });

  // Vérifie que $isLogged() retourne bien un Observable
  // émettant false dès la souscription (valeur initiale du BehaviorSubject).
  it('$isLogged should return an Observable emitting false initially', (done) => {
    service.$isLogged().subscribe(value => {
      expect(value).toBe(false);
      done();
    });
  });

  // ========================
  // Tests d'intégration
  // ========================

  // Plan de tests — Login : vérifie que la connexion met bien isLogged à true.
  it('logIn should set isLogged to true', () => {
    service.logIn(mockSessionInformation);
    expect(service.isLogged).toBe(true);
  });

  // Plan de tests — Login : vérifie que les informations de l'utilisateur sont correctement stockées dans sessionInformation.
  it('logIn should set sessionInformation', () => {
    service.logIn(mockSessionInformation);
    expect(service.sessionInformation).toEqual(mockSessionInformation);
  });

  // Plan de tests — Login : vérifie que $isLogged() émet true après une connexion.
  it('logIn should emit true on $isLogged observable', (done) => {
    const emitted: boolean[] = [];

    service.$isLogged().subscribe(value => {
      emitted.push(value);
      if (emitted.length === 2) {
        expect(emitted[0]).toBe(false); // valeur initiale
        expect(emitted[1]).toBe(true);  // après logIn
        done();
      }
    });
    service.logIn(mockSessionInformation);
  });

  // Plan de tests — Logout : vérifie que la déconnexion met bien isLogged à false.
  it('logOut should set isLogged to false', () => {
    service.logIn(mockSessionInformation);
    service.logOut();
    expect(service.isLogged).toBe(false);
  });

  // Plan de tests — Logout : vérifie que les informations de session sont effacées après une déconnexion.
  it('logOut should clear sessionInformation', () => {
    service.logIn(mockSessionInformation);
    service.logOut();
    expect(service.sessionInformation).toBeUndefined();
  });

  // Plan de tests — Logout : vérifie que $isLogged() émet false après une déconnexion.
  it('logOut should emit false on $isLogged observable', (done) => {
    const emitted: boolean[] = [];

    service.$isLogged().subscribe(value => {
      emitted.push(value);
      if (emitted.length === 3) {
        expect(emitted[0]).toBe(false); // valeur initiale
        expect(emitted[1]).toBe(true);  // après logIn
        expect(emitted[2]).toBe(false); // après logOut
        done();
      }
    });

    service.logIn(mockSessionInformation);
    service.logOut();
  });
});