import React from 'react';

import { LetterStatus } from '../utils/gameLogic';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyboardStatus: Record<string, LetterStatus>;
  disabled: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "BACKSPACE"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "ENTER"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

interface KeyProps {
  letter: string;
  status?: LetterStatus;
  onClick: () => void;
  disabled: boolean;
}

function Key({ letter, status, onClick, disabled }: KeyProps) {
  const getStatusClass = () => {
    if (disabled) return "bg-gray-400 text-gray-300";

    switch (status) {
      case "correct":
        return "bg-green-600 text-white hover:bg-green-700";
      case "present":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "absent":
        return "bg-gray-600 text-white hover:bg-gray-700";
      default:
        return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    }
  };

  const isSpecialKey = letter === "ENTER" || letter === "BACKSPACE";
  const displayText = letter === "BACKSPACE" ? "⌫" : letter;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${isSpecialKey ? "px-3 text-sm" : "px-4"} py-3 rounded font-semibold
        transition-all duration-200 transform active:scale-95
        ${getStatusClass()}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {displayText}
    </button>
  );
}

export default function Keyboard({
  onKeyPress,
  keyboardStatus,
  disabled,
}: KeyboardProps) {
  return (
    <div className="max-w-lg mx-auto">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-2">
          {row.map((key) => (
            <Key
              key={key}
              letter={key}
              status={keyboardStatus[key]}
              onClick={() => onKeyPress(key)}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
