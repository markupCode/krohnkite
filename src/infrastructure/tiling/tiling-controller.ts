import {
  IDriver,
  IDriverContext,
  Shortcut,
  WindowState
} from "../../architecture";
import { IConfig } from "../../domain/config/config";
import { ILogger } from "../../domain/logging/logger";
import { TilingEngine } from "./tiling-engine";
import { Window } from "../window/window";

/**
 * A thin layer which translates WM events to tiling actions.
 */
export class TilingController {
  public constructor(
    private driver: IDriver,
    private engine: TilingEngine,
    private config: IConfig,
    private logger: ILogger
  ) {}

  public onScreenCountChanged(count: number): void {
    this.logger.debug(() => ["onScreenCountChanged", { count }]);
    this.engine.arrange();
  }

  public onScreenResized(context: IDriverContext): void {
    this.logger.debug(() => ["onScreenResized", { ctx: context }]);
    this.engine.arrangeScreen(context);
  }

  public onCurrentContextChanged(context: IDriverContext): void {
    this.logger.debug(() => ["onCurrentContextChanged", { ctx: context }]);
    this.engine.arrange();
  }

  public onWindowAdded(window: Window): void {
    this.logger.debug(() => ["onWindowAdded", { window }]);
    this.engine.manage(window);
    this.engine.arrange();
  }

  public onWindowRemoved(window: Window): void {
    this.logger.debug(() => ["onWindowRemoved", { window }]);
    this.engine.unmanage(window);
    this.engine.arrange();
  }

  public onWindowMoveStart(window: Window): void {
    /* do nothing */
  }

  public onWindowMove(window: Window): void {
    /* do nothing */
  }

  public onWindowMoveOver(window: Window): void {
    this.logger.debug(() => ["onWindowMoveOver", { window }]);

    if (window.state === WindowState.Tile) {
      // TODO: refactor this block;
      const diff = window.actualGeometry.subtract(window.geometry);
      const distance = Math.sqrt(diff.x ** 2 + diff.y ** 2);

      // TODO: arbitrary constant
      if (distance > 30) {
        window.floatGeometry = window.actualGeometry;
        window.state = WindowState.Float;
        this.engine.arrange();
      } else {
        window.commit();
      }
    }
  }

  public onWindowResizeStart(window: Window): void {
    /* do nothing */
  }

  public onWindowResize(window: Window): void {
    this.logger.debug(() => ["onWindowResizeOver", { window }]);

    if (this.config.adjustLayout && this.config.adjustLayoutLive) {
      if (window.state === WindowState.Tile) {
        this.engine.adjustLayout(window);
        this.engine.arrange();
      }
    }
  }

  public onWindowResizeOver(window: Window): void {
    this.logger.debug(() => ["onWindowResizeOver", { window }]);

    if (this.config.adjustLayout && window.state === WindowState.Tile) {
      this.engine.adjustLayout(window);
      this.engine.arrange();
    } else if (!this.config.adjustLayout) {
      this.engine.enforceSize(window);
    }
  }

  public onWindowGeometryChanged(window: Window): void {
    this.logger.debug(() => ["onWindowGeometryChanged", { window }]);
    this.engine.enforceSize(window);
  }

  // NOTE: accepts `null` to simplify caller. This event is a catch-all hack
  // by itself anyway.
  public onWindowChanged(window: Window | null, comment?: string): void {
    if (window) {
      this.logger.debug(() => ["onWindowChanged", { window, comment }]);
      this.engine.arrange();
    }
  }

  public onShortcut(input: Shortcut, data?: any) {
    if (this.engine.handleLayoutShortcut(input, data)) {
      this.engine.arrange();
      return;
    }

    const window = this.driver.getCurrentWindow();
    switch (input) {
      case Shortcut.Up:
        if (window) {
          this.engine.moveFocus(window, -1);
        }
        break;
      case Shortcut.Down:
        if (window) {
          this.engine.moveFocus(window, +1);
        }
        break;

      case Shortcut.ShiftUp:
        if (window) {
          this.engine.moveTile(window, -1);
        }
        break;
      case Shortcut.ShiftDown:
        if (window) {
          this.engine.moveTile(window, +1);
        }
        break;

      case Shortcut.SetMaster:
        if (window) {
          this.engine.setMaster(window);
        }
        break;
      case Shortcut.ToggleFloat:
        if (window) {
          this.engine.toggleFloat(window);
        }
        break;

      case Shortcut.CycleLayout:
        this.engine.cycleLayout();
      case Shortcut.SetLayout:
        this.engine.setLayout(data);
        break;
    }

    this.engine.arrange();
  }
}
