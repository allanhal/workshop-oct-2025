import { useEffect, useState } from 'react';

import GameStatsModal from './components/GameStats';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import {
    checkGuess, getGameStats, getKeyboardStatus, LetterStatus, updateGameStats
} from './utils/gameLogic';
import { isValidWord } from './utils/words';

function App() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [results, setResults] = useState<LetterStatus[][]>([]);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing"
  );
  const [showStats, setShowStats] = useState(false);
  const [shake, setShake] = useState(false);
  const [showInvalidWord, setShowInvalidWord] = useState(false);

  const currentRow = guesses.length;
  const keyboardStatus = getKeyboardStatus(guesses, results);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (gameStatus !== "playing") return;

      const key = e.key.toUpperCase();

      if (key === "ENTER") {
        handleKeyPress("ENTER");
      } else if (key === "BACKSPACE") {
        handleKeyPress("BACKSPACE");
      } else if (key.match(/^[A-ZÇ]$/)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, gameStatus]);

  useEffect(() => {
    if (gameStatus !== "playing") {
      setShowStats(true);
      updateGameStats(gameStatus === "won", guesses.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  const handleKeyPress = async (key: string) => {
    if (gameStatus !== "playing") return;

    if (key === "ENTER") {
      if (currentGuess.length !== 5) {
        triggerShake();
        return;
      }

      if (!isValidWord(currentGuess)) {
        setShowInvalidWord(true);
        triggerShake();
        setTimeout(() => setShowInvalidWord(false), 2000);
        return;
      }

      const result = await checkGuess(currentGuess);

      const newGuesses = [...guesses, currentGuess];
      const newResults = [...results, result.result];

      setGuesses(newGuesses);
      setResults(newResults);
      setCurrentGuess("");

      if (result.correct) {
        setGameStatus("won");
      }

      // Check loose condition
      if (newGuesses.length >= 6) {
        setGameStatus("lost");
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && key.match(/^[A-ZÇ]$/)) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Termo</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
        {showInvalidWord && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            Palavra não encontrada na lista
          </div>
        )}

        <Grid
          guesses={guesses}
          currentGuess={currentGuess}
          results={results}
          currentRow={currentRow}
          shake={shake}
        />

        <Keyboard
          onKeyPress={handleKeyPress}
          keyboardStatus={keyboardStatus}
          disabled={gameStatus !== "playing"}
        />
      </main>

      <footer className="p-4 text-center text-gray-500 text-sm">
        <p>Um clone do jogo Wordle em português</p>
        <p className="mt-1">
          {/* Palavra de hoje: <span className="text-xs">#{answer}</span> */}
          Palavra de hoje: <span className="text-xs">#answer</span>
        </p>
      </footer>

      <GameStatsModal
        stats={getGameStats()}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        gameResult={gameStatus === "playing" ? null : gameStatus}
        guessCount={guesses.length}
      />
    </div>
  );
}

export default App;
