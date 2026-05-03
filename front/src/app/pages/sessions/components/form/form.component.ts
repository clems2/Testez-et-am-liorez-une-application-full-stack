import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { map, switchMap, of, Observable } from 'rxjs';


type FormDatas = {
  form: FormGroup;
  onUpdate: boolean;
};

@Component({
  selector: 'app-form',
  imports: [CommonModule, MaterialModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private matSnackBar = inject(MatSnackBar);
  private sessionApiService = inject(SessionApiService);
  private sessionService = inject(SessionService);
  private teacherService = inject(TeacherService);
  private router = inject(Router);

  public onUpdate: boolean = false;
  public sessionForm: FormGroup | undefined;
  public teachers$ = this.teacherService.all();
  private id: string | undefined;

  public datas$: Observable<FormDatas> = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id');

      if (id) {
        return this.sessionApiService.detail(id).pipe(
          map(session => ({
            form: this.initForm(session),
            onUpdate: true
          }))
        );
      }

      return of({
        form: this.initForm(),
        onUpdate: false
      });
    })
  );

  private initForm(session?: Session): FormGroup {
    return this.fb.group({
      name: [session?.name || '', [Validators.required]],
      date: [
        session ? new Date(session.date).toISOString().split('T')[0] : '',
        [Validators.required]
      ],
      teacher_id: [session?.teacher_id || '', [Validators.required]],
      description: [
        session?.description || '',
        [Validators.required, Validators.maxLength(2000)]
      ]
    });
  }

  public submit(datas:FormDatas): void {
    const session = datas.form.value as Session;

    const request$ = datas.onUpdate
      ? this.sessionApiService.update(this.route.snapshot.paramMap.get('id')!, session)
      : this.sessionApiService.create(session);

    request$.subscribe(() => {
      this.matSnackBar.open(
        datas.onUpdate ? 'Session updated !' : 'Session created !',
        'Close',
        { duration: 3000 }
      );
      this.router.navigate(['sessions']);
    });
  }
}
