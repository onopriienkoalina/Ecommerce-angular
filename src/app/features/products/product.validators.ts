import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const oldPriceGreaterValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const price = control.get('price')?.value;
  const oldPrice = control.get('oldPrice')?.value;

  if (typeof price !== 'number' || typeof oldPrice !== 'number') {
    return null;
  }
  if (oldPrice <= price) {
    return { oldPriceGreater: true };
  }
  return null;
};
