import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ListStudentsComponent } from './components/list-students/list-students.component';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ListStudentsComponent, TranslateModule],
})
export class StudentsPage {
  constructor() {}
}
