# Visual Testing System for TUI Framework

## Vấn đề: Agents không thể "nhìn thấy" TUI output thực tế

**Thách thức**: 
- Agents không có cơ thể vật lý
- Không thể nhìn thấy màn hình terminal thực tế
- Không biết TUI hiển thị như thế nào với user

**Giải pháp**: Visual Testing System với:
1. **Screenshot captures** - Lưu hình ảnh terminal output
2. **Multi-size testing** - Test trên nhiều kích cỡ terminal
3. **Visual regression** - So sánh thay đổi hình ảnh
4. **Agent-readable output** - Chuyển đổi sang text mô tả

## Architecture

### 1. Terminal Screenshot System
```
tests/visual/
├── captures/           # Captured terminal screenshots
├── baselines/          # Expected output baselines  
├── diffs/             # Visual difference images
├── reports/           # Agent-readable reports
└── runners/           # Test execution scripts
```

### 2. Testing Flow
1. **Run TUI component** in virtual terminal
2. **Capture screenshot** của terminal output
3. **Convert to text description** for agents
4. **Compare with baseline** images
5. **Generate report** agents có thể đọc

### 3. Multi-Terminal Testing
- **Small**: 80x24 (standard)
- **Medium**: 120x30 (common)
- **Large**: 200x50 (wide screens)
- **Mobile**: 40x20 (narrow terminals)

## Implementation Plan

### Phase 1: Basic Screenshot System
- Virtual terminal environment
- Screenshot capture functionality
- Text-based output description

### Phase 2: Visual Comparison
- Baseline image management
- Pixel-perfect comparison
- Difference highlighting

### Phase 3: Agent Integration  
- Readable test reports
- Automatic failure descriptions
- Visual regression alerts

## Benefits for Agents

1. **"See" actual TUI output** through descriptions
2. **Understand layout issues** from reports
3. **Detect visual regressions** automatically
4. **Test responsive behavior** across sizes
5. **Validate user experience** objectively