import { Shortcut } from "../../../architecture";
import { IConfig } from "../../../domain/config/config";
import { ILayout } from "../../../domain/layouts/layout";
import { Window } from "../../window/window";
import { Rectangle } from "../../../utils/rectangle";

export class StairLayout implements ILayout {
  public get enabled(): boolean {
    return this.config.enableStairLayout;
  }

  private space: number; /* in pixels */

  constructor(private config: IConfig) {
    this.space = 24;
  }

  public apply = (tiles: Window[], area: Rectangle): void => {
    const len = tiles.length;
    const space = this.space;

    // TODO: limit the maximum number of staired windows.

    for (let i = 0; i < len; i++) {
      const dx = space * (len - i - 1);
      const dy = space * i;
      tiles[i].geometry = new Rectangle(
        area.x + dx,
        area.y + dy,
        area.width - dx,
        area.height - dy
      );
    }
  };

  public handleShortcut(input: Shortcut) {
    switch (input) {
      case Shortcut.Decrease:
        // TODO: define arbitrary constants
        this.space = Math.max(16, this.space - 8);
        break;
      case Shortcut.Increase:
        // TODO: define arbitrary constants
        this.space = Math.min(160, this.space + 8);
        break;
      default:
        return false;
    }
    return true;
  }

  public toString(): string {
    return "StairLayout(" + this.space + ")";
  }
}
