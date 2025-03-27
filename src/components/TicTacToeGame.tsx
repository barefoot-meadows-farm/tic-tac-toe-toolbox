
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameSettings } from './GameStart';
import { useAuth } from '@/contexts/AuthContext';
import { trackGameComplete } from '@/utils/analytics';

type Player = 'X' | 'O' | null;
type Board = (Player)[][];

interface TicTacToeGameProps {
  variant?: string;
  className?: string;
  settings?: GameSettings | null;
  isFullscreen?: boolean;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ 
  variant = 'classic',
  className,
  settings,
  isFullscreen
}) => {
  // Use settings?.boardSize or default to 3
  const boardSize = settings?.boardSize || 3;
  
  // Initialize the board based on boardSize
  const [board, setBoard] = useState<Board>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  
  // Determine first player based on settings
  const getInitialPlayer = (): 'X' | 'O' => {
    if (!settings || settings.firstPlayer === 'random') {
      return Math.random() < 0.5 ? 'X' : 'O';
    }
    return settings.firstPlayer === 'player1' ? 'X' : 'O';
  };
  
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>(getInitialPlayer());
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningLine, setWinningLine] = useState<number[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Reset the timer when it's used
  const [timeLeft, setTimeLeft] = useState(settings?.timeLimit || null);
  
  // Get auth context
  const { user } = useAuth();
  
  // Reset the game when settings change
  useEffect(() => {
    resetGame();
  }, [settings, boardSize]);
  
  // Timer logic
  useEffect(() => {
    if (!gameStarted || winner || isDraw || !settings?.timeLimit) return;
    
    if (timeLeft === 0) {
      // Time's up, switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      setTimeLeft(settings.timeLimit);
      return;
    }
    
    const timer = setTimeout(() => {
      if (timeLeft !== null) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, winner, isDraw, settings?.timeLimit, currentPlayer]);

  const checkWinner = (board: Board) => {
    const size = board.length;
    const winLength = settings?.winLength || size;
    
    // Check rows
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        let sequence = board[i].slice(j, j + winLength);
        if (sequence.every(cell => cell === 'X') || sequence.every(cell => cell === 'O')) {
          const winLine = Array.from({length: winLength}, (_, k) => [i, j + k]);
          setWinningLine(winLine);
          return sequence[0];
        }
      }
    }
    
    // Check columns
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = 0; j < size; j++) {
        let match = true;
        let firstCell = board[i][j];
        if (!firstCell) continue;
        
        for (let k = 1; k < winLength; k++) {
          if (board[i + k][j] !== firstCell) {
            match = false;
            break;
          }
        }
        
        if (match) {
          const winLine = Array.from({length: winLength}, (_, k) => [i + k, j]);
          setWinningLine(winLine);
          return firstCell;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        let match = true;
        let firstCell = board[i][j];
        if (!firstCell) continue;
        
        for (let k = 1; k < winLength; k++) {
          if (board[i + k][j + k] !== firstCell) {
            match = false;
            break;
          }
        }
        
        if (match) {
          const winLine = Array.from({length: winLength}, (_, k) => [i + k, j + k]);
          setWinningLine(winLine);
          return firstCell;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = winLength - 1; j < size; j++) {
        let match = true;
        let firstCell = board[i][j];
        if (!firstCell) continue;
        
        for (let k = 1; k < winLength; k++) {
          if (board[i + k][j - k] !== firstCell) {
            match = false;
            break;
          }
        }
        
        if (match) {
          const winLine = Array.from({length: winLength}, (_, k) => [i + k, j - k]);
          setWinningLine(winLine);
          return firstCell;
        }
      }
    }
    
    // Check for draw
    const isDraw = board.every(row => row.every(cell => cell !== null));
    if (isDraw) {
      setIsDraw(true);
    }
    
    return null;
  };

  const handleClick = (row: number, col: number) => {
    // Handle special case for Feral variant
    const canOverwrite = variant === 'feral';
    
    if ((board[row][col] && !canOverwrite) || winner || isDraw) return;

    if (!gameStarted) {
      setGameStarted(true);
      if (settings?.timeLimit) {
        setTimeLeft(settings.timeLimit);
      }
    }
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    // For misere variant, we invert the winner logic
    if (variant === 'misere') {
      const potentialWinner = checkWinner(newBoard);
      if (potentialWinner) {
        // In misere, the player who makes three in a row loses
        const actualWinner = potentialWinner === 'X' ? 'O' : 'X';
        setWinner(actualWinner);
        
        // Track the game completion
        if (user) {
          const opponent = settings?.opponent || 'ai';
          trackGameComplete(
            {
              gameId: variant || 'traditional',
              variant: variant || 'traditional',
              opponent: opponent === 'ai' ? 'ai' : 'human',
              difficulty: settings?.difficulty,
              result: actualWinner === 'X' ? 'win' : 'loss'
            }, 
            user
          );
        }
        
        return;
      }
    } else {
      // Regular winner check for other variants
      const potentialWinner = checkWinner(newBoard);
      if (potentialWinner) {
        setWinner(potentialWinner);
        
        // Track the game completion
        if (user) {
          const opponent = settings?.opponent || 'ai';
          trackGameComplete(
            {
              gameId: variant || 'traditional',
              variant: variant || 'traditional',
              opponent: opponent === 'ai' ? 'ai' : 'human',
              difficulty: settings?.difficulty,
              result: potentialWinner === 'X' ? 'win' : 'loss'
            }, 
            user
          );
        }
        
        return;
      }
    }
    
    // Check for draw
    if (isDraw) {
      // Track the game completion as a draw
      if (user) {
        const opponent = settings?.opponent || 'ai';
        trackGameComplete(
          {
            gameId: variant || 'traditional',
            variant: variant || 'traditional',
            opponent: opponent === 'ai' ? 'ai' : 'human',
            difficulty: settings?.difficulty,
            result: 'draw'
          }, 
          user
        );
      }
    }
    
    // Reset the timer when a move is made
    if (settings?.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
    
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);
  };

  const resetGame = () => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setCurrentPlayer(getInitialPlayer());
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setGameStarted(false);
    if (settings?.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
  };

  const isWinningCell = (row: number, col: number) => {
    return winningLine.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
        {settings?.timeLimit && gameStarted && !winner && !isDraw && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">Time left: {timeLeft}s</p>
            <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-1000"
                style={{ 
                  width: `${(timeLeft! / settings.timeLimit) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      
        {!gameStarted && (
          <div className="animate-fade-in">
            <p className="text-lg text-muted-foreground mb-4">
              Click on a cell to begin
            </p>
          </div>
        )}
        
        {gameStarted && !winner && !isDraw && (
          <div className="animate-fade-in">
            <p className="text-xl font-medium mb-2">Current player</p>
            <div 
              className={cn(
                "w-12 h-12 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-2xl",
                currentPlayer === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
              )}
            >
              {currentPlayer}
            </div>
          </div>
        )}
        
        {winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">Winner</p>
            <div 
              className={cn(
                "w-14 h-14 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-3xl",
                winner === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
              )}
            >
              {winner}
            </div>
          </div>
        )}
        
        {isDraw && !winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">
              Draw!
            </p>
            <p className="text-muted-foreground">No more moves available</p>
          </div>
        )}
      </div>
      
      <div 
        className={cn(
          "board-grid w-full max-w-sm mx-auto bg-muted/30 p-4 rounded-lg shadow-sm",
          (winner || isDraw) ? "opacity-90" : "",
          boardSize > 3 ? "grid grid-cols-" + boardSize + " gap-1" : "grid grid-cols-3 gap-2"
        )}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gap: boardSize > 3 ? '0.25rem' : '0.5rem'
        }}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center text-3xl font-bold transition-all duration-300",
                gameStarted && !cell && !winner && !isDraw ? "hover:border-primary/50" : "",
                isWinningCell(rowIndex, colIndex) ? "bg-primary/10 border-primary" : "",
                boardSize > 3 ? "text-xl" : "text-3xl"
              )}
              onClick={() => handleClick(rowIndex, colIndex)}
              disabled={!!winner || isDraw}
              aria-label={`Cell ${rowIndex}-${colIndex}`}
            >
              {cell === 'X' && (
                <span className="text-primary animate-x-mark">X</span>
              )}
              {cell === 'O' && (
                <span className="text-accent-foreground animate-o-mark">O</span>
              )}
            </button>
          ))
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Button 
          onClick={resetGame} 
          variant="outline" 
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Restart Game
        </Button>
      </div>
    </div>
  );
};

export default TicTacToeGame;
