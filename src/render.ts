import { Renderer, h } from './renderer';

const renderer = new Renderer();
renderer.mount(document.getElementById('container'), h('div'));

const colors = ['none', '#2C3E50', '#E74C3C', '#1ABC9C', '#3498DB', '#E67E22'];

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
