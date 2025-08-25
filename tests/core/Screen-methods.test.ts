describe('Screen methods', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      buffer: [],
      stdout: { write: jest.fn() }
    };
  });

  it('should test clear', () => {
    const { clear } = require('../../src/core/Screen/clear');
    clear.call(mockContext);
    expect(mockContext.stdout.write).toHaveBeenCalled();
  });

  it('should test write', () => {
    const { write } = require('../../src/core/Screen/write');
    
    // Test with buffering enabled
    mockContext.buffering = true;
    write.call(mockContext, 'test');
    expect(mockContext.buffer.length).toBeGreaterThan(0);
    expect(mockContext.buffer[0]).toBe('test');
    
    // Test without buffering
    mockContext.buffering = false;
    mockContext.buffer = [];
    write.call(mockContext, 'direct');
    expect(mockContext.stdout.write).toHaveBeenCalledWith('direct');
  });

  it('should test moveCursor', () => {
    const { moveCursor } = require('../../src/core/Screen/moveCursor');
    moveCursor.call(mockContext, 5, 5);
    expect(mockContext.stdout.write).toHaveBeenCalled();
  });
});
