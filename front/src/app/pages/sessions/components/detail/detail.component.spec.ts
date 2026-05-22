import { expect, jest } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';

const mockSession: Session = {
  id: 1,
  name: 'Morning Yoga',
  description: 'Start your day with energy',
  date: new Date('2026-05-20'),
  teacher_id: 1,
  users: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockTeacher: Teacher = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Smith',
  createdAt: new Date(),
  updatedAt: new Date()
};

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

// Mock typé pour MatSnackBar sinon problème d'injection.
class MatSnackBarMock {
  open = jest.fn();
}

//Session informations tests, Delete session tests, Participate/Unparticipate tests (visible buttons and HTTP requests)
describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBarMock: MatSnackBarMock;

  // Setup partagé entre les tests : configure le TestBed, intercepte les requêtes HTTP de chargement initial (session + teacher) et fait le rendu.
  const setupTestBed = async (sessionServiceMock: object) => {
    await TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: MatSnackBar, useClass: MatSnackBarMock },
        { provide: SessionService, useValue: sessionServiceMock },        
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        // ActivatedRoute APRÈS provideRouter pour qu'il override le router par défaut
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: '1' }) }
          }
        }
      ]
    }).compileComponents();
    //pas la pattern idéal pour le override du provider de MatSnackBar (avec useClass), mais ça fonctionne (NoopAnimationsModule ne fonctionne pas dans ce composant pour une raison inconnue, probablement lié à la configuration du TestBed).
    TestBed.overrideComponent(DetailComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useClass: MatSnackBarMock }
        ]
      }
    });
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBarMock = fixture.debugElement.injector.get(MatSnackBar) as unknown as MatSnackBarMock;
    fixture.detectChanges();

    // Le composant fait deux requêtes en chaîne : d'abord la session, puis le teacher (via switchMap dans loadDatas).
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush(mockSession);

    const teacherReq = httpMock.expectOne('api/teacher/1');
    teacherReq.flush(mockTeacher);

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

  // Plan de tests — Informations session : vérifie que le nom de la session, sa description, et le professeur sont affichés correctement.
  it('should display session information', async () => {
    await setupTestBed(mockSessionServiceUser);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Morning Yoga');
    expect(compiled.textContent).toContain('Start your day with energy');
    expect(compiled.textContent).toContain('Jane');
    expect(compiled.textContent).toContain('Smith');
  });

  // Plan de tests — Informations session : vérifie que le bouton Delete est affiché pour un utilisateur admin.
  it('should display Delete button for admin user', async () => {
    await setupTestBed(mockSessionServiceAdmin);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Delete');
  });

  // Plan de tests — Informations session : vérifie que le bouton Delete n'est PAS affiché pour un utilisateur non-admin.
  it('should not display Delete button for non-admin user', async () => {
    await setupTestBed(mockSessionServiceUser);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Delete');
  });

  // Plan de tests — Informations session : vérifie que le bouton Participate est affiché pour un utilisateur non-admin qui ne participe pas encore.
  it('should display Participate button for non-admin user not participating', async () => {
    await setupTestBed(mockSessionServiceUser);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Participate');
  });

  // Vérifie que back() appelle window.history.back() pour revenir à la page précédente (liste des sessions).
  it('should call window.history.back on back()', async () => {
    await setupTestBed(mockSessionServiceUser);
    const historySpy = jest.spyOn(window.history, 'back');
    component.back();
    expect(historySpy).toHaveBeenCalled();
  });

  // Plan de tests — Suppression session : vérifie que delete() envoie un DELETE HTTP, affiche un snackbar de confirmation et redirige vers la liste des sessions.
  it('should delete session, show snackbar and navigate to sessions list', async () => {
    await setupTestBed(mockSessionServiceAdmin);
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.delete();
    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    await fixture.whenStable();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session deleted !',
      'Close',
      { duration: 3000 }
    );
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  // Plan de tests — Informations session : vérifie que participate() envoie un POST HTTP pour inscrire l'utilisateur à la session.
  it('should send POST request when participate is called', async () => {
    await setupTestBed(mockSessionServiceUser);
    component.participate();
    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('POST');
    req.flush(null);
    // Après participate, le composant recharge les données.
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush({ ...mockSession, users: [2] });
    const teacherReq = httpMock.expectOne('api/teacher/1');
    teacherReq.flush(mockTeacher);
    await fixture.whenStable();
  });

  // Plan de tests — Informations session : vérifie que unParticipate() envoie un DELETE HTTP pour désinscrire l'utilisateur de la session.
  it('should send DELETE request when unParticipate is called', async () => {
    await setupTestBed(mockSessionServiceUser);
    component.unParticipate();
    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    // Après unParticipate, le composant recharge les données.
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush(mockSession);
    const teacherReq = httpMock.expectOne('api/teacher/1');
    teacherReq.flush(mockTeacher);
    await fixture.whenStable();
  });
});