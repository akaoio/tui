/**
 * Input validation logic
 */

import { InputState } from './types';

export function validateInput(
  state: InputState,
  validator?: (value: string) => string | null
): string | null {
  if (validator) {
    state.error = validator(state.value);
    return state.error;
  }
  return null;
}

export function clearError(this: any, state: InputState): void {
  state.error = null;
}