import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page/product-details-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent },
  { path: 'contacts', component: ContactPageComponent },
  { path: 'products/:id', component: ProductDetailsPageComponent },
  {
    path: 'order',
    loadChildren: () => import('./features/order/order.module').then((m) => m.OrderModule),
  },
  {
    path: 'add-product',
    loadChildren: () =>
      import('./features/add-product/add-product.routes').then((m) => m.addProductRoutes),
  },
  {
  path: 'edit-product',
    loadChildren: () =>
      import('./features/edit-product/edit-product.routes').then((m) => m.editProductRoutes),
  },    
];
