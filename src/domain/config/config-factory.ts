import { IConfig } from "./config";

export interface IConfigFactory {
  get(): IConfig;
}
