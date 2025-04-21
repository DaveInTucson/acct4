import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DateRange } from 'src/app/model/statement';
import { daysInMonth, JustDate } from 'src/app/util/JustDate';

@Component({
  selector: 'app-select-date-dialog',
  templateUrl: './select-date-dialog.component.html',
  styleUrls: ['./select-date-dialog.component.css']
})
export class SelectDateDialogComponent {

    @Input() fromDate: string | null = null;
    @Input() toDate: string | null = null;
    @Output('onApply') applyEmitter = new EventEmitter<DateRange>();

    @ViewChild('selectDateRangeDialog') selectDateRangeDialog! : ElementRef<HTMLDialogElement>;

  show() {
    this.selectDateRangeDialog.nativeElement.show();
  }

  onCancel() {
    this.selectDateRangeDialog.nativeElement.close();
  }

  onApply() {
    this.selectDateRangeDialog.nativeElement.close();
    this.applyEmitter.emit({ fromDate: this.fromDate, toDate: this.toDate });
  }

  onLast30() {
    this.selectDateRangeDialog.nativeElement.close();
    let toDate = new JustDate();
    let fromDate = toDate.addDays(-30);
    this.applyEmitter.emit({ fromDate: fromDate.toSQLString(), toDate: toDate.toSQLString() });
  }

  onThisMonth() {
    this.selectDateRangeDialog.nativeElement.close();
    let today = new JustDate();
    let firstOfMonth = new JustDate(today.year, today.month, 1);
    let lastOfMonth = new JustDate(today.year, today.month, daysInMonth(today.year, today.month));
    this.applyEmitter.emit({ fromDate: firstOfMonth.toSQLString(), toDate: lastOfMonth.toSQLString()});
  }

  onThisYear() {
    this.selectDateRangeDialog.nativeElement.close();
    let thisYear = new JustDate().year;
    let jan1 = new JustDate(thisYear, 1, 1);
    let dec31 = new JustDate(thisYear, 12, 31);
    this.applyEmitter.emit({ fromDate: jan1.toSQLString(), toDate: dec31.toSQLString()});
  }

  onLast365() {
    this.selectDateRangeDialog.nativeElement.close();
    let toDate = new JustDate();
    let fromDate = toDate.addDays(-365);
    this.applyEmitter.emit({ fromDate: fromDate.toSQLString(), toDate: toDate.toSQLString() });
  }

  onClearRange() {
    this.selectDateRangeDialog.nativeElement.close();
    this.applyEmitter.emit({ fromDate: null, toDate: null });
  }

}
