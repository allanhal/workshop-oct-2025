const all5WordsRequest = await fetch("/all5.csv");
const all5WordsText = await all5WordsRequest.text();
const all5Words = all5WordsText
  .split(",")
  .map((word) => word.trim().toLowerCase());

export function isValidWord(word: string): boolean {
  if (word.length !== 5) return false;
  return all5Words.includes(word.toLowerCase());
}
