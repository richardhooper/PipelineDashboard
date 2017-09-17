import {Component, OnInit} from '@angular/core';

import {EnvironmentsService} from "./environments.service";
import {List} from "./list";
import {Environment} from "./environment";

@Component({
  selector: 'app-environments',
  templateUrl: './environments.component.html',
  styleUrls: ['./environments.component.css'],
  providers: [EnvironmentsService]
})
export class EnvironmentsComponent implements OnInit {

  environments: List<Environment> = new List<Environment>();

  constructor(private environmentService: EnvironmentsService) {
  }

  ngOnInit() {
    this.getEnvironments();
  }

  getEnvironments(): void {
    this.environmentService
      .getEnvironments()
      .then((environments) => this.environments = environments);
  }

}