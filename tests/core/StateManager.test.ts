import { Store } from '../../src/core/StateManager/Store';

describe('StateManager/Store', () => {
  let store: any;

  beforeEach(() => {
    store = new Store({
      state: { counter: 0 },
      mutations: {
        increment: (state: any) => { state.counter++; }
      },
      actions: {
        incrementAsync: ({ commit }: any) => {
          setTimeout(() => commit('increment'), 0);
        }
      },
      getters: {
        doubleCounter: (state: any) => state.counter * 2
      }
    });
  });

  it('should initialize with state', () => {
    expect(store.state.counter).toBe(0);
  });

  it('should commit mutations', () => {
    store.commit('increment');
    expect(store.state.counter).toBe(1);
  });

  it('should dispatch actions', async () => {
    await store.dispatch('incrementAsync');
    await new Promise(r => setTimeout(r, 10));
    expect(store.state.counter).toBe(1);
  });

  it('should compute getters', () => {
    expect(store.getters.doubleCounter).toBe(0);
    store.commit('increment');
    expect(store.getters.doubleCounter).toBe(2);
  });
});
