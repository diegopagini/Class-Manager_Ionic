import { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'classes',
        loadComponent: () =>
          import('../pages/classes/classes.page').then((m) => m.ClassesPage),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('../pages/payments/payments.page').then((m) => m.PaymentsPage),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('../pages/students/students.page').then((m) => m.StudentsPage),
      },
      {
        path: '',
        redirectTo: '/students',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/classes',
    pathMatch: 'full',
  },
];
