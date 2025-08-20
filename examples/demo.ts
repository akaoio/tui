#!/usr/bin/env tsx

/**
 * TUI Framework Demo - Showcasing all enterprise features
 * Run: npx tsx examples/demo.ts
 */

import {
    ScreenManager,
    ComponentRegistry,
    SchemaFormBuilder,
    SchemaRegistry,
    EventBus,
    Store,
    FormSchema,
    FieldType,
    Color,
    color,
    bold
} from '../src'

// Simple login form schema
const loginSchema: FormSchema = {
    id: 'login-form',
    version: '1.0.0',
    title: '🔐 Login',
    layout: 'vertical',
    fields: [
        {
            id: 'username',
            name: 'username',
            type: FieldType.TEXT,
            label: 'Username',
            placeholder: 'Enter username or email',
            required: true,
            validation: [
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
            placeholder: 'Enter password',
            required: true,
            validation: [
                {
                    type: 'minLength',
                    value: 6,
                    message: 'Password must be at least 6 characters'
                }
            ]
        },
        {
            id: 'remember',
            name: 'remember',
            type: FieldType.CHECKBOX,
            label: 'Remember me',
            defaultValue: false
        }
    ],
    submitButton: {
        label: 'Login',
        position: 'center'
    },
    onSubmit: async (values) => {
        console.log('\n✅ Login submitted:', values)
        
        // Simulate API call
        console.log('⏳ Authenticating...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (values.username === 'admin' && values.password === 'password') {
            console.log('✅ Login successful!')
        } else {
            console.log('❌ Invalid credentials')
        }
    }
}

// Create global state store
const appStore = new Store({
    state: {
        currentUser: null,
        isAuthenticated: false,
        theme: 'dark',
        notifications: []
    },
    mutations: {
        SET_USER(state, user) {
            state.currentUser = user
            state.isAuthenticated = !!user
        },
        ADD_NOTIFICATION(state, notification) {
            state.notifications.push({
                id: Date.now(),
                ...notification,
                timestamp: new Date()
            })
        },
        CLEAR_NOTIFICATIONS(state) {
            state.notifications = []
        }
    },
    actions: {
        async login({ commit }, credentials) {
            // Simulate login
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            if (credentials.username === 'admin') {
                commit('SET_USER', {
                    id: '1',
                    username: credentials.username,
                    role: 'admin'
                })
                commit('ADD_NOTIFICATION', {
                    type: 'success',
                    message: 'Login successful'
                })
                return true
            }
            
            commit('ADD_NOTIFICATION', {
                type: 'error',
                message: 'Invalid credentials'
            })
            return false
        },
        logout({ commit }) {
            commit('SET_USER', null)
            commit('CLEAR_NOTIFICATIONS')
        }
    },
    getters: {
        isAdmin: (state) => state.currentUser?.role === 'admin',
        notificationCount: (state) => state.notifications.length
    }
})

class DemoApp {
    private screen: ScreenManager
    private registry: ComponentRegistry
    private eventBus: EventBus
    private formBuilder?: SchemaFormBuilder
    private currentView: 'menu' | 'login' | 'dashboard' = 'menu'
    
    constructor() {
        this.screen = ScreenManager.getInstance()
        this.registry = ComponentRegistry.getInstance()
        this.eventBus = EventBus.getInstance()
        
        this.setupEventHandlers()
        this.setupStoreWatchers()
    }
    
    private setupEventHandlers(): void {
        // Global keyboard shortcuts
        this.screen.on('keypress', (char: string, key: any) => {
            // ESC to go back
            if (key?.name === 'escape') {
                if (this.currentView !== 'menu') {
                    this.currentView = 'menu'
                    this.render()
                } else {
                    this.quit()
                }
            }
            
            // Q to quit
            if (char === 'q' && this.currentView === 'menu') {
                this.quit()
            }
            
            // Menu navigation
            if (this.currentView === 'menu') {
                switch (char) {
                    case '1':
                        this.showLoginForm()
                        break
                    case '2':
                        this.showDashboard()
                        break
                    case '3':
                        this.showComponentRegistry()
                        break
                    case '4':
                        this.showEventBusDemo()
                        break
                    case '5':
                        this.showStateDemo()
                        break
                }
            }
        })
        
        // Component events via EventBus
        this.eventBus.subscribe('form:submit', (payload) => {
            console.log('📡 Form submitted via EventBus:', payload.data)
        })
        
        this.eventBus.subscribe('component:*', (payload) => {
            console.log(`📡 Component event:`, payload)
        })
    }
    
    private setupStoreWatchers(): void {
        // Watch for authentication changes
        appStore.watch('isAuthenticated', (newValue, oldValue) => {
            console.log(`🔐 Auth state changed: ${oldValue} → ${newValue}`)
            
            if (newValue) {
                this.eventBus.emit('user:login', {
                    data: appStore.state.currentUser
                })
            } else {
                this.eventBus.emit('user:logout', {})
            }
        })
        
        // Watch notifications
        appStore.watch('notifications', (newValue) => {
            if (newValue.length > 0) {
                const latest = newValue[newValue.length - 1]
                console.log(`🔔 Notification: ${latest.message}`)
            }
        }, { deep: true })
    }
    
    private showMenu(): void {
        this.currentView = 'menu'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Title
        const title = '🚀 TUI Framework Enterprise Demo'
        this.screen.write(
            title,
            Math.floor((width - title.length) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // Menu options
        const menuItems = [
            '1. Schema-driven Form (Login)',
            '2. Dashboard with State Management',
            '3. Component Registry Demo',
            '4. Event Bus Communication',
            '5. Reactive State Demo',
            '',
            'Press number to select, Q to quit'
        ]
        
        let y = 5
        menuItems.forEach(item => {
            const x = Math.floor((width - item.length) / 2)
            const style = item.startsWith('Press') 
                ? color(Color.BrightBlack)
                : item === '' ? '' : color(Color.White)
            this.screen.write(item, x, y++, style)
        })
        
        // Stats
        const stats = this.registry.getStats()
        this.screen.write(
            `Components: ${stats.total} | Mounted: ${stats.mounted}`,
            2,
            height - 3,
            color(Color.BrightBlack)
        )
        
        const eventStats = this.eventBus.getStats()
        this.screen.write(
            `Event Handlers: ${eventStats.totalHandlers} | Types: ${eventStats.eventTypes}`,
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        this.screen.render()
    }
    
    private showLoginForm(): void {
        this.currentView = 'login'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Create form from schema
        this.formBuilder = new SchemaFormBuilder(loginSchema)
        
        // Handle form events
        this.formBuilder.on('submit', async (values) => {
            const success = await appStore.dispatch('login', values)
            
            if (success) {
                setTimeout(() => {
                    this.showDashboard()
                }, 1000)
            }
        })
        
        // Build components
        const components = this.formBuilder.buildComponents()
        
        // Title
        this.screen.write(
            '🔐 Login Form (Schema-driven)',
            Math.floor((width - 30) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // Render form fields
        let y = 5
        components.forEach((component, fieldId) => {
            // Register in ComponentRegistry
            const id = this.registry.register(component, {
                type: 'FormField',
                name: fieldId
            })
            
            // Mount and render
            this.registry.mount(id, { x: 10, y, width: width - 20, height: 3 })
            
            component.render(this.screen, {
                x: 10,
                y,
                width: width - 20,
                height: 3
            })
            
            y += 4
        })
        
        // Instructions
        this.screen.write(
            'Tab: Next field | Enter: Submit | ESC: Back',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        this.screen.write(
            'Try: username=admin, password=password',
            2,
            height - 1,
            color(Color.BrightBlack)
        )
        
        this.screen.render()
    }
    
    private showDashboard(): void {
        this.currentView = 'dashboard'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Title
        this.screen.write(
            '📊 Dashboard',
            Math.floor((width - 12) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // User info from store
        const user = appStore.state.currentUser
        if (user) {
            this.screen.write(
                `Logged in as: ${user.username} (${user.role})`,
                2,
                4,
                color(Color.Green)
            )
        } else {
            this.screen.write(
                'Not logged in',
                2,
                4,
                color(Color.Red)
            )
        }
        
        // Store state
        this.screen.write('Current State:', 2, 6, color(Color.Yellow))
        const stateJson = JSON.stringify(appStore.state, null, 2)
        const lines = stateJson.split('\n')
        lines.forEach((line, i) => {
            if (i < 15) { // Limit display
                this.screen.write(line, 4, 8 + i, color(Color.White))
            }
        })
        
        // Instructions
        this.screen.write(
            'ESC: Back to menu',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        this.screen.render()
    }
    
    private showComponentRegistry(): void {
        this.currentView = 'dashboard'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Title
        this.screen.write(
            '🗂️ Component Registry',
            Math.floor((width - 22) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // Registry stats
        const stats = this.registry.getStats()
        this.screen.write(
            `Total Components: ${stats.total}`,
            2,
            4,
            color(Color.Yellow)
        )
        this.screen.write(
            `Mounted: ${stats.mounted}`,
            2,
            5,
            color(Color.Green)
        )
        
        // Component tree
        this.screen.write('Component Tree:', 2, 7, color(Color.Yellow))
        const tree = this.registry.getTreeJSON()
        const treeJson = JSON.stringify(tree, null, 2)
        const lines = treeJson.split('\n')
        lines.forEach((line, i) => {
            if (i < 10) {
                this.screen.write(line, 4, 9 + i, color(Color.White))
            }
        })
        
        this.screen.write(
            'ESC: Back to menu',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        this.screen.render()
    }
    
    private showEventBusDemo(): void {
        this.currentView = 'dashboard'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Title
        this.screen.write(
            '📡 Event Bus Demo',
            Math.floor((width - 17) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // Event stats
        const stats = this.eventBus.getStats()
        this.screen.write(
            `Event Handlers: ${stats.totalHandlers}`,
            2,
            4,
            color(Color.Yellow)
        )
        this.screen.write(
            `Event Types: ${stats.eventTypes}`,
            2,
            5,
            color(Color.Yellow)
        )
        this.screen.write(
            `History Size: ${stats.historySize}`,
            2,
            6,
            color(Color.Yellow)
        )
        
        // Recent events
        this.screen.write('Recent Events:', 2, 8, color(Color.Green))
        const history = this.eventBus.getHistory()
        history.slice(-5).forEach((event, i) => {
            this.screen.write(
                `${event.event}: ${JSON.stringify(event.payload.data)}`,
                4,
                10 + i,
                color(Color.White)
            )
        })
        
        // Trigger test event
        this.screen.write(
            'Press T to trigger test event',
            2,
            height - 3,
            color(Color.BrightBlack)
        )
        
        this.screen.write(
            'ESC: Back to menu',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        // Handle test event
        this.screen.once('keypress', (char: string) => {
            if (char === 't') {
                this.eventBus.emit('test:event', {
                    data: { message: 'Hello from EventBus!', timestamp: Date.now() }
                })
                this.showEventBusDemo() // Refresh
            }
        })
        
        this.screen.render()
    }
    
    private showStateDemo(): void {
        this.currentView = 'dashboard'
        const { width, height } = this.screen.getDimensions()
        
        this.screen.clear()
        
        // Title
        this.screen.write(
            '⚡ Reactive State Demo',
            Math.floor((width - 22) / 2),
            2,
            color(Color.Cyan) + bold('')
        )
        
        // Current state
        this.screen.write('Store State:', 2, 4, color(Color.Yellow))
        this.screen.write(
            `User: ${appStore.state.currentUser?.username || 'None'}`,
            4,
            6,
            color(Color.White)
        )
        this.screen.write(
            `Authenticated: ${appStore.state.isAuthenticated}`,
            4,
            7,
            color(Color.White)
        )
        this.screen.write(
            `Theme: ${appStore.state.theme}`,
            4,
            8,
            color(Color.White)
        )
        this.screen.write(
            `Notifications: ${appStore.state.notifications.length}`,
            4,
            9,
            color(Color.White)
        )
        
        // Getters
        this.screen.write('Computed Getters:', 2, 11, color(Color.Yellow))
        this.screen.write(
            `Is Admin: ${appStore.getters.isAdmin}`,
            4,
            13,
            color(Color.White)
        )
        this.screen.write(
            `Notification Count: ${appStore.getters.notificationCount}`,
            4,
            14,
            color(Color.White)
        )
        
        // Actions
        this.screen.write(
            'Press L to login, O to logout, N for notification',
            2,
            height - 3,
            color(Color.BrightBlack)
        )
        
        this.screen.write(
            'ESC: Back to menu',
            2,
            height - 2,
            color(Color.BrightBlack)
        )
        
        // Handle actions
        this.screen.once('keypress', async (char: string) => {
            switch (char) {
                case 'l':
                    await appStore.dispatch('login', { username: 'admin', password: 'password' })
                    this.showStateDemo()
                    break
                case 'o':
                    await appStore.dispatch('logout')
                    this.showStateDemo()
                    break
                case 'n':
                    appStore.commit('ADD_NOTIFICATION', {
                        type: 'info',
                        message: `Test notification ${Date.now()}`
                    })
                    this.showStateDemo()
                    break
            }
        })
        
        this.screen.render()
    }
    
    private render(): void {
        switch (this.currentView) {
            case 'menu':
                this.showMenu()
                break
            case 'login':
                this.showLoginForm()
                break
            case 'dashboard':
                this.showDashboard()
                break
        }
    }
    
    private quit(): void {
        // Cleanup
        this.registry.clear()
        this.eventBus.reset()
        this.screen.cleanup()
        
        console.log('\n👋 Thanks for trying TUI Framework!')
        console.log('📚 Check out the docs for more features')
        process.exit(0)
    }
    
    run(): void {
        this.screen.enterAlternateScreen()
        this.screen.enableMouse()
        this.screen.setCursorVisible(true)
        
        this.showMenu()
    }
}

// Run demo
console.log('Starting TUI Framework Demo...\n')
const app = new DemoApp()
app.run()

// Handle graceful shutdown
process.on('SIGINT', () => {
    ScreenManager.getInstance().cleanup()
    process.exit(0)
})