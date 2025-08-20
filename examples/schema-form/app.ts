#!/usr/bin/env tsx

/**
 * Schema-driven Form Example
 * Demonstrates building forms from JSON schemas
 */

import {
    ScreenManager,
    SchemaFormBuilder,
    ComponentRegistry,
    EventBus,
    Store,
    FormSchema,
    FieldType,
    Color,
    color
} from '../../src'

// Define form schema
const userFormSchema: FormSchema = {
    id: 'user-form',
    version: '1.0.0',
    title: 'User Registration',
    description: 'Create a new user account',
    layout: 'vertical',
    sections: [
        {
            id: 'personal',
            title: 'Personal Information',
            fields: [
                {
                    id: 'firstName',
                    name: 'firstName',
                    type: FieldType.TEXT,
                    label: 'First Name',
                    placeholder: 'Enter your first name',
                    required: true,
                    validation: [
                        {
                            type: 'minLength',
                            value: 2,
                            message: 'First name must be at least 2 characters'
                        },
                        {
                            type: 'maxLength',
                            value: 50,
                            message: 'First name cannot exceed 50 characters'
                        }
                    ]
                },
                {
                    id: 'lastName',
                    name: 'lastName',
                    type: FieldType.TEXT,
                    label: 'Last Name',
                    placeholder: 'Enter your last name',
                    required: true,
                    validation: [
                        {
                            type: 'minLength',
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                        }
                    ]
                },
                {
                    id: 'email',
                    name: 'email',
                    type: FieldType.EMAIL,
                    label: 'Email Address',
                    placeholder: 'user@example.com',
                    required: true,
                    validation: [
                        {
                            type: 'email',
                            message: 'Please enter a valid email address'
                        }
                    ]
                },
                {
                    id: 'age',
                    name: 'age',
                    type: FieldType.NUMBER,
                    label: 'Age',
                    placeholder: 'Enter your age',
                    min: 18,
                    max: 120,
                    validation: [
                        {
                            type: 'min',
                            value: 18,
                            message: 'You must be at least 18 years old'
                        },
                        {
                            type: 'max',
                            value: 120,
                            message: 'Please enter a valid age'
                        }
                    ]
                }
            ]
        },
        {
            id: 'account',
            title: 'Account Settings',
            fields: [
                {
                    id: 'username',
                    name: 'username',
                    type: FieldType.TEXT,
                    label: 'Username',
                    placeholder: 'Choose a username',
                    required: true,
                    validation: [
                        {
                            type: 'pattern',
                            value: '^[a-zA-Z0-9_]+$',
                            message: 'Username can only contain letters, numbers, and underscores'
                        },
                        {
                            type: 'minLength',
                            value: 3,
                            message: 'Username must be at least 3 characters'
                        }
                    ]
                },
                {
                    id: 'password',
                    name: 'password',
                    type: FieldType.PASSWORD,
                    label: 'Password',
                    placeholder: 'Enter a strong password',
                    required: true,
                    validation: [
                        {
                            type: 'minLength',
                            value: 8,
                            message: 'Password must be at least 8 characters'
                        },
                        {
                            type: 'pattern',
                            value: '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])',
                            message: 'Password must contain uppercase, lowercase, and numbers'
                        }
                    ]
                },
                {
                    id: 'confirmPassword',
                    name: 'confirmPassword',
                    type: FieldType.PASSWORD,
                    label: 'Confirm Password',
                    placeholder: 'Re-enter your password',
                    required: true,
                    dependencies: [
                        {
                            field: 'password',
                            condition: 'equals',
                            action: 'validate',
                            validator: (value, form) => value === form.password
                        }
                    ],
                    validation: [
                        {
                            type: 'custom',
                            message: 'Passwords do not match',
                            validator: (value, field, form) => value === form.password
                        }
                    ]
                }
            ]
        },
        {
            id: 'preferences',
            title: 'Preferences',
            fields: [
                {
                    id: 'newsletter',
                    name: 'newsletter',
                    type: FieldType.CHECKBOX,
                    label: 'Subscribe to newsletter',
                    defaultValue: false
                },
                {
                    id: 'notifications',
                    name: 'notifications',
                    type: FieldType.SELECT,
                    label: 'Notification Preferences',
                    placeholder: 'Select notification frequency',
                    options: [
                        { label: 'Never', value: 'never' },
                        { label: 'Daily', value: 'daily' },
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Monthly', value: 'monthly' }
                    ],
                    defaultValue: 'weekly'
                },
                {
                    id: 'theme',
                    name: 'theme',
                    type: FieldType.RADIO,
                    label: 'Preferred Theme',
                    options: [
                        { label: 'Light', value: 'light' },
                        { label: 'Dark', value: 'dark' },
                        { label: 'Auto', value: 'auto' }
                    ],
                    defaultValue: 'auto'
                }
            ]
        }
    ],
    submitButton: {
        label: 'Create Account',
        position: 'center'
    },
    cancelButton: {
        label: 'Cancel'
    },
    resetButton: {
        label: 'Reset Form'
    },
    onSubmit: async (values, schema) => {
        console.log('Form submitted with values:', values)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Account created successfully!')
    },
    onCancel: (schema) => {
        console.log('Form cancelled')
        process.exit(0)
    },
    onReset: (schema) => {
        console.log('Form reset')
    },
    onChange: (values, changedField, schema) => {
        console.log(`Field "${changedField}" changed:`, values[changedField])
    }
}

// Create application state store
const store = new Store({
    state: {
        user: null,
        formData: {},
        loading: false,
        errors: []
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user
        },
        SET_FORM_DATA(state, data) {
            state.formData = data
        },
        SET_LOADING(state, loading) {
            state.loading = loading
        },
        ADD_ERROR(state, error) {
            state.errors.push(error)
        },
        CLEAR_ERRORS(state) {
            state.errors = []
        }
    },
    actions: {
        async submitForm({ commit, state }, formData) {
            commit('SET_LOADING', true)
            commit('CLEAR_ERRORS')
            
            try {
                // Validate and process form data
                commit('SET_FORM_DATA', formData)
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Create user
                const user = {
                    id: Date.now().toString(),
                    ...formData
                }
                
                commit('SET_USER', user)
                console.log('User created:', user)
            } catch (error: any) {
                commit('ADD_ERROR', error.message)
            } finally {
                commit('SET_LOADING', false)
            }
        }
    },
    getters: {
        isLoggedIn: (state) => state.user !== null,
        hasErrors: (state) => state.errors.length > 0,
        errorCount: (state) => state.errors.length
    }
})

// Application class
class SchemaFormApp {
    private screen: ScreenManager
    private formBuilder: SchemaFormBuilder
    private registry: ComponentRegistry
    private eventBus: EventBus
    
    constructor() {
        this.screen = ScreenManager.getInstance()
        this.registry = ComponentRegistry.getInstance()
        this.eventBus = EventBus.getInstance()
        
        // Build form from schema
        this.formBuilder = new SchemaFormBuilder(userFormSchema)
        
        this.setupEventHandlers()
    }
    
    private setupEventHandlers(): void {
        // Handle form events
        this.formBuilder.on('change', ({ field, value, values }) => {
            store.commit('SET_FORM_DATA', values)
        })
        
        this.formBuilder.on('submit', async (values) => {
            await store.dispatch('submitForm', values)
            
            if (!store.getters.hasErrors) {
                console.log('Success! User account created.')
                setTimeout(() => this.quit(), 2000)
            }
        })
        
        this.formBuilder.on('validationError', (result) => {
            console.log('Validation errors:', result.errors)
        })
        
        // Global keyboard shortcuts
        this.screen.on('keypress', (char: string, key: any) => {
            if (char === 'q' || key?.name === 'escape') {
                this.quit()
            }
        })
        
        // Watch store changes
        store.watch('loading', (newValue, oldValue) => {
            if (newValue) {
                console.log('Processing...')
            } else {
                console.log('Ready')
            }
        })
        
        store.watch('errors', (newValue) => {
            if (newValue.length > 0) {
                console.error('Errors:', newValue)
            }
        }, { deep: true })
    }
    
    private renderForm(): void {
        const { width, height } = this.screen.getDimensions()
        
        // Clear screen
        this.screen.clear()
        
        // Header
        this.screen.write(
            'Schema-driven Form Example',
            Math.floor((width - 26) / 2),
            1,
            color(Color.Cyan)
        )
        
        // Build and render form components
        const components = this.formBuilder.buildComponents()
        
        let y = 3
        components.forEach((component, id) => {
            // Register component in registry
            const componentId = this.registry.register(component, {
                id,
                type: component.constructor.name,
                name: id
            })
            
            // Mount component
            this.registry.mount(componentId, {
                x: 5,
                y,
                width: width - 10,
                height: 3
            })
            
            // Render component
            component.render(this.screen, {
                x: 5,
                y,
                width: width - 10,
                height: 3
            })
            
            y += 4
        })
        
        // Instructions
        this.screen.write(
            'Tab: Next field | Shift+Tab: Previous | Enter: Submit | ESC: Cancel',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        // Render
        this.screen.render()
    }
    
    private quit(): void {
        // Cleanup
        this.registry.clear()
        this.eventBus.reset()
        this.screen.cleanup()
        
        console.log('\nGoodbye!')
        process.exit(0)
    }
    
    run(): void {
        this.screen.enterAlternateScreen()
        this.screen.setCursorVisible(true)
        
        this.renderForm()
    }
}

// Run application
const app = new SchemaFormApp()
app.run()

// Handle graceful shutdown
process.on('SIGINT', () => {
    ScreenManager.getInstance().cleanup()
    process.exit(0)
})