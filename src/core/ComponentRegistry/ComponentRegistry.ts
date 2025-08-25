/**
 * ComponentRegistry class (CONTAINER ONLY - no logic)
 */

import { EventEmitter } from 'events';
import { Component } from '../Component';
import {
  ComponentMetadata,
  ComponentRef,
  RegisterOptions,
  MountRegion,
  RegistryStats
} from './types';
import { constructor } from './constructor';
import { getInstance } from './getInstance';
import { register } from './register';
import { unregister } from './unregister';
import { get } from './get';
import { getByType } from './getByType';
import { getAll } from './getAll';
import { getChildren } from './getChildren';
import { getAncestors } from './getAncestors';
import { find } from './find';
import { findOne } from './findOne';
import { updateMetadata } from './updateMetadata';
import { mount } from './mount';
import { unmount } from './unmount';
import { getMounted } from './getMounted';
import { moveToParent } from './moveToParent';
import { getTreeJSON } from './getTreeJSON';
import { clear } from './clear';
import { getStats } from './getStats';
import { updateComponentTree } from './updateComponentTree';
import { tree } from './tree';
import { setParent } from './setParent';

export class ComponentRegistry extends EventEmitter {
  public static instance: any;
  public components: Map<string, ComponentRef> = new Map();
  public componentsByType: Map<string, Set<string>> = new Map();
  public componentTree: Map<string, string[]> = new Map();
  public mountedComponents: Set<string> = new Set();
  
  private constructor() {
    super();
    constructor.call(this);
  }
  
  static getInstance(): any {
    return getInstance();
  }
  
  register(component: Component, options: RegisterOptions = {}): string {
    return register.call(this, component, options);
  }
  
  unregister(id: string): boolean {
    return unregister.call(this, id);
  }
  
  get(id: string): ComponentRef | undefined {
    return get.call(this, id);
  }
  
  getByType(type: string): ComponentRef[] {
    return getByType.call(this, type);
  }
  
  getAll(): ComponentRef[] {
    return getAll.call(this);
  }
  
  getChildren(parentId: string): ComponentRef[] {
    return getChildren.call(this, parentId);
  }
  
  getAncestors(id: string): ComponentRef[] {
    return getAncestors.call(this, id);
  }
  
  find(predicate: (ref: ComponentRef) => boolean): ComponentRef[] {
    return find.call(this, predicate);
  }
  
  findOne(predicate: (ref: ComponentRef) => boolean): ComponentRef | undefined {
    return findOne.call(this, predicate);
  }
  
  updateMetadata(id: string, updates: Partial<ComponentMetadata>): boolean {
    return updateMetadata.call(this, id, updates);
  }
  
  mount(id: string, region?: MountRegion): boolean {
    return mount.call(this, id, region);
  }
  
  unmount(id: string): boolean {
    return unmount.call(this, id);
  }
  
  getMounted(): ComponentRef[] {
    return getMounted.call(this);
  }
  
  moveToParent(id: string, newParentId: string | null): boolean {
    return moveToParent.call(this, id, newParentId);
  }
  
  getTreeJSON(): any {
    return getTreeJSON.call(this);
  }
  
  clear(): void {
    return clear.call(this);
  }
  
  getStats(): RegistryStats {
    return getStats.call(this);
  }

  updateComponentTree(childId: string, parentId: string | null): void {
    return setParent.call(this, childId, parentId);
  }

  tree(rootId?: string): string {
    return tree.call(this, rootId);
  }

  findById(id: string): ComponentRef | undefined {
    return get.call(this, id);
  }
}