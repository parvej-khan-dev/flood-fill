function isValid(x, y) {
  if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
    return true;
  }

  return false;
}
