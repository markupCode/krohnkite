import { IConfig } from "../../domain/config/config";
import { IConfigFactory } from "../../domain/config/config-factory";

export class KWinConfigFactory implements IConfigFactory {
  public get(): IConfig {
    const layoutModesConfig = {
      enableMonocleLayout: KWin.readConfig("enableMonocleLayout", true),
      enableQuarterLayout: KWin.readConfig("enableQuarterLayout", false),
      enableSpreadLayout: KWin.readConfig("enableSpreadLayout", true),
      enableStairLayout: KWin.readConfig("enableStairLayout", true),
      enableTileLayout: KWin.readConfig("enableTileLayout", true),
      maximizeSoleTile: KWin.readConfig("maximizeSoleTile", false),
      monocleMaximize: KWin.readConfig("monocleMaximize", true)
    };

    const layoutConfig = {
      adjustLayout: KWin.readConfig("adjustLayout", true),
      adjustLayoutLive: KWin.readConfig("adjustLayoutLive", true),
      noTileBorder: KWin.readConfig("noTileBorder", false)
    };

    const gapConfig = {
      screenGapBottom: KWin.readConfig("screenGapBottom", 0),
      screenGapLeft: KWin.readConfig("screenGapLeft", 0),
      screenGapRight: KWin.readConfig("screenGapRight", 0),
      screenGapTop: KWin.readConfig("screenGapTop", 0),
      tileLayoutGap: KWin.readConfig("tileLayoutGap", 0)
    };

    const ignoreConfig = {
      ignoreActivity: this.commaSeparate(KWin.readConfig("ignoreActivity", "")),
      ignoreClass: this.commaSeparate(
        KWin.readConfig("ignoreClass", "krunner,yakuake,spectacle,kded5")
      ),

      ignoreScreen: this.commaSeparate(KWin.readConfig("ignoreScreen", "")).map(
        str => parseInt(str, 10)
      ),
      ignoreTitle: this.commaSeparate(KWin.readConfig("ignoreTitle", ""))
    };

    return {
      ...layoutModesConfig,
      ...layoutConfig,
      ...gapConfig,

      layoutPerActivity: KWin.readConfig("layoutPerActivity", false),
      layoutPerDesktop: KWin.readConfig("layoutPerDesktop", false),
      preventMinimize: KWin.readConfig("preventMinimize", false),
      preventProtrusion: KWin.readConfig("preventProtrusion", true),

      floatUtility: KWin.readConfig("floatUtility", true),
      floatingClass: this.commaSeparate(KWin.readConfig("floatingClass", "")),
      floatingTitle: this.commaSeparate(KWin.readConfig("floatingTitle", "")),

      ...ignoreConfig,

      debug: KWin.readConfig("debug", false)
    };
  }

  private commaSeparate(str: string): string[] {
    if (!str || typeof str !== "string") {
      return [];
    }

    return str.split(",").map(part => part.trim());
  }
}
