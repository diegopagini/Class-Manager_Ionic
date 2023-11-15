import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Student } from 'src/app/models/student';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';
import { ListDataComponent } from 'src/app/shared/components/list-data/list-data.component';

import { StudentFormComponent } from '../student-form/student-form.component';

@Component({
  selector: 'app-list-students',
  templateUrl: './list-students.component.html',
  styleUrls: ['./list-students.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    ListDataComponent,
    StudentFormComponent,
  ],
})
export class ListStudentsComponent implements OnInit {
  students = signal<Student[]>([]);
  showForm = signal<boolean>(false);
  studentSelected: Student;

  constructor(private _sqliteService: SqliteManagerService) {}
  ngOnInit(): void {
    this.getStudents();
  }

  onShowForm(): void {
    this.showForm.set(true);
  }

  getStudents(search?: string): void {
    this._sqliteService.getStudents(search).then((value: Student[]) => {
      this.students.set(value);
    });
  }

  filterList(event: any): void {
    const { value } = event.detail;
    this.getStudents(value);
  }

  onClose(changes: boolean): void {
    this.showForm.set(false);
    this.studentSelected = null as any;
    if (changes) this.getStudents();
  }

  updateStudent(student: Student) {
    this.studentSelected = student;
    this.showForm.set(true);
  }

  deleteStudent(student: Student) {
    this.studentSelected = student;
  }
}
