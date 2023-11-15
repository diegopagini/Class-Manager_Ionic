import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Student } from 'src/app/models/student';
import { AlertService } from 'src/app/services/alert.service';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IonicModule, CommonModule, TranslateModule],
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student;
  @Output() closeForm = new EventEmitter<boolean>();
  update: boolean;
  studentForm: FormGroup;

  constructor(
    private _alert: AlertService,
    private _fb: FormBuilder,
    private _sqliteService: SqliteManagerService,
    private _translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.student) this.student = new Student();
    else this.update = true;

    this.studentForm = this._fb.group({
      name: [this.student.name || null, [Validators.required]],
      surname: [this.student.surname || null, [Validators.required]],
      email: [this.student.email || null, [Validators.required]],
      phone: [this.student.phone || null, [Validators.required]],
      id: [this.student.id || null],
    });
  }

  close(changes?: boolean): void {
    this.closeForm.emit(changes);
  }

  createUpdateStudent(): void {
    if (this.update) {
      this._sqliteService.updateStudent(this.studentForm.value).then(() => {
        this._alert.alertMessage(
          this._translateService.instant('label.success'),
          this._translateService.instant('label.success.message.edit.student')
        );

        this.close(true);
      });

      return;
    }

    this._sqliteService.createStudent(this.studentForm.value).then(() => {
      this._alert.alertMessage(
        this._translateService.instant('label.success'),
        this._translateService.instant('label.success.message.add.student')
      );

      this.close(true);
    });
  }
}
