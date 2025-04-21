import { Component, Input } from '@angular/core';
import { Group } from 'src/app/model/account';

@Component({
  selector: 'app-group-summary-link',
  templateUrl: './group-summary-link.component.html',
  styleUrls: ['./group-summary-link.component.css']
})
export class GroupSummaryLinkComponent {

  @Input() group: Group | null = null;
  @Input() groupID: number = 0;
  @Input() caption: string | null = null;
  @Input() fromDate: string | null = null;
  @Input() toDate: string | null = null;

  getGroupID(): number {
    if (this.group) return this.group.id;
    return this.groupID;
  }

  getCaption(): string {
    if (this.caption) return this.caption;
    if (this.group) return this.group.name;

    return `group ${this.getGroupID()}`;
  }

  getQueryParms(): Object | null {
    if (this.fromDate !== null || this.toDate !== null)
      return { from: this.fromDate, to: this.toDate };

    return null;
  }
}
