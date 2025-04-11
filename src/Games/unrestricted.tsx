import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GameSettings } from '@/components/GameStart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { trackGameComplete } from '@/utils/analytics';

interface UnrestrictedTicTacToeProps {
  settings?: GameSettings;
}

type Player = 'X' | 'O' | null;
type Board = (Player)[][];

const UnrestrictedTicTacToe: React.FC<UnrestrictedTicTacToeProps> = ({ settings }) => {
  // Game configuration options derived from settings
  // Fixed 5x5 grid for Unrestricted mode - this is not configurable
  const boardSize = 5; // Fixed at 5x5 regardless of settings
  const winLength = settings?.winLength || 3;
  const timeLimit = settings?.timeLimit || 0; // 0 means no time limit
  const aiEnabled = settings?.opponent === 'ai';
  const aiDifficulty = settings?.difficulty || 'medium';
  
  // Game state
  const [board, setBoard] = useState<Board>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>(
    settings?.firstPlayer === 'player2' ? 'O' : 
    settings?.firstPlayer === 'player1' ? 'X' : 
    Math.random() < 0.5 ? 'X' : 'O'
  );
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number][]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Initialize game on component mount
  useEffect(() => {
    resetGame();
  }, []);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (timeLimit > 0 && gameStarted && !winner) {
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
  }, [timeLimit, currentPlayer, winner, gameStarted]);

  // Reset the game
  const resetGame = () => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setCurrentPlayer(
      settings?.firstPlayer === 'player2' ? 'O' : 
      settings?.firstPlayer === 'player1' ? 'X' : 
      Math.random() < 0.5 ? 'X' : 'O'
    );
    setWinner(null);
    setLastMove(null);
    setWinningLine([]);
    setTimeLeft(timeLimit);
    setIsAiThinking(false);
    setGameStarted(false);
  };

  // Check for winner
  const checkWinner = (board: Board): Player | 'Draw' | null => {
    // Check for win conditions in 5x5 grid
    
    // Check rows
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col <= boardSize - winLength; col++) {
        const player = board[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < winLength; i++) {
            if (board[row][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) {
            const line: [number, number][] = [];
            for (let i = 0; i < winLength; i++) {
              line.push([row, col + i]);
            }
            setWinningLine(line);
            return player;
          }
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < boardSize; col++) {
      for (let row = 0; row <= boardSize - winLength; row++) {
        const player = board[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < winLength; i++) {
            if (board[row + i][col] !== player) {
              win = false;
              break;
            }
          }
          if (win) {
            const line: [number, number][] = [];
            for (let i = 0; i < winLength; i++) {
              line.push([row + i, col]);
            }
            setWinningLine(line);
            return player;
          }
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = 0; col <= boardSize - winLength; col++) {
        const player = board[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < winLength; i++) {
            if (board[row + i][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) {
            const line: [number, number][] = [];
            for (let i = 0; i < winLength; i++) {
              line.push([row + i, col + i]);
            }
            setWinningLine(line);
            return player;
          }
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = winLength - 1; col < boardSize; col++) {
        const player = board[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < winLength; i++) {
            if (board[row + i][col - i] !== player) {
              win = false;
              break;
            }
          }
          if (win) {
            const line: [number, number][] = [];
            for (let i = 0; i < winLength; i++) {
              line.push([row + i, col - i]);
            }
            setWinningLine(line);
            return player;
          }
        }
      }
    }
    
    // Check if the board is full for a draw
    const isFull = board.every(row => row.every(cell => cell !== null));
    if (isFull) return 'Draw';
    
    return null;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // Don't allow moves if game is over or cell is already filled
    if (winner || board[row][col] !== null) return;
    
    // Start game if not started
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Create a new board with the player's move
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastMove([row, col]);
    
    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === 'Draw') {
        trackGameComplete('unrestricted', 'draw');
      } else {
        trackGameComplete('unrestricted', gameWinner === currentPlayer ? 'win' : 'loss');
      }
      return;
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Render a cell
  const renderCell = (row: number, col: number) => {
    const cellValue = board[row][col];
    const isLastMove = lastMove && lastMove[0] === row && lastMove[1] === col;
    const isWinningCell = winningLine.some(([r, c]) => r === row && c === col);
    
    return (
      <div
        key={`${row}-${col}`}
        className={cn(
          "flex items-center justify-center border border-border",
          "w-12 h-12 md:w-16 md:h-16 text-2xl md:text-3xl font-bold",
          "transition-all duration-150 cursor-pointer",
          isLastMove && "bg-primary/10",
          isWinningCell && "bg-primary/20",
          gameStarted && cellValue === null && !winner && "hover:bg-primary/5"
        )}
        onClick={() => handleCellClick(row, col)}
      >
        {cellValue}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">
          Unrestricted Mode
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Game status */}
        <div className="mb-4 text-center">
          {winner ? (
            <div className="text-xl font-bold">
              {winner === 'Draw' ? 'Game ended in a Draw!' : `Player ${winner} wins!`}
            </div>
          ) : (
            <div>
              <div className="font-medium">
                {gameStarted ? `Current Player: ${currentPlayer}` : 'Click any cell to start'}
              </div>
              
              {timeLimit > 0 && gameStarted && !winner && (
                <div className="mt-1 text-sm">
                  Time left: {timeLeft}s
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Game board */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: boardSize }).map((_, rowIndex) => (
              Array.from({ length: boardSize }).map((_, colIndex) => (
                renderCell(rowIndex, colIndex)
              ))
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-sm">
          <p className="font-medium">Game Rules:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>This is an experimental game mode with a fixed 5x5 grid</li>
            <li>Custom rules and mechanics will be added in future updates</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={resetGame}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>
        
        {!gameStarted && (
          <Button
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UnrestrictedTicTacToe;