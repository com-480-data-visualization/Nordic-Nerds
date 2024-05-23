export const capitalizeFirstLetter = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const range = (start, end) =>
  Array.from({ length: end - start }, (_, k) => k + start);

export const zip2 = (arr1, arr2) =>
  range(0, Math.min(arr1.length, arr2.length)).map((i) => [arr1[i], arr2[i]]);

export const zipN = (arrs) =>
  range(0, Math.min(...arrs.map((arr) => arr.length))).map((i) =>
    range(0, arrs.length).map((arrIndex) => arrs[arrIndex][i])
  );

export const last = (arr) => arr[arr.length - 1];

export const tail = (arr) => arr.slice(1, arr.length);

export const interleave = (arr1, arr2) =>
  range(
    0,
    2 * Math.min(arr1.length, arr2.length) + (arr1.length > arr2.length ? 1 : 0)
  ).map((index) => (index % 2 == 0 ? arr1[index / 2] : arr2[(index - 1) / 2]));

export const repeat = (arr, n) =>
  range(0, n)
    .map((_) => arr)
    .flat();

export const enumerate = (arr) => arr.map((e, i) => [e, i]);
export const ints = (n) => range(0, n);

export const numberWord = (number) => {
  switch (number) {
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    case 5:
      return "five";
    case 6:
      return "six";
    case 7:
      return "seven";
    case 8:
      return "eight";
    case 9:
      return "nine";
    case 10:
      return "ten";
    case 11:
      return "eleven";
    case 12:
      return "twelve";
    default:
      return number + "";
  }
};

export const enumerationString = (items) =>
  items.length < 2
    ? items.join(", ")
    : items.slice(0, items.length - 1).join(", ") +
      " and " +
      items[items.length - 1];

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const findPlayerClub = (player, transfers, year) => transfers[player.name].data
    .slice()
    .reverse()
    .find((transfer) => transfer.year <= year)?.club_name;
