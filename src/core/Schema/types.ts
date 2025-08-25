/**
 * Types and interfaces for Schema system
 */

import { Component } from '../Component';

/**
 * Field types supported by schema
 */
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password',
  EMAIL = 'email',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  FILE = 'file',
  COLOR = 'color',
  RANGE = 'range',
  BUTTON = 'button',
  LABEL = 'label',
  LIST = 'list',
  TABLE = 'table',
  TREE = 'tree',
  CUSTOM = 'custom'
}

/**
 * Validation rule types
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, field: FieldSchema, form: any) => boolean | Promise<boolean>;
}

/**
 * Field schema definition
 */
export interface FieldSchema {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: any;
  value?: any;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  required?: boolean;
  validation?: ValidationRule[];
  options?: Array<{ label: string; value: any; disabled?: boolean }>;
  multiple?: boolean;
  rows?: number; // for textarea
  cols?: number;
  min?: number; // for number/range
  max?: number; // for number/range
  step?: number; // for number/range
  accept?: string; // for file
  style?: Record<string, any>;
  className?: string;
  dependencies?: FieldDependency[];
  onChange?: (value: any, field: FieldSchema, form: any) => void;
  onFocus?: (field: FieldSchema, form: any) => void;
  onBlur?: (field: FieldSchema, form: any) => void;
  onValidate?: (value: any, field: FieldSchema, form: any) => ValidationResult;
  customComponent?: typeof Component;
  customProps?: Record<string, any>;
}

/**
 * Field dependency
 */
export interface FieldDependency {
  field: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'custom';
  value?: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'validate';
  targetValue?: any;
  validator?: (value: any, form: any) => boolean;
}

/**
 * Form section for grouping fields
 */
export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FieldSchema[];
  columns?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  visible?: boolean;
  style?: Record<string, any>;
}

/**
 * Complete form schema
 */
export interface FormSchema {
  id: string;
  version: string;
  title?: string;
  description?: string;
  sections?: FormSection[];
  fields?: FieldSchema[]; // For simple forms without sections
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  submitButton?: {
    label: string;
    style?: Record<string, any>;
    position?: 'left' | 'center' | 'right';
  };
  cancelButton?: {
    label: string;
    style?: Record<string, any>;
  };
  resetButton?: {
    label: string;
    style?: Record<string, any>;
  };
  style?: Record<string, any>;
  onSubmit?: (values: Record<string, any>, schema: FormSchema) => void | Promise<void>;
  onCancel?: (schema: FormSchema) => void;
  onReset?: (schema: FormSchema) => void;
  onChange?: (values: Record<string, any>, changedField: string, schema: FormSchema) => void;
  onValidate?: (values: Record<string, any>, schema: FormSchema) => ValidationResult;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * Validator function type
 */
export type ValidatorFunction = (value: any, field: FieldSchema, form: any) => boolean | Promise<boolean>;

/**
 * Transformer function type
 */
export type TransformerFunction = (value: any, field: FieldSchema, form: any) => any;