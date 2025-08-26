#!/usr/bin/env tsx
/**
 * TUI Input Component Battle Tests
 * Testing real terminal UI interactions with Battle PTY
 */

import { Battle } from '@akaoio/battle'
import { join } from 'path'

// Test helper to create test scripts
function createTestScript(testCode: string): string {
    return `
const { Input } = require('../../dist/index.js');
const { Screen } = require('../../dist/core/screen.js');
const { Keyboard } = require('../../dist/core/keyboard.js');

${testCode}
`
}

export async function testInputComponent() {
    console.log('\n=== Testing TUI Input Component with Battle ===\n')
    
    const results = { total: 0, passed: 0, failed: 0 }
    
    // Test: Input renders placeholder
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 5000 
        })
        
        const result = await battle.run(async (b) => {
            // Create a test script that uses TUI
            await b.spawn('node', ['-e', createTestScript(`
                const screen = new Screen(process.stdout);
                const keyboard = new Keyboard(process.stdin);
                const input = new Input(screen, keyboard, {
                    placeholder: 'Enter text...',
                    x: 0,
                    y: 0,
                });
                input.render();
                console.log('INPUT_RENDERED');
            `)])
            
            await b.expect('INPUT_RENDERED')
        })
        
        if (result.success) {
            console.log('✅ Input renders placeholder')
            results.passed++
        } else {
            console.log('❌ Input renders placeholder:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ Input renders placeholder:', e.message)
        results.failed++
    }
    
    // Test: Input handles keyboard input
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 5000
        })
        
        const result = await battle.run(async (b) => {
            await b.spawn('node', ['-e', createTestScript(`
                const screen = new Screen(process.stdout);
                const keyboard = new Keyboard(process.stdin);
                const input = new Input(screen, keyboard);
                
                // Listen for change event
                input.on('change', (value) => {
                    console.log('CHANGE_EVENT:' + value);
                });
                
                input.focus();
                
                // Simulate typing 'hello'
                const createKeyEvent = (name) => ({ name, key: name, ctrl: false, meta: false, shift: false, sequence: name });
                input.handleKey('h', createKeyEvent('h'));
                input.handleKey('e', createKeyEvent('e'));
                input.handleKey('l', createKeyEvent('l'));
                input.handleKey('l', createKeyEvent('l'));
                input.handleKey('o', createKeyEvent('o'));
                
                console.log('FINAL_VALUE:' + input.getValue());
            `)])
            
            await b.expect('CHANGE_EVENT:h')
            await b.expect('CHANGE_EVENT:he')
            await b.expect('CHANGE_EVENT:hel')
            await b.expect('CHANGE_EVENT:hell')
            await b.expect('CHANGE_EVENT:hello')
            await b.expect('FINAL_VALUE:hello')
        })
        
        if (result.success) {
            console.log('✅ Input handles keyboard input')
            results.passed++
        } else {
            console.log('❌ Input handles keyboard input:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ Input handles keyboard input:', e.message)
        results.failed++
    }
    
    // Test: Input validation
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 5000
        })
        
        const result = await battle.run(async (b) => {
            await b.spawn('node', ['-e', createTestScript(`
                const screen = new Screen(process.stdout);
                const keyboard = new Keyboard(process.stdin);
                
                const validator = (value) => {
                    return value.length < 3 ? 'Too short' : null;
                };
                
                const input = new Input(screen, keyboard, { validator });
                
                input.on('error', (error) => {
                    console.log('ERROR_EVENT:' + error);
                });
                
                input.setValue('ab');
                input.focus();
                
                // Trigger validation
                const createKeyEvent = (name) => ({ name, key: name, ctrl: false, meta: false, shift: false, sequence: name });
                input.handleKey('Enter', createKeyEvent('return'));
                
                console.log('ERROR_STATE:' + input.getError());
            `)])
            
            await b.expect('ERROR_EVENT:Too short')
            await b.expect('ERROR_STATE:Too short')
        })
        
        if (result.success) {
            console.log('✅ Input validation works')
            results.passed++
        } else {
            console.log('❌ Input validation works:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ Input validation works:', e.message)
        results.failed++
    }
    
    console.log(`\nInput Component Tests: ${results.passed}/${results.total} passed`)
    return results
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testInputComponent()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0)
        })
        .catch(error => {
            console.error('Test failed:', error)
            process.exit(1)
        })
}