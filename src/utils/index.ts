/* eslint-disable @typescript-eslint/no-explicit-any */

export function isNumeric(num: any) {
  return !isNaN(num) && !isNaN(parseFloat(num));
}
