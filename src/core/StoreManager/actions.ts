/**
 * Action handling methods
 */

import { Store, StoreSchema, ActionContext } from './types';
import { EventEmitter } from 'events';

/**
 * Handle action execution
 */
export async function handleAction(this: any, store: Store,
  schema: StoreSchema,
  actionName: string,
  payload: any,
  emitter: EventEmitter): Promise<any>  {
  const action = schema.actions?.[actionName];
  if (!action) {
    console.warn(`Action not found: ${actionName}`);
    return;
  }

  try {
    const handler = action.handler;
    const context: ActionContext = {
      state: store.state,
      getters: store.getters,
      commit: store.commit,
      dispatch: store.dispatch
    };

    let result: any;

    if (typeof handler === 'function') {
      result = await handler(context, payload);
    } else if (typeof handler === 'string') {
      result = await executeActionFromString(handler, context, payload);
    }

    // Emit action complete event
    emitter.emit('action-complete', {
      action: actionName,
      payload,
      result
    });

    return result;
  } catch (error) {
    console.error(`Action error (${actionName}):`, error);
    throw error;
  }
}

/**
 * Execute action from string definition
 */
async function executeActionFromString(
  handler: string,
  context: ActionContext,
  payload?: any
): Promise<any> {
  // Create safe context with required modules
  const safeContext = {
    ...context,
    require: (id: string) => {
      // Only allow safe modules
      if (id === 'os') {
        return require('os');
      } else if (id === 'path') {
        return require('path');
      } else if (id === 'fs') {
        return require('fs');
      }
      throw new Error(`Module '${id}' is not allowed in actions`);
    }
  };

  if (handler.includes('async')) {
    // Async action
    const bodyMatch = handler.match(/async\s+function\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (bodyMatch) {
      const funcBody = bodyMatch[1];
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const func = new AsyncFunction('{ state, getters, commit, dispatch }', 'payload', 'require', funcBody);
      return await func.call(safeContext, context, payload, safeContext.require);
    }
  } else {
    // Sync action
    const bodyMatch = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (bodyMatch) {
      const funcBody = bodyMatch[1];
      const func = new Function('context', 'payload', 'require', `
        const { state, getters, commit, dispatch } = context;
        ${funcBody}
      `);
      return func.call(safeContext, context, payload, safeContext.require);
    }
  }
}