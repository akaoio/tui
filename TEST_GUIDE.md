# 📋 HƯỚNG DẪN TEST TODO APP

## 1. Test SimpleTodo (App đơn giản)

### Chạy app:
```bash
cd /home/x/Projects/tui
npx tsx examples/todos/SimpleTodo.ts
```

### Các lệnh để test:

| Phím | Chức năng | Test case |
|------|-----------|-----------|
| `a` | Add todo | Thêm todo mới |
| `t` | Toggle | Đánh dấu hoàn thành/chưa hoàn thành |
| `d` | Delete | Xóa todo |
| `c` | Clear done | Xóa tất cả todo đã hoàn thành |
| `q` | Quit | Thoát app |

### Kịch bản test:

```bash
# Test 1: Thêm todo
1. Nhấn 'a'
2. Nhập: "Test todo mới"
3. Enter
→ Kiểm tra: Todo mới xuất hiện trong danh sách

# Test 2: Toggle todo
1. Nhấn 't'  
2. Chọn số todo (ví dụ: 1)
3. Enter
→ Kiểm tra: ☐ chuyển thành ✅

# Test 3: Xóa todo
1. Nhấn 'd'
2. Chọn số todo muốn xóa
3. Xác nhận 'y'
→ Kiểm tra: Todo biến mất khỏi danh sách

# Test 4: Clear completed
1. Nhấn 'c'
→ Kiểm tra: Tất cả todo ✅ bị xóa
```

## 2. Test TodoApp (App phức tạp)

### Chạy app:
```bash
npx tsx examples/todos/TodoApp.ts
```

### Các tính năng nâng cao:

| Phím | Chức năng | Mô tả |
|------|-----------|-------|
| `a` | Add | Thêm todo với priority, category, due date |
| `e` | Edit | Sửa todo |
| `d` | Delete | Xóa todo |
| `Space` | Toggle | Đánh dấu hoàn thành |
| `f` | Filter | Lọc: all/active/completed |
| `t` | Theme | Đổi theme |
| `1-9` | Select | Chọn todo để xem chi tiết |
| `q` | Quit | Thoát |

### Kịch bản test nâng cao:

```bash
# Test 1: Thêm todo đầy đủ thông tin
1. Nhấn 'a'
2. Title: "Hoàn thành dự án"
3. Description: "Viết code và test"
4. Category: "Work"
5. Priority: chọn 'high'
6. Due date: 2024-12-31
→ Kiểm tra: Todo hiển thị với 🔴 (high priority)

# Test 2: Filter
1. Nhấn 'f' nhiều lần
→ Kiểm tra: Chuyển qua all → active → completed

# Test 3: Theme
1. Nhấn 't' nhiều lần
→ Kiểm tra: Màu sắc và border thay đổi

# Test 4: Xem chi tiết
1. Nhấn số (1-5)
→ Kiểm tra: Hiển thị detail view
2. Nhấn ESC để quay lại
```

## 3. Test tự động

### Chạy test hệ thống:
```bash
# Test toàn bộ systems
npx tsx test/test-systems.ts

# Validate tất cả components
npx tsx test/validate-all.ts
```

## 4. Test thủ công từng component

### Test Input:
```bash
# Tạo file test-input.ts
cat > test-input.ts << 'EOF'
import { TUI } from './src/TUI'

async function test() {
    const ui = new TUI()
    const name = await ui.prompt('Nhập tên của bạn')
    console.log('Bạn đã nhập:', name)
    ui.close()
}
test()
EOF

npx tsx test-input.ts
```

### Test Select:
```bash
# Tạo file test-select.ts
cat > test-select.ts << 'EOF'
import { TUI } from './src/TUI'

async function test() {
    const ui = new TUI()
    const choice = await ui.select('Chọn màu', ['Đỏ', 'Xanh', 'Vàng'])
    console.log('Bạn chọn:', choice)
    ui.close()
}
test()
EOF

npx tsx test-select.ts
```

### Test Confirm:
```bash
# Tạo file test-confirm.ts
cat > test-confirm.ts << 'EOF'
import { TUI } from './src/TUI'

async function test() {
    const ui = new TUI()
    const ok = await ui.confirm('Bạn có chắc chắn?')
    console.log('Kết quả:', ok ? 'Đồng ý' : 'Từ chối')
    ui.close()
}
test()
EOF

npx tsx test-confirm.ts
```

## 5. Test stress (kiểm tra hiệu năng)

### Test với nhiều todo:
```bash
# Tạo file stress-test.ts
cat > stress-test.ts << 'EOF'
import { TUI } from './src/TUI'

async function stressTest() {
    const ui = new TUI({ title: 'Stress Test' })
    
    // Test hiển thị nhiều items
    console.log('Testing with 100 items...')
    for(let i = 1; i <= 100; i++) {
        ui.showInfo(`Item ${i}: Processing...`)
    }
    
    // Test spinner
    const spinner = ui.createSpinner('Loading 1000 items...')
    spinner.start()
    
    setTimeout(() => {
        spinner.stop('✅ Complete!')
        ui.showSuccess('Stress test passed!')
        ui.close()
    }, 3000)
}

stressTest()
EOF

npx tsx stress-test.ts
```

## 6. Test responsive

### Test thay đổi kích thước terminal:
```bash
# Chạy app
npx tsx examples/todos/TodoApp.ts

# Trong khi app đang chạy:
1. Thu nhỏ terminal window
2. Phóng to terminal window
→ Kiểm tra: Layout tự điều chỉnh
```

## 7. Test themes

### Test từng theme:
```bash
# Tạo file test-themes.ts
cat > test-themes.ts << 'EOF'
import { TUI } from './src/TUI'
import { ThemeManager } from './src/core/Theme'

async function testThemes() {
    const themes = ['default', 'minimal', 'modern', 'bold', 'ocean', 'forest']
    const ui = new TUI()
    
    for(const theme of themes) {
        ThemeManager.getInstance().setTheme(theme)
        console.log(ui.createHeader())
        ui.showInfo(`Testing theme: ${theme}`)
        await new Promise(r => setTimeout(r, 1000))
    }
    
    ui.close()
}

testThemes()
EOF

npx tsx test-themes.ts
```

## 8. Kiểm tra lỗi thường gặp

### ✅ Checklist cần kiểm tra:

- [ ] Không bị overlay text
- [ ] Confirm prompt không đè lên header
- [ ] Input hoạt động bình thường
- [ ] Select có thể chọn được option
- [ ] Theme thay đổi màu sắc chính xác
- [ ] Responsive khi resize terminal
- [ ] Spinner quay mượt mà
- [ ] Progress bar hiển thị đúng %
- [ ] Xóa/thêm todo không bị lỗi
- [ ] Thoát app sạch sẽ (không treo terminal)

## 9. Debug khi gặp lỗi

### Bật debug mode:
```bash
DEBUG=tui:* npx tsx examples/todos/SimpleTodo.ts
```

### Xem output thực tế:
```bash
npx tsx test/capture-screen.ts
```

## 10. Test trên các terminal khác nhau

Hãy test trên:
- Terminal Linux native
- Windows Terminal
- VS Code terminal
- iTerm2 (macOS)
- Alacritty
- Termux (Android)

---

💡 **Mẹo:** Nếu gặp lỗi, hãy chạy `npm run build` trước để đảm bảo code mới nhất được compile.