import { FormBuilder, Validators } from '@angular/forms';
import { oldPriceGreaterValidator } from '../products/product.validators';
export const createProductForm = (formBuilder: FormBuilder) => {
  return formBuilder.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      oldPrice: [0, [Validators.required, Validators.min(0.01)]],
    },
    {
      validators: [oldPriceGreaterValidator],
    },
  );
};
