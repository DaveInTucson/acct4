import { Component, Input } from '@angular/core';
import { Group } from 'src/app/model/account';

@Component({
  selector: 'app-group-in-and-out-link',
  templateUrl: './group-in-and-out-link.component.html',
  styleUrls: ['./group-in-and-out-link.component.css']
})
export class GroupInAndOutLinkComponent {
  @Input() group: Group | null = null;
  @Input() groupID: number | null = null;
  @Input() caption: string | null = null;
  @Input() fromDate: string | null = null;
  @Input() toDate: string | null = null;

  getGroupID() : number {
    if (null != this.groupID) return this.groupID;
    if (null != this.group) return this.group.id;
    return 0;
  }

  getCaption() : string {
    if (null != this.caption) return this.caption;
    if (null != this.group) return this.group.name;
    return `no caption for group ${this.getGroupID()}`;
  }

  getQueryParms(): Object | null {
    if (this.fromDate !== null || this.toDate !== null)
      return { from: this.fromDate, to: this.toDate };

    return null;
  }
}
