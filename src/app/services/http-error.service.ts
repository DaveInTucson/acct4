import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ErrorMessage {
  context: string,
  error: HttpErrorResponse,
}

@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {
  private errorSubject = new Subject<ErrorMessage | null>();
  
  error$ = this.errorSubject.asObservable()

  showError(context: string, error: HttpErrorResponse) : void {
    this.errorSubject.next({context, error});
  }

  clearError() {
    this.errorSubject.next(null);
  }
}
