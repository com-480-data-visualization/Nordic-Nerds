export const capitalizeFirstLetter = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const range = (start, end) =>
  Array.from({ length: end - start }, (_, k) => k + start);

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
