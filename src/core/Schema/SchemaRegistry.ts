/**
 * Schema Registry for managing multiple schemas
 */

import { FormSchema, ValidatorFunction, TransformerFunction } from './types';
import { validators, registerValidator as registerValidatorInternal } from './validators';

/**
 * Schema Registry - Singleton
 */
export class SchemaRegistry {
  private static instance: SchemaRegistry;
  private schemas: Map<string, FormSchema> = new Map();
  private transformers: Map<string, TransformerFunction> = new Map();
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }
  
  /**
   * Register a schema
   */
  register(schema: FormSchema): void {
    this.schemas.set(schema.id, schema);
  }
  
  /**
   * Get schema by ID
   */
  get(id: string): FormSchema | undefined {
    return this.schemas.get(id);
  }
  
  /**
   * Get all schemas
   */
  getAll(): FormSchema[] {
    return Array.from(this.schemas.values());
  }
  
  /**
   * Remove schema
   */
  remove(id: string): boolean {
    return this.schemas.delete(id);
  }
  
  /**
   * Clear all schemas
   */
  clear(): void {
    this.schemas.clear();
  }
  
  /**
   * Register custom validator
   */
  registerValidator(name: string, validator: ValidatorFunction): void {
    registerValidatorInternal(name, validator);
  }
  
  /**
   * Get validator
   */
  getValidator(name: string): ValidatorFunction | undefined {
    return validators[name];
  }
  
  /**
   * Register transformer
   */
  registerTransformer(name: string, transformer: TransformerFunction): void {
    this.transformers.set(name, transformer);
  }
  
  /**
   * Get transformer
   */
  getTransformer(name: string): TransformerFunction | undefined {
    return this.transformers.get(name);
  }
  
  /**
   * Validate schema structure
   */
  validateSchema(schema: FormSchema): boolean {
    // Basic validation
    if (!schema.id || !schema.version) {
      return false;
    }
    
    // Must have either sections or fields
    if (!schema.sections && !schema.fields) {
      return false;
    }
    
    // Validate field structure
    const fields = schema.sections 
      ? schema.sections.flatMap(s => s.fields)
      : schema.fields || [];
    
    return fields.every((field: any) => {
      return field.id && field.type && field.label && field.name;
    });
  }
  
  /**
   * Merge schemas
   */
  mergeSchemas(base: FormSchema, override: Partial<FormSchema>): FormSchema {
    return {
      ...base,
      ...override,
      fields: override.fields || base.fields,
      sections: override.sections || base.sections
    };
  }
}