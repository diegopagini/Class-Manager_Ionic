import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ClassI } from 'src/app/models/classes';
import { Filter } from 'src/app/models/filter';
import { Payment } from 'src/app/models/payment';
import { Student } from 'src/app/models/student';
import { SqliteManagerService } from 'src/app/services/sqlite-manager.service';
import { FilterComponent } from 'src/app/shared/components/filter/filter.component';
import { ListDataComponent } from 'src/app/shared/components/list-data/list-data.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FilterComponent,
    IonicModule,
    ListDataComponent,
    TranslateModule,
  ],
})
export class PaymentListComponent implements OnInit {
  filter = signal<Filter>({ paid: null });
  payments = signal<Payment[]>(null);
  total = signal<number>(null);

  constructor(private _sqliteService: SqliteManagerService) {}

  ngOnInit(): void {
    this.getPayments();
  }

  filterData(filter: Filter): void {
    this.filter.set(filter);
    this.getPayments();
  }

  private getPayments(): void {
    Promise.all([
      this._sqliteService.getPayments(this.filter()),
      this._sqliteService.getClasses(),
      this._sqliteService.getStudents(),
    ]).then(([payments, classes, students]) => {
      this.payments.set(payments);
      this.associateObjects(classes, students);
      this.calculateTotal();
      this.filter.set({
        paid: null,
      });
    });
  }

  private associateObjects(classes: ClassI[], students: Student[]): void {
    this.payments.update((payments: Payment[]) =>
      payments.map((payment: Payment) => {
        payment.class = classes.find((c: ClassI) => c.id === payment.id_class);

        if (payment.class)
          payment.class.student = students.find(
            (s: Student) => s.id === payment.class.id_student
          );

        return payment;
      })
    );
  }

  private calculateTotal(): void {
    this.total.set(
      this.payments().reduce(
        (acum: number, payment: Payment) => acum + payment.class.price,
        0
      )
    );
  }
}
