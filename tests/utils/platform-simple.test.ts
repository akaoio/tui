import { platform } from '../../src/utils/platform';

describe('Platform Utils', () => {
  it('should detect platform', () => {
    const result = platform();
    expect(typeof result).toBe('string');
  });

  it('should handle process.platform', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'linux' });
    
    const result = platform();
    expect(result).toBe('linux');
    
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });
});