/**
 * OutputFilter constructor method
 */

export function constructor(this: any): any {
  this.originalWrite = process.stdout.write.bind(process.stdout)
  this.originalErrorWrite = process.stderr.write.bind(process.stderr)
  this.enabled = false
}