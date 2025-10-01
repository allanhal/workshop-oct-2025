import { useEffect, useRef, useState } from 'react';

import BugReport from './components/BugReportModal';
import GameStatsModal from './components/GameStats';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import {
    checkGuess, getGameStats, getKeyboardStatus, LetterStatus, updateGameStats
} from './utils/gameLogic';
import { isValidWord } from './utils/words';

function App() {
  const [showBugReport, setShowBugReport] = useState(false);
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
    if (showBugReport) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (showBugReport) return;
      if (gameStatus !== "playing") return;

      const key = e.key.toUpperCase();

      if (key === "ENTER") {
        handleKeyPressRef.current("ENTER");
      } else if (key === "BACKSPACE") {
        handleKeyPressRef.current("BACKSPACE");
      } else if (key.match(/^[A-ZÇ]$/)) {
        handleKeyPressRef.current(key);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGuess, gameStatus, showBugReport]);

  useEffect(() => {
    if (showBugReport) return;
    if (gameStatus !== "playing") {
      setShowStats(true);
      updateGameStats(gameStatus === "won", guesses.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  const handleKeyPressRef = useRef<(key: string) => void>(() => {});

  useEffect(() => {
    if (showBugReport) {
      handleKeyPressRef.current = () => {};
    } else {
      handleKeyPressRef.current = (key: string) => {
        if (showBugReport) return;

        if (gameStatus !== "playing") return;

        const checkPress = async () => {
          if (showBugReport) return;
          if (key === "ENTER") {
            if (currentGuess.length !== 5) {
              triggerShake();
              return;
            }

            if (await !isValidWord(currentGuess)) {
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
        checkPress();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBugReport, gameStatus, currentGuess, guesses, results]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowStats(true)}
          >
            📈
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Termo</h1>
          <button onClick={() => setShowBugReport(true)}>🪲</button>
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
          onKeyPress={(key) => handleKeyPressRef.current(key)}
          keyboardStatus={keyboardStatus}
          disabled={gameStatus !== "playing"}
        />
      </main>

      <footer className="p-4 text-center text-gray-500 text-sm">
        <p>
          Um clone do jogo{" "}
          <a
            href="https://www.nytimes.com/games/wordle/index.html"
            target="_blank"
          >
            Wordle
          </a>{" "}
          em português
        </p>
      </footer>

      <GameStatsModal
        stats={getGameStats()}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        gameResult={gameStatus === "playing" ? null : gameStatus}
        guessCount={guesses.length}
      />

      <BugReport
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
      />
    </div>
  );
}

export default App;
