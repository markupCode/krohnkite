import { ILayout } from "./layout";

export interface ILayoutStoreEntry {
  currentLayout: ILayout | null;

  cycleLayout(): void;
  setLayout(layoutType: any): void;
}
