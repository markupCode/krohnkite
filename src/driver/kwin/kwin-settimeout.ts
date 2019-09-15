import { debugObj } from "../../util/debug";

export class KWinTimerPool {
  public static readonly instance = new KWinTimerPool();

  public timers: QQmlTimer[];

  constructor() {
    this.timers = [];
  }

  public setTimeout(func: () => void, timeout: number) {
    const timer: QQmlTimer =
      this.timers.pop() ||
      Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);

    const callback = () => {
      try {
        timer.triggered.disconnect(callback);
      } catch (e) {
        /* ignore */
      }
      try {
        func();
      } catch (e) {
        /* ignore */
      }
      this.timers.push(timer);
      debugObj(() => ["setTimeout/callback", { poolSize: this.timers.length }]);
    };

    timer.interval = timeout;
    timer.repeat = false;
    timer.triggered.connect(callback);
    timer.start();
  }
}

export function KWinSetTimeout(func: () => void, timeout: number) {
  KWinTimerPool.instance.setTimeout(func, timeout);
}
