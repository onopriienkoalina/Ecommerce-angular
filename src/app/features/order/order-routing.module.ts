import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { OrderSuccessPageComponent } from './pages/order-success-page/order-success-page.component';
import { orderSubmittedGuard } from './guards/order-submitted.guard';

const routes: Routes = [
  {
    path: '',
    component: OrderPageComponent,
  },
  {
    path: 'thank-you',
    component: OrderSuccessPageComponent,
    canActivate: [orderSubmittedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
