import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClassI } from 'src/app/models/classes';
import { Student } from 'src/app/models/student';
import { AlertService } from 'src/app/services/alert.service';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';
import { FilterComponent } from 'src/app/shared/components/filter/filter.component';
import { ListDataComponent } from 'src/app/shared/components/list-data/list-data.component';

import { ClassFormComponent } from '../class-form/class-form.component';

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClassFormComponent,
    CommonModule,
    FilterComponent,
    IonicModule,
    ListDataComponent,
    TranslateModule,
  ],
})
export class ClassListComponent implements OnInit {
  classes = signal<ClassI[]>(null);
  selectedClass = signal<ClassI>(null);
  showForm = signal<boolean>(false);

  constructor(
    private _alert: AlertService,
    private _translate: TranslateService,
    private _sqliteService: SqliteManagerService
  ) {}
  ngOnInit(): void {
    this.getClasses();
  }

  onShowForm(): void {
    this.showForm.set(true);
  }

  onCloseForm(changes: boolean): void {
    this.showForm.set(false);
    this.selectedClass.set(null);
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

  updateClass(item: ClassI) {
    this.selectedClass.set(item);
    this.onShowForm();
  }

  deleteClass(item: ClassI) {
    this._alert.alertConfirm({
      header: this._translate.instant('label.confirm'),
      message: this._translate.instant('label.confirm.message.class'),
      functionOk: () => {
        this._sqliteService
          .deleteClass(item)
          .then(async () => {
            this._alert.alertMessage(
              this._translate.instant('label.success'),
              this._translate.instant('label.success.message.remove.class')
            );
            this.getClasses();
          })
          .catch((error) => {
            console.error(error);
            this._alert.alertMessage(
              this._translate.instant('label.error'),
              this._translate.instant('label.error.message.remove.class')
            );
          });
      },
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
