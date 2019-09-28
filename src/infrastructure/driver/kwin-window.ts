import { IDriverContext, IDriverWindow } from "../../architecture";
import { IConfig } from "../../domain/config/config";
import { ILogger } from "../../domain/logging/logger";
import { Rectangle } from "../../utils/rectangle";
import { toQRectangle, toRectangle } from "../../utils/rectangle-mappers";
import { clip, matchWords } from "../../utils/utils-service";
import { KWinContext } from "./kwin-context";

export class KWinWindow implements IDriverWindow {
  public static generateID(client: KWin.Client) {
    return String(client) + "/" + client.windowId;
  }

  private static readonly PLASMA_SHELL_RESORCE_CLASS = "plasmashell";

  public readonly client: KWin.Client;
  public readonly id: string;

  public get context(): IDriverContext {
    let activity;
    if (this.client.activities.length === 0) {
      activity = workspace.currentActivity;
    } else if (this.client.activities.indexOf(workspace.currentActivity) >= 0) {
      activity = workspace.currentActivity;
    } else {
      activity = this.client.activities[0];
    }

    const desktop =
      this.client.desktop >= 0 ? this.client.desktop : workspace.currentDesktop;

    return new KWinContext(this.client.screen, activity, desktop);
  }

  public get fullScreen(): boolean {
    return this.client.fullScreen;
  }

  public get geometry(): Rectangle {
    return toRectangle(this.client.geometry);
  }

  public get shouldIgnore(): boolean {
    const resourceClass = String(this.client.resourceClass);

    if (
      this.client.specialWindow ||
      resourceClass === KWinWindow.PLASMA_SHELL_RESORCE_CLASS
    ) {
      return true;
    }

    if (
      this.config.ignoreClass.indexOf(resourceClass) >= 0 ||
      matchWords(this.client.caption, this.config.ignoreTitle) >= 0
    ) {
      return true;
    }

    return false;
  }

  public get shouldFloat(): boolean {
    const resourceClass = String(this.client.resourceClass);

    if (this.client.modal || !this.client.resizeable) {
      return true;
    }

    if (
      this.config.floatUtility &&
      (this.client.dialog || this.client.splash || this.client.utility)
    ) {
      return true;
    }

    if (
      this.config.floatingClass.indexOf(resourceClass) >= 0 ||
      matchWords(this.client.caption, this.config.floatingTitle) >= 0
    ) {
      return true;
    }

    return false;
  }

  private readonly _bakNoBorder: boolean;

  constructor(
    private config: IConfig,
    private logger: ILogger,
    client: KWin.Client
  ) {
    this.client = client;
    this.id = KWinWindow.generateID(client);
    this._bakNoBorder = client.noBorder;
  }

  public commit(geometry?: Rectangle, noBorder?: boolean, keepBelow?: boolean) {
    if (this.client.move || this.client.resize) {
      return;
    }

    if (noBorder !== undefined) {
      this.client.noBorder = noBorder || this._bakNoBorder;
    }

    if (keepBelow !== undefined) {
      this.client.keepBelow = keepBelow;
    }

    if (geometry !== undefined) {
      geometry = this.adjustGeometry(geometry);

      if (this.config.preventProtrusion) {
        const area = toRectangle(
          workspace.clientArea(
            KWin.PlacementArea,
            this.client.screen,
            workspace.currentDesktop
          )
        );

        if (!area.includes(geometry)) {
          /* assume windows will extrude only through right and bottom edges */
          const x = geometry.x + Math.min(area.maxX - geometry.maxX, 0);
          const y = geometry.y + Math.min(area.maxY - geometry.maxY, 0);
          geometry = new Rectangle(x, y, geometry.width, geometry.height);
          geometry = this.adjustGeometry(geometry);
        }
      }

      this.client.geometry = toQRectangle(geometry);
    }
  }

  public toString(): string {
    /* using a shorthand name to keep debug message tidy */
    return `KWin(${this.client.windowId.toString(16)}.${
      this.client.resourceClass
    })`;
  }

  public visible(context: IDriverContext): boolean {
    // TODO: how it happened?
    const kwinContext = context as KWinContext;

    if (this.client.minimized) {
      return false;
    }

    // on all desktop
    if (
      this.client.desktop !== kwinContext.desktop &&
      this.client.desktop !== -1
    ) {
      return false;
    }

    // on all activities
    if (
      this.client.activities.length !== 0 &&
      this.client.activities.indexOf(kwinContext.activity) === -1
    ) {
      return false;
    }

    return this.client.screen === kwinContext.screen;
  }

  private adjustGeometry(geometry: Rectangle): Rectangle {
    let width = geometry.width;
    let height = geometry.height;

    /* do not resize fixed-size windows */
    if (!this.client.resizeable) {
      return new Rectangle(
        geometry.x,
        geometry.y,
        this.client.geometry.width,
        this.client.geometry.height
      );
    }

    /* respect resize increment */
    if (
      !(this.client.basicUnit.width === 1 && this.client.basicUnit.height === 1)
    ) {
      /* NOT free-size */
      [width, height] = this.applyResizeIncrement(geometry);
    }

    /* respect min/max size limit */
    width = clip(width, this.client.minSize.width, this.client.maxSize.width);
    height = clip(
      height,
      this.client.minSize.height,
      this.client.maxSize.height
    );

    return new Rectangle(geometry.x, geometry.y, width, height);
  }

  private applyResizeIncrement(geometry: Rectangle): [number, number] {
    const unit = this.client.basicUnit;
    const base = this.client.minSize;

    const padWidth = this.client.geometry.width - this.client.clientSize.width;
    const padHeight =
      this.client.geometry.height - this.client.clientSize.height;

    const quotWidth = Math.floor(
      (geometry.width - base.width - padWidth) / unit.width
    );
    const quotHeight = Math.floor(
      (geometry.height - base.height - padHeight) / unit.height
    );

    const newWidth = base.width + unit.width * quotWidth + padWidth;
    const newHeight = base.height + unit.height * quotHeight + padHeight;

    this.logger.debug(() => [
      "applyResizeIncrement",
      {
        unit,
        base,
        geom: geometry,
        pad: [padWidth, padHeight].join("x"),
        size: [newWidth, newHeight].join("x")
      }
    ]);

    return [newWidth, newHeight];
  }
}
