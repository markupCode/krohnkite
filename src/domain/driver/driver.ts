import { Window } from "../../infrastructure/window/window";
import { Rectangle } from "../../utils/rectangle";
import { IDriverContext } from "./driver-context";

export interface IDriver {
  forEachScreen(func: (ctx: IDriverContext) => void): void;
  getCurrentContext(): IDriverContext;
  getCurrentWindow(): Window | null;
  getWorkingArea(ctx: IDriverContext): Rectangle;
  setCurrentWindow(window: Window): void;
  setTimeout(func: () => void, timeout: number): void;
}
