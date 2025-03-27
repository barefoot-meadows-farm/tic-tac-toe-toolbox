
import React, { useState, useEffect } from 'react';

const NumericalTicTacToe = () => {
  // Game configuration options
  const [boardSize, setBoardSize] = useState(3);
  const [timeLimit, setTimeLimit] = useState(0); // 0 means no time limit
  const [showLastMove, setShowLastMove] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Game state
  const [board, setBoard] = useState<Array<number | null>>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 for odd player, 2 for even player
  const [winner, setWinner] = useState<number | string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [usedNumbers, setUsedNumbers] = useState({
    odd: [] as number[],    // Numbers used by player 1 (1, 3, 5, 7, 9)
    even: [] as number[]    // Numbers used by player 2 (2, 4, 6, 8)
  });
  
  // Available numbers for each player
  const oddNumbers = [1, 3, 5, 7, 9].filter(num => !usedNumbers.odd.includes(num));
  const evenNumbers = [2, 4, 6, 8].filter(num => !usedNumbers.even.includes(num));
  
  // Target sum (traditionally 15 for all board sizes)
  const getTargetSum = (size: number): number => {
    return 15; // Standard target sum
  };
  
  const targetSum = getTargetSum(boardSize);

  // Initialize or reset the game board when configuration changes
  useEffect(() => {
    resetGame();
  }, [boardSize]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isPlaying && timeLimit > 0 && !winner) {
      setTimeLeft(timeLimit);
      
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Switch to other player when time runs out
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
            return timeLimit;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, timeLimit, currentPlayer, winner]);

  // Reset the game
  const resetGame = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setCurrentPlayer(1);
    setWinner(null);
    setLastMove(null);
    setWinningLine([]);
    setTimeLeft(timeLimit);
    setIsPlaying(false);
    setUsedNumbers({
      odd: [],
      even: []
    });
  };

  // Start the game
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  // Check for winner
  const checkWinner = (boardState: Array<number | null>, index: number, number: number): boolean => {
    // Position to check
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    
    // Arrays to hold lines to check
    const lines: number[][] = [];
    
    // Add horizontal line
    const horizontalLine = Array(boardSize).fill(0).map((_, i) => row * boardSize + i);
    lines.push(horizontalLine);
    
    // Add vertical line
    const verticalLine = Array(boardSize).fill(0).map((_, i) => i * boardSize + col);
    lines.push(verticalLine);
    
    // Add diagonal lines if cell is on a diagonal
    // Main diagonal (top-left to bottom-right)
    if (row === col) {
      const mainDiagonal = Array(boardSize).fill(0).map((_, i) => i * boardSize + i);
      lines.push(mainDiagonal);
    }
    
    // Anti-diagonal (top-right to bottom-left)
    if (row + col === boardSize - 1) {
      const antiDiagonal = Array(boardSize).fill(0).map((_, i) => i * boardSize + (boardSize - 1 - i));
      lines.push(antiDiagonal);
    }
    
    // Check each line for a win
    for (const line of lines) {
      const values = line.map(idx => boardState[idx]).filter(val => val !== null) as number[];
      
      // Skip lines that don't have enough numbers yet
      if (values.length < boardSize) continue;
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      
      if (sum === targetSum) {
        setWinningLine(line);
        return true;
      }
    }
    
    return false;
  };

  // Check for a draw
  const checkDraw = (boardState: Array<number | null>): boolean => {
    // Draw if all cells are filled
    const allCellsFilled = boardState.every(cell => cell !== null);
    
    // Draw if either player has run out of numbers
    const player1OutOfNumbers = oddNumbers.length === 0;
    const player2OutOfNumbers = evenNumbers.length === 0;
    const outOfNumbers = player1OutOfNumbers || player2OutOfNumbers;
    
    return allCellsFilled || outOfNumbers;
  };

  // Handle number selection
  const handleNumberSelect = (number: number) => {
    if (!isPlaying || winner || lastMove === null) return;
    
    const newBoard = [...board];
    newBoard[lastMove] = number;
    setBoard(newBoard);
    
    // Add number to used numbers
    const newUsedNumbers = { ...usedNumbers };
    if (currentPlayer === 1) {
      newUsedNumbers.odd = [...newUsedNumbers.odd, number];
    } else {
      newUsedNumbers.even = [...newUsedNumbers.even, number];
    }
    setUsedNumbers(newUsedNumbers);
    
    // Check for winner
    if (checkWinner(newBoard, lastMove, number)) {
      setWinner(currentPlayer);
      setIsPlaying(false);
      setLastMove(null);
    } else if (checkDraw(newBoard)) {
      setWinner('Draw');
      setIsPlaying(false);
      setLastMove(null);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      
      // Check if next player has run out of numbers and declare draw if so
      const nextPlayerNumbers = currentPlayer === 1 ? evenNumbers : oddNumbers;
      if (nextPlayerNumbers.length === 0) {
        setWinner('Draw');
        setIsPlaying(false);
        setLastMove(null);
      } else {
        // Reset timer for the next player
        if (timeLimit > 0) {
          setTimeLeft(timeLimit);
        }
        
        // Reset selected cell
        setLastMove(null);
      }
    }
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (!isPlaying || board[index] !== null || winner) return;
    
    // Just select the cell, don't place a number yet
    setLastMove(index);
  };

  // Render the available numbers for the current player
  const renderNumberOptions = () => {
    const numbers = currentPlayer === 1 ? oddNumbers : evenNumbers;
    
    return (
      <div className="flex justify-center space-x-2 mb-4">
        {numbers.map(number => (
          <button
            key={number}
            className={`w-10 h-10 flex items-center justify-center font-bold text-lg
                     ${currentPlayer === 1 ? 'bg-red-200 hover:bg-red-300' : 'bg-blue-200 hover:bg-blue-300'}
                     rounded-full`}
            onClick={() => handleNumberSelect(number)}
            disabled={lastMove === null}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  // Render the game cell
  const renderCell = (index: number) => {
    const isLastMoveCell = lastMove === index && showLastMove;
    const isWinningCell = winningLine.includes(index);
    
    // Determine cell background color
    let bgColor = 'bg-white';
    if (isWinningCell) {
      bgColor = 'bg-green-200';
    } else if (isLastMoveCell) {
      bgColor = 'bg-yellow-100';
    }
    
    const cellValue = board[index];
    let textColor = 'text-black';
    
    if (cellValue !== null) {
      textColor = cellValue % 2 === 1 ? 'text-red-600' : 'text-blue-600';
    }
    
    return (
      <div
        key={index}
        className={`flex items-center justify-center text-4xl font-bold cursor-pointer
                   border border-gray-400 ${bgColor} ${textColor}`}
        style={{ 
          width: `${100 / boardSize}%`, 
          height: `${100 / boardSize}%`,
          aspectRatio: '1 / 1'
        }}
        onClick={() => handleCellClick(index)}
      >
        {cellValue !== null ? cellValue : ''}
      </div>
    );
  };

  // Render the game board
  const renderBoard = () => {
    return (
      <div className="flex flex-wrap w-64 h-64 border border-gray-400">
        {board.map((_, index) => renderCell(index))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-1">Numerical Tic-Tac-Toe</h1>
      <p className="text-gray-600 mb-4">Get numbers that sum to {targetSum} in a line!</p>
      
      {!isPlaying && !winner ? (
        <div className="w-full max-w-md p-4 bg-gray-100 rounded mb-6">
          <h2 className="text-xl font-semibold mb-3">Game Configuration</h2>
          
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Board Size:</label>
            <select 
              className="w-full p-2 border rounded"
              value={boardSize}
              onChange={(e) => setBoardSize(parseInt(e.target.value))}
            >
              <option value="3">3x3</option>
              <option value="4">4x4</option>
              <option value="5">5x5</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-gray-700 mb-1">Time Limit (seconds per move):</label>
            <select 
              className="w-full p-2 border rounded"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            >
              <option value="0">No time limit</option>
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </div>
          
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="showLastMove"
              className="mr-2"
              checked={showLastMove}
              onChange={(e) => setShowLastMove(e.target.checked)}
            />
            <label htmlFor="showLastMove">Highlight selected cell</label>
          </div>
          
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={startGame}
          >
            Start Game
          </button>
          
          <div className="mt-4 bg-white p-3 rounded">
            <h3 className="font-semibold mb-2">Game Rules:</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Player 1 uses odd numbers (1, 3, 5, 7, 9)</li>
              <li>Player 2 uses even numbers (2, 4, 6, 8)</li>
              <li>Each number can only be used once</li>
              <li>Create a line of numbers that sum to {targetSum} to win</li>
              <li>First select a cell, then choose a number to place</li>
              <li>The game ends in a draw if a player runs out of numbers</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mb-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold">
              {winner ? (
                winner === 'Draw' ? 'Game Draw!' : `Player ${winner} Wins!`
              ) : (
                `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? 'Odd' : 'Even'} Numbers)`
              )}
            </div>
            
            {timeLimit > 0 && isPlaying && (
              <div className="text-lg">
                Time: {timeLeft}s
              </div>
            )}
          </div>
          
          {isPlaying && renderNumberOptions()}
          
          {renderBoard()}
          
          <div className="mt-4 flex justify-between">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              onClick={resetGame}
            >
              Reset Game
            </button>
            
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => setIsPlaying(false)}
            >
              Change Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumericalTicTacToe;
