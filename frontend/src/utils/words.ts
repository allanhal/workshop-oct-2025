

export async function isValidWord(word: string): Promise<boolean> {
  const all5WordsRequest = await fetch("/all5.csv");
  const all5WordsText = await all5WordsRequest.text();
  const all5Words = all5WordsText
    .split(",")
    .map((word) => word.trim().toLowerCase());

  if (word.length !== 5) return false;
  return all5Words.includes(word.toLowerCase());
}
