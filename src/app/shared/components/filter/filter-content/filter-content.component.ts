import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Filter } from 'src/app/models/filter';
import { Student } from 'src/app/models/student';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';

@Component({
  selector: 'app-filter-content',
  templateUrl: './filter-content.component.html',
  styleUrls: ['./filter-content.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterContentComponent implements OnInit {
  @Input({ required: true }) filter: Filter;
  filterForm: FormGroup;
  students = signal<Student[]>(null);

  constructor(
    private _fb: FormBuilder,
    private _sqliteService: SqliteManagerService
  ) {}
  ngOnInit(): void {
    this.filterForm = this._fb.group({
      date_start: [this.filter?.date_start || null],
      date_end: [this.filter?.date_end || null],
      id_student: [this.filter?.id_student || null],
    });

    this._sqliteService.getStudents().then((value: Student[]) => {
      this.students.set(value);
    });
  }

  onSubmit(): void {}

  reset(): void {}
}
