import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { capSQLiteChanges } from '@capacitor-community/sqlite';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ClassI } from 'src/app/models/classes';
import { Payment } from 'src/app/models/payment';
import { Student } from 'src/app/models/student';
import { AlertService } from 'src/app/services/alert.service';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';

@Component({
  selector: 'app-class-form',
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule, TranslateModule, ReactiveFormsModule],
})
export class ClassFormComponent implements OnInit {
  @Input() classObj: ClassI;
  @Output() closeForm = new EventEmitter<boolean>();
  alreadyPaid = signal<boolean>(false);
  classForm: FormGroup;
  students = signal<Student[]>(null);
  update = signal<boolean>(false);

  constructor(
    private _alert: AlertService,
    private _fb: FormBuilder,
    private _sqlservice: SqliteManagerService,
    private _translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.classObj) this.classObj = new ClassI();
    else this.update.set(true);
    this.initForm();

    this._sqlservice
      .getPaymentByClass(this.classObj.id)
      .then((value: Payment) => {
        if (value) {
          const paid = value.paid === 1 ? true : false;
          this.classForm.get('payment').setValue(value);
          this.alreadyPaid.set(paid);
          this.classForm.get('paid').setValue(paid);
        } else {
          this.classForm.get('paid').setValue(false);
          this.classForm.get('payment').setValue(null);
        }
      });

    this.getStudents();
  }

  close(changes?: boolean): void {
    this.closeForm.emit(changes);
  }

  createUpdateClass(): void {
    this.formartDate();

    if (this.update()) {
      this._sqlservice
        .updateClass(this.classForm.value)
        .then(() => {
          this._alert.alertMessage(
            this._translate.instant('label.success'),
            this._translate.instant('label.success.message.edit.class')
          );

          this.close(true);
        })
        .catch((error) => {
          console.error(error);
          this._alert.alertMessage(
            this._translate.instant('label.error'),
            this._translate.instant('label.error.message.edit.class')
          );
        });

      return;
    }

    this._sqlservice
      .createClass(this.classForm.value)
      .then((changes: capSQLiteChanges) => {
        this.setPayment(changes);

        this._alert.alertMessage(
          this._translate.instant('label.success'),
          this._translate.instant('label.success.message.add.class')
        );

        this.close(true);
      })
      .catch((error) => {
        console.error(error);
        this._alert.alertMessage(
          this._translate.instant('label.error'),
          this._translate.instant('label.error.message.add.class')
        );
      });
  }

  private setPayment({ changes }: capSQLiteChanges): void {
    const { lastId } = changes;
    const paid = this.classForm.get('paid');
    const payment = this.classForm.get('payment');

    if (paid.value) {
      const value = {
        id_class: lastId,
        date: moment(payment.value).format('YYYY-MM-DDTHH:mm'),
        paid: 1,
      };
      payment.setValue(value);
    } else {
      payment.setValue({ paid: 0 });
    }

    this._sqlservice.createPayment(payment.value);
  }

  async getStudents(): Promise<void> {
    this.students.set(await this._sqlservice.getStudents());
  }

  private initForm(): void {
    this.classForm = this._fb.group({
      date_end: [
        this.classObj?.date_end ||
          moment(new Date()).format('YYYY-MM-DDTHH:mm'),
        [Validators.required],
      ],
      date_start: [
        this.classObj?.date_start ||
          moment(new Date()).format('YYYY-MM-DDTHH:mm'),
        [Validators.required],
      ],
      id_student: [this.classObj?.id_student || null, [Validators.required]],
      id: [this.classObj?.id || null],
      payment: [null],
      paid: [false],
      price: [
        this.classObj?.price || 0,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });
  }

  private formartDate(): void {
    const start = this.classForm.get('date_start');
    const end = this.classForm.get('date_end');

    start.setValue(moment(start.value).format('YYYY-MM-DDTHH:mm'));
    end.setValue(moment(end.value).format('YYYY-MM-DDTHH:mm'));
  }
}
