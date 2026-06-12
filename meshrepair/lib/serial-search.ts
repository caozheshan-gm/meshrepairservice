export function normalizeSerialSearch(value: string) {
  return value.replace(/[-\s]/g, "").toUpperCase();
}

export function serialMatches(candidate: string, searchValue: string) {
  return normalizeSerialSearch(candidate) === normalizeSerialSearch(searchValue);
}
