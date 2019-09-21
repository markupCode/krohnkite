import { IDriverContext, WindowState } from "../architecture";
import { Window } from "./window";

export class WindowStore {
  public list: Window[];

  constructor(windows?: Window[]) {
    this.list = windows || [];
  }

  public move(window: Window, newIdx: number) {
    const idx = this.list.indexOf(window);
    if (idx < 0) {
      return;
    }

    this.list.splice(idx, 1);
    this.list.splice(newIdx, 0, window);
  }

  public get length(): number {
    return this.list.length;
  }

  public at(idx: number) {
    return this.list[idx];
  }

  public indexOf(window: Window) {
    return this.list.indexOf(window);
  }

  public push(window: Window) {
    this.list.push(window);
  }

  public remove(window: Window) {
    const idx = this.list.indexOf(window);
    if (idx >= 0) {
      this.list.splice(idx, 1);
    }
  }

  public visibles(ctx: IDriverContext): Window[] {
    return this.list.filter(win => win.visible(ctx));
  }

  public visibleTiles(ctx: IDriverContext): Window[] {
    return this.list.filter(
      win => win.state === WindowState.Tile && win.visible(ctx)
    );
  }

  public visibleTileables(context: IDriverContext): Window[] {
    return this.list.filter(
      win =>
        (win.state === WindowState.Tile ||
          win.state === WindowState.FreeTile) &&
        win.visible(context)
    );
  }
}
