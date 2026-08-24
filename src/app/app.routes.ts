import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page/product-details-page.component';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'contacts', component: ContactPageComponent },
  { path: 'products/:id', component: ProductDetailsPageComponent },
  {
    path: 'order',
    canActivate: [authGuard],
    loadChildren: () => import('./features/order/order.module').then((m) => m.OrderModule),
  },
  {
    path: 'add-product',
    canActivate: [roleGuard('admin')],
    loadChildren: () =>
      import('./features/add-product/add-product.routes').then((m) => m.addProductRoutes),
  },
  {
    path: 'edit-product',
    canActivate: [roleGuard('admin', 'owner')],
    loadChildren: () =>
      import('./features/edit-product/edit-product.routes').then((m) => m.editProductRoutes),
  },
];
