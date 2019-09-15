class QuarterLayout implements ILayout {
  public static readonly MAX_PROPORTION = 0.8;

  public get enabled(): boolean {
    return CONFIG.enableQuarterLayout;
  }

  private lhsplit: number;
  private rhsplit: number;
  private vsplit: number;

  public constructor() {
    this.lhsplit = 0.5;
    this.rhsplit = 0.5;
    this.vsplit = 0.5;
  }

  public adjust(area: Rect, tiles: Window[], basis: Window) {
    if (tiles.length <= 1 || tiles.length > 4) {
      return;
    }

    const idx = tiles.indexOf(basis);
    if (idx < 0) {
      return;
    }

    const delta = new WindowResizeDelta(basis);

    /* vertical split */
    if ((idx === 0 || idx === 3) && delta.east !== 0) {
      this.vsplit =
        (Math.floor(area.width * this.vsplit) + delta.east) / area.width;
    } else if ((idx === 1 || idx === 2) && delta.west !== 0) {
      this.vsplit =
        (Math.floor(area.width * this.vsplit) - delta.west) / area.width;
    }

    /* left-side horizontal split */
    if (tiles.length === 4) {
      if (idx === 0 && delta.south !== 0) {
        this.lhsplit =
          (Math.floor(area.height * this.lhsplit) + delta.south) / area.height;
      }
      if (idx === 3 && delta.north !== 0) {
        this.lhsplit =
          (Math.floor(area.height * this.lhsplit) - delta.north) / area.height;
      }
    }

    /* right-side horizontal split */
    if (tiles.length >= 3) {
      if (idx === 1 && delta.south !== 0) {
        this.rhsplit =
          (Math.floor(area.height * this.rhsplit) + delta.south) / area.height;
      }
      if (idx === 2 && delta.north !== 0) {
        this.rhsplit =
          (Math.floor(area.height * this.rhsplit) - delta.north) / area.height;
      }
    }

    /* clipping */
    this.vsplit = clip(
      this.vsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
    this.lhsplit = clip(
      this.lhsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
    this.rhsplit = clip(
      this.rhsplit,
      1 - QuarterLayout.MAX_PROPORTION,
      QuarterLayout.MAX_PROPORTION
    );
  }

  public apply(tiles: Window[], area: Rect): void {
    if (tiles.length === 1) {
      tiles[0].geometry = area;
      return;
    }

    const gap1 = Math.floor(CONFIG.tileLayoutGap / 2);
    const gap2 = CONFIG.tileLayoutGap - gap1;

    const leftWidth = Math.floor(area.width * this.vsplit);
    const rightWidth = area.width - leftWidth;
    const rightX = area.x + leftWidth;
    if (tiles.length === 2) {
      tiles[0].geometry = new Rect(area.x, area.y, leftWidth, area.height).gap(
        0,
        gap1,
        0,
        0
      );
      tiles[1].geometry = new Rect(rightX, area.y, rightWidth, area.height).gap(
        gap2,
        0,
        0,
        0
      );
      return;
    }

    const rightTopHeight = Math.floor(area.height * this.rhsplit);
    const rightBottomHeight = area.height - rightTopHeight;
    const rightBottomY = area.y + rightTopHeight;
    if (tiles.length === 3) {
      tiles[0].geometry = new Rect(area.x, area.y, leftWidth, area.height).gap(
        0,
        gap1,
        0,
        0
      );
      tiles[1].geometry = new Rect(
        rightX,
        area.y,
        rightWidth,
        rightTopHeight
      ).gap(gap2, 0, 0, gap1);
      tiles[2].geometry = new Rect(
        rightX,
        rightBottomY,
        rightWidth,
        rightBottomHeight
      ).gap(gap2, 0, gap2, 0);
      return;
    }

    const leftTopHeight = Math.floor(area.height * this.lhsplit);
    const leftBottomHeight = area.height - leftTopHeight;
    const leftBottomY = area.y + leftTopHeight;
    if (tiles.length >= 4) {
      tiles[0].geometry = new Rect(
        area.x,
        area.y,
        leftWidth,
        leftTopHeight
      ).gap(0, gap1, 0, gap1);
      tiles[1].geometry = new Rect(
        rightX,
        area.y,
        rightWidth,
        rightTopHeight
      ).gap(gap2, 0, 0, gap1);
      tiles[2].geometry = new Rect(
        rightX,
        rightBottomY,
        rightWidth,
        rightBottomHeight
      ).gap(gap2, 0, gap2, 0);
      tiles[3].geometry = new Rect(
        area.x,
        leftBottomY,
        leftWidth,
        leftBottomHeight
      ).gap(0, gap2, gap2, 0);
    }

    if (tiles.length > 4) {
      tiles.slice(4).forEach(tile => (tile.state = WindowState.FreeTile));
    }
  }

  public toString(): string {
    return "QuarterLayout()";
  }
}

try {
  exports.QuarterLayout = QuarterLayout;
} catch (e) {
  /* ignore */
}
