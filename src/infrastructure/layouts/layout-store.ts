import { IDriverContext } from "../../architecture";
import { ILayout } from "../../domain/layouts/layout";
import { ILayoutFactory } from "../../domain/layouts/layout-factory";
import { ILayoutStoreEntry } from "../../domain/layouts/layout-store-entry";
import { ILayoutStoreEntryFactory } from "../../domain/layouts/layout-store-entry-factory";

export class LayoutStore {
  private store: {
    [key: string]: ILayoutStoreEntry;
  };

  constructor(
    private layoutFactory: ILayoutFactory,
    private entryFactory: ILayoutStoreEntryFactory
  ) {
    this.store = {};
  }

  public getCurrentLayout(context: IDriverContext): ILayout {
    if (context.ignore) {
      return this.layoutFactory.getDefaultLayout();
    }

    const usedEntry = this.getEntry(context.id).currentLayout;

    if (!usedEntry) {
      return this.layoutFactory.getDefaultLayout();
    }

    return usedEntry;
  }

  public cycleLayout(context: IDriverContext) {
    if (context.ignore) {
      return;
    }
    this.getEntry(context.id).cycleLayout();
  }

  public setLayout(context: IDriverContext, layoutType: any) {
    if (context.ignore) {
      return;
    }
    this.getEntry(context.id).setLayout(layoutType);
  }

  private getEntry(key: string): ILayoutStoreEntry {
    if (!this.store[key]) {
      this.store[key] = this.entryFactory.getLayoutEntry();
    }

    return this.store[key];
  }
}
