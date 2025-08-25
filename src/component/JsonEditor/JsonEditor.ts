/**
 * JSON Editor Component - Main class
 * Interactive editor for JSON configuration files
 */

import { Component } from '../../core/Component';
import { VirtualCursorManager } from '../../core/VirtualCursor';
import { JsonNode } from './types';
import { buildNodeTree, isDescendantOf } from './nodeTree';
import { parseValue, updateValue, addProperty, deleteProperty } from './editingLogic';
import { 
  handleEditModeInput, 
  handleNormalModeInput, 
  moveSelection,
  InputHandlerState 
} from './inputHandler';
import { 
  renderNodeLine, 
  getVisibleNodes, 
  getScrollIndicator,
  RenderState 
} from './renderer';

export class JsonEditor extends Component {
  private data: any = {};
  private nodes: JsonNode[] = [];
  private selectedIndex: number = 0;
  private editMode: boolean = false;
  private editValue: string = '';
  private scrollOffset: number = 0;
  private onChange?: (data: any) => void;

  constructor(props?: any) {
    super(props);
    if (props?.data) {
      this.setData(props.data);
    }
  }

  /**
   * Set JSON data to edit
   */
  setData(data: any): void {
    this.data = data;
    this.nodes = buildNodeTree(data);
    this.selectedIndex = 0;
    this.scrollOffset = 0;
  }

  /**
   * Get current JSON data
   */
  getData(): any {
    return this.data;
  }

  /**
   * Set change callback
   */
  onDataChange(callback: (data: any) => void): void {
    this.onChange = callback;
  }

  /**
   * Toggle node expansion
   */
  private toggleNode(node: JsonNode): void {
    if (node.type === 'object' || node.type === 'array') {
      node.expanded = !node.expanded;
      
      if (!node.expanded) {
        // Collapse - remove children from flat list
        this.nodes = this.nodes.filter((n: any) => {
          return !isDescendantOf(n, node);
        });
      } else {
        // Expand - rebuild tree
        this.nodes = buildNodeTree(this.data);
      }
    }
  }

  /**
   * Start editing selected node
   */
  private startEdit(): void {
    const node = this.nodes[this.selectedIndex];
    if (!node || node.type === 'object' || node.type === 'array') return;
    
    this.editMode = true;
    this.editValue = String(node.value);
  }

  /**
   * Apply edit
   */
  private applyEdit(): void {
    const node = this.nodes[this.selectedIndex];
    if (!node) return;
    
    const newValue = parseValue(this.editValue, node.type);
    if (newValue === null && node.type === 'number') return; // Invalid number
    
    // Update data
    this.data = updateValue(this.data, node.path, newValue);
    
    // Rebuild tree
    this.nodes = buildNodeTree(this.data);
    
    this.editMode = false;
    this.editValue = '';
    
    // Notify change
    this.onChange?.(this.data);
  }

  /**
   * Add new property to object
   */
  private addPropertyAction(): void {
    const node = this.nodes[this.selectedIndex];
    if (!node || node.type !== 'object') return;
    
    const result = addProperty(this.data, node);
    this.data = result.data;
    
    // Rebuild tree
    this.nodes = buildNodeTree(this.data);
    
    // Find and select new property
    const newNode = this.nodes.find((n: any) => 
      n.path.join('.') === result.newNodePath.join('.')
    );
    if (newNode) {
      this.selectedIndex = this.nodes.indexOf(newNode);
      this.startEdit();
    }
    
    this.onChange?.(this.data);
  }

  /**
   * Delete selected property
   */
  private deletePropertyAction(): void {
    const node = this.nodes[this.selectedIndex];
    if (!node || node.path.length === 0) return;
    
    try {
      this.data = deleteProperty(this.data, node);
      
      // Rebuild tree
      this.nodes = buildNodeTree(this.data);
      
      // Adjust selection
      if (this.selectedIndex >= this.nodes.length) {
        this.selectedIndex = Math.max(0, this.nodes.length - 1);
      }
      
      this.onChange?.(this.data);
    } catch (error) {
      // Handle error silently
    }
  }

  handleInput(char: string, key: any): boolean {
    const state: InputHandlerState = {
      editMode: this.editMode,
      editValue: this.editValue,
      selectedIndex: this.selectedIndex,
      scrollOffset: this.scrollOffset,
      nodes: this.nodes
    };

    if (this.editMode) {
      const result = handleEditModeInput(char, key, state, () => this.applyEdit());
      
      // Update state from handler
      this.editMode = state.editMode;
      this.editValue = state.editValue;
      
      return result;
    }
    
    const callbacks = {
      moveSelection: (delta: number) => {
        moveSelection(delta, state, this.props);
        this.selectedIndex = state.selectedIndex;
        this.scrollOffset = state.scrollOffset;
      },
      toggleNode: (node: JsonNode) => this.toggleNode(node),
      startEdit: () => this.startEdit(),
      addProperty: () => this.addPropertyAction(),
      deleteProperty: () => this.deletePropertyAction()
    };
    
    return handleNormalModeInput(char, key, state, callbacks);
  }

  render(context: any): void {
    const { region } = context;
    
    // Draw border
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: region.height }, 'rounded');
    
    // Title
    this.writeText(context, ' JSON Editor ', 2, 0, '\x1b[1m\x1b[36m');
    
    // Help text
    const helpText = '[↑↓] Navigate [←→] Collapse/Expand [e] Edit [a] Add [d] Delete';
    this.writeText(context, helpText, 2, region.height - 1, '\x1b[90m');
    
    // Render nodes
    let y = 2;
    const maxY = region.height - 2;
    const visibleNodes = getVisibleNodes(this.nodes, this.scrollOffset, maxY - 2);
    
    for (let i = 0; i < visibleNodes.length && y < maxY; i++) {
      const node = visibleNodes[i];
      const isSelected = this.nodes.indexOf(node) === this.selectedIndex;
      
      const line = renderNodeLine(node, isSelected, this.editMode, this.editValue);
      
      // Write line
      this.writeText(context, line, 2, y, '');
      y++;
    }
    
    // Scroll indicator
    if (this.nodes.length > maxY - 2) {
      const scrollText = getScrollIndicator(this.selectedIndex, this.nodes.length);
      this.writeText(context, scrollText, region.width - scrollText.length - 2, 1, '\x1b[90m');
    }
  }
}