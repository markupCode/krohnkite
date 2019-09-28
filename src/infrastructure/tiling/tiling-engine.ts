import { IConfig } from "../../domain/config/config";
import { Shortcut } from "../../domain/config/shortcut";
import { IDriver } from "../../domain/driver/driver";
import { IDriverContext } from "../../domain/driver/driver-context";
import { ILogger } from "../../domain/logging/logger";
import { IEngine } from "../../domain/tiling/engine";
import { WindowState } from "../../domain/window/window-state";
import { Rectangle } from "../../utils/rectangle";
import { wrapIndex } from "../../utils/utils-service";
import { KWinContext } from "../driver/kwin-context";
import { LayoutStore } from "../layouts/layout-store";
import { Window } from "../window/window";
import { WindowStore } from "../window/window-store";

export class TilingEngine implements IEngine {
  constructor(
    private driver: IDriver,
    private layouts: LayoutStore,
    private windows: WindowStore,
    private config: IConfig,
    private logger: ILogger
  ) {}

  public adjustLayout(basis: Window) {
    // TODO: why there is assignment to the implementation?
    const context = basis.context as KWinContext;
    const layout = this.layouts.getCurrentLayout(context);

    if (layout.adjust) {
      const fullArea = this.driver.getWorkingArea(context);

      const area = new Rectangle(
        fullArea.x + this.config.screenGapLeft,
        fullArea.y + this.config.screenGapTop,
        fullArea.width -
          (this.config.screenGapLeft + this.config.screenGapRight),
        fullArea.height -
          (this.config.screenGapTop + this.config.screenGapBottom)
      );

      const tiles = this.windows.visibleTiles(context);
      layout.adjust(area, tiles, basis);
    }
  }

  public arrange() {
    this.logger.debug(() => "arrange");

    this.driver.forEachScreen((context: IDriverContext) => {
      this.arrangeScreen(context);
    });
  }

  public arrangeScreen(context: IDriverContext) {
    const layout = this.layouts.getCurrentLayout(context);

    const fullArea = this.driver.getWorkingArea(context);
    const workingArea = new Rectangle(
      fullArea.x + this.config.screenGapLeft,
      fullArea.y + this.config.screenGapTop,
      fullArea.width - (this.config.screenGapLeft + this.config.screenGapRight),
      fullArea.height - (this.config.screenGapTop + this.config.screenGapBottom)
    );

    const visibles = this.windows.visibles(context);
    const tiles = this.windows.visibleTiles(context);

    this.logger.debug(() => [
      "arrangeScreen",
      {
        context,
        layout,
        tiles: tiles.length,
        visibles: visibles.length
      }
    ]);

    /* reset all properties of windows */
    visibles.forEach(window => {
      if (window.state === WindowState.FreeTile) {
        window.state = WindowState.Tile;
      }

      if (window.state === WindowState.Tile) {
        window.noBorder = this.config.noTileBorder;
      }
    });

    if (this.config.maximizeSoleTile && tiles.length === 1) {
      tiles[0].noBorder = true;
      tiles[0].geometry = fullArea;
    } else if (tiles.length > 0) {
      layout.apply(tiles, workingArea, fullArea);
    }

    visibles.forEach(window => window.commit());
  }

  public enforceSize(window: Window) {
    if (
      window.state === WindowState.Tile &&
      !window.actualGeometry.equals(window.geometry)
    ) {
      this.driver.setTimeout(() => {
        if (window.state === WindowState.Tile) {
          window.commit();
        }
      }, 10);
    }
  }

  public manage(window: Window) {
    if (!window.shouldIgnore) {
      window.state = window.shouldFloat ? WindowState.Float : WindowState.Tile;
      this.windows.push(window);
    }
  }

  public unmanage(window: Window) {
    this.windows.remove(window);
  }

  public moveFocus(window: Window, step: number) {
    if (step === 0) {
      return;
    }

    const context = window ? window.context : this.driver.getCurrentContext();

    const visibles = this.windows.visibles(context);
    if (visibles.length === 0) {
      /* nothing to focus */
      return;
    }

    const idx = window ? visibles.indexOf(window) : -1;
    if (!window || idx < 0) {
      /* unmanaged window -> focus master */
      this.driver.setCurrentWindow(visibles[0]);
      return;
    }

    const num = visibles.length;
    const newIndex = (idx + (step % num) + num) % num;

    this.logger.debug(() => [
      "moveFocus",
      { from: window, to: visibles[newIndex] }
    ]);

    this.driver.setCurrentWindow(visibles[newIndex]);
  }

  public moveTile(window: Window, step: number) {
    if (step === 0) {
      return;
    }

    const context = window.context;
    const visibles = this.windows.visibles(context);
    if (visibles.length < 2) {
      return;
    }

    const vsrc = visibles.indexOf(window);
    const vdst = wrapIndex(vsrc + step, visibles.length);
    const dstWin = visibles[vdst];

    const dst = this.windows.indexOf(dstWin);
    this.logger.debug(() => ["moveTile", { step, vsrc, vdst, dst }]);
    this.windows.move(window, dst);
  }

  public toggleFloat(window: Window) {
    window.state =
      window.state === WindowState.Float ? WindowState.Tile : WindowState.Float;
  }

  public setMaster(window: Window) {
    this.windows.move(window, 0);
  }

  public cycleLayout() {
    this.layouts.cycleLayout(this.driver.getCurrentContext());
  }

  public setLayout(layout: any) {
    if (layout) {
      this.layouts.setLayout(this.driver.getCurrentContext(), layout);
    }
  }

  public handleLayoutShortcut(input: Shortcut, data?: any): boolean {
    const layout = this.layouts.getCurrentLayout(
      this.driver.getCurrentContext()
    );
    if (layout.handleShortcut) {
      return layout.handleShortcut(input, data);
    }
    return false;
  }
}
