
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Player = 'X' | 'O' | null;
type Board = (Player)[][];

interface TicTacToeGameProps {
  variant?: string;
  className?: string;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ 
  variant = 'classic',
  className
}) => {
  const [board, setBoard] = useState<Board>(Array(3).fill(null).map(() => Array(3).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningLine, setWinningLine] = useState<number[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const checkWinner = (board: Board) => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        setWinningLine([[i, 0], [i, 1], [i, 2]]);
        return board[i][0];
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
        setWinningLine([[0, i], [1, i], [2, i]]);
        return board[0][i];
      }
    }
    
    // Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      setWinningLine([[0, 0], [1, 1], [2, 2]]);
      return board[0][0];
    }
    
    if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
      setWinningLine([[0, 2], [1, 1], [2, 0]]);
      return board[0][2];
    }
    
    // Check for draw
    const isDraw = board.every(row => row.every(cell => cell !== null));
    if (isDraw) {
      setIsDraw(true);
    }
    
    return null;
  };

  const handleClick = (row: number, col: number) => {
    if (board[row][col] || winner || isDraw) return;

    if (!gameStarted) {
      setGameStarted(true);
    }
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);
  };

  const resetGame = () => {
    setBoard(Array(3).fill(null).map(() => Array(3).fill(null)));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setGameStarted(false);
  };

  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      setWinner(winner);
    }
  }, [board]);

  const isWinningCell = (row: number, col: number) => {
    return winningLine.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
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
          (winner || isDraw) ? "opacity-90" : ""
        )}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center text-3xl font-bold transition-all duration-300",
                gameStarted && !cell && !winner && !isDraw ? "hover:border-primary/50" : "",
                isWinningCell(rowIndex, colIndex) ? "bg-primary/10 border-primary" : ""
              )}
              onClick={() => handleClick(rowIndex, colIndex)}
              disabled={!!cell || !!winner || isDraw}
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
