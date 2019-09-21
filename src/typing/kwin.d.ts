// API Reference:
//     https://techbase.kde.org/Development/Tutorials/KWin/Scripting/API_4.9

declare var console: any;

declare namespace KWin {
  /* enum ClientAreaOption */
  var PlacementArea: number;

  function readConfig(key: string, defaultValue?: any): any;

  function registerShortcut(
    title: string,
    text: string,
    keySequence: string,
    callback: any
  ): boolean;

  interface WorkspaceWrapper {
    /* read-only */
    readonly currentActivity: string;
    readonly numScreens: number;

    /* read-write */
    activeClient: KWin.Client;
    currentDesktop: number;
    /* NOTE: if no window is present, this points to desktop. */

    /* signals */
    activitiesChanged: QSignal;
    activityAdded: QSignal;
    activityRemoved: QSignal;
    clientAdded: QSignal;
    clientFullScreenSet: QSignal;
    clientMaximizeSet: QSignal;
    clientMinimized: QSignal;
    clientRemoved: QSignal;
    clientUnminimized: QSignal;
    currentActivityChanged: QSignal;
    currentDesktopChanged: QSignal;
    numberDesktopsChanged: QSignal;
    numberScreensChanged: QSignal;
    screenResized: QSignal;

    /* functions */
    clientList(): Client[];
    clientArea(option: number, screen: number, desktop: number): QRect;
  }

  interface Options {
    /* signal */
    configChanged: QSignal;
  }

  interface Toplevel {
    /* read-only */
    readonly activities: string[] /* Not exactly `Array` */;
    readonly dialog: boolean;
    readonly resourceClass: QByteArray;
    readonly resourceName: QByteArray;
    readonly screen: number;
    readonly splash: boolean;
    readonly utility: boolean;
    readonly windowId: number;
    readonly windowRole: QByteArray;

    readonly clientPos: QPoint;
    readonly clientSize: QSize;

    /* signal */
    activitiesChanged: QSignal;
    geometryChanged: QSignal;
    screenChanged: QSignal;
    windowShown: QSignal;
  }

  interface Client extends Toplevel {
    /* read-only */
    readonly caption: string;
    readonly maxSize: QSize;
    readonly minSize: QSize;
    readonly modal: boolean;
    readonly move: boolean;
    readonly resize: boolean;
    readonly resizeable: boolean;
    readonly specialWindow: boolean;

    /* read-write */
    desktop: number;
    fullScreen: boolean;
    geometry: QRect;
    keepAbove: boolean;
    keepBelow: boolean;
    minimized: boolean;
    noBorder: boolean;
    onAllDesktops: boolean;
    basicUnit: QSize;

    /* signals */
    desktopChanged: QSignal;
    moveResizedChanged: QSignal;
  }
}

declare var workspace: KWin.WorkspaceWrapper;
declare var options: KWin.Options;
