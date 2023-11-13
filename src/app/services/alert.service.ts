import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

interface AlertConfirm {
  header: string;
  message: string;
  functionOk: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  async alertMessage(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['ok'],
    });

    await alert.present();
  }

  async alertConfirm({
    header,
    message,
    functionOk,
  }: AlertConfirm): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: this.translate.instant('label.cancel'),
          role: 'cancel',
          handler: () => {},
        },
        {
          text: this.translate.instant('label.ok'),
          role: 'confirm',
          handler: () => {
            functionOk();
          },
        },
      ],
    });

    await alert.present();
  }
}
