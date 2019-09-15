class SpreadLayout implements ILayout {
  public get enabled(): boolean {
    return CONFIG.enableSpreadLayout;
  }

  private space: number; /* in ratio */

  constructor() {
    this.space = 0.07;
  }

  public apply = (tiles: Window[], area: Rect): void => {
    let numTiles = tiles.length;
    const spaceWidth = Math.floor(area.width * this.space);
    let cardWidth = area.width - spaceWidth * (numTiles - 1);

    // TODO: define arbitrary constants
    const miniumCardWidth = area.width * 0.4;
    while (cardWidth < miniumCardWidth) {
      cardWidth += spaceWidth;
      numTiles -= 1;
    }

    for (let i = 0; i < tiles.length; i++) {
      tiles[i].geometry = new Rect(
        area.x + (i < numTiles ? spaceWidth * (numTiles - i - 1) : 0),
        area.y,
        cardWidth,
        area.height
      );
    }
  };

  public handleShortcut(input: Shortcut) {
    switch (input) {
      case Shortcut.Decrease:
        // TODO: define arbitrary constants
        this.space = Math.max(0.04, this.space - 0.01);
        break;
      case Shortcut.Increase:
        // TODO: define arbitrary constants
        this.space = Math.min(0.1, this.space + 0.01);
        break;
      default:
        return false;
    }
    return true;
  }

  public toString(): string {
    return "SpreadLayout(" + this.space + ")";
  }
}

try {
  exports.SpreadLayout = SpreadLayout;
} catch (e) {
  /* ignore */
}
