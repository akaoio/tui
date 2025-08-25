/**
 * Built-in validators for Schema system
 */

import { FieldSchema, ValidatorFunction } from './types';

/**
 * Built-in validators
 */
export const validators: Record<string, ValidatorFunction> = {
  required: (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  
  min: (value: any, field: FieldSchema) => {
    if (field.min === undefined) return true;
    const num = Number(value);
    return !isNaN(num) && num >= field.min;
  },
  
  max: (value: any, field: FieldSchema) => {
    if (field.max === undefined) return true;
    const num = Number(value);
    return !isNaN(num) && num <= field.max;
  },
  
  minLength: (value: any, field: FieldSchema) => {
    if (!field.validation) return true;
    const rule = field.validation.find((r: any) => r.type === 'minLength');
    if (!rule || rule.value === undefined) return true;
    const str = String(value || '');
    return str.length >= rule.value;
  },
  
  maxLength: (value: any, field: FieldSchema) => {
    if (!field.validation) return true;
    const rule = field.validation.find((r: any) => r.type === 'maxLength');
    if (!rule || rule.value === undefined) return true;
    const str = String(value || '');
    return str.length <= rule.value;
  },
  
  pattern: (value: any, field: FieldSchema) => {
    if (!field.validation) return true;
    const rule = field.validation.find((r: any) => r.type === 'pattern');
    if (!rule || !rule.value) return true;
    const regex = new RegExp(rule.value);
    return regex.test(String(value || ''));
  },
  
  email: (value: any) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  },
  
  url: (value: any) => {
    if (!value) return true;
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Register custom validator
 */
export function registerValidator(this: any, name: string, validator: ValidatorFunction): void {
  validators[name] = validator;
}

/**
 * Get validator by name
 */
export function getValidator(this: any, name: string): ValidatorFunction | undefined {
  return validators[name];
}