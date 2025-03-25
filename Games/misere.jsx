
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MisereTicTacToe = () => {
  // Game configuration options
  const [boardSize, setBoardSize] = useState(3);
  const [timeLimit, setTimeLimit] = useState(0); // 0 means no time limit
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winCondition, setWinCondition] = useState(3); // Number in a row needed to lose
  
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
  const [loser, setLoser] = useState(null); // In Misère, we track the loser instead of winner
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState(null);
  const [losingLine, setLosingLine] = useState([]);

  // Initialize or reset the game board when configuration changes
  useEffect(() => {
    resetGame();
  }, [boardSize, winCondition]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isPlaying && timeLimit > 0 && !loser) {
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
  }, [isPlaying, timeLimit, currentPlayer, loser]);

  // Reset the game
  const resetGame = () => {
    // Create empty board with current board size
    setBoard(Array(boardSize * boardSize).fill(''));
    setCurrentPlayer('X');
    setLoser(null);
    setLastMove(null);
    setLosingLine([]);
    setTimeLeft(timeLimit);
    setIsPlaying(false);
  };

  // Start the game
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  // Check for line formation (which in Misère means you lose)
  const checkLineFormed = (boardState, index, player) => {
    // Get row and column from index
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    
    // Check horizontal
    let count = 0;
    let loseLine = [];
    for (let c = 0; c < boardSize; c++) {
      if (boardState[row * boardSize + c] === player) {
        count++;
        loseLine.push(row * boardSize + c);
        if (count >= winCondition) {
          // Only keep the cells that form the losing line
          setLosingLine(loseLine.slice(loseLine.length - winCondition));
          return true;
        }
      } else {
        count = 0;
        loseLine = [];
      }
    }
    
    // Check vertical
    count = 0;
    loseLine = [];
    for (let r = 0; r < boardSize; r++) {
      if (boardState[r * boardSize + col] === player) {
        count++;
        loseLine.push(r * boardSize + col);
        if (count >= winCondition) {
          setLosingLine(loseLine.slice(loseLine.length - winCondition));
          return true;
        }
      } else {
        count = 0;
        loseLine = [];
      }
    }
    
    // Check all diagonals (not just main ones)
    // Start by checking diagonals that run from top-left to bottom-right
    for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
      for (let startCol = 0; startCol <= boardSize - winCondition; startCol++) {
        count = 0;
        loseLine = [];
        for (let i = 0; i < Math.min(boardSize - startRow, boardSize - startCol); i++) {
          const cellIndex = (startRow + i) * boardSize + (startCol + i);
          if (boardState[cellIndex] === player) {
            count++;
            loseLine.push(cellIndex);
            if (count >= winCondition) {
              setLosingLine(loseLine.slice(loseLine.length - winCondition));
              return true;
            }
          } else {
            count = 0;
            loseLine = [];
          }
        }
      }
    }
    
    // Check diagonals that run from top-right to bottom-left
    for (let startRow = 0; startRow <= boardSize - winCondition; startRow++) {
      for (let startCol = winCondition - 1; startCol < boardSize; startCol++) {
        count = 0;
        loseLine = [];
        for (let i = 0; i < Math.min(boardSize - startRow, startCol + 1); i++) {
          const cellIndex = (startRow + i) * boardSize + (startCol - i);
          if (boardState[cellIndex] === player) {
            count++;
            loseLine.push(cellIndex);
            if (count >= winCondition) {
              setLosingLine(loseLine.slice(loseLine.length - winCondition));
              return true;
            }
          } else {
            count = 0;
            loseLine = [];
          }
        }
      }
    }
    
    // No line formed
    return false;
  };

  // Check for a draw
  const checkDraw = (boardState) => {
    return boardState.every(cell => cell !== '');
  };

  // Handle cell click
  const handleCellClick = (index) => {
    if (!isPlaying || board[index] !== '' || loser) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setLastMove(index);
    
    // Check if the current player formed a line (and loses in Misère)
    if (checkLineFormed(newBoard, index, currentPlayer)) {
      setLoser(currentPlayer);
      setIsPlaying(false);
    } else if (checkDraw(newBoard)) {
      // In a draw, no one loses
      setLoser('Draw');
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

  // Check if a cell is part of the losing line
  const isLosingCell = (index) => {
    return losingLine.includes(index);
  };

  // Render the game board
  const renderBoard = () => {
    return (
      <div 
        className="board-grid bg-muted/30 p-4 rounded-lg shadow-sm w-full max-w-sm mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gap: boardSize > 3 ? '0.25rem' : '0.5rem'
        }}
      >
        {board.map((cell, index) => (
          <button
            key={index}
            className={cn(
              "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center font-bold transition-all duration-300",
              isPlaying && !loser && !cell ? "hover:border-primary/50" : "",
              isLosingCell(index) ? "bg-red-100 border-red-400" : "",
              lastMove === index && showLastMove ? "bg-accent/20" : "",
              boardSize > 3 ? "text-xl" : "text-3xl"
            )}
            onClick={() => handleCellClick(index)}
            disabled={!isPlaying || loser || cell !== ''}
          >
            {cell === 'X' && <span className="text-primary">{cell}</span>}
            {cell === 'O' && <span className="text-accent-foreground">{cell}</span>}
          </button>
        ))}
      </div>
    );
  };

  // Get the game status message
  const getGameStatusMessage = () => {
    if (loser === 'Draw') {
      return 'Game Draw!';
    } else if (loser) {
      // In Misère, the non-loser is the winner
      return `Player ${loser === 'X' ? 'O' : 'X'} Wins!`;
    } else {
      return `Player ${currentPlayer}'s Turn`;
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">Misère Tic Tac Toe</h1>
      <p className="text-muted-foreground mb-4">Avoid getting {winCondition} in a row to win!</p>
      
      {!isPlaying && !loser ? (
        <div className="w-full max-w-md p-4 bg-background/80 rounded-lg border border-border mb-6">
          <h2 className="text-xl font-semibold mb-3">Game Configuration</h2>
          
          <div className="mb-3">
            <label className="block text-foreground mb-1">Board Size:</label>
            <select 
              className="w-full p-2 border rounded bg-background border-border"
              value={boardSize}
              onChange={(e) => setBoardSize(parseInt(e.target.value))}
            >
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
              <option value={5}>5x5</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-foreground mb-1">Lose Condition (in a row):</label>
            <select 
              className="w-full p-2 border rounded bg-background border-border"
              value={winCondition}
              onChange={(e) => setWinCondition(parseInt(e.target.value))}
            >
              <option value={3}>3 in a row</option>
              {boardSize >= 4 && <option value={4}>4 in a row</option>}
              {boardSize >= 5 && <option value={5}>5 in a row</option>}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-foreground mb-1">Time Limit (seconds per move):</label>
            <select 
              className="w-full p-2 border rounded bg-background border-border"
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
            <label htmlFor="showLastMove" className="text-foreground">Highlight last move</label>
          </div>
          
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded"
            onClick={startGame}
            type="button"
          >
            Start Game
          </Button>
        </div>
      ) : (
        <div className="mb-4 w-full max-w-md">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold">
              {getGameStatusMessage()}
            </div>
            
            {timeLimit > 0 && isPlaying && (
              <div className="text-lg">
                Time: {timeLeft}s
                <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000"
                    style={{ 
                      width: `${(timeLeft / timeLimit) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {renderBoard()}
          
          <div className="mt-4 flex justify-between">
            <Button
              variant="outline"
              className="py-2 px-4 rounded mr-2"
              onClick={resetGame}
            >
              Reset Game
            </Button>
            
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded"
              onClick={() => setIsPlaying(false)}
            >
              Change Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisereTicTacToe;
