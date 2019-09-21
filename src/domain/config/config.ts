export interface IConfig {
  enableMonocleLayout: boolean;
  enableQuarterLayout: boolean;
  enableSpreadLayout: boolean;
  enableStairLayout: boolean;
  enableTileLayout: boolean;
  monocleMaximize: boolean;
  maximizeSoleTile: boolean;

  adjustLayout: boolean;
  adjustLayoutLive: boolean;
  noTileBorder: boolean;

  screenGapBottom: number;
  screenGapLeft: number;
  screenGapRight: number;
  screenGapTop: number;
  tileLayoutGap: number;

  layoutPerActivity: boolean;
  layoutPerDesktop: boolean;
  preventMinimize: boolean;
  preventProtrusion: boolean;

  floatUtility: boolean;

  floatingClass: string[];
  floatingTitle: string[];
  ignoreClass: string[];
  ignoreTitle: string[];

  ignoreActivity: string[];
  ignoreScreen: number[];

  debug: boolean;
}
