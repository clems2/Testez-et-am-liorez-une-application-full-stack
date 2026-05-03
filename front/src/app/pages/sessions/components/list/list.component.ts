import { Component, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";


type ListDatas = {
  sessions: Session[];
  user: SessionInformation | undefined;
};

@Component({
  selector: 'app-list',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  private sessionApiService = inject(SessionApiService);
  private sessionService = inject(SessionService);

  public datas$: Observable<ListDatas> = this.sessionApiService.all().pipe(
    map((sessions) => ({
      sessions,
      user: this.sessionService.sessionInformation
    }))
  );
}
