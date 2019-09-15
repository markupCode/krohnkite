class FloatingLayout implements ILayout {
  public static instance = new FloatingLayout();

  public get enabled(): boolean {
    return true;
  }

  public apply = (tiles: Window[], area: Rect, workingArea?: Rect): void => {
    tiles.forEach((tile: Window) => (tile.state = WindowState.FreeTile));
  };

  public toString(): string {
    return "FloatingLayout()";
  }
}

try {
  exports.FloatingLayout = FloatingLayout;
} catch (e) {
  /* ignore */
}
