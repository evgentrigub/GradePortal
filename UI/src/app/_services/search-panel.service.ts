import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { SearchGroup } from '../_enums/search-group-enum';

const emptySkills: Observable<Array<string>> = of([]);

@Injectable({
  providedIn: 'root',
})
export class SearchPanelService {
  constructor(private http: HttpClient) {}

  searchSomething(queryString: string, group: SearchGroup): Observable<Array<string>> {
    const result = ['aaaaa', 'bbbbb', 'ccccccc'];
    return of(result);

    // if (!queryString) {
    //   return emptySkills;
    // }

    // const query = queryString.trim();

    // if (query.length < 3) {
    //   return emptySkills;
    // }

    // const params: HttpParams = new HttpParams({ fromObject: { query, limit: '10' } });

    // return this.http.get<Array<string>>(`${environment.apiUrl}/skills/search`, { params }).pipe(
    //   catchError(this.handleError),
    //   tap(x => console.log('autocompleSkill result:', x))
    // );
  }

  private handleError(error: HttpErrorResponse) {
    let msg: string;

    if (error.error instanceof ErrorEvent) {
      msg = 'Произошла ошибка:' + error.error.message;
    } else {
      msg = `Произошла ошибка: ${error.error}. Код ошибки ${error.status}`;
    }

    console.error('PositionService::handleError() ' + msg);

    return throwError(msg);
  }
}
