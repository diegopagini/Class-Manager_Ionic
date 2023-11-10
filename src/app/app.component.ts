import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

jeepSqlite(window);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  isWeb: boolean;

  constructor(
    private platform: Platform,
    private translateService: TranslateService
  ) {}
  ngOnInit(): void {
    this.setLang();
    this.setIsWeb();
  }

  private setLang(): void {
    this.translateService.setDefaultLang('es');

    this.platform.ready().then(async () => {
      const language = await Device.getLanguageCode();
      if (language.value) this.translateService.use(language.value.slice(0, 2));
    });
  }

  private async setIsWeb(): Promise<void> {
    const info = await Device.getInfo();
    this.isWeb = info.platform === 'web';
  }
}
