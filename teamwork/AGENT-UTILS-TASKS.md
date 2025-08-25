# 🔧 AGENT-UTILS: Utilities & Services

**Agent Assignment**: Utilities, Services & Helper Functions Testing  
**Mission**: Achieve 100% test coverage for all utility functions and services  
**Status**: READY TO START  

## 🎯 UTILITIES RESPONSIBILITIES

You are responsible for **foundation utilities** that power the entire framework. These pure functions and services are used everywhere and must be rock-solid reliable.

## 📂 FILES TO TEST (Priority Order)

### Priority 1: Fix Failing Color Tests (CRITICAL)
```
src/utils/colors/ - Currently 89% coverage, FAILING TESTS
├── color.ts              (Named color support - FAILING)
├── rgb.ts                (RGB color functions - FAILING)  
├── hex.ts                (Hex color functions - FAILING)
├── bgRgb.ts              (Background RGB - working)
├── bgHex.ts              (Background hex - working)
├── reset.ts              (Reset colors - working)
├── index.ts              (Color exports - working)
└── types.ts              (Color types - working)
```

**Current Failures**:
- RGB values not clamped (300, -10 should become 255, 0)
- Decimal RGB values not rounded
- 3-digit hex codes not expanded properly  
- Invalid hex codes not defaulting to black
- Named colors returning empty strings instead of ANSI codes

### Priority 2: Complete Style Functions  
```
src/utils/styles/ - Currently 65% coverage
├── style.ts              (Style combinations - 33% coverage)
├── blink.ts              (Blink style - 50% coverage)
├── bold.ts               (Bold style - 50% coverage)
├── dim.ts                (Dim style - 50% coverage) 
├── italic.ts             (Italic style - 50% coverage)
├── reverse.ts            (Reverse style - 50% coverage)
├── strikethrough.ts      (Strikethrough - 50% coverage)
├── underline.ts          (Underline - 50% coverage)
├── hidden.ts             (Hidden text - 50% coverage)
├── centerText.ts         (Text centering - 20% coverage)
├── truncate.ts           (Text truncation - 25% coverage)
├── drawBox.ts            (Box drawing - 16% coverage)
├── boxStyles.ts          (Box styles - 100% ✓)
└── types.ts              (Style types - 100% ✓)
```

### Priority 3: Zero Coverage Utilities (CRITICAL)
```
src/utils/platform.ts    - 0% COVERAGE - Platform detection functions
src/utils/services.ts     - 0% COVERAGE - Service management system
```

### Priority 4: State Management System
```
src/core/StateManager/ - Complex state system
├── Store.ts              (Main store container)
├── constructor.ts        (Store initialization)
├── state.ts              (State management)
├── mutations.ts          (State mutations)
├── actions.ts            (Async actions)
├── getters.ts            (Computed values)
├── gettersGet.ts         (Getter retrieval)
├── watch.ts              (State watching)
├── watchers.ts           (Watcher management)
├── reactive.ts           (Reactive system)
├── subscribe.ts          (Store subscription)
├── subscribeAction.ts    (Action subscription)
├── dispatch.ts           (Action dispatch)
├── commit.ts             (Mutation commit)
├── snapshot.ts           (State snapshots)
├── restore.ts            (State restoration)
├── replaceState.ts       (State replacement)
├── trackChange.ts        (Change tracking)
├── trackDependency.ts    (Dependency tracking)
├── triggerWatchers.ts    (Watcher triggers)
├── timeTravel.ts         (Time travel debugging)
├── getHistory.ts         (History retrieval)
├── clearHistory.ts       (History clearing)
└── registerModule.ts     (Module registration)
```

### Priority 5: Store Management
```
src/core/StoreManager/ - Store management system  
├── StoreManager.ts       (Container - store management)
├── constructor.ts        (Manager initialization)
├── createStore.ts        (Store creation)
├── getStore.ts           (Store retrieval)
├── get.ts                (Value getting)
├── set.ts                (Value setting)
├── destroy.ts            (Store cleanup)
├── getState.ts           (State access)
├── initializeState.ts    (State initialization)
├── registerGlobalStore.ts (Global store)
├── subscribe.ts          (Store subscription)
├── mutations.ts          (Mutation management)
├── actions.ts            (Action management)
└── getters.ts            (Getter management)
```

### Priority 6: Theme System
```
src/core/Theme/ - Theming system
├── ThemeManager.ts       (Container - theme management)
├── themes.ts             (Theme definitions)
├── colorPalettes.ts      (Color palettes)
├── borderStyles.ts       (Border styling)
├── spacing.ts            (Spacing definitions)
└── index.ts              (Theme exports)
```

## 🧪 TESTING STRATEGY

### 1. Fix Failing Color Tests FIRST
```javascript
// Current failing test pattern (NEEDS FIXING):
describe('RGB Colors', () => {
  it('should clamp RGB values', () => {
    const result = rgb(300, -10, 128);
    // FAILING: expects '\x1b[38;2;255;0;128m'
    // GETTING: '\x1b[38;2;300;-10;128m'
    expect(result).toBe('\x1b[38;2;255;0;128m');
  });
});

// SOLUTION NEEDED: Fix rgb.ts to clamp values 0-255
```

### 2. Pure Function Testing Pattern
```javascript
// Utility functions are pure - easy to test
describe('UtilityFunction', () => {
  test('should return expected output for given input', () => {
    const result = utilityFunction(input);
    expect(result).toBe(expectedOutput);
  });
  
  test('should handle edge cases', () => {
    expect(utilityFunction(null)).toBe(defaultValue);
    expect(utilityFunction(undefined)).toBe(defaultValue);
    expect(utilityFunction('')).toBe(emptyResult);
  });
});
```

### 3. Service Testing Pattern
```javascript
// Services often use singleton pattern
describe('ServiceName', () => {
  beforeEach(() => {
    // Reset singleton state between tests
    ServiceName.getInstance().reset();
  });
  
  test('should provide singleton instance', () => {
    const instance1 = ServiceName.getInstance();
    const instance2 = ServiceName.getInstance();
    expect(instance1).toBe(instance2);
  });
});
```

### 4. State Management Testing
```javascript
// State management needs careful testing
describe('Store', () => {
  let store;
  
  beforeEach(() => {
    store = new Store({
      state: { count: 0 },
      mutations: {
        increment: (state) => state.count++
      }
    });
  });
  
  test('should handle mutations', () => {
    store.commit('increment');
    expect(store.state.count).toBe(1);
  });
});
```

## 📋 SPECIFIC TASKS

### Task 1: Fix Color System (Day 1 - CRITICAL)
- [ ] **FIX** `rgb.ts` - add value clamping (0-255)
- [ ] **FIX** `rgb.ts` - round decimal values  
- [ ] **FIX** `hex.ts` - proper 3-digit hex expansion
- [ ] **FIX** `hex.ts` - invalid hex defaults to black
- [ ] **FIX** `color.ts` - implement named color mapping
- [ ] **VERIFY** all color tests pass
- [ ] **ACHIEVE** 100% color coverage

### Task 2: Complete Style System (Day 1-2)
- [ ] Test all style functions individually
- [ ] Test style combination logic
- [ ] Test `centerText.ts` - text centering algorithm
- [ ] Test `truncate.ts` - text truncation logic  
- [ ] Test `drawBox.ts` - box drawing functions
- [ ] Create comprehensive style integration tests
- [ ] Achieve 100% style coverage

### Task 3: Platform & Services (Day 2-3)
- [ ] **CREATE** comprehensive `platform.ts` tests
  - [ ] Operating system detection
  - [ ] Terminal capability detection
  - [ ] Environment variable handling
- [ ] **CREATE** comprehensive `services.ts` tests  
  - [ ] Service registration/discovery
  - [ ] Service lifecycle management
  - [ ] Dependency injection system
- [ ] Achieve 100% platform/services coverage

### Task 4: State Management (Day 3-4)
- [ ] Test `Store.ts` container class delegation
- [ ] Test all state management method files
- [ ] Test reactive state updates
- [ ] Test mutation and action systems
- [ ] Test state watching and subscriptions
- [ ] Test time travel debugging
- [ ] Test snapshot and restore functionality
- [ ] Achieve 100% StateManager coverage

### Task 5: Store Management (Day 4-5)
- [ ] Test `StoreManager.ts` singleton pattern
- [ ] Test store creation and cleanup
- [ ] Test global store registration
- [ ] Test store value getting/setting
- [ ] Test store subscription system
- [ ] Integration with StateManager
- [ ] Achieve 100% StoreManager coverage

### Task 6: Theme System (Day 5)
- [ ] Test `ThemeManager.ts` container
- [ ] Test theme switching and application
- [ ] Test color palette system
- [ ] Test border and spacing systems
- [ ] Test theme inheritance and overrides
- [ ] Achieve 100% Theme coverage

## 📊 SUCCESS CRITERIA

### Coverage Targets:
- **Color Functions**: 89% → 100% (fix failing tests)
- **Style Functions**: 65% → 100% 
- **Platform Utils**: 0% → 100% (critical)
- **Services**: 0% → 100% (critical)
- **State Management**: 0% → 100%
- **Store Management**: 0% → 100%
- **Theme System**: 0% → 100%

### Quality Gates:
- [ ] All failing color tests are fixed and green
- [ ] All utility functions have comprehensive tests
- [ ] Service singletons properly tested
- [ ] State management thoroughly covered
- [ ] Edge cases and error conditions tested
- [ ] Zero TypeScript errors
- [ ] All tests are green and stable

## 🤝 COORDINATION POINTS

### Provide to Other Agents:
- **Fixed color functions** → Agent-Components needs for UI styling
- **Platform detection** → Agent-Core needs for terminal operations
- **Service patterns** → All agents need service testing patterns
- **State management** → Agent-Integration needs for complex workflows

### Use from Agent-Core:
- **Base testing patterns** → For consistent testing approach
- **Mock utilities** → For process and environment mocking

### Coordinate with Agent-Components:
- **Style functions** → Components need styles for theming
- **Color functions** → Components need colors for appearance

## 🚨 CRITICAL FIXES NEEDED

### Failing Color Tests (MUST FIX FIRST):
1. **RGB Clamping**: Values > 255 or < 0 must be clamped
2. **RGB Rounding**: Decimal values must be rounded to integers
3. **Hex Expansion**: 3-digit hex (#F00) → 6-digit (#FF0000)
4. **Hex Validation**: Invalid hex → default to black (#000000)
5. **Named Colors**: Empty strings → proper ANSI codes

### Example Fix for `rgb.ts`:
```javascript
// BROKEN:
export function rgb(r: number, g: number, b: number): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

// FIXED:
export function rgb(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return `\x1b[38;2;${clamp(r)};${clamp(g)};${clamp(b)}m`;
}
```

## 📝 PROGRESS TRACKING

Update daily in your individual agent file:

```markdown
## Daily Progress - Agent-Utils

### Day 1: [Date]
- ✅ Fixed ALL failing color tests 
- ✅ RGB clamping and rounding implemented
- ✅ Hex validation and expansion fixed
- 🔄 Color coverage: 100% (was 89%)

### Day 2: [Date]
- ✅ Completed all style functions
- ✅ Started platform detection tests  
- 📋 Next: Services system testing
- 🔄 Utils coverage: 67%
```

## 🎯 FINAL DELIVERABLES

When Agent-Utils work is complete:
- [ ] 100% test coverage for all utility modules
- [ ] ALL failing tests fixed and green
- [ ] Comprehensive service testing patterns
- [ ] State management test examples
- [ ] Utility test library for other agents
- [ ] Zero critical utility bugs

**Your success provides the rock-solid foundation every other part of the framework depends on! 🔧⚡**