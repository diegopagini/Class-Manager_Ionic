import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-list-data',
  templateUrl: './list-data.component.html',
  styleUrls: ['./list-data.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule, CommonModule, TranslateModule],
})
export class ListDataComponent {
  @ContentChild('templateData', { static: false })
  templateData: TemplateRef<any>;
  @Input() addText: string;
  @Input() emptyText: string;
  @Input() showAdd: boolean = true;
  @Input({ required: true }) data: any[];
  @Output() add = new EventEmitter<boolean>();

  addData(): void {
    this.add.emit(true);
  }
}
