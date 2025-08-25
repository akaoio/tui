# 📱 AGENT-CORE: Infrastructure & Core Systems

**Agent Assignment**: Core Infrastructure Testing  
**Mission**: Achieve 100% test coverage for core TUI infrastructure  
**Status**: READY TO START  

## 🎯 CORE RESPONSIBILITIES

You are responsible for the **foundation** of the TUI framework. Your tests will be used by all other agents, so quality and patterns are critical.

## 📂 FILES TO TEST (Priority Order)

### Priority 1: Screen & ScreenManager (CRITICAL)
```
src/core/Screen/
├── Screen.ts              (Container class - test delegation)
├── constructor.ts         (Screen initialization)
├── write.ts              (Text output - CRITICAL)
├── writeAt.ts            (Positioned output)
├── writeLine.ts          (Line output)
├── clear.ts              (Screen clearing)
├── clearLine.ts          (Line clearing)
├── moveCursor.ts         (Cursor positioning)
├── getWidth.ts           (Dimension - mock needed)
├── getHeight.ts          (Dimension - mock needed)
├── showCursor.ts         (Cursor visibility)
├── hideCursor.ts         (Cursor visibility)
└── [15+ more methods]
```

```
src/core/ScreenManager/
├── ScreenManager.ts       (Container class - singleton pattern)
├── constructor.ts         (Singleton initialization)
├── getInstance.ts         (Singleton access - CRITICAL)
├── write.ts              (Write operations)
├── clear.ts              (Clear operations)
├── flush.ts              (Buffer management)
├── setupTerminal.ts      (Terminal setup)
├── handleResize.ts       (Resize handling)
├── parseKey.ts           (Key parsing)
└── [15+ more methods]
```

### Priority 2: Core Infrastructure
```
src/core/App/
├── App.ts                (Container class - app lifecycle)
├── constructor.ts        (App initialization)
├── start.ts              (App startup - CRITICAL)
├── stop.ts               (App cleanup - CRITICAL)
├── render.ts             (Main render loop)
├── setRootComponent.ts   (Component tree)
└── [8+ more methods]

src/core/Component/
├── Component.ts          (Base component container)
├── constructor.ts        (Component initialization)
├── addChild.ts           (Child management)
├── removeChild.ts        (Child management)
├── findById.ts           (Component search)
└── [8+ more methods]
```

### Priority 3: Component Registry & Event Bus
```
src/core/ComponentRegistry/
├── ComponentRegistry.ts   (Container - component tracking)
├── register.ts           (Component registration)
├── unregister.ts         (Component cleanup)
├── find.ts               (Component lookup)
├── mount.ts              (Component mounting)
├── unmount.ts            (Component unmounting)
└── [15+ more methods]

src/core/EventBus/
├── EventBus.ts           (Container - event system)
├── emit.ts               (Event emission - CRITICAL)
├── subscribe.ts          (Event subscription)
├── removeHandler.ts      (Cleanup)
└── [10+ more methods]
```

### Priority 4: Main TUI Class
```
src/TUI.ts                (Main framework entry point)
```

## 🧪 TESTING STRATEGY

### 1. Mock Strategy (CREATE FIRST)
Create shared mocks that other agents will use:

```javascript
// tests/mocks/screen.ts
export const createMockScreen = () => ({
  width: 80,
  height: 24,
  write: jest.fn(),
  writeAt: jest.fn(),
  writeLine: jest.fn(),
  clear: jest.fn(),
  clearLine: jest.fn(),
  moveCursor: jest.fn(),
  getWidth: jest.fn(() => 80),
  getHeight: jest.fn(() => 24),
  showCursor: jest.fn(),
  hideCursor: jest.fn(),
  saveCursor: jest.fn(),
  restoreCursor: jest.fn()
});

// tests/mocks/process.ts  
export const createMockProcess = () => ({
  stdout: {
    write: jest.fn(),
    columns: 80,
    rows: 24,
    isTTY: true
  },
  stdin: {
    setRawMode: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  }
});
```

### 2. Container Class Testing Pattern
Test that containers properly delegate to method files:

```javascript
// Example: tests/core/Screen.test.ts
describe('Screen Container', () => {
  test('should delegate write to write method file', () => {
    const screen = new Screen();
    const spy = jest.spyOn(writeMethod, 'write');
    
    screen.write('test');
    
    expect(spy).toHaveBeenCalledWith('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Method File Testing Pattern  
Test individual method files with proper context mocking:

```javascript
// Example: tests/core/Screen/write.test.ts
describe('Screen write method', () => {
  let mockContext;
  
  beforeEach(() => {
    mockContext = {
      output: process.stdout,
      buffer: '',
      addToBuffer: jest.fn(),
      flushBuffer: jest.fn()
    };
  });
  
  test('should write text to output', () => {
    write.call(mockContext, 'Hello World');
    
    expect(mockContext.addToBuffer).toHaveBeenCalledWith('Hello World');
  });
});
```

### 4. Integration Testing
Test how core components work together:

```javascript
// tests/core/integration.test.ts
describe('Core Integration', () => {
  test('App should coordinate Screen and ComponentRegistry', () => {
    const app = new App();
    const mockComponent = createMockComponent();
    
    app.setRootComponent(mockComponent);
    app.start();
    
    // Verify Screen is used for rendering
    // Verify ComponentRegistry tracks component
    // Verify proper initialization flow
  });
});
```

## 📋 SPECIFIC TASKS

### Task 1: Setup Shared Infrastructure (Day 1)
- [ ] Create `/tests/mocks/` directory
- [ ] Create `screen.ts` mock factory
- [ ] Create `process.ts` mock factory  
- [ ] Create `component.ts` mock factory
- [ ] Test mock factories work correctly

### Task 2: Screen System Testing (Day 1-2)
- [ ] Test `Screen.ts` container class delegation
- [ ] Test all Screen method files individually
- [ ] Create comprehensive Screen integration test
- [ ] Verify Screen mocks work for other agents
- [ ] Achieve 100% Screen coverage

### Task 3: ScreenManager System (Day 2-3)
- [ ] Test `ScreenManager.ts` singleton pattern
- [ ] Test ScreenManager method files
- [ ] Test terminal setup and cleanup
- [ ] Test resize and input handling
- [ ] Integration with Screen class

### Task 4: App & Component Foundation (Day 3-4)  
- [ ] Test `App.ts` container and lifecycle
- [ ] Test `Component.ts` base functionality
- [ ] Test component tree management
- [ ] Test app startup and shutdown
- [ ] Integration between App and Screen

### Task 5: Registry & Event System (Day 4-5)
- [ ] Test `ComponentRegistry.ts` singleton
- [ ] Test component lifecycle management
- [ ] Test `EventBus.ts` event system
- [ ] Test event emission and subscription
- [ ] Integration with component system

### Task 6: Main TUI Class (Day 5)
- [ ] Test `TUI.ts` main class
- [ ] Test framework initialization
- [ ] Integration with all core systems
- [ ] End-to-end framework testing

## 📊 SUCCESS CRITERIA

### Coverage Targets:
- **Screen System**: 100% coverage
- **ScreenManager**: 100% coverage  
- **App/Component**: 100% coverage
- **ComponentRegistry**: 100% coverage
- **EventBus**: 100% coverage
- **TUI Main**: 100% coverage

### Quality Gates:
- [ ] All core container classes pass delegation tests
- [ ] All method files have individual tests
- [ ] Integration tests verify system coordination
- [ ] Shared mocks enable other agents' work
- [ ] Zero TypeScript errors
- [ ] All tests are green

## 🤝 COORDINATION POINTS

### Provide to Other Agents:
- **Screen mocks** → Agent-Components needs for UI rendering
- **Process mocks** → Agent-Utils needs for platform testing
- **ComponentRegistry patterns** → Agent-Integration needs for schemas
- **Base test setup** → All agents need terminal operation testing

### Receive from Other Agents:
- **Component mocks** ← Agent-Components will create UI component mocks
- **Utility functions** ← Agent-Utils will create helper testing functions
- **Integration patterns** ← Agent-Integration will create end-to-end examples

## 📝 PROGRESS TRACKING

Update daily in your individual agent file:

```markdown
## Daily Progress - Agent-Core

### Day 1: [Date]
- ✅ Created shared mock infrastructure
- ✅ Tested Screen container class delegation
- ⏳ Working on Screen method file tests
- 🔄 Screen coverage: 45%

### Day 2: [Date]  
- ✅ Completed all Screen method tests
- ✅ Started ScreenManager singleton testing
- 📋 Next: ScreenManager method files
- 🔄 Core coverage: 62%
```

## 🚨 CRITICAL NOTES

### Technical Constraints:
- **Singleton Testing**: ScreenManager and ComponentRegistry are singletons - reset between tests
- **Process Mocking**: Terminal operations need careful process.stdout mocking
- **Async Operations**: Some screen operations may be async - use proper async testing
- **Buffer Management**: Screen uses internal buffers - test buffer state correctly

### Common Pitfalls:
- Don't forget to reset singletons between tests
- Mock process.stdout consistently across tests
- Test both success and error paths
- Include edge cases (empty strings, null values)
- Test cleanup and disposal properly

## 🎯 FINAL DELIVERABLES

When Agent-Core work is complete:
- [ ] 100% test coverage for all core infrastructure
- [ ] Comprehensive shared mock library
- [ ] Integration test examples
- [ ] Documentation of testing patterns
- [ ] All core tests are green and stable

**Your success enables all other agents to succeed. The foundation you build determines the success of the entire mission! 🚀**