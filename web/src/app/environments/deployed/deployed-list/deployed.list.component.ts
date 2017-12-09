import { Component, OnInit } from '@angular/core';

import { DeployedService } from './../deployed.service';
import { List } from './../../list';
import { ActivatedRoute } from "@angular/router";
import { Deployed } from "../deployed";
import { Release } from "../releases";

@Component({
  selector: 'app-deployed-list',
  templateUrl: './deployed-list.component.html',
  styleUrls: ['./deployed-list.component.css'],
  providers: [DeployedService]
})
export class DeployedListComponent implements OnInit {

  deployed: List<Deployed> = new List<Deployed>();
  releases: List<Release> = new List<Release>();

  constructor(
    private route: ActivatedRoute,
    private deployedService: DeployedService
  ) {
  }

  ngOnInit() {
    this.deployedService.subscribeDeployed()
      .subscribe(deploys => {
        this.deployed = deploys
      });

    this.getDeployed(this.route.snapshot.params.id);
  }

  getDeployed(environmentId: string): void {
    this.deployedService
      .getDeployed(environmentId);
  }
}
