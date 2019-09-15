class MonocleLayout implements ILayout {
  public get enabled(): boolean {
    return CONFIG.enableMonocleLayout;
  }

  public apply = (tiles: Window[], area: Rect, workingArea?: Rect): void => {
    if (CONFIG.monocleMaximize) {
      area = workingArea || area;
      tiles.forEach(window => (window.noBorder = true));
    }
    tiles.forEach(window => (window.geometry = area));
  };

  public toString(): string {
    return "MonocleLayout()";
  }
}

try {
  exports.MonocleLayout = MonocleLayout;
} catch (e) {
  /* ignore */
}
