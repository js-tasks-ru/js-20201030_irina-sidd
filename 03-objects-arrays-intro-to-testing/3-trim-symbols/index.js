/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!string || size === 0) {
    return '';
  }

  if (!size) {
    return string;
  }

  return transformString(string, size);
}

function transformString (string, size) {
  let counter = 0;
  let previousChar = '';
  const chars = string.split('');

  const newArray = chars.map(function (char) {
    counter = previousChar === char ? ++counter : 0;
    if (previousChar !== char || counter < size) {
      previousChar = char;
      return char;
    }

    previousChar = char;
    return '';
  });

  return newArray.join('');
}
