import { EventBus } from '../../src/core/EventBus/EventBus';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = EventBus.getInstance();
    eventBus.reset(); // Clear any existing state
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = EventBus.getInstance();
      const instance2 = EventBus.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      eventBus.subscribe('test-event', handler);
      
      eventBus.emit('test-event', { data: 'test', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        data: 'test',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle multiple subscribers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      
      eventBus.emit('test-event', { data: 'data', timestamp: new Date() });
      
      expect(handler1).toHaveBeenCalledWith(expect.objectContaining({
        data: 'data',
        timestamp: expect.any(Date)
      }));
      expect(handler2).toHaveBeenCalledWith(expect.objectContaining({
        data: 'data',
        timestamp: expect.any(Date)
      }));
    });

    it('should return unsubscribe function', () => {
      const handler = jest.fn();
      const subscription = eventBus.subscribe('test-event', handler);
      
      eventBus.emit('test-event', { data: 'data1', timestamp: new Date() });
      expect(handler).toHaveBeenCalledTimes(1);
      
      subscription.unsubscribe();
      
      eventBus.emit('test-event', { data: 'data2', timestamp: new Date() });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle wildcard subscriptions', () => {
      const handler = jest.fn();
      eventBus.subscribe('*', handler);
      
      eventBus.emit('event1', { data: 'data1', timestamp: new Date() });
      eventBus.emit('event2', { data: 'data2', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, expect.objectContaining({
        data: 'data1',
        timestamp: expect.any(Date)
      }));
      expect(handler).toHaveBeenNthCalledWith(2, expect.objectContaining({
        data: 'data2',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle namespace subscriptions', () => {
      const handler = jest.fn();
      eventBus.subscribe('app:*', handler);
      
      eventBus.emit('app:start', { data: 'data1', timestamp: new Date() });
      eventBus.emit('app:stop', { data: 'data2', timestamp: new Date() });
      eventBus.emit('other:event', { data: 'data3', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, expect.objectContaining({
        data: 'data1',
        timestamp: expect.any(Date)
      }));
      expect(handler).toHaveBeenNthCalledWith(2, expect.objectContaining({
        data: 'data2',
        timestamp: expect.any(Date)
      }));
    });
  });

  describe('Event Emission', () => {
    it('should emit events with data', () => {
      const handler = jest.fn();
      eventBus.subscribe('test', handler);
      
      eventBus.emit('test', { data: { value: 123 }, timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        data: { value: 123 },
        timestamp: expect.any(Date)
      }));
    });

    it('should emit without data', () => {
      const handler = jest.fn();
      eventBus.subscribe('test', handler);
      
      eventBus.emit('test', { timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        timestamp: expect.any(Date)
      }));
    });

    it('should not throw if no handlers', () => {
      expect(() => {
        eventBus.emit('non-existent', { data: 'data', timestamp: new Date() });
      }).not.toThrow();
    });

    it('should handle errors in handlers', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = jest.fn();
      
      eventBus.subscribe('test', errorHandler);
      eventBus.subscribe('test', normalHandler);
      
      expect(() => {
        eventBus.emit('test', { data: 'test', timestamp: new Date() });
      }).not.toThrow();
      
      expect(normalHandler).toHaveBeenCalledWith(expect.objectContaining({
        data: 'test',
        timestamp: expect.any(Date)
      }));
    });
  });

  describe('Handler Management', () => {
    it('should remove specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const sub1 = eventBus.subscribe('test', handler1);
      eventBus.subscribe('test', handler2);
      
      sub1.unsubscribe();
      
      eventBus.emit('test', { data: 'data', timestamp: new Date() });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith(expect.objectContaining({
        data: 'data',
        timestamp: expect.any(Date)
      }));
    });

    it('should get handlers for event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('test', handler1);
      eventBus.subscribe('test', handler2);
      
      // Note: getHandlersForEvent is private, so we test via emit behavior
      eventBus.emit('test', { data: 'test', timestamp: new Date() });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should reset all handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventBus.subscribe('event1', handler1);
      eventBus.subscribe('event2', handler2);
      
      eventBus.reset();
      
      eventBus.emit('event1', { data: 'data', timestamp: new Date() });
      eventBus.emit('event2', { data: 'data', timestamp: new Date() });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('Event History', () => {
    it('should track event history', () => {
      eventBus.emit('event1', { data: 'data1', timestamp: new Date() });
      eventBus.emit('event2', { data: 'data2', timestamp: new Date() });
      
      const history = eventBus.getHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0]).toMatchObject({
        event: 'event1',
        payload: expect.objectContaining({
          data: 'data1',
          timestamp: expect.any(Date)
        })
      });
      expect(history[1]).toMatchObject({
        event: 'event2',
        payload: expect.objectContaining({
          data: 'data2',
          timestamp: expect.any(Date)
        })
      });
    });

    it('should include timestamp in history', () => {
      eventBus.emit('test', { data: 'data', timestamp: new Date() });
      
      const history = eventBus.getHistory();
      
      expect(history[0].payload.timestamp).toBeInstanceOf(Date);
    });

    it('should clear history', () => {
      eventBus.emit('event1', { data: 'data1', timestamp: new Date() });
      eventBus.emit('event2', { data: 'data2', timestamp: new Date() });
      
      eventBus.clearHistory();
      
      const history = eventBus.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should limit history size', () => {
      // Emit more than max history size (1000 from EventBus)
      for (let i = 0; i < 1050; i++) {
        eventBus.emit('test', { data: i, timestamp: new Date() });
      }
      
      const history = eventBus.getHistory();
      expect(history.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined event names gracefully', () => {
      const handler = jest.fn();
      
      expect(() => {
        eventBus.subscribe(null as any, handler);
      }).not.toThrow();
      
      expect(() => {
        eventBus.emit(undefined as any, { data: 'test', timestamp: new Date() });
      }).not.toThrow();
    });

    it('should handle circular references in data', () => {
      const handler = jest.fn();
      eventBus.subscribe('test', handler);
      
      const circular: any = { a: 1 };
      circular.self = circular;
      
      expect(() => {
        eventBus.emit('test', { data: circular, timestamp: new Date() });
      }).not.toThrow();
      
      expect(handler).toHaveBeenCalled();
    });

    it('should handle very long event names', () => {
      const longEventName = 'a'.repeat(1000);
      const handler = jest.fn();
      
      eventBus.subscribe(longEventName, handler);
      eventBus.emit(longEventName, { data: 'test', timestamp: new Date() });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        data: 'test',
        timestamp: expect.any(Date)
      }));
    });

    it('should handle concurrent subscriptions during emit', () => {
      const handler1 = jest.fn(() => {
        eventBus.subscribe('new-event', jest.fn());
      });
      
      eventBus.subscribe('test', handler1);
      
      expect(() => {
        eventBus.emit('test', { data: 'test', timestamp: new Date() });
      }).not.toThrow();
    });
  });
});