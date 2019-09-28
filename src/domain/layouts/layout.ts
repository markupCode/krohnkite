import { Window } from "../../infrastructure/window/window";
import { Rectangle } from "../../utils/rectangle";
import { Shortcut } from "../config/shortcut";

export interface ILayout {
  readonly enabled: boolean;

  adjust?(area: Rectangle, tiles: Window[], basis: Window): void;
  apply(tiles: Window[], area: Rectangle, workingArea?: Rectangle): void;
  toString(): string;

  handleShortcut?(input: Shortcut, data?: any): boolean;
}
