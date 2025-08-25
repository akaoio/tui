/**
 * Field dependency processing for Schema system
 */

import { FieldSchema, FieldDependency } from './types';
import { Component } from '../Component';

/**
 * Evaluate dependency condition
 */
export function evaluateDependency(this: any, dep: FieldDependency,
  field: FieldSchema,
  values: Record<string, any>): boolean {
  const value = values[field.name];
  
  switch (dep.condition) {
    case 'equals':
      return value === dep.value;
    case 'notEquals':
      return value !== dep.value;
    case 'contains':
      return String(value).includes(dep.value);
    case 'greaterThan':
      return Number(value) > dep.value;
    case 'lessThan':
      return Number(value) < dep.value;
    case 'custom':
      return dep.validator?.(value, values) || false;
    default:
      return false;
  }
}

/**
 * Apply dependency action
 */
export function applyDependencyAction(this: any, dep: FieldDependency,
  targetField: FieldSchema,
  component: Component | undefined,
  values: Record<string, any>): void {
  if (!component) return;
  
  switch (dep.action) {
    case 'show':
      (component as any).visible = true;
      break;
    case 'hide':
      (component as any).visible = false;
      break;
    case 'enable':
      component.props.disabled = false;
      // Rendering handled by form update cycle
      break;
    case 'disable':
      component.props.disabled = true;
      // Rendering handled by form update cycle
      break;
    case 'setValue':
      if (dep.targetValue !== undefined) {
        values[targetField.name] = dep.targetValue;
        component.props.value = dep.targetValue;
        // Rendering handled by form update cycle
      }
      break;
    case 'validate':
      // Trigger validation - handled elsewhere
      break;
  }
}

/**
 * Process all field dependencies
 */
export function processDependencies(this: any, changedField: FieldSchema,
  allFields: FieldSchema[],
  components: Map<string, Component>,
  values: Record<string, any>): void {
  allFields.forEach((targetField: any) => {
    targetField.dependencies?.forEach((dep: any) => {
      if (dep.field === changedField.name) {
        const shouldApply = evaluateDependency(dep, changedField, values);
        
        if (shouldApply) {
          const component = components.get(targetField.id);
          applyDependencyAction(dep, targetField, component, values);
        }
      }
    });
  });
}