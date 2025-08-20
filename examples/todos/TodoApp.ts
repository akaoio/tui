#!/usr/bin/env tsx

/**
 * Modern Todo App - Professional TUI Application
 * Features smooth UX like a real desktop app
 */

import { ScreenManager, Region, ANSI, MouseEvent, MouseEventType, MouseButton } from '../../src/core/ScreenManager'
import { Component, Label, Button, TextInput, List } from '../../src/core/Component'
import { Color, BgColor, color, reset } from '../../src/utils/colors'
import { bold, dim, underline } from '../../src/utils/styles'
import { ResponsiveCommands, ResponsiveTabs } from '../../src/components/ResponsiveCommands'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Todo data structure
 */
interface Todo {
    id: string
    title: string
    completed: boolean
    priority: 'low' | 'medium' | 'high'
    createdAt: Date
}

/**
 * App state
 */
interface AppState {
    todos: Todo[]
    filter: 'all' | 'active' | 'completed'
    view: 'list' | 'add' | 'edit'
    selectedId?: string
}

/**
 * Header Component
 */
class HeaderComponent extends Component {
    private title: string
    private stats: { total: number; completed: number }
    
    constructor(title: string) {
        super({ borderStyle: 'none' })
        this.title = title
        this.stats = { total: 0, completed: 0 }
        this.isFocusable = false
    }
    
    updateStats(total: number, completed: number): void {
        this.stats = { total, completed }
    }
    
    render(screen: ScreenManager, region: Region): void {
        // Title bar with gradient effect
        screen.fillRegion({ x: region.x, y: region.y, width: region.width, height: 1 }, ' ', color(undefined, BgColor.Blue))
        const titleText = ` TODO APP `
        const titleX = Math.floor((region.width - titleText.length) / 2)
        screen.write(titleText, region.x + titleX, region.y, color(Color.White, BgColor.Blue) + ANSI.bold)
        
        // Stats on the right
        const statsText = `${this.stats.completed}/${this.stats.total} `
        const statsStyle = color(Color.Green, BgColor.Blue)
        screen.write(statsText, region.x + region.width - statsText.length - 1, region.y, statsStyle)
        
        // Separator line
        screen.write('─'.repeat(region.width), region.x, region.y + 1, color(Color.BrightBlack))
    }
    
    protected onInput(): boolean {
        return false
    }
}

/**
 * Todo List Component
 */
class TodoListComponent extends List {
    private todos: Todo[] = []
    private filter: 'all' | 'active' | 'completed' = 'all'
    
    constructor() {
        super([], { borderStyle: 'none' })
    }
    
    setTodos(todos: Todo[]): void {
        this.todos = todos
        this.updateDisplay()
    }
    
    setFilter(filter: 'all' | 'active' | 'completed'): void {
        this.filter = filter
        this.updateDisplay()
    }
    
    private updateDisplay(): void {
        const filtered = this.getFilteredTodos()
        const items = filtered.map(todo => {
            const checkbox = todo.completed ? '[X]' : '[ ]'
            const priority = { high: 'H', medium: 'M', low: 'L' }[todo.priority]
            const priorityColor = { high: '!', medium: '*', low: ' ' }[todo.priority]
            return `${checkbox} ${priorityColor}${priority} ${todo.title}`
        })
        this.setItems(items)
    }
    
    private getFilteredTodos(): Todo[] {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(t => !t.completed)
            case 'completed':
                return this.todos.filter(t => t.completed)
            default:
                return this.todos
        }
    }
    
    getSelectedTodo(): Todo | undefined {
        const filtered = this.getFilteredTodos()
        return filtered[this.getSelectedIndex()]
    }
    
    render(screen: ScreenManager, region: Region): void {
        // Clear the region first
        screen.fillRegion(region, ' ')
        
        // Custom rendering for todo items
        const filtered = this.getFilteredTodos()
        const height = region.height
        const selectedIdx = this.getSelectedIndex()
        
        // Calculate scroll
        let startIdx = 0
        if (selectedIdx >= height) {
            startIdx = selectedIdx - height + 1
        }
        
        for (let i = 0; i < height && i + startIdx < filtered.length; i++) {
            const todo = filtered[i + startIdx]
            const y = region.y + i
            const isSelected = i + startIdx === selectedIdx
            
            // Background for selected item
            if (isSelected && this.state.focused) {
                screen.fillRegion({ x: region.x, y, width: region.width, height: 1 }, ' ', color(undefined, BgColor.BrightBlack))
            }
            
            // Checkbox
            const checkbox = todo.completed ? '[X]' : '[ ]'
            const checkColor = todo.completed ? color(Color.BrightBlack) : color(Color.White)
            screen.write(checkbox, region.x + 2, y, checkColor + (isSelected && this.state.focused ? color(undefined, BgColor.BrightBlack) : ''))
            
            // Priority with colors
            const prioritySymbol = {
                high: '[!]',
                medium: '[*]',
                low: '[ ]'
            }[todo.priority]
            
            const priorityColor = {
                high: color(Color.Red),
                medium: color(Color.Yellow),
                low: color(Color.Green)
            }[todo.priority]
            
            screen.write(prioritySymbol, region.x + 6, y, priorityColor + (isSelected && this.state.focused ? color(undefined, BgColor.BrightBlack) : ''))
            
            // Title
            const titleStyle = todo.completed ? color(Color.BrightBlack) + ANSI.strikethrough : color(Color.White)
            const maxTitleLen = region.width - 12
            const displayTitle = todo.title.length > maxTitleLen ? todo.title.slice(0, maxTitleLen - 3) + '...' : todo.title
            screen.write(displayTitle, region.x + 10, y, titleStyle + (isSelected && this.state.focused ? color(undefined, BgColor.BrightBlack) : ''))
        }
        
        // Empty state
        if (filtered.length === 0) {
            const emptyMsg = 'No todos found'
            const msgX = Math.floor((region.width - emptyMsg.length) / 2)
            const msgY = Math.floor(region.height / 2)
            screen.write(emptyMsg, region.x + msgX, region.y + msgY, color(Color.BrightBlack))
        }
        
        // Scroll indicators
        if (startIdx > 0) {
            screen.write('▲', region.x + region.width - 2, region.y, color(Color.Cyan))
        }
        if (startIdx + height < filtered.length) {
            screen.write('▼', region.x + region.width - 2, region.y + height - 1, color(Color.Cyan))
        }
    }
}

/**
 * Status Bar Component
 */
class StatusBarComponent extends Component {
    private message = ''
    private messageTimeout?: NodeJS.Timeout
    private filter: 'all' | 'active' | 'completed' = 'all'
    private tabs: ResponsiveTabs
    private commands: ResponsiveCommands
    
    constructor() {
        super({ borderStyle: 'none' })
        this.isFocusable = false
        
        // Create responsive tabs
        this.tabs = new ResponsiveTabs(['all', 'active', 'completed'])
        this.tabs.onTabChange((tab) => {
            this.filter = tab as 'all' | 'active' | 'completed'
        })
        
        // Create responsive commands
        this.commands = new ResponsiveCommands([
            { key: 'A', label: 'Add', color: Color.Green, minWidth: 6 },
            { key: 'E', label: 'Edit', color: Color.Yellow, minWidth: 7 },
            { key: 'D', label: 'Delete', color: Color.Red, minWidth: 9 },
            { key: 'Space', label: 'Toggle', color: Color.Cyan, minWidth: 12 },
            { key: 'F', label: 'Filter', color: Color.Magenta, minWidth: 9 },
            { key: 'ESC/Q', label: 'Quit', color: Color.BrightBlack, minWidth: 10 }
        ])
    }
    
    setMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout)
        }
        this.message = message
        this.messageTimeout = setTimeout(() => {
            this.message = ''
        }, 3000)
    }
    
    setFilter(filter: 'all' | 'active' | 'completed'): void {
        this.filter = filter
        const index = ['all', 'active', 'completed'].indexOf(filter)
        this.tabs.setActiveTab(index)
    }
    
    render(screen: ScreenManager, region: Region): void {
        // Clear region
        screen.fillRegion(region, ' ')
        
        // Top separator
        screen.write('─'.repeat(region.width), region.x, region.y, color(Color.BrightBlack))
        
        // Calculate space for tabs and commands
        const tabsWidth = Math.floor(region.width * 0.4)
        const commandsWidth = region.width - tabsWidth - 2
        
        // Render tabs on the left
        this.tabs.render(screen, {
            x: region.x + 2,
            y: region.y + 1,
            width: tabsWidth,
            height: 1
        })
        
        // Render commands on the right
        this.commands.render(screen, {
            x: region.x + tabsWidth + 2,
            y: region.y + 1,
            width: commandsWidth,
            height: 1
        })
        
        // Message (if any)
        if (this.message) {
            const msgStyle = color(Color.Green) + ANSI.bold
            const msgX = Math.floor((region.width - this.message.length) / 2)
            screen.write(this.message, region.x + msgX, region.y, msgStyle)
        }
    }
    
    protected override onInput(): boolean {
        return false
    }
}

/**
 * Modern Input Dialog Component
 */
class ModernDialog extends Component {
    private title = ''
    private fields: { label: string; input: TextInput; value: string }[] = []
    private activeFieldIndex = 0
    private onSubmit?: (values: string[]) => void
    private onCancel?: () => void
    private visible = false
    private width = 50
    private height = 10
    
    constructor() {
        super({ borderStyle: 'none' })
        this.isFocusable = true
    }
    
    show(
        title: string, 
        fields: { label: string; placeholder: string; defaultValue?: string }[],
        onSubmit: (values: string[]) => void,
        onCancel?: () => void
    ): void {
        this.title = title
        this.fields = fields.map(f => {
            const input = new TextInput(f.placeholder)
            if (f.defaultValue) {
                input.setValue(f.defaultValue)
            }
            return {
                label: f.label,
                input,
                value: f.defaultValue || ''
            }
        })
        
        this.activeFieldIndex = 0
        this.onSubmit = onSubmit
        this.onCancel = onCancel
        this.visible = true
        this.state.value = true // Mark dialog as visible
        
        // Calculate height based on fields
        this.height = 6 + fields.length * 3
        
        // Focus first field
        if (this.fields.length > 0) {
            this.fields[0].input.onFocus()
        }
    }
    
    hide(): void {
        this.visible = false
        this.state.value = false
        // Blur all fields
        this.fields.forEach(f => f.input.onBlur())
        this.fields = []
    }
    
    render(screen: ScreenManager, region: Region): void {
        if (!this.visible) return
        
        // Center the dialog
        const x = Math.floor((region.width - this.width) / 2)
        const y = Math.floor((region.height - this.height) / 2)
        
        // Draw shadow
        screen.fillRegion({ x: x + 2, y: y + 1, width: this.width, height: this.height }, ' ', color(undefined, BgColor.Black))
        
        // Draw dialog background
        screen.fillRegion({ x, y, width: this.width, height: this.height }, ' ', color(undefined, BgColor.BrightBlack))
        
        // Draw border with rounded corners
        screen.drawBox(x, y, this.width, this.height, 'rounded')
        
        // Title bar
        screen.fillRegion({ x: x + 1, y: y + 1, width: this.width - 2, height: 1 }, ' ', color(undefined, BgColor.Blue))
        const titleX = x + Math.floor((this.width - this.title.length) / 2)
        screen.write(this.title, titleX, y + 1, color(Color.White, BgColor.Blue) + bold(''))
        
        // Render fields
        let fieldY = y + 3
        this.fields.forEach((field, index) => {
            const isActive = index === this.activeFieldIndex
            
            // Label
            screen.write(field.label + ':', x + 3, fieldY, color(Color.Cyan) + ANSI.bold)
            
            // Input field
            const inputY = fieldY + 1
            
            // Mark active field as focused
            if (isActive && this.state.focused) {
                field.input.onFocus()
            } else {
                field.input.onBlur()
            }
            
            // Render input (it will draw its own border)
            field.input.render(screen, { x: x + 3, y: inputY, width: this.width - 6, height: 3 })
            
            // Show focus indicator
            if (isActive) {
                screen.write('>', x + 1, inputY + 1, color(Color.Green) + ANSI.bold)
            }
            
            fieldY += 3
        })
        
        // Bottom buttons
        const buttonY = y + this.height - 2
        const submitText = ' Submit '
        const cancelText = ' Cancel '
        const buttonSpacing = 4
        const totalButtonWidth = submitText.length + cancelText.length + buttonSpacing
        const buttonX = x + Math.floor((this.width - totalButtonWidth) / 2)
        
        // Submit button
        const submitStyle = color(Color.Black, BgColor.Green) + ANSI.bold
        screen.write(submitText, buttonX, buttonY, submitStyle)
        screen.write('[Enter]', buttonX - 7, buttonY, color(Color.Green))
        
        // Cancel button
        const cancelStyle = color(Color.White, BgColor.Red) + ANSI.bold
        screen.write(cancelText, buttonX + submitText.length + buttonSpacing, buttonY, cancelStyle)
        screen.write('[ESC]', buttonX + submitText.length + buttonSpacing + cancelText.length + 1, buttonY, color(Color.Red))
    }
    
    getCursorPosition(): { x: number; y: number } | null {
        if (!this.visible || !this.state.focused || this.fields.length === 0) return null
        
        const activeField = this.fields[this.activeFieldIndex]
        if (activeField && activeField.input) {
            const cursorPos = activeField.input.getCursorPosition()
            if (cursorPos) {
                // Calculate absolute position
                const { width, height } = ScreenManager.getInstance().getDimensions()
                const dialogX = Math.floor((width - this.width) / 2)
                const dialogY = Math.floor((height - this.height) / 2)
                const fieldY = dialogY + 4 + (this.activeFieldIndex * 3)
                
                return {
                    x: dialogX + 4 + cursorPos.x,
                    y: fieldY + cursorPos.y
                }
            }
        }
        
        return null
    }
    
    protected onInput(key: string, keyInfo: any): boolean {
        if (!this.visible || !this.state.focused) return false
        
        // ESC to cancel
        if (keyInfo?.name === 'escape') {
            this.onCancel?.()
            this.hide()
            return true
        }
        
        // Tab to navigate between fields
        if (keyInfo?.name === 'tab') {
            // Blur current field
            if (this.fields[this.activeFieldIndex]) {
                this.fields[this.activeFieldIndex].input.onBlur()
            }
            
            // Move to next/previous field
            if (keyInfo.shift) {
                this.activeFieldIndex = (this.activeFieldIndex - 1 + this.fields.length) % this.fields.length
            } else {
                this.activeFieldIndex = (this.activeFieldIndex + 1) % this.fields.length
            }
            
            // Focus new field
            if (this.fields[this.activeFieldIndex]) {
                this.fields[this.activeFieldIndex].input.onFocus()
            }
            return true
        }
        
        // Enter to submit (when not in a field)
        if (keyInfo?.name === 'return' && keyInfo.ctrl) {
            const values = this.fields.map(f => f.input.getValue() || f.value || '')
            this.onSubmit?.(values)
            this.hide()
            return true
        }
        
        // Pass input to active field
        const activeField = this.fields[this.activeFieldIndex]
        if (activeField && activeField.input) {
            // Special handling for Enter key
            if (keyInfo?.name === 'return') {
                // Get current values
                const values = this.fields.map(f => f.input.getValue() || f.value || '')
                
                // If in last field or only one field, submit
                if (this.activeFieldIndex === this.fields.length - 1) {
                    this.onSubmit?.(values)
                    this.hide()
                    return true
                } else {
                    // Move to next field
                    activeField.input.onBlur()
                    this.activeFieldIndex++
                    this.fields[this.activeFieldIndex].input.onFocus()
                    return true
                }
            }
            
            // Let the field handle the input
            const handled = activeField.input.handleInput(key, keyInfo)
            if (handled) {
                // Update stored value
                activeField.value = activeField.input.getValue() || ''
            }
            return handled
        }
        
        return false
    }
    
    onFocus(): void {
        super.onFocus()
        // Focus the active field
        if (this.fields.length > 0 && this.fields[this.activeFieldIndex]) {
            this.fields[this.activeFieldIndex].input.onFocus()
        }
    }
    
    onBlur(): void {
        super.onBlur()
        // Blur all fields
        this.fields.forEach(f => f.input.onBlur())
    }
    
    getValue(): any {
        return this.visible
    }
}

/**
 * Main Todo Application
 */
class TodoApp {
    private screen: ScreenManager
    private state: AppState
    private dataFile: string
    
    // Components
    private header: HeaderComponent
    private todoList: TodoListComponent
    private statusBar: StatusBarComponent
    private dialog: ModernDialog
    
    constructor() {
        this.screen = ScreenManager.getInstance()
        this.dataFile = path.join(process.cwd(), 'todos.json')
        
        // Initialize state
        this.state = {
            todos: this.loadTodos(),
            filter: 'all',
            view: 'list'
        }
        
        // Create components
        this.header = new HeaderComponent('Task Manager')
        this.todoList = new TodoListComponent()
        this.statusBar = new StatusBarComponent()
        this.dialog = new ModernDialog()
        
        // Setup
        this.setupComponents()
        this.setupEventHandlers()
    }
    
    private loadTodos(): Todo[] {
        try {
            if (fs.existsSync(this.dataFile)) {
                const data = fs.readFileSync(this.dataFile, 'utf8')
                return JSON.parse(data).map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt)
                }))
            }
        } catch (error) {
            // Ignore errors
        }
        
        // Default todos
        return [
            {
                id: '1',
                title: 'Build a modern TUI framework',
                completed: false,
                priority: 'high',
                createdAt: new Date()
            },
            {
                id: '2',
                title: 'Create smooth terminal UX',
                completed: false,
                priority: 'high',
                createdAt: new Date()
            },
            {
                id: '3',
                title: 'Add component system',
                completed: true,
                priority: 'medium',
                createdAt: new Date()
            }
        ]
    }
    
    private saveTodos(): void {
        try {
            fs.writeFileSync(this.dataFile, JSON.stringify(this.state.todos, null, 2))
        } catch (error) {
            this.statusBar.setMessage('Error saving todos', 'error')
        }
    }
    
    private setupComponents(): void {
        const { width, height } = this.screen.getDimensions()
        
        // Register components with regions
        this.screen.registerComponent('header', this.header, {
            x: 0, y: 0, width, height: 2
        })
        
        this.screen.registerComponent('todoList', this.todoList, {
            x: 0, y: 2, width, height: height - 5
        })
        
        this.screen.registerComponent('statusBar', this.statusBar, {
            x: 0, y: height - 3, width, height: 3
        })
        
        this.screen.registerComponent('dialog', this.dialog, {
            x: 0, y: 0, width, height
        })
        
        // Update components with data
        this.updateComponents()
    }
    
    private updateComponents(): void {
        const total = this.state.todos.length
        const completed = this.state.todos.filter(t => t.completed).length
        
        this.header.updateStats(total, completed)
        this.todoList.setTodos(this.state.todos)
        this.todoList.setFilter(this.state.filter)
        this.statusBar.setFilter(this.state.filter)
    }
    
    private setupEventHandlers(): void {
        // Global keyboard shortcuts
        this.screen.on('keypress', (char: string, key: any) => {
            // Check if dialog is visible
            if (this.dialog.getValue()) return
            
            switch (char?.toLowerCase()) {
                case 'q':
                    this.quit()
                    break
                    
                case 'a':
                    this.addTodo()
                    break
                    
                case 'e':
                    this.editTodo()
                    break
                    
                case 'd':
                    this.deleteTodo()
                    break
                    
                case ' ':
                    this.toggleTodo()
                    break
                    
                case 'f':
                    this.cycleFilter()
                    break
            }
        })
        
        // ESC to quit
        this.screen.on('escape', () => {
            if (!this.dialog.getValue()) {
                this.quit()
            }
        })
        
        // Handle resize
        this.screen.on('resize', () => {
            this.setupComponents()
            this.screen.render()
        })
        
        // Handle todo selection
        this.todoList.on('select', () => {
            this.toggleTodo()
        })
    }
    
    private addTodo(): void {
        this.dialog.show(
            'Add New Todo',
            [
                { label: 'Title', placeholder: 'Enter todo title...', defaultValue: '' },
                { label: 'Priority', placeholder: 'low/medium/high', defaultValue: 'medium' }
            ],
            (values) => {
                const [title, priorityStr] = values
                if (title) {
                    const priority = ['low', 'medium', 'high'].includes(priorityStr) 
                        ? priorityStr as 'low' | 'medium' | 'high'
                        : 'medium'
                    
                    const newTodo: Todo = {
                        id: Date.now().toString(),
                        title,
                        completed: false,
                        priority,
                        createdAt: new Date()
                    }
                    this.state.todos.push(newTodo)
                    this.saveTodos()
                    this.updateComponents()
                    this.statusBar.setMessage('✓ Todo added successfully', 'success')
                    this.screen.render()
                }
            },
            () => {
                this.statusBar.setMessage('Cancelled', 'info')
                this.screen.render()
            }
        )
        
        // Focus on dialog
        this.screen.focusComponent('dialog')
        this.screen.render()
    }
    
    private editTodo(): void {
        const selected = this.todoList.getSelectedTodo()
        if (selected) {
            this.dialog.show(
                'Edit Todo',
                [
                    { label: 'Title', placeholder: 'Enter todo title...', defaultValue: selected.title },
                    { label: 'Priority', placeholder: 'low/medium/high', defaultValue: selected.priority }
                ],
                (values) => {
                    const [title, priorityStr] = values
                    if (title) {
                        selected.title = title
                        selected.priority = ['low', 'medium', 'high'].includes(priorityStr) 
                            ? priorityStr as 'low' | 'medium' | 'high'
                            : selected.priority
                        
                        this.saveTodos()
                        this.updateComponents()
                        this.statusBar.setMessage('✓ Todo updated', 'success')
                        this.screen.render()
                    }
                },
                () => {
                    this.statusBar.setMessage('Cancelled', 'info')
                    this.screen.render()
                }
            )
            
            this.screen.focusComponent('dialog')
            this.screen.render()
        }
    }
    
    private deleteTodo(): void {
        const selected = this.todoList.getSelectedTodo()
        if (selected) {
            const index = this.state.todos.findIndex(t => t.id === selected.id)
            if (index > -1) {
                this.state.todos.splice(index, 1)
                this.saveTodos()
                this.updateComponents()
                this.statusBar.setMessage('✓ Todo deleted', 'success')
                this.screen.render()
            }
        }
    }
    
    private toggleTodo(): void {
        const selected = this.todoList.getSelectedTodo()
        if (selected) {
            selected.completed = !selected.completed
            this.saveTodos()
            this.updateComponents()
            this.statusBar.setMessage(
                selected.completed ? '✓ Marked as completed' : '✓ Marked as active',
                'success'
            )
            this.screen.render()
        }
    }
    
    private cycleFilter(): void {
        const filters: ('all' | 'active' | 'completed')[] = ['all', 'active', 'completed']
        const currentIndex = filters.indexOf(this.state.filter)
        this.state.filter = filters[(currentIndex + 1) % filters.length]
        this.updateComponents()
        this.statusBar.setMessage(`Filter: ${this.state.filter}`, 'info')
        this.screen.render()
    }
    
    private quit(): void {
        this.screen.cleanup()
        console.log('\nGoodbye!')
        process.exit(0)
    }
    
    run(): void {
        // Enter fullscreen mode
        this.screen.enterAlternateScreen()
        
        // Enable mouse support
        this.screen.enableMouse()
        
        // Set cursor visible for input
        this.screen.setCursorVisible(true)
        
        // Initial render
        this.screen.render()
        
        // Focus on the todo list
        this.screen.focusComponent('todoList')
    }
}

// Run the app
const app = new TodoApp()
app.run()

// Handle graceful shutdown
process.on('SIGINT', () => {
    ScreenManager.getInstance().cleanup()
    process.exit(0)
})