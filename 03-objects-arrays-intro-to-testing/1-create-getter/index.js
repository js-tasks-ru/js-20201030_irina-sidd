/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathSteps = path.split('.');

  const getter = obj => {
    if(!obj || Object.keys(obj).length === 0) return undefined;

    let value = {...obj};
    pathSteps.forEach(key => {
      value = value[key];
    });

    return value;
  };

  return getter;
}
