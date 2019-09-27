import { ILayout } from "../../domain/layouts/layout";
import { ILayoutStoreEntry } from "../../domain/layouts/layout-store-entry";

type LayoutIndex = number | null;

export class LayoutStoreEntry implements ILayoutStoreEntry {
  private currentLayoutIndex: LayoutIndex = null;

  public get currentLayout(): ILayout | null {
    if (!this.currentLayoutIndex) {
      return null;
    }

    if (this.layouts[this.currentLayoutIndex].enabled) {
      return this.layouts[this.currentLayoutIndex];
    }

    this.cycleLayout();

    if (this.layouts[this.currentLayoutIndex].enabled) {
      return this.layouts[this.currentLayoutIndex];
    }

    return null;
  }

  constructor(private layouts: ReadonlyArray<ILayout>) {
    if (layouts.length > 0) {
      this.currentLayoutIndex = 0;
    }
  }

  public cycleLayout() {
    const startIndex = this.currentLayoutIndex;

    if (!startIndex) {
      return;
    }

    for (let i = 1; i < this.layouts.length; i++) {
      const nextIndex = (startIndex + i) % this.layouts.length;

      if (this.layouts[nextIndex].enabled) {
        this.currentLayoutIndex = nextIndex;
        break;
      }
    }
  }

  public setLayout(layoutType: any) {
    const foundLayoutIndex = this.layouts.findIndex(
      layout => layout.enabled && layout instanceof layoutType
    );

    if (foundLayoutIndex === -1) {
      return;
    }

    this.currentLayoutIndex = foundLayoutIndex;
  }
}
