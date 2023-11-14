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

@Component({
  selector: 'app-list-students',
  templateUrl: './list-students.component.html',
  styleUrls: ['./list-students.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, ListDataComponent],
})
export class ListStudentsComponent implements OnInit {
  students = signal<Student[]>([]);
  showForm = signal<boolean>(false);

  constructor(private _sqliteService: SqliteManagerService) {}
  ngOnInit(): void {
    this.getStudents();
  }

  onShowForm(): void {
    this.showForm.set(true);
  }

  getStudents(): void {
    this._sqliteService.getStudents().then((value: Student[]) => {
      this.students.set(value);
    });
  }
}
