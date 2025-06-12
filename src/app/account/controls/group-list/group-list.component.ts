import { Component, Input } from '@angular/core';
import { Group } from 'src/app/model/account';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  standalone: false
})
export class GroupListComponent {

  @Input() groups: Group[] = [];
}
