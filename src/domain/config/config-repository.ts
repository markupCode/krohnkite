import { IConfig } from "./config";

export interface IConfigRepository {
  save(config: IConfig): void;
  get(): IConfig;
}
