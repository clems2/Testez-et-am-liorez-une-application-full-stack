import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './core/service/auth.service';
import { SessionService } from './core/service/session.service';
import {CommonModule} from "@angular/common";
import {MaterialModule} from "./shared/material.module";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private router = inject(Router);
  private sessionService = inject(SessionService);
  public readonly isLogged$: Observable<boolean> = this.sessionService.$isLogged();

  public logout(): void {
    this.sessionService.logOut();
    this.router.navigate([''])
  }
}
