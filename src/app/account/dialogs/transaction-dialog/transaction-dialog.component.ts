import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Account } from 'src/app/model/account';
import { JustDate } from 'src/app/util/JustDate';
import { Transaction } from 'src/app/model/statement';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from } from 'rxjs';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.css'],
  standalone: false
})
export class TransactionDialogComponent {

  @Output('onCreate') createEmitter = new EventEmitter<Transaction>();
  @Output('onUpdate') updateEmitter = new EventEmitter<Transaction>();
  applyEmitter!: EventEmitter<Transaction>;

  title: String = "default title";
  accounts: Account[] = [];
  transaction: Transaction | null = null;
  displayStyle = 'none';
  dialogFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.dialogFormGroup = this.formBuilder.group({
      date_posted: ['', Validators.required],
      from_id: ['', [Validators.required, Validators.min(1)]],
      to_id: ['', [Validators.required, Validators.min(1)]],
      amount: [this.formatAmount(this.transaction?.amount || 0), Validators.required],
      status: ['', Validators.required],
      note: [''],
    } , { validators: this.fromToAccountValidator } );
  }

  private formatAmount(value: number): string {
    return parseFloat(value.toString()).toFixed(2); // Ensures two decimal places
  }

  formIsValid() { return !this.dialogFormGroup.invalid; }

  private fromToAccountValidator(group: FormGroup) {
    const fromId = group.get('from_id')?.value;
    const toId = group.get('to_id')?.value;
    return fromId && toId && fromId === toId ? { sameAccount: true } : null;
  }

  accountErrorText(): string {
    if (this.dialogFormGroup.hasError('sameAccount'))
      return "To and From must be different accounts";

    return "";
  }

  amountErrorText(): string {
    let amountControl = this.dialogFormGroup.get('amount');
    if (amountControl === null || !(amountControl.touched)) return "";

    if (amountControl.errors?.['required']) return "Amount is required.";
    if (amountControl.errors?.['min']) return "Amount must be positive.";

    return "";
  }

  createTransaction(accounts: Account[]) {
    this.applyEmitter = this.createEmitter
    this.accounts = accounts;
    this.transaction = {
      id: 0,
      date_posted: new JustDate().toSQLString(),
      from_id: 0,
      to_id: 0,
      amount: 0,
      status: 'pending',
      sort_order: 0,
      note: null
    };
    this.dialogFormGroup.patchValue(this.transaction);
    this.showDialog("Create New Transaction");
  }

  editTransaction(accounts: Account[], transaction: Transaction) {
    this.applyEmitter = this.updateEmitter;
    this.accounts = accounts;
    this.transaction = transaction;
    this.dialogFormGroup.patchValue(this.transaction);

    this.dialogFormGroup.patchValue({
      amount: transaction.amount.toFixed(2)
    }, { emitEvent: false }); // Avoid triggering value changes

    this.showDialog("Edit Transaction");
  }

  onOuterClick(event: any) {

  }

  onAccountSelected(field: 'from_id' | 'to_id', id: number) {
    this.dialogFormGroup.patchValue({ [field]: id });
  }

  buttonApply() {
    this.hideDialog();
    this.applyEmitter.emit({
      ...this.transaction,
      ...this.dialogFormGroup.value
    });
    this.transaction = null;
  }

  buttonCancel() {
    this.hideDialog();
    this.transaction = null;
  }

  private showDialog(title: string) {
    this.title = title;
    this.cdr.detectChanges(); // Prevent ExpressionChangedAfterItHasBeenCheckedError
    this.dialogFormGroup.markAsUntouched();
    this.displayStyle = 'block'; 
    }

  private hideDialog() { this.displayStyle = 'none'; }

}
