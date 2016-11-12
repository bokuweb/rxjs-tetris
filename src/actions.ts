import { Subject } from "rxjs/Subject";

export const actionSource$ = new Subject();

export type Action = NextAction |
  StartAction |
  DownAction |
  LeftAction |
  RightAction |
  RotateAction |
  GameoverAction |
  RemoveAction;

export class NextAction {
  constructor () {}
}

export class StartAction {
  constructor () {}
}

export class DownAction {
  constructor () {}
}

export class LeftAction {
  constructor () {}
}

export class RightAction {
  constructor () {}
}

export class RotateAction {
  constructor () {}
}

export class GameoverAction {
  constructor () {}
}

export class RemoveAction {
  constructor (public removeRows: number[]) {}
}

