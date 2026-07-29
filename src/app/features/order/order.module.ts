import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { OrderSuccessPageComponent } from './pages/order-success-page/order-success-page.component';

@NgModule({
  declarations: [OrderPageComponent, OrderSuccessPageComponent],
  imports: [CommonModule, OrderRoutingModule, ReactiveFormsModule],
})
export class OrderModule {}
