import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { map, switchMap, Observable, Subject, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


type DetailDatas = {
  session: Session;
  teacher: Teacher;
  isParticipate: boolean;
  isAdmin: boolean;
};

@Component({
  selector: 'app-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent {
  
  
  private route = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private sessionApiService = inject(SessionApiService);
  private teacherService = inject(TeacherService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);


  public sessionId = this.route.snapshot.paramMap.get('id')!;
  public userId = this.sessionService.sessionInformation!.id;
  public strUserId = this.sessionService.sessionInformation!.id.toString();

  private readonly refresh$ = new Subject<void>();

  public readonly datas$: Observable<DetailDatas> = this.refresh$.pipe(
    startWith(undefined as void),
    switchMap(() => this.loadDatas())
  );



  private loadDatas(): Observable<DetailDatas> {
    return this.sessionApiService.detail(this.sessionId).pipe(
      switchMap(session =>
        this.teacherService.detail(session.teacher_id.toString()).pipe(
          map(teacher => ({
            session,
            teacher,
            isParticipate: session.users.includes(this.userId),
            isAdmin: this.sessionService.sessionInformation!.admin
          }))
        )
      )
    );
  }

  public back() {
    window.history.back();
  }

  public delete(): void {
    this.sessionApiService
      .delete(this.sessionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
          this.matSnackBar.open('Session deleted !', 'Close', { duration: 3000 });
          this.router.navigate(['sessions']);
        }
      );
  }

  public participate(): void {
    this.sessionApiService.participate(this.sessionId, this.strUserId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.refresh$.next());
  }

  public unParticipate(): void {
    this.sessionApiService.unParticipate(this.sessionId, this.strUserId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.refresh$.next());
  }
}
