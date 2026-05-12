import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionInformation } from 'src/app/core/models/sessionInformation.interface';
import { SessionService } from 'src/app/core/service/session.service';
import { LoginRequest } from '../../core/models/loginRequest.interface';
import { AuthService } from '../../core/service/auth.service';
import {MaterialModule} from "../../shared/material.module";
import { CommonModule } from '@angular/common';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);


  public hide = true;
  public readonly onError = signal(false);

  public form = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.min(3)
      ]
    ]
  });

  public submit(): void {
    const loginRequest = this.form.value as LoginRequest;

    this.authService.login(loginRequest).pipe(
      tap((response: SessionInformation) => {
        this.sessionService.logIn(response);
        this.router.navigate(['/sessions']);
      }),
      catchError(() => {
        this.onError.set(true);
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
