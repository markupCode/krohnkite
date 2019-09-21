import { Rectangle } from "./rectangle";

export function toQRectangle(rectangle: Rectangle) {
  return Qt.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
}

export function toRectangle(qRectangle: QRect) {
  return new Rectangle(
    qRectangle.x,
    qRectangle.y,
    qRectangle.width,
    qRectangle.height
  );
}
