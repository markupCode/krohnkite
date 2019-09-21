import { ILayout } from "../architecture";
import { FloatingLayout } from "../infrastructure/layouts/floating-layout";
import { MonocleLayout } from "../infrastructure/layouts/monocle-layout";
import { QuarterLayout } from "../infrastructure/layouts/quarter-layout";
import { SpreadLayout } from "../infrastructure/layouts/spread-layout";
import { StairLayout } from "../infrastructure/layouts/stair-layout";
import { TileLayout } from "../infrastructure/layouts/tile-layout";

export class LayoutStoreEntry {
  public layouts: ILayout[];

  public get currentLayout(): ILayout {
    if (this.layouts[0].enabled) {
      return this.layouts[0];
    }

    this.cycleLayout();
    if (this.layouts[0].enabled) {
      return this.layouts[0];
    }
    return FloatingLayout.instance;
  }

  constructor() {
    this.layouts = [
      new TileLayout(),
      new MonocleLayout(),
      new SpreadLayout(),
      new StairLayout(),
      new QuarterLayout()
    ];
  }

  public cycleLayout() {
    const start = this.layouts[0];
    for (;;) {
      this.layouts.push(this.layouts.shift() as ILayout);
      if (this.layouts[0].enabled) {
        break;
      }
      if (this.layouts[0] === start) {
        break;
      }
    }
  }

  public setLayout(cls: any) {
    const result = this.layouts.filter(lo => lo.enabled && lo instanceof cls);
    if (result.length === 0) {
      return;
    }
    const layout = result[0];

    while (this.layouts[0] !== layout) {
      this.layouts.push(this.layouts.shift() as ILayout);
    }
  }
}
