#!/usr/bin/env tsx
import { 
  Screen, 
  Keyboard, 
  Form, 
  Input, 
  Select, 
  Checkbox, 
  Radio 
} from '../src-new';

async function main() {
  const screen = new Screen();
  const keyboard = new Keyboard();
  
  screen.clear();
  screen.hideCursor();
  
  // Create form components
  const nameInput = new Input(screen, keyboard, {
    placeholder: 'Enter your name',
    width: 30
  });
  
  const emailInput = new Input(screen, keyboard, {
    placeholder: 'Enter your email',
    width: 30,
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email format';
      }
      return null;
    }
  });
  
  const countrySelect = new Select(screen, keyboard, {
    width: 30,
    options: [
      { label: 'United States', value: 'us' },
      { label: 'United Kingdom', value: 'uk' },
      { label: 'Canada', value: 'ca' },
      { label: 'Australia', value: 'au' },
      { label: 'Germany', value: 'de' },
      { label: 'France', value: 'fr' },
      { label: 'Japan', value: 'jp' },
      { label: 'Other', value: 'other' }
    ]
  });
  
  const genderRadio = new Radio(screen, keyboard, {
    orientation: 'horizontal',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' }
    ]
  });
  
  const termsCheckbox = new Checkbox(screen, keyboard, {
    label: 'I agree to the terms and conditions'
  });
  
  const newsletterCheckbox = new Checkbox(screen, keyboard, {
    label: 'Subscribe to newsletter'
  });
  
  // Create form
  const form = new Form(screen, keyboard, {
    title: 'User Registration',
    x: 2,
    y: 1,
    width: 60,
    height: 20,
    components: [
      nameInput,
      emailInput,
      countrySelect,
      genderRadio,
      termsCheckbox,
      newsletterCheckbox
    ],
    submitLabel: 'Register',
    cancelLabel: 'Cancel'
  });
  
  form.on('submit', (values) => {
    screen.clear();
    screen.showCursor();
    console.log('\nForm submitted with values:');
    console.log(JSON.stringify(values, null, 2));
    keyboard.stop();
    process.exit(0);
  });
  
  form.on('cancel', () => {
    screen.clear();
    screen.showCursor();
    console.log('\nForm cancelled');
    keyboard.stop();
    process.exit(0);
  });
  
  form.activate();
  keyboard.start();
}

main().catch(console.error);