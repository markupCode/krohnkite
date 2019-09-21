import { IDriverContext, ILayout } from "../architecture";
import { FloatingLayout } from "../layouts/floating-layout";
import { LayoutStoreEntry } from "./layout-store-entry";

export class LayoutStore {
  private store: {
    [key: string]: LayoutStoreEntry;
  };

  constructor() {
    this.store = {};
  }

  public getCurrentLayout(ctx: IDriverContext): ILayout {
    return ctx.ignore
      ? FloatingLayout.instance
      : this.getEntry(ctx.id).currentLayout;
  }

  public cycleLayout(ctx: IDriverContext) {
    if (ctx.ignore) {
      return;
    }
    this.getEntry(ctx.id).cycleLayout();
  }

  public setLayout(ctx: IDriverContext, cls: any) {
    if (ctx.ignore) {
      return;
    }
    this.getEntry(ctx.id).setLayout(cls);
  }

  private getEntry(key: string): LayoutStoreEntry {
    if (!this.store[key]) {
      this.store[key] = new LayoutStoreEntry();
    }
    return this.store[key];
  }
}
