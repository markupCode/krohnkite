import { Rectangle } from "../../utils/rectangle";
import { IDriverContext } from "./driver-context";

export interface IDriverWindow {
  readonly context: IDriverContext;
  readonly fullScreen: boolean;
  readonly geometry: Rectangle;
  readonly id: string;
  readonly shouldIgnore: boolean;
  readonly shouldFloat: boolean;

  commit(geometry?: Rectangle, noBorder?: boolean, keepBelow?: boolean): void;
  visible(ctx: IDriverContext): boolean;
}
