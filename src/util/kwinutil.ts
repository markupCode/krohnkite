function toQRect(rect: Rect) {
  return Qt.rect(rect.x, rect.y, rect.width, rect.height);
}

function toRect(qrect: QRect) {
  return new Rect(qrect.x, qrect.y, qrect.width, qrect.height);
}
