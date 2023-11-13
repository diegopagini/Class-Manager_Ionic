import { NgIf } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Device } from '@capacitor/device';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Subject, takeUntil } from 'rxjs';

import { SqliteManagerService } from './services/sqlite-manager.service';

jeepSqlite(window);

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit, OnDestroy {
  isWeb = false;
  load = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private platform: Platform,
    private sqliteService: SqliteManagerService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.setLang();
    this.setIsWeb();
    this.initDb();
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

  private initDb(): void {
    this.sqliteService.init();
    this.sqliteService.dbReady$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isReady: boolean) => {
        this.load = isReady;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
