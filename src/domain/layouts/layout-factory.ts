import { ILayout } from "./layout";

export interface ILayoutFactory {
  getLayouts(): ReadonlyArray<ILayout>;
  getDefaultLayout(): ILayout;
}
