import { Component, OnDestroy } from '@angular/core';
import { ErrorMessage, HttpErrorService } from './services/http-error.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private releaseSubscriptions$ = new Subject<void>();
  title = 'Acctounts V4';

  errorMessage: ErrorMessage | null = null;

  constructor(private errorService: HttpErrorService) {
    this.errorService.error$
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe(
        (message) => this.errorMessage = message );
  }

  getMessageText() : string {
    if (null === this.errorMessage) return "null message";
    else {
      return this.errorMessage.error.message;
    }
  }

  ngOnDestroy() {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();
  }

  getErrorContext() : string {
    return this.errorMessage!.error.error.context;
  }
}


