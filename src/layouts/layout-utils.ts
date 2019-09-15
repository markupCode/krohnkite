import { Window } from "../engine/window";
import { Rect } from "../util/rect";

export function stackTiles(tiles: Window[], area: Rect, gap = 0) {
  if (tiles.length === 1) {
    tiles[0].geometry = area;
    return;
  }

  const count = tiles.length;
  const tileHeight = (area.height + gap) / count - gap;
  tiles.forEach((window: Window, i: number) => {
    window.geometry = new Rect(
      area.x,
      area.y + Math.floor(i * (tileHeight + gap)),
      area.width,
      Math.floor(tileHeight)
    );
  });
}

export class LayoutWeightMap {
  private map: { [key: string]: [Window, number] };
  constructor() {
    this.map = {};
  }

  public get(window: Window) {
    return this.getEntry(window)[1];
  }

  public set(window: Window, weight: number) {
    this.getEntry(window)[1] = weight;
  }

  public multiply(window: Window, ratio: number) {
    this.getEntry(window)[1] *= ratio;
  }

  public clean() {
    for (const key in this.map) {
      if (!this.map[key][0].window) {
        delete this.map[key];
      }
    }
  }

  private getEntry(window: Window): [Window, number] {
    const entry = this.map[window.id];
    return entry ? entry : (this.map[window.id] = [window, 1]);
  }
}

export function stackTilesWithWeight(
  tiles: Window[],
  area: Rect,
  weights: LayoutWeightMap,
  gap = 0
) {
  const wsum = tiles.reduce((acc, tile) => acc + weights.get(tile), 0);

  const n = tiles.length;
  const hsum = area.height - (n - 1) * gap;

  let wacc = 0;
  tiles.forEach((tile, i) => {
    const weight = weights.get(tile);
    const winy = area.y + (hsum * wacc) / wsum + i * gap;
    const winh = (hsum * weight) / wsum;

    tile.geometry = new Rect(
      area.x,
      Math.floor(winy),
      area.width,
      Math.floor(winh)
    );
    wacc += weight;
  });
}

export function adjustStackWeights(
  stack: Window[],
  basis: Window,
  basisHeight: number,
  weights: LayoutWeightMap,
  stackHeight: number,
  direction: "forward" | "backward",
  gap = 0
) {
  const idx = stack.indexOf(basis);

  const H = stackHeight - (stack.length - 1) * gap;
  const W = stack.reduce((acc, tile) => acc + weights.get(tile), 0);

  const rest =
    direction === "forward" ? stack.slice(idx + 1) : stack.slice(0, idx);
  const restW = rest.reduce((acc, tile) => acc + weights.get(tile), 0);

  const w = (basisHeight * W) / H;
  const dw = w - weights.get(basis);
  const restScale = (restW - dw) / restW;

  weights.set(basis, w);
  rest.forEach(tile => weights.multiply(tile, restScale));
}
