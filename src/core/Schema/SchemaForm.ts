/**
 * Schema Form - Main form builder from schema
 */

import { EventEmitter } from 'events';
import { Component } from '../Component';
import { ComponentFactory } from '../ComponentFactory';
import {
  FormSchema,
  FieldSchema,
  ValidationResult,
  ValidatorFunction
} from './types';
import { SchemaRegistry } from './SchemaRegistry';
import { getValidator } from './validators';
import { processDependencies } from './dependencies';

/**
 * Schema-driven Form Builder
 */
export class SchemaForm extends EventEmitter {
  private schema: FormSchema;
  private registry: SchemaRegistry;
  private components: Map<string, Component> = new Map();
  private values: Record<string, any> = {};
  private errors: Record<string, string[]> = {};
  private warnings: Record<string, string[]> = {};
  private dirty: Set<string> = new Set();
  private touched: Set<string> = new Set();
  
  constructor(schema: FormSchema, registry?: SchemaRegistry) {
    super();
    
    this.schema = schema;
    this.registry = registry || SchemaRegistry.getInstance();
    
    // Register schema if not already registered
    if (!this.registry.get(schema.id)) {
      this.registry.register(schema);
    }
    
    this.initializeValues();
  }
  
  /**
   * Initialize form values from schema
   */
  private initializeValues(): void {
    const fields = this.getAllFields();
    fields.forEach((field: any) => {
      if (field.defaultValue !== undefined) {
        this.values[field.name] = field.defaultValue;
      } else if (field.value !== undefined) {
        this.values[field.name] = field.value;
      }
    });
  }
  
  /**
   * Get all fields from schema
   */
  private getAllFields(): FieldSchema[] {
    if (this.schema.sections) {
      return this.schema.sections.flatMap(section => section.fields);
    }
    return this.schema.fields || [];
  }
  
  /**
   * Build components from schema
   */
  buildComponents(): Map<string, Component> {
    const fields = this.getAllFields();
    
    fields.forEach((field: any) => {
      const component = this.createComponent(field);
      if (component) {
        this.components.set(field.id, component);
        this.setupFieldBindings(field, component);
      }
    });
    
    return this.components;
  }
  
  /**
   * Create component from field schema
   */
  private createComponent(field: FieldSchema): Component | null {
    // Use ComponentFactory to create components
    const factory = ComponentFactory.getInstance();
    
    const options = {
      label: field.label,
      placeholder: field.placeholder,
      style: field.style,
      checked: field.defaultValue,
      value: field.defaultValue,
      options: field.options,
      disabled: field.disabled,
      name: field.name
    };
    
    const component = factory.createComponent(field.type, options);
    
    if (!component) {
      return null;
    }
    
    // Set initial value and disabled state via props
    component.props.value = this.values[field.name];
    component.props.disabled = field.disabled;
    
    return component;
  }
  
  /**
   * Setup data bindings for field
   */
  private setupFieldBindings(field: FieldSchema, component: Component): void {
    // Two-way data binding
    component.on('change', (value) => {
      this.values[field.name] = value;
      this.dirty.add(field.name);
      this.validateField(field);
      processDependencies(field, this.getAllFields(), this.components, this.values);
      
      // Call field onChange
      field.onChange?.(value, field, this.values);
      
      // Call form onChange
      this.schema.onChange?.(this.values, field.name, this.schema);
      
      // Emit change event
      this.emit('change', {
        field: field.name,
        value,
        values: this.values
      });
    });
    
    // Focus/blur events
    component.on('focus', () => {
      field.onFocus?.(field, this.values);
      this.emit('focus', { field: field.name });
    });
    
    component.on('blur', () => {
      this.touched.add(field.name);
      field.onBlur?.(field, this.values);
      this.validateField(field);
      this.emit('blur', { field: field.name });
    });
  }
  
  /**
   * Validate a single field
   */
  private validateField(field: FieldSchema): boolean {
    const value = this.values[field.name];
    const errors: string[] = [];
    
    // Check required
    if (field.required) {
      const validator = getValidator('required');
      if (validator && !validator(value, field, this.values)) {
        errors.push(field.label + ' is required');
      }
    }
    
    // Check other validations
    field.validation?.forEach((rule: any) => {
      let validator = rule.validator;
      
      if (!validator && rule.type !== 'custom') {
        validator = getValidator(rule.type);
      }
      
      if (validator && !validator(value, field, this.values)) {
        errors.push(rule.message);
      }
    });
    
    // Custom validation
    if (field.onValidate) {
      const result = field.onValidate(value, field, this.values);
      if (!result.valid && result.errors?.[field.name]) {
        errors.push(...result.errors[field.name]);
      }
    }
    
    // Update errors
    if (errors.length > 0) {
      this.errors[field.name] = errors;
    } else {
      delete this.errors[field.name];
    }
    
    return errors.length === 0;
  }
  
  /**
   * Validate entire form
   */
  validate(): ValidationResult {
    const fields = this.getAllFields();
    let valid = true;
    
    // Clear existing errors
    this.errors = {};
    this.warnings = {};
    
    // Validate each field
    fields.forEach((field: any) => {
      if (!this.validateField(field)) {
        valid = false;
      }
    });
    
    // Custom form validation
    if (this.schema.onValidate) {
      const result = this.schema.onValidate(this.values, this.schema);
      if (!result.valid) {
        valid = false;
        if (result.errors) {
          Object.assign(this.errors, result.errors);
        }
      }
      if (result.warnings) {
        Object.assign(this.warnings, result.warnings);
      }
    }
    
    return {
      valid,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  
  /**
   * Submit form
   */
  async submit(): Promise<void> {
    const validation = this.validate();
    
    if (!validation.valid) {
      this.emit('validationError', validation);
      return;
    }
    
    if (this.schema.onSubmit) {
      await this.schema.onSubmit(this.values, this.schema);
    }
    
    this.emit('submit', this.values);
  }
  
  /**
   * Cancel form
   */
  cancel(): void {
    if (this.schema.onCancel) {
      this.schema.onCancel(this.schema);
    }
    this.emit('cancel');
  }
  
  /**
   * Reset form
   */
  reset(): void {
    this.initializeValues();
    this.errors = {};
    this.warnings = {};
    this.dirty.clear();
    this.touched.clear();
    
    // Reset component values
    const fields = this.getAllFields();
    fields.forEach((field: any) => {
      const component = this.components.get(field.id);
      if (component) {
        component.props.value = this.values[field.name];
        // Rendering handled by form update cycle
      }
    });
    
    if (this.schema.onReset) {
      this.schema.onReset(this.schema);
    }
    
    this.emit('reset');
  }
  
  /**
   * Get form values
   */
  getValues(): Record<string, any> {
    return { ...this.values };
  }
  
  /**
   * Set form values
   */
  setValues(values: Record<string, any>): void {
    Object.assign(this.values, values);
    
    // Update components
    Object.keys(values).forEach((name: any) => {
      const field = this.getAllFields().find((f: any) => f.name === name);
      if (field) {
        const component = this.components.get(field.id);
        if (component) {
          component.props.value = values[name];
          // Rendering handled by form update cycle
        }
      }
    });
  }
  
  /**
   * Get field value
   */
  getValue(name: string): any {
    return this.values[name];
  }
  
  /**
   * Set field value
   */
  setValue(name: string, value: any): void {
    this.values[name] = value;
    this.dirty.add(name);
    
    const field = this.getAllFields().find((f: any) => f.name === name);
    if (field) {
      const component = this.components.get(field.id);
      if (component) {
        component.props.value = value;
        // Rendering handled by form update cycle
      }
      this.validateField(field);
    }
  }
  
  /**
   * Get form errors
   */
  getErrors(): Record<string, string[]> {
    return { ...this.errors };
  }
  
  /**
   * Get field errors
   */
  getFieldErrors(name: string): string[] {
    return this.errors[name] || [];
  }
  
  /**
   * Check if form is dirty
   */
  isDirty(): boolean {
    return this.dirty.size > 0;
  }
  
  /**
   * Check if field is dirty
   */
  isFieldDirty(name: string): boolean {
    return this.dirty.has(name);
  }
  
  /**
   * Check if field is touched
   */
  isFieldTouched(name: string): boolean {
    return this.touched.has(name);
  }
}