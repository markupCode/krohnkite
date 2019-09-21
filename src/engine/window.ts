import { IDriverContext, IDriverWindow, WindowState } from "../architecture";
import { ILogger } from "../domain/logging/logger";
import { Rectangle } from "../utils/rectangle";

export class Window {
  public readonly id: string;

  public get actualGeometry(): Rectangle {
    return this.window.geometry;
  }
  public get context(): IDriverContext {
    return this.window.context;
  }
  public get shouldFloat(): boolean {
    return this.window.shouldFloat;
  }
  public get shouldIgnore(): boolean {
    return this.window.shouldIgnore;
  }

  public get tileable(): boolean {
    return (
      this.state === WindowState.Tile || this.state === WindowState.FreeTile
    );
  }

  public floatGeometry: Rectangle;
  public geometry: Rectangle;
  public noBorder: boolean;

  public get state(): WindowState {
    if (this.window.fullScreen) {
      return WindowState.FullScreen;
    }

    return this._state;
  }

  // TODO: maybe, try splitting this into multiple methods,
  //       like setTile, setFloat, setFreeTile
  public set state(value: WindowState) {
    if (value === WindowState.FullScreen) {
      return;
    }

    const state = this.state;
    if (state === value) {
      return;
    } else if (state === WindowState.Unmanaged) {
      /* internally accept the new state */
    } else if (state === WindowState.FullScreen) {
      /* internally accept the new state */
    } else if (state === WindowState.Tile && value === WindowState.Float) {
      this.window.commit(this.floatGeometry, false, false);
    } else if (state === WindowState.Tile && value === WindowState.FreeTile) {
      this.window.commit(this.floatGeometry, false, false);
    } else if (state === WindowState.Float && value === WindowState.Tile) {
      this.floatGeometry = this.actualGeometry;
    } else if (state === WindowState.Float && value === WindowState.FreeTile) {
      /* do nothing */
    } else if (state === WindowState.FreeTile && value === WindowState.Tile) {
      this.floatGeometry = this.actualGeometry;
    } else if (state === WindowState.FreeTile && value === WindowState.Float) {
      /* do nothing */
    } else {
      /* deny */
      this.logger.debug(() => [
        "Window.state/ignored",
        { from: state, to: value }
      ]);
      return;
    }

    this._state = value;
  }

  private _state: WindowState;

  constructor(public readonly window: IDriverWindow, private logger: ILogger) {
    this.id = window.id;

    this.floatGeometry = window.geometry;
    this.geometry = window.geometry;
    this.noBorder = false;

    this._state = WindowState.Unmanaged;
  }

  public commit() {
    if (this.state === WindowState.Tile) {
      this.window.commit(this.geometry, this.noBorder, true);
    } else if (this.state === WindowState.FullScreen) {
      this.window.commit(undefined, undefined, false);
    }
  }

  public visible(ctx: IDriverContext): boolean {
    return this.window.visible(ctx);
  }

  public toString(): string {
    return "Window(" + String(this.window) + ")";
  }
}
