export class KWinTimerPool {
  public static readonly instance = new KWinTimerPool();

  public timers: QQmlTimer[];

  constructor() {
    this.timers = [];
  }

  public setTimeout(action: () => void, timeout: number) {
    // TODO: simplify
    const timer: QQmlTimer =
      this.timers.pop() ||
      Qt.createQmlObject("import QtQuick 2.0; Timer {}", scriptRoot);

    const callback = () => {
      try {
        timer.triggered.disconnect(callback);
      } catch (exception) {
        // TODO: log the exception
      }

      try {
        action();
      } catch (exception) {
        // TODO: log the exception
      }

      this.timers.push(timer);

      // debugObj(() => ["setTimeout/callback", { poolSize: this.timers.length }]);
    };

    timer.interval = timeout;
    timer.repeat = false;
    timer.triggered.connect(callback);
    timer.start();
  }
}

export function KWinSetTimeout(action: () => void, timeout: number) {
  KWinTimerPool.instance.setTimeout(action, timeout);
}
