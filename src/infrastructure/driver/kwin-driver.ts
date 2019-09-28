import { Shortcut } from "../../domain/config/shortcut";
import { IDriver } from "../../domain/driver/driver";
import { IDriverContext } from "../../domain/driver/driver-context";
import { WindowState } from "../../domain/window/window-state";
import { KWinSetTimeout } from "../../utils/kwin/kwin-settimeout";
import { Rectangle } from "../../utils/rectangle";
import { toRectangle } from "../../utils/rectangle-mappers";
import { MonocleLayout } from "../layouts/implementations/monocle-layout";
import { SpreadLayout } from "../layouts/implementations/spread-layout";
import { StairLayout } from "../layouts/implementations/stair-layout";
import { TileLayout } from "../layouts/implementations/tile-layout";
import { TilingController } from "../tiling/tiling-controller";
import { TilingEngine } from "../tiling/tiling-engine";
import { Window } from "../window/window";
import { KWinContext } from "./kwin-context";
import { KWinWindow } from "./kwin-window";

/**
 * Abstracts KDE implementation specific details.
 *
 * Driver is responsible for initializing the tiling logic, connecting
 * signals(Qt/KDE term for binding events), and providing specific utility
 * functions.
 */
export class KWinDriver implements IDriver {
  private engine: TilingEngine;
  private control: TilingController;
  private windowMap: { [key: string]: Window };
  private timerPool: QQmlTimer[];

  constructor() {
    this.engine = new TilingEngine(this);
    this.control = new TilingController(this, this.engine);
    this.windowMap = {};
    this.timerPool = Array();
  }

  public main() {
    // CONFIG = KWINCONFIG = new KWinConfig();
    // debug(() => "Config: " + KWINCONFIG);

    this.bindEvents();
    this.bindShortcut();

    const clients = workspace.clientList();
    for (let i = 0; i < clients.length; i++) {
      const window = this.registerWindow(clients[i]);
      this.engine.manage(window);
      if (window.state !== WindowState.Unmanaged) {
        this.bindWindowEvents(window, clients[i]);
      } else {
        this.unregisterWindow(window);
      }
    }
    this.engine.arrange();
  }

  public forEachScreen(func: (ctx: IDriverContext) => void) {
    for (let screen = 0; screen < workspace.numScreens; screen++) {
      func(
        new KWinContext(
          screen,
          workspace.currentActivity,
          workspace.currentDesktop
        )
      );
    }
  }

  public getCurrentContext(): IDriverContext {
    return new KWinContext(
      workspace.activeClient ? workspace.activeClient.screen : 0,
      workspace.currentActivity,
      workspace.currentDesktop
    );
  }

  public getCurrentWindow(): Window | null {
    const client = workspace.activeClient;
    if (!client) {
      return null;
    }
    
    return this.queryWindow(client);
  }

  public getWorkingArea(ctx: IDriverContext): Rectangle {
    const kctx = ctx as KWinContext;
    return toRectangle(
      workspace.clientArea(
        KWin.PlacementArea,
        kctx.screen,
        workspace.currentDesktop
      )
    );
  }

  public setCurrentWindow(window: Window) {
    const kwindow = window.window as KWinWindow;
    workspace.activeClient = kwindow.client;
  }

  public setTimeout(func: () => void, timeout: number) {
    KWinSetTimeout(func, timeout);
  }

  private bindShortcut() {
    /* check if method exists */
    if (!KWin.registerShortcut) {
      return;
    }

    const bind = (seq: string, title: string, input: Shortcut) => {
      title = "Krohnkite: " + title;
      seq = "Meta+" + seq;
      const cb = () => {
        this.control.onShortcut(input);
      };
      KWin.registerShortcut(title, "", seq, cb);
    };

    bind("J", "Down/Next", Shortcut.Down);
    bind("K", "Up/Prev", Shortcut.Up);
    bind("H", "Left", Shortcut.Left);
    bind("L", "Right", Shortcut.Right);

    bind("Shift+J", "Move Down/Next", Shortcut.ShiftDown);
    bind("Shift+K", "Move Up/Prev", Shortcut.ShiftUp);
    bind("Shift+H", "Move Left", Shortcut.ShiftLeft);
    bind("Shift+L", "Move Right", Shortcut.ShiftRight);

    bind("Ctrl+J", "Grow Height", Shortcut.GrowHeight);
    bind("Ctrl+K", "Shrink Height", Shortcut.ShrinkHeight);
    bind("Ctrl+H", "Shrink Width", Shortcut.ShrinkWidth);
    bind("Ctrl+L", "Grow Width", Shortcut.GrowWidth);

    bind("I", "Increase", Shortcut.Increase);
    bind("D", "Decrease", Shortcut.Decrease);
    bind("F", "Float", Shortcut.ToggleFloat);
    bind("\\", "Cycle Layout", Shortcut.CycleLayout);

    bind("Return", "Set master", Shortcut.SetMaster);

    KWin.registerShortcut("Krohnkite: Tile Layout", "", "Meta+T", () => {
      this.control.onShortcut(Shortcut.SetLayout, TileLayout);
    });

    KWin.registerShortcut("Krohnkite: Monocle Layout", "", "Meta+M", () => {
      this.control.onShortcut(Shortcut.SetLayout, MonocleLayout);
    });

    KWin.registerShortcut("Krohnkite: Spread Layout", "", "", () => {
      this.control.onShortcut(Shortcut.SetLayout, SpreadLayout);
    });

    KWin.registerShortcut("Krohnkite: Stair Layout", "", "", () => {
      this.control.onShortcut(Shortcut.SetLayout, StairLayout);
    });
  }

  /*
   * Signal handlers
   */

  private connect(signal: QSignal, handler: (..._: any[]) => void) {
    const wrapper = (...args: any[]) => {
      /* test if script is enabled.
       * XXX: `workspace` become undefined when the script is disabled. */
      let enabled = false;
      try {
        enabled = !!workspace;
      } catch (e) {
        /* ignore */
      }

      if (enabled) {
        handler.apply(this, args);
      } else {
        signal.disconnect(wrapper);
      }
    };
    signal.connect(wrapper);
  }

  private registerWindow(client: KWin.Client): Window {
    const window = new Window(new KWinWindow(client));
    const key = window.id;
    debugObj(() => ["registerWindow", { key, client }]);
    return (this.windowMap[key] = window);
  }

  private queryWindow(client: KWin.Client): Window | null {
    const key = KWinWindow.generateID(client);
    return this.windowMap[key] || null;
  }

  private unregisterWindow(window: Window) {
    const key = window.id;
    debugObj(() => ["removeTile", { key }]);
    delete this.windowMap[key];
  }

  private bindEvents() {
    this.connect(workspace.numberScreensChanged, (count: number) =>
      this.control.onScreenCountChanged(count)
    );

    this.connect(workspace.screenResized, (screen: number) =>
      this.control.onScreenResized(
        new KWinContext(
          screen,
          workspace.currentActivity,
          workspace.currentDesktop
        )
      )
    );

    this.connect(workspace.currentActivityChanged, (activity: string) =>
      this.control.onCurrentContextChanged(this.getCurrentContext())
    );

    this.connect(
      workspace.currentDesktopChanged,
      (desktop: number, client: KWin.Client) =>
        this.control.onCurrentContextChanged(this.getCurrentContext())
    );

    this.connect(workspace.clientAdded, (client: KWin.Client) => {
      const handler = () => {
        const window = this.registerWindow(client);
        this.control.onWindowAdded(window);
        if (window.state !== WindowState.Unmanaged) {
          this.bindWindowEvents(window, client);
        } else {
          this.unregisterWindow(window);
        }

        client.windowShown.disconnect(handler);
      };
      client.windowShown.connect(handler);
    });

    this.connect(workspace.clientRemoved, (client: KWin.Client) => {
      const window = this.queryWindow(client);
      if (window) {
        this.control.onWindowRemoved(window);
        this.unregisterWindow(window);
      }
    });

    this.connect(
      workspace.clientFullScreenSet,
      (client: KWin.Client, fullScreen: boolean, user: boolean) =>
        this.control.onWindowChanged(
          this.queryWindow(client),
          "fullscreen=" + fullScreen + " user=" + user
        )
    );

    this.connect(workspace.clientMinimized, (client: KWin.Client) => {
      if (KWINCONFIG.preventMinimize) {
        client.minimized = false;
        workspace.activeClient = client;
      } else {
        this.control.onWindowChanged(this.queryWindow(client), "minimized");
      }
    });

    this.connect(workspace.clientUnminimized, (client: KWin.Client) =>
      this.control.onWindowChanged(this.queryWindow(client), "unminimized")
    );

    // TODO: options.configChanged.connect(this.onConfigChanged);
    /* NOTE: How disappointing. This doesn't work at all. Even an official kwin script tries this.
     *       https://github.com/KDE/kwin/blob/master/scripts/minimizeall/contents/code/main.js */
  }

  private bindWindowEvents(window: Window, client: KWin.Client) {
    let moving = false;
    let resizing = false;

    this.connect(client.moveResizedChanged, () => {
      debugObj(() => [
        "moveResizedChanged",
        { window, move: client.move, resize: client.resize }
      ]);
      if (moving !== client.move) {
        moving = client.move;
        if (moving) {
          this.control.onWindowMoveStart(window);
        } else {
          this.control.onWindowMoveOver(window);
        }
      }
      if (resizing !== client.resize) {
        resizing = client.resize;
        if (resizing) {
          this.control.onWindowResizeStart(window);
        } else {
          this.control.onWindowResizeOver(window);
        }
      }
    });

    this.connect(client.geometryChanged, () => {
      if (moving) {
        this.control.onWindowMove(window);
      } else if (resizing) {
        this.control.onWindowResize(window);
      } else {
        if (!window.actualGeometry.equals(window.geometry)) {
          this.control.onWindowGeometryChanged(window);
        }
      }
    });

    this.connect(client.screenChanged, () =>
      this.control.onWindowChanged(window, "screen=" + client.screen)
    );

    this.connect(client.activitiesChanged, () =>
      this.control.onWindowChanged(
        window,
        "activity=" + client.activities.join(",")
      )
    );

    this.connect(client.desktopChanged, () =>
      this.control.onWindowChanged(window, "desktop=" + client.desktop)
    );
  }

  // TODO: private onConfigChanged = () => {
  //     this.loadConfig();
  //     this.engine.arrange();
  // }
  /* NOTE: check `bindEvents` for details */
}
