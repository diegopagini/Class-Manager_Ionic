import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Student } from 'src/app/models/student';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IonicModule, CommonModule],
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student;
  @Output() closeForm = new EventEmitter<void>();
  update: boolean;

  constructor(
    private _sqliteService: SqliteManagerService,
    private _translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.student) this.student = new Student();
    else this.update = true;
  }

  close(): void {
    this.closeForm.emit();
  }
}
