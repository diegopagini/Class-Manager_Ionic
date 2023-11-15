import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ClassListComponent } from './components/class-list/class-list.component';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.page.html',
  styleUrls: ['./classes.page.scss'],
  standalone: true,
  imports: [ClassListComponent, TranslateModule, IonicModule],
})
export class ClassesPage {}
