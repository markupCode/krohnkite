import { IConfig } from "../../domain/config/config";
import { IDriverContext } from "../../domain/driver/driver-context";

export class KWinContext implements IDriverContext {
  public readonly screen: number;
  public readonly activity: string;
  public readonly desktop: number;

  private _path: string | null;

  public get id(): string {
    if (!this._path) {
      this._path = String(this.screen);
      
      if (this.config.layoutPerActivity) {
        this._path += "@" + this.activity;
      }

      if (this.config.layoutPerDesktop) {
        this._path += "#" + this.desktop;
      }
    }

    return this._path;
  }

  public get ignore(): boolean {
    const activityName = activityInfo.activityName(this.activity);
    return (
      this.config.ignoreActivity.indexOf(activityName) >= 0 ||
      this.config.ignoreScreen.indexOf(this.screen) >= 0
    );
  }

  constructor(
    private config: IConfig,
    screen: number,
    activity: string,
    desktop: number
  ) {
    this.screen = screen;
    this.activity = activity;
    this.desktop = desktop;

    this._path = null;
  }

  public toString(): string {
    return `KWinContext(${[
      this.screen,
      activityInfo.activityName(this.activity),
      this.desktop
    ].join(", ")})`;
  }
}
