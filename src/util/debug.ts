const DEBUG = {
  enabled: false,
  started: new Date().getTime()
};

function debug(f: () => any) {
  if (DEBUG.enabled) {
    const timestamp = (new Date().getTime() - DEBUG.started) / 1000;
    console.log("[" + timestamp + "]", f()); // tslint:disable-line:no-console
  }
}

function debugObj(f: () => [string, any]) {
  if (DEBUG.enabled) {
    const timestamp = (new Date().getTime() - DEBUG.started) / 1000;
    const [name, obj] = f();
    const buf = [];

    for (const i in obj) {
      buf.push(i + "=" + obj[i]);
    }

    console.log("[" + timestamp + "]", name + ": " + buf.join(" ")); // tslint:disable-line:no-console
  }
}
