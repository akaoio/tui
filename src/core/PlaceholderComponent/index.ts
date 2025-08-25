/**
 * PlaceholderComponent - Container class
 * Placeholder component for backward compatibility
 */

import { Component, ComponentProps, RenderContext } from '../Component'
import { render } from './render'

export class PlaceholderComponent extends Component {
  constructor(props: ComponentProps = {}) {
    super(props)
  }

  render(context: RenderContext): void {
    render.call(this, context)
  }
}

export default PlaceholderComponent