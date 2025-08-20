#!/usr/bin/env tsx

/**
 * Todo App - Sử dụng pure TUI framework
 * Framework chỉ cung cấp nền tảng, app tự do thiết kế
 */

import { App } from '../../src/core/App'
import { 
  DockLayout, 
  TodoHeader, 
  TodoInput, 
  TodoList, 
  FilterBar, 
  StackLayout 
} from './app-components'

// App tự tạo global state - framework không biết gì về này
;(global as any).$store = {
  state: {
    todos: [
      { id: 1, text: 'Learn TUI Framework', completed: false },
      { id: 2, text: 'Build Todo App', completed: true },
      { id: 3, text: 'Add Interactive Features', completed: false }
    ],
    filter: 'all'
  },
  
  commit(mutation: string, payload?: any) {
    switch (mutation) {
      case 'ADD_TODO':
        const newId = Math.max(0, ...this.state.todos.map((t: any) => t.id)) + 1
        this.state.todos.push({ id: newId, text: payload, completed: false })
        break
      case 'TOGGLE_TODO':
        // Toggle first todo for demo
        if (this.state.todos.length > 0) {
          this.state.todos[0].completed = !this.state.todos[0].completed
        }
        break
      case 'SET_FILTER':
        this.state.filter = payload
        break
    }
  }
}

/**
 * App tự do thiết kế layout theo ý thích
 * Framework không force bất kỳ structure nào
 */
function createTodoApp(): App {
  const app = new App()
  
  // 1. Tạo layout root - app tự quyết định dùng dock layout
  const root = new DockLayout({ 
    top: 'header',
    center: 'main-content', 
    bottom: 'filter-bar',
    topHeight: 3,
    bottomHeight: 2
  })
  
  // 2. Header với blue background - app styling
  const header = new TodoHeader({ 
    id: 'header',
    title: 'Todo App'
  })
  
  // 3. Main content với stack layout - app tự thiết kế
  const mainContent = new StackLayout({ id: 'main-content' })
  
  const todoInput = new TodoInput({ 
    id: 'todo-input',
    placeholder: 'What needs to be done?'
  })
  
  const todoList = new TodoList({ 
    id: 'todo-list'
  })
  
  mainContent.addChild(todoInput)
  mainContent.addChild(todoList)
  
  // 4. Filter bar với gray background - app styling  
  const filterBar = new FilterBar({ id: 'filter-bar' })
  
  // 5. Assemble component tree - app tự do tổ chức
  root.addChild(header)
  root.addChild(mainContent)
  root.addChild(filterBar)
  
  // 6. Business logic - chỉ có logic thuần túy
  todoInput.on('submit', (text: string) => {
    ;(global as any).$store.commit('ADD_TODO', text)
    app.render() // Re-render sau khi state thay đổi
  })
  
  todoList.on('toggle-todo', () => {
    ;(global as any).$store.commit('TOGGLE_TODO')
    app.render()
  })
  
  filterBar.children.forEach(button => {
    button.on('click', (filter: string) => {
      ;(global as any).$store.commit('SET_FILTER', filter)
      app.render()
    })
  })
  
  // 7. Global app events
  app.on('keypress', (char: string, key: any) => {
    if (char === 'q' || key?.name === 'escape') {
      app.stop()
      process.exit(0)
    }
  })
  
  app.setRootComponent(root)
  return app
}

/**
 * Khởi chạy app
 */
async function main() {
  
  const app = createTodoApp()
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    app.stop()
    process.exit(0)
  })
  
  await app.start()
}

main().catch(() => {})