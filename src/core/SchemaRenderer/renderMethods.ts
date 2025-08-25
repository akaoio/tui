/**
 * Rendering methods for SchemaRenderer
 */

import { SchemaRendererState, BoxChars } from './types';
import { LayoutNode, ComputedBox } from '../LayoutEngine';
import { SchemaComponentDefinition } from '../ComponentAdapter/index';
import { resolveValue } from './resolveValue';

/**
 * Main render method
 */
export function render(this: any, state: SchemaRendererState): void {
  if (state.isDestroyed) return;
  
  const { width, height } = state.screen.getDimensions();
  state.screen.clear();
  
  // Update component adapter context
  state.componentAdapter.updateContext({
    store: state.storeManager?.getStore() || (global as any).$store,
    resolveValue: (v: any) => resolveValue(state, v)
  });
  
  // Update layout engine dimensions
  state.layoutEngine.updateDimensions(width, height);
  
  // Compute and render layout
  if (state.layoutTree) {
    state.layoutEngine.computeLayout(state.layoutTree);
    renderLayoutNode(state, state.layoutTree);
  }
  
  (state.screen as any).flush();
}

/**
 * Render a layout node
 */
export function renderLayoutNode(this: any, state: SchemaRendererState, node: LayoutNode): void {
  if (!node.computed) return;
  
  const { borderBox, contentBox } = node.computed;
  
  // Draw border if specified
  if (node.props?.border) {
    const borderStyle = node.props.border === true ? 'single' : node.props.border;
    drawBox(
      state,
      borderBox.x,
      borderBox.y,
      borderBox.width,
      borderBox.height,
      resolveValue(state, node.props.title) || '',
      borderStyle
    );
  }
  
  // Try to render as component first
  const componentId = node.props?.$id || node.props?.name || `${node.type}_${Date.now()}`;
  const schemaComponent: SchemaComponentDefinition = {
    type: node.type,
    props: node.props,
    style: node.props?.style,
    data: node.props?.data,
    template: node.props?.template,
    itemTemplate: node.props?.itemTemplate,
    events: node.props?.events
  };
  
  const component = state.componentAdapter.createComponent(componentId, schemaComponent, contentBox);
  
  if (component) {
    // Component adapter will handle rendering
    state.componentAdapter.renderComponent(componentId);
  } else {
    // Fall back to basic rendering for non-component nodes
    renderBasicNode(state, node, contentBox as any);
  }
  
  // Always render children
  if (node.children) {
    for (const child of node.children) {
      renderLayoutNode(state, child);
    }
  }
}

/**
 * Render basic node (text, templates, containers)
 */
export function renderBasicNode(this: any, state: SchemaRendererState, node: LayoutNode, box: ComputedBox): void {
  // Handle template nodes
  if (node.props?.template) {
    renderTemplate(state, node, box);
  } else if (node.props?.text) {
    renderText(state, node, box);
  }
  
  // Legacy rendering for specific types
  switch (node.type) {
    case 'panel':
    case 'container':
    case 'flexbox':
    case 'grid':
    case 'stack':
    case 'dock':
      // Layout containers - children will be rendered
      break;
  }
}

/**
 * Render template text
 */
export function renderTemplate(this: any, state: SchemaRendererState, node: LayoutNode, box: ComputedBox): void {
  const template = node.props?.template || '';
  const style = node.props?.style || {};
  
  // Resolve template with store values
  const text = resolveValue(state, template);
  if (!text) return;
  
  // Apply background if specified
  if (style.background) {
    const bgColor = getBackgroundColor(style.background);
    for (let i = 0; i < (box.height || 1); i++) {
      state.screen.write(' '.repeat(box.width), box.x, box.y + i, bgColor);
    }
  }
  
  // Split text into lines
  const lines = text.split('\n');
  const padding = style.padding || 0;
  const textX = box.x + padding;
  const textY = box.y + padding;
  const maxWidth = box.width - (padding * 2);
  
  // Render each line
  lines.forEach((line: string, index: number) => {
    if (index >= (box.height || lines.length) - (padding * 2)) return;
    
    const truncated = line.length > maxWidth ? line.substring(0, maxWidth) : line;
    const aligned = alignText(truncated, maxWidth, style.align || 'left');
    
    const textColor = style.color === 'white' ? '\x1b[97m' : '\x1b[37m';
    const bgColor = style.background ? getBackgroundColor(style.background) : '';
    const fullStyle = bgColor + textColor;
    
    state.screen.write(aligned, textX, textY + index, fullStyle);
  });
}

/**
 * Render simple text
 */
export function renderText(this: any, state: SchemaRendererState, node: LayoutNode, box: ComputedBox): void {
  const text = resolveValue(state, node.props?.text || '');
  const style = node.props?.style || {};
  
  if (!text || text.trim() === '') return;
  
  const maxWidth = Math.max(0, box.width);
  
  // Apply color styles
  let colorCode = '';
  if (style.color) {
    const resolvedColor = resolveValue(state, style.color);
    switch(resolvedColor) {
      case 'red': colorCode = '\x1b[31m'; break;
      case 'green': colorCode = '\x1b[32m'; break;
      case 'yellow': colorCode = '\x1b[33m'; break;
      case 'blue': colorCode = '\x1b[34m'; break;
      case 'magenta': colorCode = '\x1b[35m'; break;
      case 'cyan': colorCode = '\x1b[36m'; break;
      case 'gray': case 'grey': colorCode = '\x1b[90m'; break;
      default: colorCode = '\x1b[37m'; break;
    }
  }
  
  if (style.bold) colorCode += '\x1b[1m';
  if (style.dim) colorCode += '\x1b[2m';
  
  // Truncate text to fit
  const trimmedText = text.trimEnd();
  const displayText = trimmedText.length > maxWidth ? trimmedText.substring(0, maxWidth) : trimmedText;
  
  state.screen.write(displayText, box.x, box.y, colorCode);
}

/**
 * Draw a box border
 */
export function drawBox(this: any, state: SchemaRendererState,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string = '',
  style: string = 'single'): void {
  if (width < 3 || height < 3) return;
  
  const chars = getBoxChars(style);
  
  // Top border with title
  let topLine = chars.topLeft;
  const innerWidth = width - 2;
  
  if (title && title.length > 0) {
    const maxTitleLen = innerWidth - 4;
    const displayTitle = title.length > maxTitleLen ? title.substring(0, maxTitleLen) : title;
    const totalDashes = innerWidth - displayTitle.length - 2;
    const leftDashes = Math.floor(totalDashes / 2);
    const rightDashes = Math.ceil(totalDashes / 2);
    
    topLine += chars.horizontal.repeat(leftDashes) + ' ' + displayTitle + ' ' + chars.horizontal.repeat(rightDashes);
  } else {
    topLine += chars.horizontal.repeat(innerWidth);
  }
  topLine += chars.topRight;
  state.screen.write(topLine, x, y);
  
  // Side borders
  for (let i = 1; i < height - 1; i++) {
    state.screen.write(chars.vertical, x, y + i);
    state.screen.write(chars.vertical, x + width - 1, y + i);
  }
  
  // Bottom border
  state.screen.write(chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight, x, y + height - 1);
}

/**
 * Get box drawing characters
 */
export function getBoxChars(this: any, style: string = 'single'): BoxChars {
  const styles: Record<string, BoxChars> = {
    single: {
      topLeft: '┌', topRight: '┐',
      bottomLeft: '└', bottomRight: '┘',
      horizontal: '─', vertical: '│'
    },
    double: {
      topLeft: '╔', topRight: '╗',
      bottomLeft: '╚', bottomRight: '╝',
      horizontal: '═', vertical: '║'
    },
    rounded: {
      topLeft: '╭', topRight: '╮',
      bottomLeft: '╰', bottomRight: '╯',
      horizontal: '─', vertical: '│'
    }
  };
  return styles[style] || styles.single;
}

/**
 * Helper: Get background color code
 */
export function getBackgroundColor(this: any, color: string): string {
  const colorMap: Record<string, string> = {
    '#1a1a2e': '\x1b[48;5;17m',
    '#0f0f0f': '\x1b[48;5;234m',
    '#222': '\x1b[48;5;235m',
    '#333': '\x1b[48;5;236m',
    '#4a4a4a': '\x1b[48;5;239m'
  };
  return colorMap[color] || '\x1b[48;5;0m';
}

/**
 * Helper: Align text
 */
export function alignText(this: any, text: string, width: number, align: string): string {
  if (align === 'center') {
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding);
  } else if (align === 'right') {
    return ' '.repeat(width - text.length) + text;
  } else {
    return text + ' '.repeat(width - text.length);
  }
}