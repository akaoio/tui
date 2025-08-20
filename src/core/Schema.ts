/**
 * Schema-driven UI System
 * Allows building TUI interfaces from JSON schemas
 */

import { EventEmitter } from 'events'
import { Component, ComponentProps } from './Component'
import { ComponentFactory } from './ComponentFactory'

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
    type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom'
    value?: any
    message: string
    validator?: (value: any, field: FieldSchema, form: any) => boolean | Promise<boolean>
}

/**
 * Field schema definition
 */
export interface FieldSchema {
    id: string
    type: FieldType
    label: string
    name: string
    placeholder?: string
    defaultValue?: any
    value?: any
    disabled?: boolean
    readonly?: boolean
    hidden?: boolean
    required?: boolean
    validation?: ValidationRule[]
    options?: Array<{ label: string; value: any; disabled?: boolean }>
    multiple?: boolean
    rows?: number // for textarea
    cols?: number
    min?: number // for number/range
    max?: number // for number/range
    step?: number // for number/range
    accept?: string // for file
    style?: Record<string, any>
    className?: string
    dependencies?: Array<{
        field: string
        condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'custom'
        value?: any
        action: 'show' | 'hide' | 'enable' | 'disable' | 'setValue' | 'validate'
        targetValue?: any
        validator?: (value: any, form: any) => boolean
    }>
    onChange?: (value: any, field: FieldSchema, form: any) => void
    onFocus?: (field: FieldSchema, form: any) => void
    onBlur?: (field: FieldSchema, form: any) => void
    onValidate?: (value: any, field: FieldSchema, form: any) => ValidationResult
    customComponent?: typeof Component
    customProps?: Record<string, any>
}

/**
 * Form section for grouping fields
 */
export interface FormSection {
    id: string
    title?: string
    description?: string
    fields: FieldSchema[]
    columns?: number
    collapsible?: boolean
    collapsed?: boolean
    visible?: boolean
    style?: Record<string, any>
}

/**
 * Complete form schema
 */
export interface FormSchema {
    id: string
    version: string
    title?: string
    description?: string
    sections?: FormSection[]
    fields?: FieldSchema[] // For simple forms without sections
    layout?: 'vertical' | 'horizontal' | 'grid'
    columns?: number
    submitButton?: {
        label: string
        style?: Record<string, any>
        position?: 'left' | 'center' | 'right'
    }
    cancelButton?: {
        label: string
        style?: Record<string, any>
    }
    resetButton?: {
        label: string
        style?: Record<string, any>
    }
    style?: Record<string, any>
    onSubmit?: (values: Record<string, any>, schema: FormSchema) => void | Promise<void>
    onCancel?: (schema: FormSchema) => void
    onReset?: (schema: FormSchema) => void
    onChange?: (values: Record<string, any>, changedField: string, schema: FormSchema) => void
    onValidate?: (values: Record<string, any>, schema: FormSchema) => ValidationResult
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean
    errors?: Record<string, string[]>
    warnings?: Record<string, string[]>
}

/**
 * Schema Registry for managing multiple schemas
 */
export class SchemaRegistry {
    private static instance: SchemaRegistry
    private schemas: Map<string, FormSchema> = new Map()
    private components: Map<string, typeof Component> = new Map()
    private validators: Map<string, ValidationRule['validator']> = new Map()
    
    private constructor() {
        this.registerDefaultComponents()
        this.registerDefaultValidators()
    }
    
    static getInstance(): SchemaRegistry {
        if (!SchemaRegistry.instance) {
            SchemaRegistry.instance = new SchemaRegistry()
        }
        return SchemaRegistry.instance
    }
    
    /**
     * Register a schema
     */
    registerSchema(schema: FormSchema): void {
        this.schemas.set(schema.id, schema)
    }
    
    /**
     * Get a schema by ID
     */
    getSchema(id: string): FormSchema | undefined {
        return this.schemas.get(id)
    }
    
    /**
     * Load schema from URL (lazy loading)
     */
    async loadSchema(url: string): Promise<FormSchema> {
        const response = await fetch(url)
        const schema = await response.json() as FormSchema
        this.registerSchema(schema)
        return schema
    }
    
    /**
     * Register custom component
     */
    registerComponent(type: string, component: typeof Component): void {
        this.components.set(type, component)
    }
    
    /**
     * Get component by type
     */
    getComponent(type: string): typeof Component | undefined {
        return this.components.get(type)
    }
    
    /**
     * Register custom validator
     */
    registerValidator(name: string, validator: ValidationRule['validator']): void {
        this.validators.set(name, validator)
    }
    
    /**
     * Get validator by name
     */
    getValidator(name: string): ValidationRule['validator'] | undefined {
        return this.validators.get(name)
    }
    
    /**
     * Register default components
     * NOTE: In the new generic architecture, apps register their own components
     */
    private registerDefaultComponents(): void {
        // Deprecated: Apps should register their own components
    }
    
    /**
     * Register default validators
     */
    private registerDefaultValidators(): void {
        this.registerValidator('required', (value) => {
            return value !== null && value !== undefined && value !== ''
        })
        
        this.registerValidator('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(value)
        })
        
        this.registerValidator('url', (value) => {
            try {
                new URL(value)
                return true
            } catch {
                return false
            }
        })
        
        this.registerValidator('minLength', (value, field) => {
            const rule = field.validation?.find(r => r.type === 'minLength')
            return String(value).length >= (rule?.value || 0)
        })
        
        this.registerValidator('maxLength', (value, field) => {
            const rule = field.validation?.find(r => r.type === 'maxLength')
            return String(value).length <= (rule?.value || Infinity)
        })
        
        this.registerValidator('min', (value, field) => {
            const rule = field.validation?.find(r => r.type === 'min')
            return Number(value) >= (rule?.value || -Infinity)
        })
        
        this.registerValidator('max', (value, field) => {
            const rule = field.validation?.find(r => r.type === 'max')
            return Number(value) <= (rule?.value || Infinity)
        })
        
        this.registerValidator('pattern', (value, field) => {
            const rule = field.validation?.find(r => r.type === 'pattern')
            if (!rule?.value) return true
            const regex = new RegExp(rule.value)
            return regex.test(String(value))
        })
    }
}

/**
 * Schema-driven Form Builder
 */
export class SchemaFormBuilder extends EventEmitter {
    private schema: FormSchema
    private values: Record<string, any> = {}
    private errors: Record<string, string[]> = {}
    private components: Map<string, Component> = new Map()
    private registry: SchemaRegistry
    
    constructor(schema: FormSchema | string) {
        super()
        this.registry = SchemaRegistry.getInstance()
        
        if (typeof schema === 'string') {
            const loadedSchema = this.registry.getSchema(schema)
            if (!loadedSchema) {
                throw new Error(`Schema with ID "${schema}" not found`)
            }
            this.schema = loadedSchema
        } else {
            this.schema = schema
            this.registry.registerSchema(schema)
        }
        
        this.initializeValues()
    }
    
    /**
     * Initialize form values from schema
     */
    private initializeValues(): void {
        const fields = this.getAllFields()
        fields.forEach(field => {
            if (field.defaultValue !== undefined) {
                this.values[field.name] = field.defaultValue
            } else if (field.value !== undefined) {
                this.values[field.name] = field.value
            }
        })
    }
    
    /**
     * Get all fields from schema
     */
    private getAllFields(): FieldSchema[] {
        if (this.schema.sections) {
            return this.schema.sections.flatMap(section => section.fields)
        }
        return this.schema.fields || []
    }
    
    /**
     * Build components from schema
     */
    buildComponents(): Map<string, Component> {
        const fields = this.getAllFields()
        
        fields.forEach(field => {
            const component = this.createComponent(field)
            if (component) {
                this.components.set(field.id, component)
                this.setupFieldBindings(field, component)
            }
        })
        
        return this.components
    }
    
    /**
     * Create component from field schema
     */
    private createComponent(field: FieldSchema): Component | null {
        // Use ComponentFactory to create components
        const factory = ComponentFactory.getInstance()
        
        const options = {
            label: field.label,
            placeholder: field.placeholder,
            style: field.style,
            checked: field.defaultValue,
            value: field.defaultValue,
            options: field.options,
            disabled: field.disabled,
            name: field.name
        }
        
        const component = factory.createComponent(field.type, options)
        
        if (!component) {
            return null
        }
        
        // Set initial value and disabled state via props
        // NOTE: In generic architecture, apps handle these through props
        component.props.value = this.values[field.name]
        component.props.disabled = field.disabled
        
        return component
    }
    
    /**
     * Setup data bindings for field
     */
    private setupFieldBindings(field: FieldSchema, component: Component): void {
        // Two-way data binding
        component.on('change', (value) => {
            this.values[field.name] = value
            this.validateField(field)
            this.processDependencies(field)
            
            // Call field onChange
            field.onChange?.(value, field, this.values)
            
            // Call form onChange
            this.schema.onChange?.(this.values, field.name, this.schema)
            
            // Emit change event
            this.emit('change', {
                field: field.name,
                value,
                values: this.values
            })
        })
        
        // Focus/blur events
        component.on('focus', () => {
            field.onFocus?.(field, this.values)
            this.emit('focus', { field: field.name })
        })
        
        component.on('blur', () => {
            field.onBlur?.(field, this.values)
            this.validateField(field)
            this.emit('blur', { field: field.name })
        })
    }
    
    /**
     * Validate a single field
     */
    private validateField(field: FieldSchema): boolean {
        const value = this.values[field.name]
        const errors: string[] = []
        
        // Check required
        if (field.required) {
            const validator = this.registry.getValidator('required')
            if (validator && !validator(value, field, this.values)) {
                errors.push(field.label + ' is required')
            }
        }
        
        // Check other validations
        field.validation?.forEach(rule => {
            let validator = rule.validator
            
            if (!validator && rule.type !== 'custom') {
                validator = this.registry.getValidator(rule.type)
            }
            
            if (validator && !validator(value, field, this.values)) {
                errors.push(rule.message)
            }
        })
        
        // Custom validation
        if (field.onValidate) {
            const result = field.onValidate(value, field, this.values)
            if (!result.valid && result.errors?.[field.name]) {
                errors.push(...result.errors[field.name])
            }
        }
        
        // Update errors
        if (errors.length > 0) {
            this.errors[field.name] = errors
        } else {
            delete this.errors[field.name]
        }
        
        return errors.length === 0
    }
    
    /**
     * Process field dependencies
     */
    private processDependencies(field: FieldSchema): void {
        const allFields = this.getAllFields()
        
        allFields.forEach(targetField => {
            targetField.dependencies?.forEach(dep => {
                if (dep.field === field.name) {
                    const shouldApply = this.evaluateDependency(dep, field)
                    
                    if (shouldApply) {
                        this.applyDependencyAction(dep, targetField)
                    }
                }
            })
        })
    }
    
    /**
     * Evaluate dependency condition
     */
    private evaluateDependency(dep: any, field: FieldSchema): boolean {
        const value = this.values[field.name]
        
        switch (dep.condition) {
            case 'equals':
                return value === dep.value
            case 'notEquals':
                return value !== dep.value
            case 'contains':
                return String(value).includes(dep.value)
            case 'greaterThan':
                return Number(value) > dep.value
            case 'lessThan':
                return Number(value) < dep.value
            case 'custom':
                return dep.validator?.(value, this.values) || false
            default:
                return false
        }
    }
    
    /**
     * Apply dependency action
     */
    private applyDependencyAction(dep: any, field: FieldSchema): void {
        const component = this.components.get(field.id)
        if (!component) return
        
        switch (dep.action) {
            case 'show':
                component.props.visible = true
                break
            case 'hide':
                component.props.visible = false
                break
            case 'enable':
                component.props.disabled = false
                break
            case 'disable':
                component.props.disabled = true
                break
            case 'setValue':
                component.props.value = dep.targetValue
                this.values[field.name] = dep.targetValue
                break
            case 'validate':
                this.validateField(field)
                break
        }
    }
    
    /**
     * Validate entire form
     */
    validate(): ValidationResult {
        const fields = this.getAllFields()
        let valid = true
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                valid = false
            }
        })
        
        // Custom form validation
        if (this.schema.onValidate) {
            const result = this.schema.onValidate(this.values, this.schema)
            if (!result.valid) {
                valid = false
                if (result.errors) {
                    Object.assign(this.errors, result.errors)
                }
            }
        }
        
        return {
            valid,
            errors: { ...this.errors }
        }
    }
    
    /**
     * Submit form
     */
    async submit(): Promise<void> {
        const validation = this.validate()
        
        if (!validation.valid) {
            this.emit('validationError', validation)
            return
        }
        
        try {
            await this.schema.onSubmit?.(this.values, this.schema)
            this.emit('submit', this.values)
        } catch (error) {
            this.emit('submitError', error)
            throw error
        }
    }
    
    /**
     * Reset form
     */
    reset(): void {
        this.initializeValues()
        this.errors = {}
        
        // Reset all components
        this.components.forEach((component, id) => {
            const field = this.getAllFields().find(f => f.id === id)
            if (field) {
                component.props.value = this.values[field.name]
            }
        })
        
        this.schema.onReset?.(this.schema)
        this.emit('reset')
    }
    
    /**
     * Get form values
     */
    getValues(): Record<string, any> {
        return { ...this.values }
    }
    
    /**
     * Set form values
     */
    setValues(values: Record<string, any>): void {
        Object.assign(this.values, values)
        
        // Update components
        Object.keys(values).forEach(name => {
            const field = this.getAllFields().find(f => f.name === name)
            if (field) {
                const component = this.components.get(field.id)
                if (component) {
                    component.props.value = values[name]
                }
            }
        })
        
        this.emit('valuesChanged', this.values)
    }
    
    /**
     * Get form errors
     */
    getErrors(): Record<string, string[]> {
        return { ...this.errors }
    }
    
    /**
     * Get component by field ID
     */
    getComponent(fieldId: string): Component | undefined {
        return this.components.get(fieldId)
    }
}