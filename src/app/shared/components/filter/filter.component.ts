import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

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
  showFilters = signal<boolean>(false);

  constructor(private _popoverController: PopoverController) {}

  async createPopover(event: MouseEvent): Promise<void> {
    const popover = await this._popoverController.create({
      backdropDismiss: true,
      component: FilterContentComponent,
      componentProps: {},
      event,
    });

    popover.onDidDismiss().then(() => {
      this.showFilters.set(false);
    });

    await popover.present();
  }

  toggleFilter(event: MouseEvent): void {
    this.showFilters.update((value: boolean) => !value);
    if (this.showFilters()) this.createPopover(event);
  }
}
