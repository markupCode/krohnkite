import { IDriverContext, IDriverWindow } from "../../architecture";
import { debugObj } from "../../util/debug";
import { clip, matchWords } from "../../util/func";
import { toQRect, toRect } from "../../util/kwinutil";
import { Rect } from "../../util/rect";
import { KWINCONFIG } from "./kwin-config";
import { KWinContext } from "./kwin-context";

export class KWinWindow implements IDriverWindow {
  public static generateID(client: KWin.Client) {
    return String(client) + "/" + client.windowId;
  }

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

  public get geometry(): Rect {
    return toRect(this.client.geometry);
  }

  public get shouldIgnore(): boolean {
    const resourceClass = String(this.client.resourceClass);
    return (
      this.client.specialWindow ||
      resourceClass === "plasmashell" ||
      KWINCONFIG.ignoreClass.indexOf(resourceClass) >= 0 ||
      matchWords(this.client.caption, KWINCONFIG.ignoreTitle) >= 0
    );
  }

  public get shouldFloat(): boolean {
    const resourceClass = String(this.client.resourceClass);
    return (
      this.client.modal ||
      !this.client.resizeable ||
      (KWINCONFIG.floatUtility &&
        (this.client.dialog || this.client.splash || this.client.utility)) ||
      KWINCONFIG.floatingClass.indexOf(resourceClass) >= 0 ||
      matchWords(this.client.caption, KWINCONFIG.floatingTitle) >= 0
    );
  }

  private readonly _bakNoBorder: boolean;

  constructor(client: KWin.Client) {
    this.client = client;
    this.id = KWinWindow.generateID(client);
    this._bakNoBorder = client.noBorder;
  }

  public commit(geometry?: Rect, noBorder?: boolean, keepBelow?: boolean) {
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
      if (KWINCONFIG.preventProtrusion) {
        const area = toRect(
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
          geometry = new Rect(x, y, geometry.width, geometry.height);
          geometry = this.adjustGeometry(geometry);
        }
      }
      this.client.geometry = toQRect(geometry);
    }
  }

  public toString(): string {
    /* using a shorthand name to keep debug message tidy */
    return (
      "KWin(" +
      this.client.windowId.toString(16) +
      "." +
      this.client.resourceClass +
      ")"
    );
  }

  public visible(ctx: IDriverContext): boolean {
    const kctx = ctx as KWinContext;
    return (
      !this.client.minimized &&
      (this.client.desktop === kctx.desktop ||
        this.client.desktop === -1) /* on all desktop */ &&
      (this.client.activities.length === 0 /* on all activities */ ||
        this.client.activities.indexOf(kctx.activity) !== -1) &&
      this.client.screen === kctx.screen
    );
  }

  private adjustGeometry(geometry: Rect): Rect {
    let width = geometry.width;
    let height = geometry.height;

    /* do not resize fixed-size windows */
    if (!this.client.resizeable) {
      width = this.client.geometry.width;
      height = this.client.geometry.height;
    } else {
      /* respect resize increment */
      if (
        !(
          this.client.basicUnit.width === 1 &&
          this.client.basicUnit.height === 1
        )
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
    }

    return new Rect(geometry.x, geometry.y, width, height);
  }

  private applyResizeIncrement(geom: Rect): [number, number] {
    const unit = this.client.basicUnit;
    const base = this.client.minSize;

    const padWidth = this.client.geometry.width - this.client.clientSize.width;
    const padHeight =
      this.client.geometry.height - this.client.clientSize.height;

    const quotWidth = Math.floor(
      (geom.width - base.width - padWidth) / unit.width
    );
    const quotHeight = Math.floor(
      (geom.height - base.height - padHeight) / unit.height
    );

    const newWidth = base.width + unit.width * quotWidth + padWidth;
    const newHeight = base.height + unit.height * quotHeight + padHeight;

    debugObj(() => [
      "applyResizeIncrement",
      {
        unit,
        base,
        geom,
        pad: [padWidth, padHeight].join("x"),
        size: [newWidth, newHeight].join("x")
      }
    ]);

    return [newWidth, newHeight];
  }
}
