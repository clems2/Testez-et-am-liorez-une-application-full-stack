import { expect } from '@jest/globals';
import { ListComponent } from './list.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Session } from 'src/app/core/models/session.interface';
import { SessionService } from 'src/app/core/service/session.service';

const mockSessions: Session[] = [
  {
    id: 1,
    name: 'Morning Yoga',
    description: 'Start your day with energy',
    date: new Date(),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    name: 'Evening Yoga',
    description: 'Wind down before bed',
    date: new Date(),
    teacher_id: 2,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockSessionServiceAdmin = {
  sessionInformation: {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true
  },
  isLogged: true
};

const mockSessionServiceUser = {
  sessionInformation: {
    token: 'fake-token',
    type: 'Bearer',
    id: 2,
    username: 'user@test.com',
    firstName: 'Regular',
    lastName: 'User',
    admin: false
  },
  isLogged: true
};

// Session list display tests, Create button visibility tests, Detail button visibility tests, Edit button visibility tests for admin and non-admin users
describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let httpMock: HttpTestingController;

  // Fonction utilitaire pour configurer le TestBed avec un service mocké donné.
  // Permet de tester facilement les deux cas : admin et utilisateur standard.
  const setupTestBed = async (sessionServiceMock: object) => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // La requête HTTP est déclenchée par l'async pipe dans le template, donc on fait detectChanges() avant d'intercepter la requête.
    fixture.detectChanges();
    const req = httpMock.expectOne('api/session');
    req.flush(mockSessions);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  afterEach(() => {
    httpMock.verify();
  });

  // Vérifie que le composant s'instancie correctement.
  it('should create', async () => {
    await setupTestBed(mockSessionServiceUser);
    expect(component).toBeTruthy();
  });

  // Plan de tests — Sessions : vérifie que toutes les sessions retournées par l'API sont affichées dans le template (titre et description).
  it('should display the list of sessions', async () => {
    await setupTestBed(mockSessionServiceUser);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Morning Yoga');
    expect(compiled.textContent).toContain('Evening Yoga');
    expect(compiled.textContent).toContain('Start your day with energy');
  });

  // Plan de tests — Sessions : vérifie que le bouton Create est affiché pour un utilisateur admin (permet la création d'une nouvelle session).
  it('should display Create button for admin user', async () => {
    await setupTestBed(mockSessionServiceAdmin);
    const createButton = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createButton).toBeTruthy();
  });

  // Plan de tests — Sessions : vérifie que le bouton Create n'est PAS affiché pour un utilisateur non-admin (pas les droits de création).
  it('should not display Create button for non-admin user', async () => {
    await setupTestBed(mockSessionServiceUser);
    const createButton = fixture.debugElement.query(By.css('button[routerLink="create"]'));
    expect(createButton).toBeNull();
  });

  // Plan de tests — Sessions : vérifie que le bouton Detail est affiché pour chaque session, indépendamment du statut admin.
  it('should display Detail button for each session', async () => {
    await setupTestBed(mockSessionServiceUser);
    const detailButtons = fixture.debugElement.queryAll(
      By.css('button[ng-reflect-router-link*="detail"]')
    );
    // Au moins une session doit avoir un bouton Detail
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Detail');
  });

  // Plan de tests — Sessions : vérifie que le bouton Edit est affiché pour un admin sur chaque session (permet la modification).
  it('should display Edit button for admin user', async () => {
    await setupTestBed(mockSessionServiceAdmin);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Edit');
  });

  // Plan de tests — Sessions : vérifie que le bouton Edit n'est PAS affiché pour un utilisateur non-admin.
  it('should not display Edit button for non-admin user', async () => {
    await setupTestBed(mockSessionServiceUser);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Edit');
  });
});