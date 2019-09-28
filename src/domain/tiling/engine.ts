import { Window } from "../../infrastructure/window/window";
import { Shortcut } from "../config/shortcut";
import { IDriverContext } from "../driver/driver-context";

/**
 * Maintains tiling context and performs various tiling actions
 */
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
