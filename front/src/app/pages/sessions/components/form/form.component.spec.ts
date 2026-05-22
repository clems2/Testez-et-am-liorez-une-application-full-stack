import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { expect, jest } from '@jest/globals';
import { of } from 'rxjs';
import { Session } from 'src/app/core/models/session.interface';
import { Teacher } from 'src/app/core/models/teacher.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { FormComponent } from './form.component';

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

const mockTeachers: Teacher[] = [
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockSessionService = {
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

// Mock typé pour MatSnackBar (cf. leçon apprise dans DetailComponent).
class MatSnackBarMock {
  open = jest.fn();
}

//Session creation tests, Session update tests, Required fields validation tests, Pre-fill form tests, title display test, back test
describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBarMock: MatSnackBarMock;

  // Setup partagé : configure le TestBed selon le mode (create ou update).
  // En mode create, paramMap.get('id') retourne null.
  // En mode update, on passe un id qui sera lu par la route.
  const setupTestBed = async (mode: 'create' | 'update') => {
    const paramMap = mode === 'update'
      ? convertToParamMap({ id: '1' })
      : convertToParamMap({});

    await TestBed.configureTestingModule({
      imports: [
        FormComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatSnackBar, useClass: MatSnackBarMock },
        { provide: SessionService, useValue: mockSessionService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap },
            paramMap: of(paramMap)
          }
        }
      ]
    }).compileComponents();

    TestBed.overrideComponent(FormComponent, {
      set: {
        providers: [
          { provide: MatSnackBar, useClass: MatSnackBarMock }
        ]
      }
    });
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBarMock = fixture.debugElement.injector.get(MatSnackBar) as unknown as MatSnackBarMock;
    fixture.detectChanges();
    // En mode update, le composant charge aussi la session existante.
    if (mode === 'update') {
      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);
    }
    await fixture.whenStable();
    fixture.detectChanges();
    // teachers$ est souscrit par l'async pipe dans le template, qui s'évalue après le rendu de datas$.
    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    await fixture.whenStable();
    fixture.detectChanges();
  };

  afterEach(() => {
    httpMock.verify();
  });

  // Vérifie que le composant s'instancie correctement en mode create.
  it('should create in create mode', async () => {
    await setupTestBed('create');
    expect(component).toBeTruthy();
  });

  // Vérifie que le composant s'instancie correctement en mode update.
  it('should create in update mode', async () => {
    await setupTestBed('update');
    expect(component).toBeTruthy();
  });

  // Plan de tests — Création session : vérifie que le titre "Create session" est affiché en mode création (sans id dans l'URL).
  it('should display "Create session" title in create mode', async () => {
    await setupTestBed('create');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Create session');
  });

  // Plan de tests — Modification session : vérifie que le titre "Update session" est affiché en mode modification (avec id dans l'URL).
  it('should display "Update session" title in update mode', async () => {
    await setupTestBed('update');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Update session');
  });

  // Plan de tests — Création/Modification session : vérifie que le formulaire est invalide quand les champs obligatoires sont vides (en mode création).
  it('should have invalid form when fields are empty in create mode', async () => {
    await setupTestBed('create');
    // On récupère le formulaire via l'observable datas$
    component.datas$.subscribe(datas => {
      expect(datas.form.invalid).toBe(true);
    });
  });

  // Plan de tests — Modification session : vérifie que le formulaire est pré-rempli avec les données de la session en mode modification.
  it('should pre-fill form with session data in update mode', async () => {
    await setupTestBed('update');
    // Le formulaire est pré-rempli via initForm(session) dans le switchMap de datas$. On vérifie via le template que les données sont bien affichées
    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('input');
    // Le premier input est le nom de la session
    const nameInput = inputs[0] as HTMLInputElement;
    expect(nameInput.value).toBe('Morning Yoga');
  });

  // Plan de tests — Création session : vérifie que submit() en mode create envoie un POST HTTP, affiche un snackbar et redirige vers /sessions.
  it('should create session, show snackbar and navigate on submit in create mode', async () => {
    await setupTestBed('create');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.datas$.subscribe(datas => {
      datas.form.setValue({
        name: 'New Yoga',
        date: '2026-06-01',
        teacher_id: 1,
        description: 'A new session'
      });
      component.submit(datas);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    req.flush(mockSession);

    await fixture.whenStable();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session created !',
      'Close',
      { duration: 3000 }
    );
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  // Plan de tests — Modification session : vérifie que submit() en mode update envoie un PUT HTTP, affiche un snackbar et redirige vers /sessions.
  it('should update session, show snackbar and navigate on submit in update mode', async () => {
    await setupTestBed('update');
    const navigateSpy = jest.spyOn(router, 'navigate');
    // La souscription à datas$ déclenche un nouveau GET session (observable froid). On capture les datas pour pouvoir appeler submit après
    let capturedDatas: any;
    component.datas$.subscribe(datas => {
      capturedDatas = datas;
    });
    // On flush le GET déclenché par la souscription
    const getReq = httpMock.expectOne('api/session/1');
    getReq.flush(mockSession);
    await fixture.whenStable();

    // Maintenant on a les datas, on peut appeler submit → déclenche le PUT
    capturedDatas.form.patchValue({ name: 'Updated Yoga' });
    component.submit(capturedDatas);

    // On intercepte le PUT
    const putReq = httpMock.expectOne(r =>
      r.url === 'api/session/1' && r.method === 'PUT'
    );
    putReq.flush(mockSession);
    await fixture.whenStable();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session updated !',
      'Close',
      { duration: 3000 }
    );
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});