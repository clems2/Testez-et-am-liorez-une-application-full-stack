import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.interface';
import { SessionService } from '../../core/service/session.service';
import { UserService } from '../../core/service/user.service';
import { MaterialModule } from "../../shared/material.module";
import { CommonModule } from "@angular/common";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeComponent {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly matSnackBar = inject(MatSnackBar);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly user$: Observable<User> = this.userService
    .getById(this.sessionService.sessionInformation!.id.toString());

  public back(): void {
    window.history.back();
  }

  public delete(): void {
    this.userService
      .delete(this.sessionService.sessionInformation!.id.toString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.matSnackBar.open('Your account has been deleted !', 'Close', { duration: 3000 });
        this.sessionService.logOut();
        this.router.navigate(['/']);
      });
  }
}