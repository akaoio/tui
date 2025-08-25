/**
 * Component creation methods
 */

import { Component, ComponentOptions } from '../../component/Component';
import { Input, InputOptions } from '../../component/Input';
import { Select, SelectOptions } from '../../component/Select';
import { Checkbox, CheckboxOptions } from '../../component/Checkbox';
import { Radio, RadioOptions } from '../../component/Radio';
import { ProgressBar, ProgressBarOptions } from '../../component/ProgressBar';
import { Spinner, SpinnerOptions } from '../../component/Spinner';
import { RenderMode } from '../RenderMode';
import { SchemaComponentDefinition, AdapterContext, ComponentRegion } from './types';

/**
 * Create an Input component from schema
 */
export function createInput(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): Input {
  const options: InputOptions = {
    ...baseOptions,
    placeholder: schema.props?.placeholder || '',
    value: context.resolveValue(schema.props?.value) || '',
    maxLength: schema.props?.maxLength,
    password: schema.props?.password,
    multiline: schema.props?.multiline,
    validator: schema.props?.validator
  };

  return new Input(context.screen, context.keyboard, options);
}

/**
 * Create a Select component from schema
 */
export function createSelect(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): Select {
  const data = context.resolveValue(schema.data) || [];
  const selectedIndex = context.resolveValue(schema.props?.selectedIndex) || 0;
  
  const options: SelectOptions = {
    ...baseOptions,
    options: Array.isArray(data) ? data : [],
    selected: selectedIndex
  };

  // Handle item template for custom rendering
  if (schema.itemTemplate) {
    (options as any).itemTemplate = schema.itemTemplate;
  }

  return new Select(context.screen, context.keyboard, options);
}

/**
 * Create a Checkbox component from schema
 */
export function createCheckbox(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): Checkbox {
  const options: CheckboxOptions = {
    ...baseOptions,
    label: schema.props?.label || '',
    checked: context.resolveValue(schema.props?.checked) || false
  };

  return new Checkbox(context.screen, context.keyboard, options);
}

/**
 * Create a Radio component from schema
 */
export function createRadio(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): Radio {
  const buttons = schema.props?.buttons || [];
  const selected = context.resolveValue(schema.props?.selected);
  
  const options: RadioOptions = {
    ...baseOptions,
    options: buttons.map((b: any) => b.label || b.value || b),
    selected: buttons.findIndex((b: any) => (b.value || b) === selected)
  };

  return new Radio(context.screen, context.keyboard, options);
}

/**
 * Create a ProgressBar component from schema
 */
export function createProgressBar(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): ProgressBar {
  const options: ProgressBarOptions = {
    ...baseOptions,
    current: context.resolveValue(schema.props?.progress) || 0,
    total: schema.props?.total || 100,
    showPercentage: schema.props?.showPercentage !== false
  };

  return new ProgressBar(context.screen, context.keyboard, options);
}

/**
 * Create a Spinner component from schema
 */
export function createSpinner(this: any, schema: SchemaComponentDefinition,
  baseOptions: ComponentOptions,
  context: AdapterContext): Spinner {
  const options: SpinnerOptions = {
    ...baseOptions,
    text: schema.props?.text || ''
  };

  return new Spinner(context.screen, context.keyboard, options);
}

/**
 * Create base component options from region
 */
export function createBaseOptions(this: any, region?: ComponentRegion): ComponentOptions {
  return {
    x: region?.x ?? 0,
    y: region?.y ?? 0,
    width: region?.width ?? 10,
    height: region?.height ?? 1,
    renderMode: RenderMode.ABSOLUTE
  };
}