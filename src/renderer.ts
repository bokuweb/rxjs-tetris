/// <reference path="../node_modules/snabbdom/type-definitions/snabbdom.d.ts" />

declare function require(s: string): any;

import { VNode, init } from 'snabbdom';

export const h = require('snabbdom/h');

const patch = init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/class'),
  require('snabbdom/modules/props'),
  require('snabbdom/modules/style'),
  require('snabbdom/modules/eventlisteners'),
]);

export class Renderer {

  prevNode: VNode;

  mount(el: HTMLElement, initNode: VNode) {
    this.prevNode = initNode;
    patch(el, initNode);
  }

  update(vnode: VNode) {
    patch(this.prevNode, vnode);
    this.prevNode = vnode;
  }
}
