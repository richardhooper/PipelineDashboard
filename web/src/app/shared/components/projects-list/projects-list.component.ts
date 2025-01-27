
// Core components
import { Breakpoints, BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material';

// Dashboard hub model
import { AuthenticationService } from '@app/core/services/authentication.service';
import { ProjectService } from '@core/services/index.service';
import { ProjectModel } from '../../models/index.model';

/**
 * Project list component
 */
@Component({
  selector: 'dashboard-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnChanges {

  @Input()
  public projects: ProjectModel[] = [];

  public displayedColumns: string[];

  public pingCount: [];

  public isSmallScreen: boolean;

  /**
   * Life cycle method
   * @param breakpointObserver BreakpointObserver
   * @param authService AuthenticationService
   * @param projectService ProjectService
   * @param snackBar MatSnackBar
   */
  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthenticationService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Medium])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isSmallScreen = false;
          this.displayedColumns = ['type', 'title', 'url', 'repository', 'monitors', 'pings', 'user', 'lastDate'];
        } else {
          this.isSmallScreen = false;
          this.displayedColumns = ['type', 'title', 'description', 'url', 'repository', 'monitors', 'pings', 'user', 'lastDate'];
        }
      });
    this.breakpointObserver
      .observe([Breakpoints.Small])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.displayedColumns = ['type', 'title', 'url', 'repository'];
          this.isSmallScreen = false;
        }
      });
    this.breakpointObserver
      .observe([Breakpoints.XSmall])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.displayedColumns = ['title', 'repository'];
          this.isSmallScreen = true;
        }
      });
  }

  /**
   * Check if project belongs to owner or not
   * @param project ProjectModel
   */
  isAdmin(project: ProjectModel): boolean {
    return project.isAdmin(this.authService.profile.uid);
  }

  /**
   * Life cycle on change event to detect change in input property
   */

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projects) {
      this.projects = changes.projects.currentValue;
    }
  }

  /**
   * Check project type
   * @param project ProjectModel
   */
  public checkTypeOfProject(project: ProjectModel): string {
    if (project.type === 'private') {
      return 'private_icon';
    } else if (project.type === 'public') {
      return 'public_icon';
    }
  }

  /**
   * Delete project by project uid
   * @param projectUid uid of project
   */
  public delete(projectUid: string): void {
    this.projectService
      .showDeleteDialog(projectUid)
      .subscribe(() => this.snackBar.open('Project deleted successfully', undefined, { duration: 5000 }));
  }
}
