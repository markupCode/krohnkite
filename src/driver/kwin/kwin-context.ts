import { IDriverContext } from "../../architecture";
import { KWINCONFIG } from "../../infrastructure/config/kwin-config-factory";

export class KWinContext implements IDriverContext {
  public readonly screen: number;
  public readonly activity: string;
  public readonly desktop: number;

  private _path: string | null;

  public get id(): string {
    if (!this._path) {
      this._path = String(this.screen);
      if (KWINCONFIG.layoutPerActivity) {
        this._path += "@" + this.activity;
      }

      if (KWINCONFIG.layoutPerDesktop) {
        this._path += "#" + this.desktop;
      }
    }
    return this._path;
  }

  public get ignore(): boolean {
    const activityName = activityInfo.activityName(this.activity);
    return (
      KWINCONFIG.ignoreActivity.indexOf(activityName) >= 0 ||
      KWINCONFIG.ignoreScreen.indexOf(this.screen) >= 0
    );
  }

  constructor(screen: number, activity: string, desktop: number) {
    this.screen = screen;
    this.activity = activity;
    this.desktop = desktop;

    this._path = null;
  }

  public toString(): string {
    return (
      "KWinCtx(" +
      [
        this.screen,
        activityInfo.activityName(this.activity),
        this.desktop
      ].join(", ") +
      ")"
    );
  }
}
