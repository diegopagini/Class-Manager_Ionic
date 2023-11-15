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
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ClassI } from 'src/app/models/classes';
import { Student } from 'src/app/models/student';
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
  classForm: FormGroup;
  students = signal<Student[]>(null as any);
  update = signal<boolean>(false);

  constructor(
    private _fb: FormBuilder,
    private _sqlservice: SqliteManagerService
  ) {}

  ngOnInit(): void {
    if (!this.classObj) this.classObj = new ClassI();
    else this.update.set(true);
    this.initForm();

    this.getStudents();
  }

  close(): void {
    this.closeForm.emit();
  }

  createUpdateClass() {}

  async getStudents(): Promise<void> {
    this.students.set(await this._sqlservice.getStudents());
  }

  private initForm(): void {
    this.classForm = this._fb.group({
      date_start: [this.classObj?.date_start || null, [Validators.required]],
      date_end: [this.classObj?.date_end || null, [Validators.required]],
      student: [this.classObj?.student || null, [Validators.required]],
      price: [this.classObj?.price || 0, [Validators.required]],
    });
  }
}
