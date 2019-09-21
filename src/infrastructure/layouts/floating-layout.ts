import { ILayout, WindowState } from "../../architecture";
import { Window } from "../../engine/window";
import { Rectangle } from "../../utils/rectangle";

export class FloatingLayout implements ILayout {
  public static instance = new FloatingLayout();

  public get enabled(): boolean {
    return true;
  }

  public apply = (
    tiles: Window[],
    area: Rectangle,
    workingArea?: Rectangle
  ): void => {
    tiles.forEach((tile: Window) => (tile.state = WindowState.FreeTile));
  };

  public toString(): string {
    return "FloatingLayout()";
  }
}
