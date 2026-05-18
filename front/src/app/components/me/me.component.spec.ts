import { expect, jest } from '@jest/globals';
import { User } from 'src/app/core/models/user.interface';
import { MeComponent } from './me.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SessionService } from 'src/app/core/service/session.service';

const mockUser: User = {
  id: 1,
  email: 'test@test.com',
  lastName: 'Doe',
  firstName: 'John',
  admin: false,
  password: 'password',
  createdAt: new Date()
};

const mockSessionService = {
  sessionInformation: {
    token: 'fake-token',
    type: 'Bearer',
    id: 1,
    username: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false
  },
  isLogged: true,
  logOut: jest.fn()
};

class MatSnackBarMock {
  open = jest.fn();
}

//User informations tests, delete account tests, back button test

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBarMock: MatSnackBarMock;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MeComponent,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatSnackBar, useClass: MatSnackBarMock  },
        { provide: SessionService, useValue: mockSessionService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBarMock = TestBed.inject(MatSnackBar) as unknown as MatSnackBarMock;

    // Simule la réponse HTTP pour le chargement initial de l'utilisateur.
    // detectChanges() en premier → déclenche la souscription de l'async pipe → la requête HTTP part → on peut l'intercepter avec expectOne
    fixture.detectChanges();
    const req = httpMock.expectOne('api/user/1');
    req.flush(mockUser);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
    // jest.clearAllMocks();
  });

  // Vérifie que le composant s'instancie correctement.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Plan de tests — Account : vérifie que le nom et l'email de l'utilisateur sont bien affichés dans le template.
  it('should display user information', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John');
    expect(compiled.textContent).toContain('DOE');
    expect(compiled.textContent).toContain('test@test.com');
  });

  // Plan de tests — Account : vérifie que le bouton Delete n'est pas affiché pour un utilisateur admin.
  it('should not display delete button for admin user', async () => {
    // On modifie le mock pour simuler un admin
    mockSessionService.sessionInformation.admin = true;
    // On recrée le composant avec le nouvel état
    fixture = TestBed.createComponent(MeComponent);
    fixture.detectChanges();  
    const req = httpMock.expectOne('api/user/1');
    req.flush({ ...mockUser, admin: true });  
    await fixture.whenStable();
    fixture.detectChanges();
    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(deleteButton).toBeNull();
    // On remet à false pour ne pas polluer les autres tests
    mockSessionService.sessionInformation.admin = false;
  });

  // Plan de tests — Account : vérifie que back() appelle bien window.history.back() pour revenir à la page précédente.
  it('should call window.history.back on back()', () => {
    const historySpy = jest.spyOn(window.history, 'back');
    component.back();
    expect(historySpy).toHaveBeenCalled();
  });

  // Plan de tests — Account : vérifie que delete() envoie un DELETE HTTP, affiche un snackbar de confirmation, appelle logOut() et redirige vers /.
  it('should delete account, show snackbar, logout and navigate to root', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    // On accède à l'instance MatSnackBar utilisée par le composant
    // et on y pose un spy
    const snackBarSpy = jest.spyOn((component as any).matSnackBar, 'open');

    component.delete();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await fixture.whenStable();

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Your account has been deleted !',
      'Close',
      { duration: 3000 }
    );
    expect(mockSessionService.logOut).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});