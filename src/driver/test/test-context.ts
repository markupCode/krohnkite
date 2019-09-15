import { IDriverContext } from "../../architecture";

export class TestContext implements IDriverContext {
  public readonly screen: number;

  public get id(): string {
    return String(this.screen);
  }

  public get ignore(): boolean {
    // TODO: optionally ignore some context to test LayoutStore
    return false;
  }

  constructor(screen: number) {
    this.screen = screen;
  }
}
