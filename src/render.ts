import { Renderer, h } from './renderer';
import { colors } from './shape';

const renderer = new Renderer();
renderer.mount(document.getElementById('container'), h('div'));

export const render = (state: any ) => {
  const vnode = h('div', [
    state.isPaused
      ? h('div', 'Press enter key to start')
      : h('div.field', state.field.map((row: number[]) => (
        h('div.raw', row.map(cell => (
          h(`div.cell${cell !== 99 ? '--active' : ''}`,
            { style: { backgroundColor: colors[cell] }})))
         )
      )))
  ]);
  renderer.update(vnode);
};
