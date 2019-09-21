import { IConfig } from "../../domain/config/config";
import { IConfigFactory } from "../../domain/config/config-factory";
import { IConfigRepository } from "../../domain/config/config-repository";

export class InMemoryConfigRepository implements IConfigRepository {
  private config: IConfig | undefined;

  constructor(private configFactory: IConfigFactory) {}

  public get(): IConfig {
    if (!this.config) {
      this.config = this.configFactory.get();
    }

    return this.config;
  }

  public save(config: IConfig) {
    this.config = config;
  }
}
