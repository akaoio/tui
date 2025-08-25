/**
 * Types and interfaces for ComponentRegistry
 */

import { Component } from '../Component';

/**
 * Component metadata
 */
export interface ComponentMetadata {
  id: string;
  type: string;
  name?: string;
  parent?: string;
  children: string[];
  props: Record<string, any>;
  state: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  mounted: boolean;
  region?: { x: number; y: number; width: number; height: number };
}

/**
 * Component reference
 */
export interface ComponentRef {
  id: string;
  component: Component;
  metadata: ComponentMetadata;
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  total: number;
  mounted: number;
  byType: Record<string, number>;
  depth: number;
}

/**
 * Registration options
 */
export interface RegisterOptions {
  id?: string;
  type?: string;
  name?: string;
  parent?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
}

/**
 * Mount region
 */
export interface MountRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}