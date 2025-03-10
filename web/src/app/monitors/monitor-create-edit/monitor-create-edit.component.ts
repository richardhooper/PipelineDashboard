// Core modules
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

// Third party modules
import { Subscription } from 'rxjs';
import { v4 as uuid } from 'uuid';

// Dashboard hub models and services
import { MonitorService } from '@core/services/index.service';
import { MonitorModel, ProjectModel } from '@shared/models/index.model';

/**
 * Monitor create edit component
 */
@Component({
  selector: 'dashboard-monitor-create-edit',
  templateUrl: './monitor-create-edit.component.html',
  styleUrls: ['./monitor-create-edit.component.scss'],
})
export class MonitorCreateEditComponent implements OnInit, OnDestroy {

  private monitorUid: string;
  private monitorsList: MonitorModel[] = [];
  private projectSubscription: Subscription;
  private saveMonitorSubscription: Subscription;
  public isEdit: Boolean = false;
  public monitorForm: FormGroup;
  public projectUid: string;
  public statusCodeList: Number[] = [200, 201, 204, 400, 401, 404, 500];

  /**
   * Life cycle method
   * @param form FormBuilder
   * @param monitorService MonitorService
   * @param route ActivatedRoute instace
   * @param snackBar MatSnackBar
   * @param router Router instace
   */
  constructor(
    private form: FormBuilder,
    private monitorService: MonitorService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  /**
   * Lifecycle init method
   */
  ngOnInit(): void {
    this.projectUid = this.route.snapshot.paramMap.get('projectUid');
    this.initializeMonitorForm();
    this.projectSubscription = this.route.data
      .subscribe((data: { project: ProjectModel }) => {
        const project: ProjectModel = data.project;
        this.monitorsList = project && project.monitors ? project.monitors : [];
        this.monitorUid = this.route.snapshot.paramMap.get('monitorUid');
        if (this.monitorUid) {
          this.isEdit = true;
          const filteredMonitor: MonitorModel = this.monitorsList.find((monitor: MonitorModel) => monitor.uid === this.monitorUid);
          this.monitorForm.reset(filteredMonitor);
        }
      });
  }

  /**
   * To initialize monitor form
   */
  initializeMonitorForm(): void {
    this.monitorForm = this.form.group({
      uid: uuid(),
      name: [undefined, [Validators.required, Validators.minLength(3)]],
      method: [undefined, Validators.required],
      path: [undefined, Validators.required],
      expectedCode: [undefined, Validators.required],
      expectedText: [undefined],
    });
  }

  /**
   * Save monitor and navigate to monitors list screen
   *
   * @param uid uid of monitor which needs to be added into monitors list
   * @param monitors monitors list to be updated
   *
   */
  save(): void {
    this.saveMonitorSubscription = this.monitorService
      .save(this.projectUid, new MonitorModel({ ...this.monitorForm.value }))
      .subscribe(
        () => this.router.navigate([`/projects/${this.projectUid}/monitors`]),
        (error: any): any => this.snackBar.open(error.message, undefined, { duration: 5000 })
      );
  }

  /**
   * Lifecycle destroy method
   */
  ngOnDestroy(): void {
    this.projectSubscription.unsubscribe();
    if (this.saveMonitorSubscription) {
      this.saveMonitorSubscription.unsubscribe();
    }
  }
}
