export type LetterStatus = "correct" | "present" | "absent" | "empty";

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

export async function checkGuess(guess: string): Promise<{
  correct: boolean;
  result: LetterStatus[];
}> {
  const requestGuess = await fetch(`http://localhost:8080/guess?word=${guess}`);
  const guessResult = await requestGuess.json();
  return guessResult;
}

export function getKeyboardStatus(
  guesses: string[],
  results: LetterStatus[][]
): Record<string, LetterStatus> {
  const keyboardStatus: Record<string, LetterStatus> = {};

  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const result = results[i];

    for (let j = 0; j < guess.length; j++) {
      const letter = guess[j];
      const status = result[j];

      if (
        !keyboardStatus[letter] ||
        (keyboardStatus[letter] === "absent" && status !== "absent") ||
        (keyboardStatus[letter] === "present" && status === "correct")
      ) {
        keyboardStatus[letter] = status;
      }
    }
  }

  return keyboardStatus;
}

export function getGameStats(): GameStats {
  const stats = localStorage.getItem("termo-stats");
  if (!stats) {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      winPercentage: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0],
    };
  }
  return JSON.parse(stats);
}

export function updateGameStats(won: boolean, guessCount: number): GameStats {
  const stats = getGameStats();

  stats.gamesPlayed++;

  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[guessCount - 1]++;
  } else {
    stats.currentStreak = 0;
  }

  stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

  localStorage.setItem("termo-stats", JSON.stringify(stats));
  return stats;
}
