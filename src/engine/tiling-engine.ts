import {
  CONFIG,
  IDriver,
  IDriverContext,
  IEngine,
  Shortcut,
  WindowState
} from "../architecture";
import { KWinContext } from "../driver/kwin/kwin-context";
import { debug, debugObj } from "../util/debug";
import { wrapIndex } from "../util/func";
import { Rect } from "../util/rect";
import { LayoutStore } from "./layout-store";
import { Window } from "./window";
import { WindowStore } from "./window-store";

/**
 * Maintains tiling context and performs various tiling actions.
 */
export class TilingEngine implements IEngine {
  private driver: IDriver;
  private layouts: LayoutStore;
  private windows: WindowStore;

  constructor(driver: IDriver) {
    this.driver = driver;
    this.layouts = new LayoutStore();
    this.windows = new WindowStore();
  }

  public adjustLayout(basis: Window) {
    const ctx = basis.context as KWinContext;
    const layout = this.layouts.getCurrentLayout(ctx);
    if (layout.adjust) {
      const fullArea = this.driver.getWorkingArea(ctx);
      const area = new Rect(
        fullArea.x + CONFIG.screenGapLeft,
        fullArea.y + CONFIG.screenGapTop,
        fullArea.width - (CONFIG.screenGapLeft + CONFIG.screenGapRight),
        fullArea.height - (CONFIG.screenGapTop + CONFIG.screenGapBottom)
      );
      const tiles = this.windows.visibleTiles(ctx);
      layout.adjust(area, tiles, basis);
    }
  }

  public arrange() {
    debug(() => "arrange");
    this.driver.forEachScreen((ctx: IDriverContext) => {
      this.arrangeScreen(ctx);
    });
  }

  public arrangeScreen(ctx: IDriverContext) {
    const layout = this.layouts.getCurrentLayout(ctx);

    const fullArea = this.driver.getWorkingArea(ctx);
    const workingArea = new Rect(
      fullArea.x + CONFIG.screenGapLeft,
      fullArea.y + CONFIG.screenGapTop,
      fullArea.width - (CONFIG.screenGapLeft + CONFIG.screenGapRight),
      fullArea.height - (CONFIG.screenGapTop + CONFIG.screenGapBottom)
    );

    const visibles = this.windows.visibles(ctx);
    const tiles = this.windows.visibleTiles(ctx);
    debugObj(() => [
      "arrangeScreen",
      {
        ctx,
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
        window.noBorder = CONFIG.noTileBorder;
      }
    });

    if (CONFIG.maximizeSoleTile && tiles.length === 1) {
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

    const ctx = window ? window.context : this.driver.getCurrentContext();

    const visibles = this.windows.visibles(ctx);
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

    debugObj(() => ["moveFocus", { from: window, to: visibles[newIndex] }]);
    this.driver.setCurrentWindow(visibles[newIndex]);
  }

  public moveTile(window: Window, step: number) {
    if (step === 0) {
      return;
    }

    const ctx = window.context;
    const visibles = this.windows.visibles(ctx);
    if (visibles.length < 2) {
      return;
    }

    const vsrc = visibles.indexOf(window);
    const vdst = wrapIndex(vsrc + step, visibles.length);
    const dstWin = visibles[vdst];

    const dst = this.windows.indexOf(dstWin);
    debugObj(() => ["moveTile", { step, vsrc, vdst, dst }]);
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
