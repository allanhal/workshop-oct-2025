import { LetterStatus } from '../utils/gameLogic';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  results: LetterStatus[][];
  currentRow: number;
  shake: boolean;
}

interface TileProps {
  letter: string;
  status: LetterStatus;
  delay?: number;
}

function Tile({ letter, status, delay = 0 }: TileProps) {
  const getStatusClass = () => {
    switch (status) {
      case "correct":
        return "bg-green-600 text-white border-green-600";
      case "present":
        return "bg-yellow-500 text-white border-yellow-500";
      case "absent":
        return "bg-gray-600 text-white border-gray-600";
      default:
        return "bg-white border-gray-300";
    }
  };

  return (
    <div
      className={`
        w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold
        transition-all duration-300 ${getStatusClass()}
        ${letter ? "animate-pulse" : ""}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {letter}
    </div>
  );
}

export default function Grid({
  guesses,
  currentGuess,
  results,
  currentRow,
  shake,
}: GridProps) {
  return (
    <div className="grid grid-rows-6 gap-1 mb-8">
      {Array.from({ length: 6 }, (_, rowIndex) => {
        let displayWord = "";
        let rowResult: LetterStatus[] = [];

        if (rowIndex < currentRow) {
          displayWord = guesses[rowIndex] || "";
          rowResult = results[rowIndex] || [];
        } else if (rowIndex === currentRow) {
          displayWord = currentGuess;
          rowResult = new Array(5).fill("empty");
        } else {
          displayWord = "";
          rowResult = new Array(5).fill("empty");
        }

        return (
          <div
            key={rowIndex}
            className={`grid grid-cols-5 gap-1 ${
              shake && rowIndex === currentRow ? "animate-bounce" : ""
            }`}
          >
            {Array.from({ length: 5 }, (_, colIndex) => (
              <Tile
                key={colIndex}
                letter={displayWord[colIndex] || ""}
                status={rowResult[colIndex]}
                delay={colIndex * 100}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
