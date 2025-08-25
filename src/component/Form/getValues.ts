/**
 * Form getValues method
 */

export function getValues(this: any): { [key: string]: any } {
  const values: { [key: string]: any } = {};
  this.components.forEach((component: any, index: number) => {
    values[`field_${index}`] = component.getValue();
  });
  return values;
}
