import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
  standalone: false
})
export class TopNavComponent {
  @Input() context: string = '';
}
