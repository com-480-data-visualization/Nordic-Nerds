export const capitalizeFirstLetter = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const range = (start, end) =>
  Array.from({ length: end - start }, (_, k) => k + start);
