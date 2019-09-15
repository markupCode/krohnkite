import { CONFIG, ILayout } from "../architecture";
import { Window } from "../engine/window";
import { Rect } from "../util/rect";

export class MonocleLayout implements ILayout {
  public get enabled(): boolean {
    return CONFIG.enableMonocleLayout;
  }

  public apply = (tiles: Window[], area: Rect, workingArea?: Rect): void => {
    if (CONFIG.monocleMaximize) {
      area = workingArea || area;
      tiles.forEach(window => (window.noBorder = true));
    }
    tiles.forEach(window => (window.geometry = area));
  };

  public toString(): string {
    return "MonocleLayout()";
  }
}
