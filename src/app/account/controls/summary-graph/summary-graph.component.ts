import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { of } from 'rxjs';
import { GroupDateAndDelta } from 'src/app/model/account';
import { SummaryGraphManager } from 'src/app/util/graphing/SummaryGraphManager';
import { daysBetweenJustDates, daysInMonth, getMonthInitial, JustDate } from 'src/app/util/JustDate';


const gridColor = "#ccc";

interface OffsetAndLabel {
  offset: number;
  label: string;
};

/* The size of the canvas the graph gets drawn on is static and determined in summary-graph.component.css.
 * It might be nicer to do some fancy whiz-bang dynamic sizing based on screen size, but honestly this works
 * well enough for my use case.
 */
@Component({
  selector: 'app-summary-graph',
  templateUrl: './summary-graph.component.html',
  styleUrls: ['./summary-graph.component.css'],
  standalone: false
})
export class SummaryGraphComponent implements AfterViewInit, OnChanges {
    @Input() startingBalance: number = 0;
    @Input() dateAndDeltas: GroupDateAndDelta[] = [];
    @Input() fromDate: string | null = null;
    @Input() toDate: string | null = null;

    @ViewChild('summaryCanvas') summaryCanvas! : ElementRef<HTMLCanvasElement>;

    private emWidth : number = 0;

    //--------------------------------------------------------------------------------
    //
    ngAfterViewInit(): void {
      this.drawSummaryGraph();
    }

    //--------------------------------------------------------------------------------
    //
    ngOnChanges(changes: SimpleChanges): void {
      if (this.summaryCanvas) this.drawSummaryGraph();
    }

    //--------------------------------------------------------------------------------
    //
    private drawSummaryGraph() {

      let sgm = new SummaryGraphManager(this.summaryCanvas.nativeElement);
      if (this.dateAndDeltas.length === 0) {
        sgm.drawNoData();
        return;
      }

      let dateRange = this.getSummaryDateRange();
      let balanceRange = this.getSummaryBalanceRange();

      let xMax = daysBetweenJustDates(dateRange[0], dateRange[1]);
      sgm.setXRange(0, xMax);
      sgm.setYRange(balanceRange[0], balanceRange[1]);
      this.emWidth = sgm.getTextWidth("M");

      this.drawHGrid(sgm, xMax, balanceRange);
      this.drawVGrid(sgm, dateRange[0], xMax, balanceRange);

      sgm.beginPath();
      let balance = this.startingBalance;
      sgm.moveTo(0, balance);
      this.dateAndDeltas.forEach(dateAndDelta => {
        let x = daysBetweenJustDates(dateRange[0], new JustDate(dateAndDelta.date_posted));
        sgm.lineTo(x, balance);
        balance += dateAndDelta.delta
        sgm.lineTo(x, balance);
      });

      sgm.lineTo(xMax, balance);
      sgm.stroke();
    }
     
    //--------------------------------------------------------------------------------
    //
    private drawHGrid(sgm: SummaryGraphManager, xMax: number, balanceRange: [number, number]) {
      let height = balanceRange[1] - balanceRange[0];

      // largest power of 10 smaller than our height
      let step = Math.pow(10, Math.floor(Math.log10(height)));

      // make it smaller if it's too close to the height
      if (height/step <= 2) step /= 10;
      if (height/step <= 3) step /= 2;

      sgm.beginPath();
      let savedStyle = sgm.getStrokeStyle();
      sgm.setStrokeStyle(gridColor);
      sgm.moveTo(0, balanceRange[0]);
      sgm.lineTo(xMax, balanceRange[0]);

      for (let y = Math.ceil(balanceRange[0]/step) * step; y <= balanceRange[1]; y += step) {
        sgm.moveTo(0, y);
        sgm.lineTo(xMax, y);
        sgm.setTextAlign('end');
        sgm.setTextBaseline('middle');
        sgm.fillText(y.toString(), -this.emWidth, y);
      }

      sgm.stroke();
      sgm.closePath();
      sgm.setStrokeStyle(savedStyle);
    }

    //--------------------------------------------------------------------------------
    //
    private drawVGrid(sgm: SummaryGraphManager, firstDate: JustDate, numDays: number, balanceRange: [number, number]) {
      sgm.beginPath();
      let savedStyle = sgm.getStrokeStyle();
      sgm.setStrokeStyle(gridColor);

      sgm.moveTo(0, balanceRange[0]);
      sgm.lineTo(0, balanceRange[1]);

      let labelExtra = sgm.canvas2graphHeight(5);
      let dateGridOffsets = this.getDateGridOffsets(sgm, firstDate, numDays);
      dateGridOffsets.forEach(offset => {
        sgm.moveTo(offset.offset, balanceRange[0]);
        sgm.lineTo(offset.offset, balanceRange[1]);
        sgm.setTextAlign('center');
        sgm.setTextBaseline('top');
        sgm.fillText(offset.label, offset.offset, balanceRange[0]+labelExtra);
      });

      sgm.stroke();
      sgm.closePath();
      sgm.setStrokeStyle(savedStyle);
    }

    //--------------------------------------------------------------------------------
    //
    private getDateGridOffsets(sgm: SummaryGraphManager, firstDate: JustDate, numDays: number) : OffsetAndLabel[] {
      let offsets: OffsetAndLabel[] = [];

      let w30 = sgm.getTextWidth("30") * 1.7;

      // if there's room enough to label individual days, do that
      if (w30 < 1) {
        for (let offset = 0; offset <= numDays; offset++) {
          let date : JustDate = firstDate.addDays(offset);
          let label = date.day.toString()
          if (date.day === 1) label = getMonthInitial(date.month);
          offsets.push({ offset, label });
        }
      }
      // if there's room to label individual months, do that
      else if (w30 < 31) {
        let date = firstDate;
        if (date.day !== 1)
          date = date.addDays(daysInMonth(date.year, date.month) - date.day);
        while (daysBetweenJustDates(firstDate, date) <= numDays) {
          let label = getMonthInitial(date.month);
          if (date.month === 1) label = date.year.toString();
          let offset = daysBetweenJustDates(firstDate, date);
          offsets.push({offset, label});
          date = date.addDays(daysInMonth(date.year, date.month));
        }
      }
      // otherwise label individual years
      else {
        // Theoretically there's a date range that would put consecutive close enough together to overlap.
        // Maybe fix that in the next version?
        let date = firstDate;
        if (1 !== firstDate.month || 1 != firstDate.day)
          date = new JustDate(firstDate.year+1, 1, 1);
        while (daysBetweenJustDates(firstDate, date) <= numDays) {
          let label = date.year.toString();
          let offset = daysBetweenJustDates(firstDate, date);
          offsets.push({ offset, label });
          date = new JustDate(date.year + 1, 1, 1);
        }
      }

      return offsets;
    }

    //--------------------------------------------------------------------------------
    //
    private getSummaryDateRange(): [JustDate, JustDate] {
      let fromDate = new JustDate(this.dateAndDeltas[0].date_posted);
      if (this.fromDate) fromDate = new JustDate(this.fromDate);

      let toDate   = new JustDate(this.dateAndDeltas[this.dateAndDeltas.length-1].date_posted);
      if (this.toDate) toDate = new JustDate(this.toDate);

      if (fromDate.compareTo(toDate) === 0) {
        fromDate = fromDate.addDays(-30);
        toDate   = toDate.addDays(1);
      }

      return [fromDate, toDate];
    }

    //--------------------------------------------------------------------------------
    //
    private getSummaryBalanceRange(): [number, number] {
      let currentBalance = this.startingBalance;
      let minBalance = currentBalance;
      let maxBalance = currentBalance;

      this.dateAndDeltas.forEach(dateAndDelta => {
        currentBalance += dateAndDelta.delta;
        if (minBalance > currentBalance) minBalance = currentBalance;
        if (maxBalance < currentBalance) maxBalance = currentBalance;
      })

      if (maxBalance - minBalance <= 0.01) {
        maxBalance += 10;
        minBalance -= 10;
        if (minBalance < 0) minBalance = 0;
      }

      return [minBalance, maxBalance];
    }
}
