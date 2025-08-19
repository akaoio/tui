import { initLip } from '../../src/lipgloss';
import fs from 'fs';
import path from 'path';

describe('WASM Initialization', () => {
  describe('initLip', () => {
    it('should successfully initialize WASM', async () => {
      const result = await initLip();
      expect(result).toBe(true);
    });

    it('should make global functions available after initialization', async () => {
      const result = await initLip();
      expect(result).toBe(true);
      
      // Check if global functions are available
      expect(typeof (globalThis as any).createStyle).toBe('function');
      expect(typeof (globalThis as any).apply).toBe('function');
      expect(typeof (globalThis as any).join).toBe('function');
      expect(typeof (globalThis as any).newTable).toBe('function');
      expect(typeof (globalThis as any).RenderMD).toBe('function');
      expect(typeof (globalThis as any).List).toBe('function');
    });

    it('should handle multiple initialization calls gracefully', async () => {
      const result1 = await initLip();
      const result2 = await initLip();
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should verify WASM file exists', () => {
      const wasmPath = path.resolve(__dirname, '../../dist/lip.wasm');
      const exists = fs.existsSync(wasmPath);
      expect(exists).toBe(true);
    });

    it('should verify WASM file size is reasonable', () => {
      const wasmPath = path.resolve(__dirname, '../../dist/lip.wasm');
      const stats = fs.statSync(wasmPath);
      // WASM file should be between 1MB and 50MB
      expect(stats.size).toBeGreaterThan(1024 * 1024); // > 1MB
      expect(stats.size).toBeLessThan(50 * 1024 * 1024); // < 50MB
    });
  });
});