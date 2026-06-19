import { Component, input } from '@angular/core';
import type { ProductCard} from '../product';
import { CurrencyPipe} from '@angular/common';
import {TruncatePipe} from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, TruncatePipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  readonly product = input.required<ProductCard>();
}
