/**
 * StoreManager constructor method
 */

import { StoreSchema } from './types';

export function constructor(this: any, schema: StoreSchema): any {
  this.schema = schema;
  this.store = this.createStore();
  this.registerGlobalStore();
}