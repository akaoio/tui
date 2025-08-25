export function setText(this: any, text: string): void {
  this.text = text;
  this.render();
}