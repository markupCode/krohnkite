function clip(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function slide(value: number, step: number): number {
  if (step === 0) {
    return value;
  }

  return Math.floor(value / step + 1.000001) * step;
}

function matchWords(str: string, words: string[]): number {
  for (let i = 0; i < words.length; i++) {
    if (str.indexOf(words[i]) >= 0) {
      return i;
    }
  }

  return -1;
}

function wrapIndex(index: number, length: number): number {
  if (index < 0) {
    return index + length;
  }

  if (index >= length) {
    return index - length;
  }

  return index;
}
