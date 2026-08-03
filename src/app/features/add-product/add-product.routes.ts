import { Routes } from '@angular/router';

export const addProductRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./add-product-page/add-product-page.component').then(
        (m) => m.AddProductPageComponent,
      ),
  },
];
