import { IDriver } from "../../src/domain/driver/driver";
import { IDriverContext } from "../../src/domain/driver/driver-context";
import { Window } from "../../src/infrastructure/window/window";
import { Rectangle } from "../../src/utils/rectangle";
import { TestContext } from "./test-context";

export class TestDriver implements IDriver {
  public currentScreen: number;
  public currentWindow: number;
  public numScreen: number;
  public screenSize: Rectangle;
  public windows: Window[];

  constructor() {
    this.currentScreen = 0;
    this.currentWindow = 0;
    this.numScreen = 1;
    this.screenSize = new Rectangle(0, 0, 10000, 10000);
    this.windows = [];
  }

  public forEachScreen(func: (ctx: IDriverContext) => void) {
    for (let screen = 0; screen < this.numScreen; screen++) {
      func(new TestContext(screen));
    }
  }

  public getCurrentContext(): IDriverContext {
    const window = this.getCurrentWindow();
    if (window) {
      return window.context;
    }
    return new TestContext(0);
  }

  public getCurrentWindow(): Window | null {
    return this.windows.length !== 0 ? this.windows[this.currentWindow] : null;
  }

  public getWorkingArea(ctx: IDriverContext): Rectangle {
    return this.screenSize;
  }

  public setCurrentWindow(window: Window) {
    const idx = this.windows.indexOf(window);
    if (idx !== -1) {
      this.currentWindow = idx;
    }
  }

  public setTimeout(func: () => void, timeout: number) {
    setTimeout(func, timeout);
  }
}

// TODO: make decision to fix after refactor process
// export function setTestConfig(name: string, value: any) {
//   if (!CONFIG) {
//     CONFIG = {} as any;
//   }

//   (CONFIG as any)[name] = value;
// }
