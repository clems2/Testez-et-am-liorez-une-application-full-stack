import { expect } from '@jest/globals';
import { TeacherService } from './teacher.service';
import { Teacher } from '../models/teacher.interface';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

const mockTeacher: Teacher = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Smith',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TeacherService
      ]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Plan de tests — Création session : le formulaire utilise teachers$ pourafficher la liste des professeurs dans le select.
  // Vérifie qu'un GET récupère bien la liste depuis api/teacher.
  it('all should GET api/teacher and return list of teachers', () => {
    const mockTeachers: Teacher[] = [mockTeacher];

    service.all().subscribe(teachers => {
      expect(teachers).toEqual(mockTeachers);
    });
    const req = httpMock.expectOne('api/teacher');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeachers);
  });

  // Plan de tests — Informations session : la page detail affiche le nom du professeur. Vérifie qu'un GET récupère un professeur par son id.
  it('detail should GET api/teacher/:id and return a teacher', () => {
    service.detail('1').subscribe(teacher => {
      expect(teacher).toEqual(mockTeacher);
    });
    const req = httpMock.expectOne('api/teacher/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeacher);
  });
});