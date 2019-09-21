export interface ILogger {
  debug(...args: Array<() => any>): void;
}
