/**
 * Input setValidator method
 */

export function setValidator(
  this: any,
  validator: (value: string) => string | null
): void {
  this.validator = validator;
}