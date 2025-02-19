import { Shortcut } from "../../../architecture";
import { IConfig } from "../../../domain/config/config";
import { ILayout } from "../../../domain/layouts/layout";
import { Window } from "../../window/window";
import { WindowResizeDelta } from "../../tiling/window-resize-delta";
import { Rectangle } from "../../../utils/rectangle";
import { clip, slide } from "../../../utils/utils-service";
import {
  adjustStackWeights,
  LayoutWeightMap,
  stackTilesWithWeight
} from "../layout-utils";

export class TileLayout implements ILayout {
  private static readonly MIN_MASTER_RATIO = 0.2;
  private static readonly MAX_MASTER_RATIO = 0.8;

  public get enabled(): boolean {
    return this.config.enableTileLayout;
  }

  private numMaster: number;
  private masterRatio: number; /* in ratio */
  private weights: LayoutWeightMap;

  constructor(private config: IConfig) {
    this.numMaster = 1;
    this.masterRatio = 0.55;
    this.weights = new LayoutWeightMap();
  }

  public adjust(area: Rectangle, tiles: Window[], basis: Window) {
    if (tiles.length <= this.numMaster) {
      return;
    }

    const idx = tiles.indexOf(basis);
    if (idx < 0) {
      return;
    }

    const delta = new WindowResizeDelta(basis);
    if (idx < this.numMaster) {
      /* master tiles */
      if (delta.east !== 0) {
        const newMasterWidth =
          Math.floor(area.width * this.masterRatio) + delta.east;
        this.masterRatio = newMasterWidth / area.width;
      }

      let height = basis.geometry.height;
      if (idx < this.numMaster - 1 && Math.abs(delta.south) > 3) {
        adjustStackWeights(
          tiles.slice(0, this.numMaster),
          basis,
          (height += delta.south),
          this.weights,
          area.height,
          "forward",
          this.config.tileLayoutGap
        );
      }

      if (idx > 0 && delta.north !== 0) {
        adjustStackWeights(
          tiles.slice(0, this.numMaster),
          basis,
          (height += delta.north),
          this.weights,
          area.height,
          "backward",
          this.config.tileLayoutGap
        );
      }
    } else {
      /* stack tiles */
      if (delta.west !== 0) {
        const newStackWidth =
          area.width - Math.floor(area.width * this.masterRatio) + delta.west;
        this.masterRatio = (area.width - newStackWidth) / area.width;
      }

      let height = basis.geometry.height;
      if (idx < tiles.length - 1 && Math.abs(delta.south) > 3) {
        adjustStackWeights(
          tiles.slice(this.numMaster),
          basis,
          (height += delta.south),
          this.weights,
          area.height,
          "forward",
          this.config.tileLayoutGap
        );
      }

      if (idx > this.numMaster && Math.abs(delta.north) > 3) {
        adjustStackWeights(
          tiles.slice(this.numMaster),
          basis,
          (height += delta.north),
          this.weights,
          area.height,
          "backward",
          this.config.tileLayoutGap
        );
      }
    }

    this.masterRatio = clip(
      this.masterRatio,
      TileLayout.MIN_MASTER_RATIO,
      TileLayout.MAX_MASTER_RATIO
    );
  }

  public apply = (tiles: Window[], area: Rectangle): void => {
    const gap = this.config.tileLayoutGap;
    /* TODO: clean up cache / check invalidated(unmanage) entries */

    if (tiles.length <= this.numMaster) {
      /* only master */
      stackTilesWithWeight(tiles, area, this.weights, gap);
    } else if (this.numMaster === 0) {
      /* only stack */
      stackTilesWithWeight(tiles, area, this.weights, gap);
    } else {
      /* master & stack */
      const mgap = Math.ceil(gap / 2);
      const sgap = gap - mgap;

      const masterFullWidth = Math.floor(area.width * this.masterRatio);
      const masterWidth = masterFullWidth - mgap;
      const stackWidth = area.width - masterFullWidth - sgap;
      const stackX = area.x + masterFullWidth + sgap;

      stackTilesWithWeight(
        tiles.slice(0, this.numMaster),
        new Rectangle(area.x, area.y, masterWidth, area.height),
        this.weights,
        gap
      );

      stackTilesWithWeight(
        tiles.slice(this.numMaster),
        new Rectangle(stackX, area.y, stackWidth, area.height),
        this.weights,
        gap
      );
    }
  };

  public handleShortcut(input: Shortcut) {
    switch (input) {
      case Shortcut.Left:
        this.masterRatio = clip(
          slide(this.masterRatio, -0.05),
          TileLayout.MIN_MASTER_RATIO,
          TileLayout.MAX_MASTER_RATIO
        );
        break;
      case Shortcut.Right:
        this.masterRatio = clip(
          slide(this.masterRatio, +0.05),
          TileLayout.MIN_MASTER_RATIO,
          TileLayout.MAX_MASTER_RATIO
        );
        break;
      case Shortcut.Increase:
        // TODO: define arbitrary constant
        if (this.numMaster < 10) {
          this.numMaster += 1;
        }
        break;
      case Shortcut.Decrease:
        if (this.numMaster > 0) {
          this.numMaster -= 1;
        }
        break;
      case Shortcut.GrowHeight:
        break;
      case Shortcut.ShrinkHeight:
        break;
      default:
        return false;
    }
    return true;
  }

  public toString(): string {
    return `"TileLayout(nmaster=${this.numMaster}, ratio=${this.masterRatio})`;
  }
}
