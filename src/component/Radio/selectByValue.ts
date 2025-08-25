export function selectByValue(this: any, value: any): void {
  const index = this.options.findIndex((opt: any) => opt.value === value);
  if (index >= 0) {
    this.select(index);
  }
}