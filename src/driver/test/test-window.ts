import { IDriverContext, IDriverWindow } from "../../architecture";
import { Rectangle } from "../../utils/rectangle";
import { TestContext } from "./test-context";

export class TestWindow implements IDriverWindow {
  private static windowCount: number = 0;

  public readonly id: string;
  public readonly shouldFloat: boolean;
  public readonly shouldIgnore: boolean;

  public context: TestContext;
  public fullScreen: boolean;
  public geometry: Rectangle;
  public keepBelow: boolean;
  public noBorder: boolean;

  constructor(
    ctx: TestContext,
    geometry?: Rectangle,
    ignore?: boolean,
    float?: boolean
  ) {
    this.id = String(TestWindow.windowCount);
    TestWindow.windowCount += 1;
    this.shouldFloat = float !== undefined ? float : false;
    this.shouldIgnore = ignore !== undefined ? ignore : false;
    this.context = ctx;
    this.fullScreen = false;
    this.geometry = geometry || new Rectangle(0, 0, 100, 100);
    this.keepBelow = false;
    this.noBorder = false;
  }

  public commit(geometry?: Rectangle, noBorder?: boolean, keepBelow?: boolean) {
    if (geometry) {
      this.geometry = geometry;
    }

    if (noBorder !== undefined) {
      this.noBorder = noBorder;
    }

    if (keepBelow !== undefined) {
      this.keepBelow = keepBelow;
    }
  }

  public visible(ctx: IDriverContext): boolean {
    const tctx = ctx as TestContext;
    return this.context.screen === tctx.screen;
  }
}
