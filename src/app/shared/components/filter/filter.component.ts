import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Filter } from 'src/app/models/filter';

import { FilterContentComponent } from './filter-content/filter-content.component';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FilterContentComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
  @Input({ required: true }) filter: Filter;
  @Output() filterData = new EventEmitter<Filter>();
  showFilters = signal<boolean>(false);

  constructor(private _popoverController: PopoverController) {}

  async createPopover(event: MouseEvent): Promise<void> {
    const popover = await this._popoverController.create({
      backdropDismiss: true,
      component: FilterContentComponent,
      cssClass: 'custom-popover-content',
      componentProps: {
        filter: this.filter,
      },
      event,
    });

    popover.onDidDismiss().then(({ data }) => {
      if (data) this.filterData.emit(data);
      this.showFilters.set(false);
    });

    await popover.present();
  }

  toggleFilter(event: MouseEvent): void {
    this.showFilters.update((value: boolean) => !value);
    if (this.showFilters()) this.createPopover(event);
  }
}
