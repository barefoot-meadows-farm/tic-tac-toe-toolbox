import React, { useState, useEffect } from 'react';

const TicTacToeConfig = () => {
  // Game configuration options
  const [boardSize, setBoardSize] = useState(3);
  const [timeLimit, setTimeLimit] = useState(0); // 0 means no time limit
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winCondition, setWinCondition] = useState(3); // Number in a row needed to win
  
  // Update win condition if it's greater than board size
  useEffect(() => {
    if (winCondition > boardSize) {
      setWinCondition(boardSize);
    }
  }, [boardSize, winCondition]);
  const [showLastMove, setShowLastMove] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Game state
  const [board, setBoard] = useState(Array(9).fill(''));
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  // Initialize or reset the game board when configuration changes
  useEffect(() => {
    resetGame();
  }, [boardSize, winCondition]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isPlaying && timeLimit > 0 && !winner) {
      setTimeLeft(timeLimit);
      
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Switch to other player when time runs out
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
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
    // Create empty board with current board size
    setBoard(Array(boardSize * boardSize).fill(''));
    setCurrentPlayer('X');
    setWinner(null);
    setLastMove(null);
    setWinningLine([]);
    setTimeLeft(timeLimit);
    setIsPlaying(false);
  };

  // Start the game
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  // Check for winner
  const checkWinner = (boardState, index, player) => {
    // Get row and column from index
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    
    // Check horizontal
    let count = 0;
    let winLine = [];
    for (let c = 0; c < boardSize; c++) {
      if (boardState[row * boardSize + c] === player) {
        count++;
        winLine.push(row * boardSize + c);
        if (count >= winCondition) {
          // Only keep the cells that form the winning line
          setWinningLine(winLine.slice(winLine.length - winCondition));
          return true;
        }
      } else {
        count = 0;
        winLine = [];
      }
    }
    
    // Check vertical
    count = 0;
    winLine = [];
    for (let r = 0; r < boardSize; r++) {
      if (boardState[r * boardSize + col] === player) {
        count++;
        winLine.push(r * boardSize + col);
        if (count >= winCondition) {
          setWinningLine(winLine.slice(winLine.length - winCondition));
          return true;
        }
      } else {
        count = 0;
        winLine = [];
      }
    }
    
    // Check all diagonals (not just main ones)
    // Start by checking diagonals that run from top-left to bottom-right
    for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
      for (let startCol = 0; startCol <= boardSize - winCondition; startCol++) {
        count = 0;
        winLine = [];
        for (let i = 0; i < Math.min(boardSize - startRow, boardSize - startCol); i++) {
          const cellIndex = (startRow + i) * boardSize + (startCol + i);
          if (boardState[cellIndex] === player) {
            count++;
            winLine.push(cellIndex);
            if (count >= winCondition) {
              setWinningLine(winLine.slice(winLine.length - winCondition));
              return true;
            }
          } else {
            count = 0;
            winLine = [];
          }
        }
      }
    }
    
    // Check diagonals that run from top-right to bottom-left
    for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
      for (let startCol = winCondition - 1; startCol < boardSize; startCol++) {
        count = 0;
        winLine = [];
        for (let i = 0; i < Math.min(boardSize - startRow, startCol + 1); i++) {
          const cellIndex = (startRow + i) * boardSize + (startCol - i);
          if (boardState[cellIndex] === player) {
            count++;
            winLine.push(cellIndex);
            if (count >= winCondition) {
              setWinningLine(winLine.slice(winLine.length - winCondition));
              return true;
            }
          } else {
            count = 0;
            winLine = [];
          }
        }
      }
    }
    
    // No winner
    return false;
  };

  // Check for a draw
  const checkDraw = (boardState) => {
    return boardState.every(cell => cell !== '');
  };

  // Handle cell click
  const handleCellClick = (index) => {
    if (!isPlaying || board[index] !== '' || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setLastMove(index);
    
    // Check for winner
    if (checkWinner(newBoard, index, currentPlayer)) {
      setWinner(currentPlayer);
      setIsPlaying(false);
    } else if (checkDraw(newBoard)) {
      setWinner('Draw');
      setIsPlaying(false);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      
      // Reset timer for the next player
      if (timeLimit > 0) {
        setTimeLeft(timeLimit);
      }
    }
  };

  // Render the game cell
  const renderCell = (index) => {
    const isLastMove = lastMove === index && showLastMove;
    const isWinningCell = winningLine.includes(index);
    
    // Determine cell background color
    let bgColor = 'bg-white';
    if (isWinningCell) {
      bgColor = 'bg-green-200';
    } else if (isLastMove) {
      bgColor = 'bg-yellow-100';
    }
    
    return (
      <div
        key={index}
        className={`flex items-center justify-center text-4xl font-bold cursor-pointer
                   border border-gray-400 ${bgColor}`}
        style={{ 
          width: `${100 / boardSize}%`, 
          height: `${100 / boardSize}%`,
          aspectRatio: '1 / 1'
        }}
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
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
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe</h1>
      
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
            <label className="block text-gray-700 mb-1">Win Condition (in a row):</label>
            <select 
              className="w-full p-2 border rounded"
              value={winCondition}
              onChange={(e) => setWinCondition(parseInt(e.target.value))}
            >
              <option value="3">3 in a row</option>
              {boardSize >= 4 && <option value="4">4 in a row</option>}
              {boardSize >= 5 && <option value="5">5 in a row</option>}
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
            <label htmlFor="showLastMove">Highlight last move</label>
          </div>
          
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="mb-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold">
              {winner ? (
                winner === 'Draw' ? 'Game Draw!' : `Player ${winner} Wins!`
              ) : (
                `Player ${currentPlayer}'s Turn`
              )}
            </div>
            
            {timeLimit > 0 && isPlaying && (
              <div className="text-lg">
                Time: {timeLeft}s
              </div>
            )}
          </div>
          
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

export default TicTacToeConfig;
