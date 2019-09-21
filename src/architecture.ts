import { Window } from "./engine/window";
import { Rect } from "./util/rect";

export enum Shortcut {
  Left,
  Right,
  Up,
  Down,

  ShiftLeft,
  ShiftRight,
  ShiftUp,
  ShiftDown,

  GrowWidth,
  GrowHeight,
  ShrinkWidth,
  ShrinkHeight,

  Increase,
  Decrease,

  ToggleFloat,
  SetMaster,
  CycleLayout,
  SetLayout
}

export enum WindowState {
  Tile,
  FreeTile,
  Float,
  FullScreen,
  Unmanaged
}

export interface IDriverWindow {
  readonly context: IDriverContext;
  readonly fullScreen: boolean;
  readonly geometry: Rect;
  readonly id: string;
  readonly shouldIgnore: boolean;
  readonly shouldFloat: boolean;

  commit(geometry?: Rect, noBorder?: boolean, keepBelow?: boolean): void;
  visible(ctx: IDriverContext): boolean;
}

export interface IDriverContext {
  readonly id: string;
  readonly ignore: boolean;
}

export interface IDriver {
  forEachScreen(func: (ctx: IDriverContext) => void): void;
  getCurrentContext(): IDriverContext;
  getCurrentWindow(): Window | null;
  getWorkingArea(ctx: IDriverContext): Rect;
  setCurrentWindow(window: Window): void;
  setTimeout(func: () => void, timeout: number): void;
}

export interface IEngine {
  adjustLayout(basis: Window): void;
  arrangeScreen(ctx: IDriverContext): void;

  /* window */
  enforceSize(window: Window): void;
  toggleFloat(window: Window): void;

  /* windows */
  manage(window: Window): void;
  unmanage(window: Window): void;
  moveFocus(window: Window, step: number): void;
  moveTile(window: Window, step: number): void;
  setMaster(window: Window): void;

  /* layout */
  handleLayoutShortcut(input: Shortcut, data?: any): boolean;

  /* layouts */
  cycleLayout(): void;
  setLayout(layout: any): void;
}

export interface ILayout {
  readonly enabled: boolean;

  adjust?(area: Rect, tiles: Window[], basis: Window): void;
  apply(tiles: Window[], area: Rect, workingArea?: Rect): void;
  toString(): string;

  handleShortcut?(input: Shortcut, data?: any): boolean;
}
