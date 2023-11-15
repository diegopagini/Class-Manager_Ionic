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
import { FormGroup } from '@angular/forms';
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
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class ClassFormComponent implements OnInit {
  @Input() classObj: ClassI;
  @Output() closeForm = new EventEmitter<boolean>();
  classForm: FormGroup;
  students = signal<Student[]>(null as any);
  update = signal<boolean>(false);

  constructor(private _sqlservice: SqliteManagerService) {}

  ngOnInit(): void {
    if (!this.classObj) this.classObj = new ClassI();
    else this.update.set(true);

    this.getStudents();
  }

  close(): void {
    this.closeForm.emit();
  }

  async getStudents(): Promise<void> {
    this.students.set(await this._sqlservice.getStudents());
  }
}
