import { GameStats } from '../utils/gameLogic';

interface GameStatsProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
  gameResult: "won" | "lost" | null;
  guessCount: number;
}

export default function GameStatsModal({
  stats,
  isOpen,
  onClose,
  gameResult,
  guessCount,
}: GameStatsProps) {
  if (!isOpen) return null;

  const handleShare = () => {
    const squares =
      gameResult === "won"
        ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Array.from({ length: guessCount }, (_) => "🟩".repeat(5)).join("\n")
        : "⬛⬛⬛⬛⬛";

    const shareText = `Termo ${
      gameResult === "won" ? guessCount : "X"
    }/6\n\n${squares}\n\nhttps://termo.ooo`;

    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Resultado copiado!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Estatísticas</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            X
          </button>
        </div>

        {gameResult && (
          <div className="mb-6 text-center">
            {gameResult === "won" ? (
              <div>
                <div className="text-2xl mb-2">🎉</div>
                <div className="text-lg font-semibold text-green-600">
                  Parabéns! Você acertou em {guessCount} tentativa
                  {guessCount !== 1 ? "s" : ""}!
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">😔</div>
                <div className="text-lg font-semibold text-gray-600">
                  A palavra era:{" "}
                  {/* <span className="font-bold text-green-600">{answer}</span> */}
                  <span className="font-bold text-green-600">answer</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-600">Jogadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.winPercentage}%</div>
            <div className="text-sm text-gray-600">Vitórias</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Sequência</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm text-gray-600">Máx. Seq.</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Distribuição de Palpites</h3>
          {stats.guessDistribution.map((count, index) => (
            <div key={index} className="flex items-center mb-1">
              <span className="w-3 text-sm">{index + 1}</span>
              <div className="flex-1 mx-2 bg-gray-200 rounded">
                <div
                  className="bg-green-500 h-4 rounded text-white text-xs flex items-center justify-end pr-1"
                  style={{
                    width:
                      stats.gamesWon > 0
                        ? `${
                            (count / Math.max(...stats.guessDistribution)) * 100
                          }%`
                        : "0%",
                  }}
                >
                  {count > 0 && count}
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameResult && (
          <button
            onClick={handleShare}
            className="w-full bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Compartilhar
          </button>
        )}
      </div>
    </div>
  );
}
