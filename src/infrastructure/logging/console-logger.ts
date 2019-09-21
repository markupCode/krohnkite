import { IConfig } from "../../domain/config/config";
import { ILogger } from "../../domain/logging/logger";

export class ConsoleLogger implements ILogger {
  constructor(private config: IConfig) {}

  public debug(...args: Array<() => any>) {
    if (this.config.debug) {
      console.log(`[${new Date()}]`, ...args.map(logAction => logAction()));
    }
  }
}
