#!/usr/bin/env node

const { TUI, Input, Select, Checkbox, Form, ProgressBar } = require('./dist/index.js');

async function demo() {
  const tui = new TUI();
  
  console.log('🚀 TUI Framework Demo\n');
  console.log('Chọn demo để chạy:\n');
  
  // Tạo menu chọn demo
  const demoSelect = new Select({
    label: 'Chọn demo:',
    options: [
      { label: '📝 Form Input Demo', value: 'form' },
      { label: '✅ Checkbox Demo', value: 'checkbox' },
      { label: '📊 Progress Bar Demo', value: 'progress' },
      { label: '🎨 Multi-Select Demo', value: 'multiselect' },
      { label: '❌ Thoát', value: 'exit' }
    ]
  });
  
  tui.add(demoSelect);
  tui.render();
  
  const choice = await demoSelect.waitForSubmit();
  tui.clear();
  
  switch(choice) {
    case 'form':
      await formDemo(tui);
      break;
    case 'checkbox':
      await checkboxDemo(tui);
      break;
    case 'progress':
      await progressDemo(tui);
      break;
    case 'multiselect':
      await multiSelectDemo(tui);
      break;
    case 'exit':
      console.log('Goodbye! 👋');
      process.exit(0);
  }
}

async function formDemo(tui) {
  console.log('\n📝 Form Demo\n');
  
  const form = new Form();
  
  const nameInput = new Input({
    label: 'Tên của bạn:',
    placeholder: 'Nhập tên...',
    required: true
  });
  
  const emailInput = new Input({
    label: 'Email:',
    placeholder: 'example@email.com',
    validator: (value) => {
      if (!value.includes('@')) return 'Email không hợp lệ';
      return null;
    }
  });
  
  const ageInput = new Input({
    label: 'Tuổi:',
    placeholder: '18',
    validator: (value) => {
      const age = parseInt(value);
      if (isNaN(age) || age < 0) return 'Tuổi phải là số dương';
      return null;
    }
  });
  
  form.addComponent('name', nameInput);
  form.addComponent('email', emailInput);
  form.addComponent('age', ageInput);
  
  tui.add(form);
  tui.render();
  
  const values = await form.waitForSubmit();
  tui.clear();
  
  console.log('\n✅ Form submitted!');
  console.log('Dữ liệu nhận được:');
  console.log(JSON.stringify(values, null, 2));
}

async function checkboxDemo(tui) {
  console.log('\n✅ Checkbox Demo\n');
  
  const checkbox1 = new Checkbox({
    label: 'Tôi đồng ý với điều khoản sử dụng',
    checked: false
  });
  
  const checkbox2 = new Checkbox({
    label: 'Gửi email thông báo cho tôi',
    checked: true
  });
  
  const checkbox3 = new Checkbox({
    label: 'Chia sẻ dữ liệu với đối tác',
    checked: false
  });
  
  tui.add(checkbox1);
  tui.add(checkbox2);
  tui.add(checkbox3);
  tui.render();
  
  console.log('Dùng Space để toggle, Enter để xác nhận\n');
  
  // Wait for Enter key
  await new Promise(resolve => {
    process.stdin.once('data', (data) => {
      if (data.toString() === '\r' || data.toString() === '\n') {
        resolve();
      }
    });
  });
  
  tui.clear();
  console.log('\nKết quả:');
  console.log(`- Điều khoản: ${checkbox1.getValue() ? '✅' : '❌'}`);
  console.log(`- Email: ${checkbox2.getValue() ? '✅' : '❌'}`);
  console.log(`- Chia sẻ: ${checkbox3.getValue() ? '✅' : '❌'}`);
}

async function progressDemo(tui) {
  console.log('\n📊 Progress Bar Demo\n');
  
  const progress = new ProgressBar({
    label: 'Đang xử lý',
    total: 100,
    width: 40
  });
  
  tui.add(progress);
  tui.render();
  
  // Simulate progress
  for (let i = 0; i <= 100; i += 5) {
    progress.setProgress(i);
    tui.render();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  tui.clear();
  console.log('\n✅ Hoàn thành!');
}

async function multiSelectDemo(tui) {
  console.log('\n🎨 Multi-Select Demo\n');
  
  const select = new Select({
    label: 'Chọn các ngôn ngữ bạn biết:',
    options: [
      { label: 'JavaScript', value: 'js' },
      { label: 'TypeScript', value: 'ts' },
      { label: 'Python', value: 'py' },
      { label: 'Go', value: 'go' },
      { label: 'Rust', value: 'rust' },
      { label: 'Java', value: 'java' },
      { label: 'C++', value: 'cpp' }
    ],
    multiple: true
  });
  
  tui.add(select);
  tui.render();
  
  console.log('Dùng Space để chọn, Enter để xác nhận\n');
  
  const selected = await select.waitForSubmit();
  tui.clear();
  
  console.log('\nBạn đã chọn:');
  selected.forEach(lang => {
    console.log(`- ${lang}`);
  });
}

// Run demo
demo().catch(console.error);