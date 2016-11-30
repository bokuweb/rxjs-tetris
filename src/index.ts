import { Observable, Subject } from 'rxjs';
import { render } from './render';
import { shapes, Shape } from "./shape";
import { beeper } from "./sounder";
import { config } from "./config";
import {
  Action,
  actionSource$,
  StartAction,
  DownAction,
  LeftAction,
  RightAction,
  NextAction,
  RotateAction,
  RemoveAction,
  GameoverAction,
} from './actions';

type Cell = number;
type Row = Cell[];
type Field = Row[];

interface Block {
  x: number;
  y: number;
  shape: Shape;
}

interface AppState {
  isPaused: boolean;
  block: Block;
  field: Field;
}

const { assign } = Object;

const range = (n: number) => Array.from(Array(n).keys());

const fieldFactory = (): Field => range(config.COLUMN).map(() => range(config.ROW).map(() => 99));

const keyEvent$ = Observable
  .fromEvent(document, 'keydown')
  .map((k: KeyboardEvent) => {
    let key: any;
    switch(k.code) {
      case 'ArrowRight': return new RightAction();
      case 'ArrowLeft': return new LeftAction();
      case 'ArrowDown': return new DownAction();
      case 'Enter': return new StartAction();
      case 'Space': return new RotateAction();
      default: return;
    };
  })
  .filter((action) => !!action)
  .subscribe(actionSource$);

Observable
  .interval(500)
  .map(_ => new DownAction())
  .subscribe(actionSource$);

const isCollision = (field: Field, block: Block) => {
  return block.shape.some((row: Row, i: number) => (
    row.some((cell: Cell, j: number) => {
      if (!cell) return;
      const { x, y } = block;
      return field[y + i] && (field[y + i][x + j] !== 99);
    })
  ))
};

const isLocked = (state: AppState) => {
  const { x, y, shape } = state.block;
  return shape.some((row: Row, i: number) => (
    row.some((cell: Cell, j: number) => {
      if (!cell) return;
      if (shape[i + 1] && shape[i + 1][j]) return;
      return typeof state.field[y + i + 1] === 'undefined' ||
      state.field[y + i + 1][x + j] !== 99
    })
  ))
};

const canMoveX = (state: AppState, dx: number) => {
  const block = assign({}, state.block);
  block.x += dx;
  return !isCollision(state.field, block);
}

const getRandomBlock = () => {
  return assign({}, { x: 5, y: 0, shape: shapes[~~(Math.random() * shapes.length)] });
}

const createInitState = () => ({
  field: fieldFactory(),
  block: getRandomBlock(),
  isPaused: true,
});

const getRotatedShape = (shape: Shape) => {
  const newShape: any[] = [];
  shape.forEach((row: number[], y: number) => {
    newShape[y] = [];
    row.forEach((cell: number, x: number) => {
      newShape[y][x] = shape[row.length - x - 1][y];
    });
  })
  return newShape;
};

const createNewField = (field: Field, block: Block) => {
  const newField = field.map((row: Row) => row.map((cell) => cell));
  block.shape.forEach((row: Row, i:number) => {
    row.forEach((cell: Cell, j: number) => {
      if (cell && field[i + block.y] && field[i + block.y][j + block.x]) {
        newField[i + block.y][j + block.x] = cell;
      }
    });
  });
  return newField;
}

const gameState$ = actionSource$
  .scan((state: AppState, action: Action) => {
    if (action instanceof StartAction) {
      return assign(state, { isPaused: false } );
    } else if (action instanceof DownAction) {
      if (state.isPaused) return state;
      if (!isLocked(state)) state.block.y += 1;
      return state;
    } else if (action instanceof LeftAction) {
      if (canMoveX(state, -1)) state.block.x -= 1;
      return assign({}, state);
    } else if (action instanceof RightAction) {
      if (canMoveX(state, 1)) state.block.x += 1;
      return state;
    } else if (action instanceof NextAction) {
      const block = getRandomBlock();
      const newField = createNewField(state.field, state.block);
      return assign(state, { block, field: newField });
    } else if (action instanceof RotateAction) {
      const rotatedBlock = assign({}, state.block, { shape: getRotatedShape(state.block.shape) });
      const block = isCollision(state.field, rotatedBlock) ? state.block : rotatedBlock;
      return assign(state, { block });
    } else if (action instanceof RemoveAction) {
      action.removeRows.forEach((rowIndex: number) => {
        state.field.splice(rowIndex, 1);
        state.field.unshift(range(config.ROW).map(() => 99))
      });
      return state;
    } else if (action instanceof GameoverAction) {
      return createInitState();
    } else {
      return state;
    }
  }, createInitState())
  .share()

const getRemovableRows = (field: Field) => (
  field.map((row: Row, i: number) => (
    row.every(cell => cell !== 99) ? i : null
  )).filter(c => c !== null)
)

const isLocked$ = gameState$
  .map((state: AppState) => isLocked(state))
  .bufferCount(2, 1)
  .map(lockedBuffer => (
    lockedBuffer.every(isLocked => isLocked)
  ))
  .share()

isLocked$
  .distinctUntilChanged()
  .filter(isLocked => !!isLocked)
  .map(_ => new NextAction())
  .do(() => beeper.next(100))
  .subscribe(actionSource$);

gameState$
  .filter((state: AppState) => state.block.y === 0)
  .filter((state: AppState) => (
    isCollision(state.field, state.block) || isLocked(state)
  ))
  .map(_ => new GameoverAction())
  .delay(200)
  .subscribe(actionSource$);

gameState$
  .combineLatest(isLocked$)
  .delay(50)
  .filter(([_, isLocked]) => isLocked)
  .map(([state, _]: [AppState, boolean]) => (
    getRemovableRows(state.field)
  ))
  .filter(removeRows => removeRows.length > 0)
  .do(() => beeper.next(400))
  .map(removeRows => new RemoveAction(removeRows))
  .subscribe(actionSource$);

gameState$
  .map((state: AppState) => ({
    isPaused: state.isPaused,
    field: createNewField(state.field, state.block)
  }))
  .subscribe(render);

