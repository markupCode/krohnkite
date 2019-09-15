import { Rect } from "../util/rect";
import { Window } from "./window";

export class WindowResizeDelta {
  public readonly diff: Rect;
  public readonly east: number;
  public readonly west: number;
  public readonly south: number;
  public readonly north: number;
  public constructor(window: Window) {
    this.diff = window.actualGeometry.subtract(window.geometry);
    this.east = this.diff.width + this.diff.x;
    this.west = -this.diff.x;
    this.south = this.diff.height + this.diff.y;
    this.north = -this.diff.y;
  }
  public toString(): string {
    return (
      "WindowResizeDelta(" +
      [
        "diff=" + this.diff,
        "east=" + this.east,
        "west=" + this.west,
        "north=" + this.north,
        "south=" + this.south
      ].join(" ") +
      ")"
    );
  }
}
