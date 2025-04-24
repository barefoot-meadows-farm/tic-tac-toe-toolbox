
import React, { useState, useEffect } from 'react';
import { GameSettings } from '@/components/GameStart';

interface UnrestrictedNInARowProps {
  settings?: GameSettings;
}

const UnrestrictedNInARow: React.FC<UnrestrictedNInARowProps> = ({ settings }) => {
  const [boardSize] = useState(settings?.boardSize || 3);
  const [winLength] = useState(settings?.winLength || 3);
  const [board, setBoard] = useState<Array<Array<string | null>>>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [winCondition, setWinCondition] = useState<Array<[number, number]>>([]);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setCurrentPlayer('X');
    setWinner(null);
    setWinCondition([]);
  };

  const checkWinner = (board: Array<Array<string | null>>, row: number, col: number, player: string) => {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal down-right
      [1, -1], // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      const winningCells: Array<[number, number]> = [[row, col]];

      // Check in positive direction
      for (let i = 1; i < winLength; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
          count++;
          winningCells.push([r, c]);
        } else {
          break;
        }
      }

      // Check in negative direction
      for (let i = 1; i < winLength; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
          count++;
          winningCells.push([r, c]);
        } else {
          break;
        }
      }

      if (count >= winLength) {
        setWinCondition(winningCells);
        return true;
      }
    }

    return false;
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] !== null || winner) {
      return;
    }

    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    if (checkWinner(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
      return;
    }

    // Check for draw
    if (newBoard.flat().every(cell => cell !== null)) {
      setWinner('Draw');
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Unrestricted N-in-a-Row</h1>
      
      <div className="mb-4">
        <p className="text-lg">
          {winner 
            ? winner === 'Draw' 
              ? "It's a draw!" 
              : `Player ${winner} wins!`
            : `Player ${currentPlayer}'s turn`}
        </p>
      </div>

      <div 
        className="grid gap-2 mb-4" 
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          width: `${boardSize * 60}px`,
        }}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isWinningCell = winCondition.some(([r, c]) => r === rowIndex && c === colIndex);
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 
                  ${isWinningCell ? 'bg-green-100 border-green-500' : 'border-gray-300 hover:bg-gray-100'}
                  ${cell ? '' : 'cursor-pointer'}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!!winner}
              >
                {cell}
              </button>
            );
          })
        ))}
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={resetGame}
      >
        Restart Game
      </button>
    </div>
  );
};

export default UnrestrictedNInARow;
