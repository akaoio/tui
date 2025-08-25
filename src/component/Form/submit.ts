/**
 * Form submit method
 */

export function submit(this: any): void {
  const values: { [key: string]: any } = {};
  this.components.forEach((component: any, index: number) => {
    values[`field_${index}`] = component.getValue();
  });
  this.emit('submit', values);
}
