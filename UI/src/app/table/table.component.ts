import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { UserData } from '../_models/user-view-model';
import { merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { ISearchOptions } from '../_models/search-options';
import { SearchPanelService } from '../_services/search-panel.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  users: UserData[] = [];
  searchParams: ISearchOptions;

  displayedColumns: string[] = ['num', 'name', 'city', 'position'];
  dataSource: MatTableDataSource<UserData>;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(
    private userService: UserService,
    private searchService: SearchPanelService,
    private router: Router,
    private snackBar: MatSnackBar) { }

  ngOnInit() { }

  ngAfterViewInit() {
    // this.sort.sortChange.subscribe(r => this.paginator.pageIndex = 0);
    this.loadUsersData();
  }

  clickUser(user: UserData) {
    this.router.navigate([`/${user.username}`], { state: { user } });
  }


  getFilteredUsers(params: ISearchOptions) {
    this.searchParams = params;
    this.loadUsersData();
  }

  loadUsersData() {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          if (!this.searchParams || this.searchParams.filter.length === 0) {
            return this.userService.getAll(this.paginator.pageIndex, this.paginator.pageSize);
          } else {
            this.searchParams.pageIndex = this.paginator.pageIndex;
            this.searchParams.pageSize = this.paginator.pageSize;
            return this.searchService.getFilteredUsers(this.searchParams);
          }
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;
          return data.items;
        }),
        catchError(e => {
          this.showMessage(e);
          this.isLoadingResults = false;
          return of([]);
        })
      )
      .subscribe(data => {
        this.users = data;
      });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
