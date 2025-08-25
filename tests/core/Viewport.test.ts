import { Viewport } from '../../src/core/Viewport';

describe('Viewport', () => {
  let viewport: any;

  beforeEach(() => {
    viewport = Viewport.getInstance();
  });

  it('should be singleton', () => {
    const v2 = Viewport.getInstance();
    expect(viewport).toBe(v2);
  });

  it('should get dimensions', () => {
    const dims = viewport.getDimensions();
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('should detect breakpoint', () => {
    const bp = viewport.getBreakpoint();
    expect(['xs', 'sm', 'md', 'lg', 'xl']).toContain(bp);
  });
});
