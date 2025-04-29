import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Group } from 'src/app/model/account';

@Component({
  selector: 'app-group-selector',
  templateUrl: './group-selector.component.html',
  styleUrls: ['./group-selector.component.css']
})
export class GroupSelectorComponent implements OnChanges {

  @Input() groups: Group[] = [];
  @Input() groupID: number = 0;
  @Input() caption: string = "Select a group";
  @Input() resetTrigger: any = 0;
  @Output() selected = new EventEmitter<number>();
  @ViewChild('groupSelector') groupSelector! : ElementRef<HTMLSelectElement>;

  private viewInitialized: boolean = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.groupSelector.nativeElement.value = this.groupID.toString();
}

//--------------------------------------------------------------------------
  //
  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetTrigger']) {
      console.log("reset trigger before:", this.groupSelector.nativeElement.value);
      this.groupSelector.nativeElement.value = "0";
      console.log("reset trigger after:", this.groupSelector.nativeElement.value);
    }
    else if (changes["groupID"]) {
      this.groupID = changes["groupID"].currentValue;
      if (this.viewInitialized) this.groupSelector.nativeElement.value = this.groupID.toString();
    }
  }


  onGroupChange(event: Event) {
    this.groupID = Number((event.target as HTMLSelectElement).value);
    this.selected.emit(this.groupID);
  }
}
