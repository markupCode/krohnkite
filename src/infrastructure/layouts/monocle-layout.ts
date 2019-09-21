import { ILayout } from "../../architecture";
import { IConfig } from "../../domain/config/config";
import { Window } from "../../engine/window";
import { Rectangle } from "../../utils/rectangle";

export class MonocleLayout implements ILayout {
  public get enabled(): boolean {
    return this.config.enableMonocleLayout;
  }

  constructor(private config: IConfig) {}

  public apply = (
    tiles: Window[],
    area: Rectangle,
    workingArea?: Rectangle
  ): void => {
    if (this.config.monocleMaximize) {
      area = workingArea || area;
      tiles.forEach(window => (window.noBorder = true));
    }
    tiles.forEach(window => (window.geometry = area));
  };

  public toString(): string {
    return "MonocleLayout()";
  }
}
