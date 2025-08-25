/**
 * OutputFilter - Container class
 * Output Filter - Nuclear option to prevent ANY mouse spillage
 * Intercepts and filters ALL output to remove mouse sequences
 */

import { constructor } from './constructor'
import { getInstance } from './getInstance'
import { enable } from './enable'
import { disable } from './disable'
import { filterMouseSequences } from './filterMouseSequences'

export class OutputFilter {
  private static instance: OutputFilter
  private originalWrite!: typeof process.stdout.write
  private originalErrorWrite!: typeof process.stderr.write
  private enabled = false
  
  private constructor() {
    constructor.call(this)
  }
  
  static getInstance(): OutputFilter {
    return getInstance.call(OutputFilter)
  }
  
  /**
   * Enable output filtering - nuclear option
   */
  enable(): void {
    enable.call(this)
  }
  
  /**
   * Disable output filtering
   */
  disable(): void {
    disable.call(this)
  }
  
  /**
   * Filter mouse sequences from output
   */
  private filterMouseSequences(str: string): string {
    return filterMouseSequences.call(this, str)
  }
}

export default OutputFilter