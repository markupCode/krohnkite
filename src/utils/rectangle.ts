export class Rectangle {
  public readonly height: number;
  public readonly width: number;
  public readonly x: number;
  public readonly y: number;

  public get maxX(): number {
    return this.x + this.width;
  }

  public get maxY(): number {
    return this.y + this.height;
  }

  constructor(x: number, y: number, w: number, h: number) {
    this.height = h;
    this.width = w;
    this.x = x;
    this.y = y;
  }

  public equals(other: Rectangle) {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    );
  }

  public gap(
    left: number,
    right: number,
    top: number,
    bottom: number
  ): Rectangle {
    return new Rectangle(
      this.x + left,
      this.y + top,
      this.width - (left + right),
      this.height - (top + bottom)
    );
  }

  public includes(other: Rectangle): boolean {
    return (
      this.x <= other.x &&
      this.y <= other.y &&
      other.maxX < this.maxX &&
      other.maxY < this.maxY
    );
  }

  public subtract(other: Rectangle) {
    return new Rectangle(
      this.x - other.x,
      this.y - other.y,
      this.width - other.width,
      this.height - other.height
    );
  }

  public toString(): string {
    return (
      "Rectangle(" + [this.x, this.y, this.width, this.height].join(", ") + ")"
    );
  }
}
