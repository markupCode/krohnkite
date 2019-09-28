import { WindowState } from "../../../architecture";
import { ILayout } from "../../../domain/layouts/layout";
import { Window } from "../../window/window";
import { Rectangle } from "../../../utils/rectangle";

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
