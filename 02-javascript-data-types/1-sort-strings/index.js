/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const result = arr.slice();
  const order = param == 'asc' ? 1 : -1;

  result.sort((a, b) =>
     a.localeCompare(b, ['ru-RU', 'en-En'], { caseFirst: 'upper'}) * order);

  return result;
}
