import { IConfig } from "./config";

export interface IReadonlyConfig extends IConfig {
  readonly enableMonocleLayout: boolean;
  readonly enableQuarterLayout: boolean;
  readonly enableSpreadLayout: boolean;
  readonly enableStairLayout: boolean;
  readonly enableTileLayout: boolean;
  readonly monocleMaximize: boolean;
  readonly maximizeSoleTile: boolean;

  readonly adjustLayout: boolean;
  readonly adjustLayoutLive: boolean;
  readonly noTileBorder: boolean;

  readonly screenGapBottom: number;
  readonly screenGapLeft: number;
  readonly screenGapRight: number;
  readonly screenGapTop: number;
  readonly tileLayoutGap: number;

  readonly layoutPerActivity: boolean;
  readonly layoutPerDesktop: boolean;
  readonly preventMinimize: boolean;
  readonly preventProtrusion: boolean;

  readonly floatUtility: boolean;

  readonly floatingClass: string[];
  readonly floatingTitle: string[];
  readonly ignoreClass: string[];
  readonly ignoreTitle: string[];

  readonly ignoreActivity: string[];
  readonly ignoreScreen: number[];

  readonly debug: boolean;
}
