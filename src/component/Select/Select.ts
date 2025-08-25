/**
 * Select component class (CONTAINER ONLY - no logic)
 */

import { Component } from '../Component';
import { Screen } from '../../core/screen';
import { Keyboard, Key, KeyEvent } from '../../core/keyboard';
import { SelectOption, SelectOptions, SelectState } from './types';
import { SelectRenderer } from './renderer';
import { SelectNavigation } from './navigation';
import { SelectionManager } from './selection';
import { constructor } from './constructor';
import { render } from './render';
import { handleKey } from './handleKey';
import { clear } from './clear';
import { clearSelection } from './clearSelection';
import { open } from './open';
import { close } from './close';
import { selectCurrent } from './selectCurrent';
import { setOptions } from './setOptions';
import { getSelectedOption } from './getSelectedOption';
import { getSelectedOptions } from './getSelectedOptions';

export class Select extends Component {
  public options: SelectOption[] = [];
  public multiple: boolean = false;
  public maxDisplay: number = 10;
  public state: SelectState = {
    selectedIndex: 0,
    hoveredIndex: 0,
    scrollOffset: 0,
    selectedIndices: new Set(),
    isOpen: false
  };
  public renderer: any;
  public navigation: any;
  public selection: any;

  constructor(screen: Screen, keyboard: Keyboard, options: SelectOptions) {
    super(screen, keyboard, options);
    constructor.call(this, screen, keyboard, options);
  }

  render(): void {
    return render.call(this);
  }

  handleKey(key: Key, event: KeyEvent): void {
    return handleKey.call(this, key, event);
  }

  override clear(): void {
    return clearSelection.call(this);
  }
  
  clearDisplay(): void {
    return clear.call(this);
  }

  setOptions(options: SelectOption[]): void {
    return setOptions.call(this, options);
  }

  getSelectedOption(): SelectOption | null {
    return getSelectedOption.call(this);
  }

  getSelectedOptions(): SelectOption[] {
    return getSelectedOptions.call(this);
  }

  open(): void {
    return open.call(this);
  }

  close(): void {
    return close.call(this);
  }

  selectCurrent(): void {
    return selectCurrent.call(this);
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  get selectedIndex(): number {
    return this.state.selectedIndex;
  }

  set selectedIndex(value: number) {
    this.state.selectedIndex = value;
  }

  get highlightedIndex(): number {
    return this.state.hoveredIndex;
  }

  set highlightedIndex(value: number) {
    this.state.hoveredIndex = value;
  }
}