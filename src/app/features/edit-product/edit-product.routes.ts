import { Routes } from '@angular/router';

export const editProductRoutes: Routes = [
  {
    path: ':id',
    loadComponent: () =>
      import('./edit-product-page/edit-product-page.component').then(
        (m) => m.EditProductPageComponent,
      ),
  },
];
