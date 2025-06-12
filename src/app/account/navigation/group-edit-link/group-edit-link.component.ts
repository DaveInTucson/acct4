import { Component, Input } from '@angular/core';
import { Group } from 'src/app/model/account';

@Component({
  selector: 'app-group-edit-link',
  templateUrl: './group-edit-link.component.html',
  styleUrls: ['./group-edit-link.component.css'],
  standalone: false
})
export class GroupEditLinkComponent {
  @Input() group: Group | null = null;
  @Input() groupID: number | null = null;
  @Input() caption: string | null = null;

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

}
