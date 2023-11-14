import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

import { Student } from '../models/student';

@Injectable({
  providedIn: 'root',
})
export class SqliteManagerService {
  dbReady$ = new BehaviorSubject<boolean>(false);
  private DB_NAME_KEY = 'db_name';
  private DB_SETUP_KEY = 'first_db_setup';
  private dbName: string;
  private isWeb: boolean = false;

  constructor(
    private alertController: AlertController,
    private http: HttpClient
  ) {}

  async init(): Promise<void> {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform === 'android') {
      try {
        await sqlite.requestPermissions();
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Sin acceso a la base de datos',
          message: 'Esta app no puede funcionar sin accesso a la base de datos',
          buttons: ['OK'],
        });

        await alert.present();
      }
    } else if (info.platform === 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();
    }

    this.setupDatabase();
  }

  async setupDatabase(): Promise<void> {
    const dbSetupDone = await Preferences.get({
      key: this.DB_SETUP_KEY,
    });

    if (!dbSetupDone.value) this.downloadDatabase();
    else {
      const dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({
        database: dbName,
      });
      await CapacitorSQLite.open({
        database: dbName,
      });
      this.dbReady$.next(true);
    }
  }

  downloadDatabase(): void {
    this.http.get('assets/db/db.json').subscribe(async (jsonExport) => {
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

      if (isValid.result) {
        this.dbName = (jsonExport as JsonSQLite).database;
        await CapacitorSQLite.importFromJson({ jsonstring });
        await CapacitorSQLite.createConnection({
          database: this.dbName,
        });
        await CapacitorSQLite.open({
          database: this.dbName,
        });
        await Preferences.set({ key: this.DB_SETUP_KEY, value: '1' });
        await Preferences.set({ key: this.DB_NAME_KEY, value: this.dbName });
        this.dbReady$.next(true);
      }
    });
  }

  async getDbName(): Promise<string> {
    if (!this.dbName) {
      const dbName = await Preferences.get({ key: this.DB_NAME_KEY });
      this.dbName = dbName.value as string;
    }

    return this.dbName;
  }

  async getStudents(): Promise<Student[]> {
    const sql = 'SELECT * FROM students WHERE active = 1';
    const dbName = await this.getDbName();

    try {
      const response = await CapacitorSQLite.query({
        database: dbName,
        statement: sql,
        values: [],
      });

      const students: Student[] = [];

      for (let index = 0; index < response.values!.length; index++) {
        const student = response.values![index] as Student;
        students.push(student);
      }

      return Promise.resolve(students);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
