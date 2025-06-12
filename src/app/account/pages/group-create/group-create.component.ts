import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AccountDBService } from 'src/app/db/account-db.service';
import { HttpErrorService } from 'src/app/services/http-error.service';
import { getGroupByName, Group } from 'src/app/model/account';
import { unstringify } from 'src/app/util/convert';
import { DBStatus } from 'src/app/util/db-status';
import { navigateToGroupEdit } from '../../navigation/navigation-functions';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.css'],
  standalone: false
})
export class GroupCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  private releaseSubscriptions$ = new Subject<void>();
  
  dbStatus: DBStatus = DBStatus.DB_WAITING;
  existingGroups: Group[] = [];
  newGroupForm: FormGroup;

  private dbSubscription! : Subscription;

  dbWaiting() : Boolean { return this.dbStatus === DBStatus.DB_WAITING; }
  dbSuccess() : Boolean { return this.dbStatus === DBStatus.DB_SUCCESS; }
  dbFailure() : Boolean { return this.dbStatus === DBStatus.DB_FAILED; }

  constructor(
    private dbService: AccountDBService,
    private errorService: HttpErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private title: Title
  ) {
    this.newGroupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1)], this.uniqueNameValidator.bind(this)],      
    });
  }

  uniqueNameValidator(control: any) {
    return new Promise(resolve => {
      const nameExists = getGroupByName(this.existingGroups, control.value) != null;
      resolve(nameExists ? { nameTaken: true } : null);
    });
  }

  ngOnInit(): void {
    this.dbStatus = DBStatus.DB_WAITING
    this.dbSubscription = this.dbService.getGroups()    
      .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: result => this.setGroups(unstringify(result)),
        error: err => this.setDBError("loading groups", err)
      });
  }

  ngAfterViewInit(): void {
      this.title.setTitle("Create New Group");
  }

  ngOnDestroy(): void {
    this.releaseSubscriptions$.next();
    this.releaseSubscriptions$.complete();    
  }

  private setGroups(groups: Group[]) {
    this.existingGroups = groups;
    this.dbStatus = DBStatus.DB_SUCCESS;
  }

  private setDBError(context: string, error: any) {
    this.dbStatus = DBStatus.DB_FAILED;
    this.errorService.showError(context, error);
  }

  showNameError(): Boolean {
    return this.nameErrorText() !== "";
  }

  nameErrorText(): string {
    let form = this.newGroupForm.get('name');
    if (form === null || !(form.touched)) return "";

    if (form.errors?.['required']) return "Name is required.";
    if (form.errors?.['nameTaken']) return "This name is already in use.";

    return "";
  }


  onSubmit() {
    console.log("value =", this.newGroupForm.value.name);
    let newGroup: Group = {
      id: 0,
      name: this.newGroupForm.value.name,
      members: [],
    };
    
    this.errorService.clearError();
    this.dbService.createGroup(newGroup)
    .pipe(takeUntil(this.releaseSubscriptions$)).subscribe({
        next: group => navigateToGroupEdit(this.router, group.id),
        error: err => this.errorService.showError("creating new group", err)
    })
  }
}


