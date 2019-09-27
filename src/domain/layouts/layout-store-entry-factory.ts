import { ILayoutStoreEntry } from "./layout-store-entry";

export interface ILayoutStoreEntryFactory {
  getLayoutEntry(): ILayoutStoreEntry;
}
