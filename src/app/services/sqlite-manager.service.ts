import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  capSQLiteChanges,
  JsonSQLite,
} from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

import { ClassI } from '../models/classes';
import { Filter } from '../models/filter';
import { Payment } from '../models/payment';
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

  async getStudents(search?: string): Promise<Student[]> {
    let sql = 'SELECT * FROM students WHERE active = 1';
    const dbName = await this.getDbName();

    if (search)
      sql += ` and (upper(name) LIKE '%${search.toUpperCase()}%' or upper(surname) LIKE '%${search.toUpperCase()}%')`;

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

  async createStudent(student: Student): Promise<capSQLiteChanges> {
    const sql =
      'INSERT INTO students(name, surname, email, phone) VALUES(?,?,?,?)';
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [
              student.name,
              student.surname,
              student.email,
              student.phone,
            ],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async updateStudent(student: Student): Promise<capSQLiteChanges> {
    const sql = `UPDATE students SET name=?, surname=?, email=?, phone=? WHERE id=?`;
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [
              student.name,
              student.surname,
              student.email,
              student.phone,
              student.id,
            ],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async deleteStudent(student: Student): Promise<capSQLiteChanges> {
    const sql = `UPDATE students SET active=0 WHERE id=?`;
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [student.id],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async getClasses(filter?: Filter): Promise<ClassI[]> {
    let sql = 'SELECT * FROM class WHERE active=1';
    if (filter?.date_start) sql += ` and date_start >= '${filter.date_start}'`;
    if (filter?.date_end) sql += ` and date_end <= '${filter.date_end}'`;
    if (filter?.id_student) sql += ` and id_student = '${filter.id_student}'`;
    sql += ' ORDER BY date_start,date_end';

    const dbName = await this.getDbName();

    try {
      const response = await CapacitorSQLite.query({
        database: dbName,
        statement: sql,
        values: [],
      });

      const classes: ClassI[] = [];

      for (const item of response!.values!) {
        classes.push(item);
      }

      return Promise.resolve(classes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async createClass(classObj: ClassI): Promise<capSQLiteChanges> {
    const sql =
      'INSERT INTO class(date_start, date_end, id_student, price) VALUES(?,?,?,?)';
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [
              classObj.date_start,
              classObj.date_end,
              classObj.id_student,
              classObj.price,
            ],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async updateClass(classObj: ClassI): Promise<capSQLiteChanges> {
    const sql =
      'UPDATE class SET date_start=?, date_end=?, id_student=?, price=? WHERE id=?';
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [
              classObj.date_start,
              classObj.date_end,
              classObj.id_student,
              classObj.price,
              classObj.id,
            ],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async deleteClass({ id }: ClassI): Promise<capSQLiteChanges> {
    const sql = 'UPDATE class SET active=0 WHERE id=?';
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [id],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async getPayments(filters?: Filter): Promise<Payment[]> {
    let sql =
      'SELECT p.* FROM payment p, class c WHERE p.id_class = c.id and c.active=1';
    if (filters?.paid === true) sql += ` and p.paid = 1`;
    if (filters?.paid === false) sql += ` and p.paid = 0`;
    if (filters?.date_start && filters?.paid === true)
      sql += ` and p.date >= '${filters.date_start}'`;
    if (filters?.date_start && filters?.paid === false)
      sql += ` and c.date_start >= '${filters.date_start}'`;
    if (filters?.date_end && filters.paid === true)
      sql += ` and p.date <= '${filters.date_start}'`;
    if (filters?.date_end && filters.paid === false)
      sql += ` and c.date_end <= '${filters.date_start}'`;
    if (filters?.id_student)
      sql += ` and c.id_student = '${filters.id_student}'`;
    sql += ` ORDER BY p.date`;

    const dbName = await this.getDbName();

    try {
      const response = await CapacitorSQLite.query({
        database: dbName,
        statement: sql,
        values: [],
      });

      const payments: Payment[] = [];

      for (const item of response!.values!) {
        payments.push(item as Payment);
      }

      return Promise.resolve(payments);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async createPayment(payment: Payment): Promise<capSQLiteChanges> {
    const sql = 'INSERT INTO payment(date, id_class, paid) VALUES(?,?,?)';
    const dbName = await this.getDbName();

    try {
      const changes = await CapacitorSQLite.executeSet({
        database: dbName,
        set: [
          {
            statement: sql,
            values: [payment.date, payment.id_class, payment.paid],
          },
        ],
      });
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(changes);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async getPaymentByClass(classId: number): Promise<Payment> {
    const sql = 'SELECT * FROM payment WHERE id_class=?';
    const dbName = await this.getDbName();

    try {
      const response = await CapacitorSQLite.query({
        database: dbName,
        statement: sql,
        values: [classId],
      });

      const payments: Payment[] = [];

      for (const item of response!.values!) {
        payments.push(item as Payment);
      }

      return Promise.resolve(payments[0]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  async updatePayment(payment: Payment): Promise<Payment> {
    const sql = 'UPDATE payment SET date=?, id_class=?, paid=? WHERE id = ?';
    const dbName = await this.getDbName();

    try {
      const response = await CapacitorSQLite.query({
        database: dbName,
        statement: sql,
        values: [payment.date, payment.id_class, payment.paid, payment.id],
      });

      const payments: Payment[] = [];

      for (const item of response!.values!) {
        payments.push(item as Payment);
      }
      // Only for web.
      if (this.isWeb) CapacitorSQLite.saveToStore({ database: dbName });

      return Promise.resolve(payments[0]);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
