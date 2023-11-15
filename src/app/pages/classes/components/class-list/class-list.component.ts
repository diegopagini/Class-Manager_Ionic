import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ClassI } from 'src/app/models/classes';
import { Student } from 'src/app/models/student';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';
import { ListDataComponent } from 'src/app/shared/components/list-data/list-data.component';

import { ClassFormComponent } from '../class-form/class-form.component';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule,
    ListDataComponent,
    ClassFormComponent,
  ],
})
export class ClassListComponent implements OnInit {
  classes = signal<ClassI[]>(null);
  selectedClass = signal<ClassI>(null);
  showForm = signal<boolean>(false);

  constructor(private _sqliteService: SqliteManagerService) {}
  ngOnInit(): void {
    this.getClasses();
  }

  onShowForm(): void {
    this.showForm.set(true);
  }

  onCloseForm(changes: boolean): void {
    this.showForm.set(false);
    if (changes) this.getClasses();
  }

  getClasses(): void {
    Promise.all([
      this._sqliteService.getClasses(),
      this._sqliteService.getStudents(),
    ]).then(([classes, students]) => {
      this.classes.set(classes);
      this.associateStudentsClasses(students);
    });
  }

  private associateStudentsClasses(students: Student[]): void {
    this.classes.update((classes: ClassI[]) =>
      classes.map((el: ClassI) => {
        const student = students.find(
          (value: Student) => value.id === el.id_student
        );
        if (student) el.student = student;
        return el;
      })
    );
  }
}
