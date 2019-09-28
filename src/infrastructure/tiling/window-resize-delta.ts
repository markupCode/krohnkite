import { Rectangle } from "../../utils/rectangle";
import { Window } from "../window/window";

export class WindowResizeDelta {
  public readonly diff: Rectangle;

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
    const innerRepresentation = {
      diff: this.diff,
      east: this.east,
      north: this.north,
      south: this.south,
      west: this.west
    };

    return JSON.stringify(innerRepresentation);
  }
}
