import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {  Observable } from 'rxjs';
import {  map } from 'rxjs/operators';

// Dashboard model and services
import { TokenService } from '../../core/services/token.service';
import { ProjectTokenModel } from '../../shared/models/index.model';

@Component({
  selector: 'dashboard-project-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.scss'],
})
export class ProjectTokensComponent {

  public projectUid: string;
  public tokens$: Observable<ProjectTokenModel[]>;

  constructor(
    private tokenService: TokenService,
    private route: ActivatedRoute
  ) {
    this.projectUid = this.route.snapshot.paramMap.get('projectUid');
    this.tokens$ = this.route.data
      .pipe(
        map((data: { tokens: ProjectTokenModel[] }) => data.tokens)
      );
  }

  // This function delete the project token
  delete(token: ProjectTokenModel): void {
    this.tokenService
      .delete(this.projectUid, token.uid)
      .toPromise()
      .then(() => {
        this.tokens$ = this.tokenService.findProjectTokens(this.projectUid);
      });
  }

}
