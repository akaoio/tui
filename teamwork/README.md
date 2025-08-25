# Teamwork Directory

Tất cả agents phải co-op qua thư mục này theo nguyên tắc CLAUDE.md.

## 🎯 ACTIVE MISSION: 100% TEST COVERAGE

**Mission Status**: COORDINATED TEAM EFFORT LAUNCHED  
**Target**: Achieve 100% test coverage for @akaoio/tui framework  
**Current Status**: 22 failed suites, 4 passing | 52 failed tests, 80 passing | ~20% coverage  

## 🧑‍💻 ACTIVE AGENT ASSIGNMENTS

### 📱 Agent-Core: Infrastructure & Core Systems
- **File**: `AGENT-CORE-TASKS.md`
- **Focus**: Screen, ScreenManager, App, Component foundation
- **Status**: READY TO START
- **Dependencies**: None (starts first)

### 🎨 Agent-Components: UI Components & Interactions  
- **File**: `AGENT-COMPONENTS-TASKS.md`
- **Focus**: Input, Select, Form, Checkbox, Radio, ProgressBar, Spinner
- **Status**: READY TO START  
- **Dependencies**: Screen mocks from Agent-Core

### 🔧 Agent-Utils: Utilities & Services
- **File**: `AGENT-UTILS-TASKS.md`  
- **Focus**: Fix failing colors/styles, platform, services, state management
- **Status**: READY TO START
- **Dependencies**: None (pure functions)

### 🔄 Agent-Integration: Integration & End-to-End
- **File**: `AGENT-INTEGRATION-TASKS.md`
- **Focus**: Schema system, layout engine, example applications
- **Status**: WAITING FOR DEPENDENCIES
- **Dependencies**: ALL other agents

## 📂 MISSION COORDINATION FILES

- **`TEAM-MISSION-100-COVERAGE.md`** - Mission overview and strategy
- **`SHARED-COORDINATION.md`** - Inter-agent communication hub
- **Individual agent task files** - Specific assignments and progress

## 🎪 MISSION EXECUTION PLAN

### Phase 1: Foundation (Days 1-2)
- Agent-Core & Agent-Utils start parallel work
- Agent-Components waits for Screen mocks

### Phase 2: Core Systems (Days 3-4)  
- All agents working in parallel
- Shared mocks and patterns established

### Phase 3: Integration (Days 5-7)
- Agent-Integration starts with dependencies ready
- Full integration testing and E2E validation

## 🚀 SUCCESS CRITERIA

- **0 Failing Test Suites** (currently 22 failing)
- **0 Failing Tests** (currently 52 failing)  
- **100% Statement Coverage** (currently ~20%)
- **All example applications working**
- **Framework remains fully functional**

---

**Previous Work**:
- ✓ Framework refactored to Class = Directory + Method-per-file pattern
- ✓ TypeScript errors fixed (191 → 0)
- ✓ Build successful (CJS, ESM, DTS)
- ✓ Architecture violations addressed

**Current Challenge**: Test coverage for new architecture pattern