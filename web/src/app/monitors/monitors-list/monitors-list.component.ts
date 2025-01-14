// Core modules
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';

// Rxjs operators
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// Breakpoints components
import { Breakpoints, BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

// Dashboard hub application model and services
import { MonitorService, ProjectService } from '@core/services/index.service';
import { DialogConfirmationComponent } from '@shared/dialog/confirmation/dialog-confirmation.component';
import { MonitorModel, ProjectModel } from '@shared/models/index.model';

/**
 * Monitor list component
 */
@Component({
  selector: 'dashboard-monitors-list',
  templateUrl: './monitors-list.component.html',
  styleUrls: ['./monitors-list.component.scss'],
})
export class MonitorsListComponent implements OnInit, OnDestroy {

  private dialogRef: MatDialogRef<DialogConfirmationComponent>;
  private monitorSubscription: Subscription;
  private saveMonitorSubscription: Subscription;
  public monitors: MonitorModel[] = [];
  public project: ProjectModel;
  public projectUid: string;
  public manualPing: boolean = false;
  public displayedColumns: string[];
  public isSmallScreen: boolean;

  /**
   * Life cycle method
   * @param dialog MatDialog
   * @param monitorService MonitorService
   * @param projectService ProjectService
   * @param route ActivatedRoute
   * @param snackBar MatSnackBar
   * @param breakpointObserver BreakpointObserver
   */
  constructor(
    private dialog: MatDialog,
    private monitorService: MonitorService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) { }

  /**
   * Life cycle init method
   */
  ngOnInit(): void {
    this.projectUid = this.route.snapshot.paramMap.get('projectUid');
    this.route.data
      .pipe(
        map((data: { project: ProjectModel }) => data.project)
      )
      .subscribe((project: ProjectModel) => {
        this.project = project;
        this.monitors = project.monitors ? project.monitors : [];
        if (!this.project.logoUrl) {
          this.project.logoUrl = 'https://cdn.dashboardhub.io/logo/favicon.ico';
        }
      });

    this.monitorSubscription = this.projectService
      .findOneById(this.projectUid)
      .subscribe((project: ProjectModel) => this.monitors = project.monitors ? project.monitors : []);

    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.displayedColumns = ['name', 'code', 'action'];
          this.isSmallScreen = true;
        } else {
          this.displayedColumns = ['name', 'method', 'code', 'text', 'ping', 'action'];
          this.isSmallScreen = false;
        }
      });
  }

  /**
   * Delete the monitor from list
   *
   * @param uid the uid of monitor which needs to be deleted
   */
  delete(monitorUid: string): void {
    let dialogConfig: MatDialogConfig = new MatDialogConfig();
    dialogConfig = {
      width: '500px',
      data: {
        title: 'Delete Monitor',
        content: 'Are you sure you want to delete?',
      },
    };
    this.dialogRef = this.dialog.open(DialogConfirmationComponent, dialogConfig);
    this.dialogRef.afterClosed()
      .subscribe((result: boolean) => {
        if (result === true) {
          this.saveMonitorSubscription = this.monitorService.delete(this.projectUid, monitorUid)
            .subscribe(
              () => this.monitorService.deletePingsByMonitor(this.projectUid, monitorUid),
              (error: any): any => this.snackBar.open(error.message, undefined, { duration: 5000 })
            );
        }
      });
  }

  /**
   * Send ping to the monitor manually from UI
   * @param monitorUid uid of monitor
   */
  public pingMonitor(monitorUid: string): void {
    this.manualPing = true;
    this.monitorService
      .pingMonitor(this.projectUid, monitorUid, 'manual')
      .subscribe(() => setTimeout(() => this.manualPing = false, 10000)); // disable the ping button for 10 seconds
  }

  /**
   * Life cycle On destroy method
   */
  ngOnDestroy(): void {
    this.monitorSubscription.unsubscribe();
    if (this.saveMonitorSubscription) {
      this.saveMonitorSubscription.unsubscribe();
    }
  }
}
