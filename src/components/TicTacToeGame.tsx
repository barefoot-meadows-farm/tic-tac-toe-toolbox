
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameSettings } from './GameStart';
import { useAuth } from '@/contexts/AuthContext';
import { trackGameComplete } from '@/utils/analytics';
import { getAIMove } from '@/utils/gameAI';

type Player = 'X' | 'O' | null;
type NumericalValue = number | null;
type Board = (Player)[][];
type NumericalBoard = (NumericalValue)[][];

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
  
  // For numerical mode, track the numbers placed and available numbers
  const [numericalBoard, setNumericalBoard] = useState<NumericalBoard>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [usedNumbers, setUsedNumbers] = useState<{
    player1: number[];
    player2: number[];
  }>({
    player1: [],
    player2: []
  });
  
  // Available numbers for numerical mode
  const player1Numbers = [1, 3, 5, 7, 9].filter(n => !usedNumbers.player1.includes(n));
  const player2Numbers = [2, 4, 6, 8].filter(n => !usedNumbers.player2.includes(n));
  
  // Track currently selected number for placement
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  
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
  const [waitingForAI, setWaitingForAI] = useState(false);
  
  // Reset the timer when it's used
  const [timeLeft, setTimeLeft] = useState(settings?.timeLimit || null);
  
  // Get auth context
  const { user } = useAuth();
  
  // Reset the game when settings change
  useEffect(() => {
    resetGame();
  }, [settings, boardSize]);
  
  // AI move handling
  useEffect(() => {
    // When it's AI's turn and game is in progress
    if (gameStarted && 
        !winner && 
        !isDraw && 
        settings?.opponent === 'ai' && 
        currentPlayer === 'O') {
      
      // Add a small delay to make the AI move seem more natural
      const aiMoveTimer = setTimeout(() => {
        setWaitingForAI(true);
        
        // Get the AI move based on the current board state and settings
        const aiMove = getAIMove(
          board, 
          currentPlayer, 
          settings, 
          variant
        );
        
        if (aiMove) {
          if (variant === 'numerical') {
            // For numerical mode, AI needs to choose a number and place it
            const [row, col] = aiMove;
            const availableNumbers = player2Numbers; // AI is player 2
            if (availableNumbers.length > 0) {
              const aiNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
              handleNumericalMove(row, col, aiNumber);
            }
          } else {
            const [row, col] = aiMove;
            handleClick(row, col);
          }
        }
        
        setWaitingForAI(false);
      }, 500);
      
      return () => clearTimeout(aiMoveTimer);
    }
  }, [gameStarted, winner, isDraw, settings?.opponent, currentPlayer, board, variant, player2Numbers]);
  
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
    // For numerical mode, use a different winner check
    if (variant === 'numerical') {
      return checkNumericalWinner(numericalBoard);
    }
    
    // For custom mode with special rules
    if (variant === 'custom' && settings?.customRules) {
      return checkCustomWinner(board);
    }
    
    const size = board.length;
    const winLength = settings?.winLength || size;
    
    // Check rows
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        let sequence = board[i].slice(j, j + winLength);
        if (sequence.every(cell => cell === 'X') || sequence.every(cell => cell === 'O')) {
          const winLine = Array.from({length: winLength}, (_, k) => [i, j + k]);
          setWinningLine(winLine);
          // For misere variant, invert the winner
          if (variant === 'misere') {
            return sequence[0] === 'X' ? 'O' : 'X';
          }
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
          // For misere variant, invert the winner
          if (variant === 'misere') {
            return firstCell === 'X' ? 'O' : 'X';
          }
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
          // For misere variant, invert the winner
          if (variant === 'misere') {
            return firstCell === 'X' ? 'O' : 'X';
          }
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
          // For misere variant, invert the winner
          if (variant === 'misere') {
            return firstCell === 'X' ? 'O' : 'X';
          }
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
  
  // Custom winner check for special game modes
  const checkCustomWinner = (board: Board) => {
    if (!settings?.customRules) return null;
    
    // Implement custom win conditions based on settings
    const { winCondition, targetSum } = settings.customRules;
    const size = board.length;
    
    if (winCondition === 'sum' && targetSum) {
      // Check for sum-based win conditions (like numerical mode)
      // This is a simplified version - would need to be expanded based on actual rules
      return checkSumBasedWinner(board, targetSum);
    }
    
    return null;
  };
  
  // Helper for sum-based win conditions
  const checkSumBasedWinner = (board: Board, targetSum: number) => {
    // Implementation would depend on how values are assigned to X and O
    // This is a placeholder for the actual implementation
    return null;
  };

  // Check for numerical win (sum of 15)
  const checkNumericalWinner = (board: NumericalBoard) => {
    const size = board.length;
    
    // Check rows
    for (let i = 0; i < size; i++) {
      const rowSum = board[i].reduce((sum, cell) => sum + (cell || 0), 0);
      if (rowSum === 15 && !board[i].includes(null)) {
        setWinningLine(Array.from({length: size}, (_, k) => [i, k]));
        // Determine which player won based on the numbers in this row
        const isPlayer1Win = board[i].some(cell => cell !== null && cell % 2 === 1);
        return isPlayer1Win ? 'X' : 'O';
      }
    }
    
    // Check columns
    for (let j = 0; j < size; j++) {
      let colSum = 0;
      let hasNull = false;
      const colNumbers: number[] = [];
      
      for (let i = 0; i < size; i++) {
        if (board[i][j] === null) {
          hasNull = true;
          break;
        }
        colSum += board[i][j]!;
        colNumbers.push(board[i][j]!);
      }
      
      if (!hasNull && colSum === 15) {
        setWinningLine(Array.from({length: size}, (_, k) => [k, j]));
        // Determine which player won
        const isPlayer1Win = colNumbers.some(num => num % 2 === 1);
        return isPlayer1Win ? 'X' : 'O';
      }
    }
    
    // Check main diagonal
    let diagSum = 0;
    let hasDiagNull = false;
    const diagNumbers: number[] = [];
    
    for (let i = 0; i < size; i++) {
      if (board[i][i] === null) {
        hasDiagNull = true;
        break;
      }
      diagSum += board[i][i]!;
      diagNumbers.push(board[i][i]!);
    }
    
    if (!hasDiagNull && diagSum === 15) {
      setWinningLine(Array.from({length: size}, (_, k) => [k, k]));
      // Determine which player won
      const isPlayer1Win = diagNumbers.some(num => num % 2 === 1);
      return isPlayer1Win ? 'X' : 'O';
    }
    
    // Check other diagonal
    let otherDiagSum = 0;
    let hasOtherDiagNull = false;
    const otherDiagNumbers: number[] = [];
    
    for (let i = 0; i < size; i++) {
      if (board[i][size - 1 - i] === null) {
        hasOtherDiagNull = true;
        break;
      }
      otherDiagSum += board[i][size - 1 - i]!;
      otherDiagNumbers.push(board[i][size - 1 - i]!);
    }
    
    if (!hasOtherDiagNull && otherDiagSum === 15) {
      setWinningLine(Array.from({length: size}, (_, k) => [k, size - 1 - k]));
      // Determine which player won
      const isPlayer1Win = otherDiagNumbers.some(num => num % 2 === 1);
      return isPlayer1Win ? 'X' : 'O';
    }
    
    // Check for draw - either board is full or players have used all their numbers
    const isNumericalDraw = board.every(row => row.every(cell => cell !== null)) || 
                            (player1Numbers.length === 0 || player2Numbers.length === 0);
    
    if (isNumericalDraw) {
      setIsDraw(true);
    }
    
    return null;
  };

  // Handle number selection for numerical mode
  const handleNumberSelect = (number: number) => {
    if (!selectedCell || winner || isDraw || waitingForAI) return;
    
    setSelectedNumber(number);
    
    // Place the number on the board
    if (selectedCell) {
      const [row, col] = selectedCell;
      handleNumericalMove(row, col, number);
    }
  };

  // Handle numerical move
  const handleNumericalMove = (row: number, col: number, number: number) => {
    if (winner || isDraw || waitingForAI) return;
    
    // Create a new board with the move
    const newNumericalBoard = numericalBoard.map(r => [...r]);
    newNumericalBoard[row][col] = number;
    setNumericalBoard(newNumericalBoard);
    
    // Update used numbers
    const newUsedNumbers = {...usedNumbers};
    if (currentPlayer === 'X') {
      newUsedNumbers.player1 = [...newUsedNumbers.player1, number];
    } else {
      newUsedNumbers.player2 = [...newUsedNumbers.player2, number];
    }
    setUsedNumbers(newUsedNumbers);
    
    // Update the regular board too (for AI logic)
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    
    // Reset selected cell and number
    setSelectedCell(null);
    setSelectedNumber(null);
    
    // Check for winner
    const winnerPlayer = checkNumericalWinner(newNumericalBoard);
    if (winnerPlayer) {
      setWinner(winnerPlayer);
      
      // Track the game completion
      if (user) {
        trackGameComplete(
          {
            gameId: variant || 'numerical',
            variant: variant || 'numerical',
            opponent: settings?.opponent || 'ai',
            difficulty: settings?.difficulty,
            result: winnerPlayer === 'X' ? 'win' : 'loss'
          }, 
          user
        );
      }
      
      return;
    }
    
    // Check for draw
    if (isDraw) {
      // Track the game completion as a draw
      if (user) {
        trackGameComplete(
          {
            gameId: variant || 'numerical',
            variant: variant || 'numerical',
            opponent: settings?.opponent || 'ai',
            difficulty: settings?.difficulty,
            result: 'draw'
          }, 
          user
        );
      }
      return;
    }
    
    // Reset the timer when a move is made
    if (settings?.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const handleClick = (row: number, col: number) => {
    // For numerical mode, handle cell selection differently
    if (variant === 'numerical') {
      if (winner || isDraw || waitingForAI || numericalBoard[row][col] !== null) return;
      
      if (!gameStarted) {
        setGameStarted(true);
        if (settings?.timeLimit) {
          setTimeLeft(settings.timeLimit);
        }
      }
      
      // Select the cell (for numerical, we'll place the number after selecting it)
      setSelectedCell([row, col]);
      return;
    }
    
    // Handle special case for Feral variant
    const canOverwrite = variant === 'feral';
    
    // For feral mode, can overwrite opponent's moves but not your own
    if ((!canOverwrite && board[row][col]) || 
        (canOverwrite && board[row][col] === currentPlayer) || 
        winner || 
        isDraw || 
        waitingForAI) {
      return;
    }

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
    setNumericalBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setUsedNumbers({ player1: [], player2: [] });
    setSelectedCell(null);
    setSelectedNumber(null);
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

  // Render the number options for the numerical mode
  const renderNumberOptions = () => {
    const availableNumbers = currentPlayer === 'X' ? player1Numbers : player2Numbers;
    
    return (
      <div className="flex justify-center space-x-2 mb-4">
        {availableNumbers.map(number => (
          <button
            key={number}
            className={cn(
              "w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full",
              currentPlayer === 'X' 
                ? "bg-red-200 hover:bg-red-300 text-red-800" 
                : "bg-blue-200 hover:bg-blue-300 text-blue-800",
              selectedNumber === number ? "ring-2 ring-primary" : ""
            )}
            onClick={() => handleNumberSelect(number)}
            disabled={!selectedCell || winner !== null || isDraw || waitingForAI}
          >
            {number}
          </button>
        ))}
      </div>
    );
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
              {variant === 'numerical' 
                ? "Select a cell, then choose a number to place" 
                : "Click on a cell to begin"}
            </p>
            {variant === 'numerical' && (
              <div className="text-sm text-muted-foreground mb-4">
                <p className="font-medium">Game Rules:</p>
                <p>Player 1 uses odd numbers (1, 3, 5, 7, 9)</p>
                <p>Player 2 uses even numbers (2, 4, 6, 8)</p>
                <p>Win by creating a sum of 15 in any line</p>
              </div>
            )}
          </div>
        )}
        
        {gameStarted && !winner && !isDraw && (
          <div className="animate-fade-in">
            <p className="text-xl font-medium mb-2">Current player</p>
            {variant === 'numerical' ? (
              <div 
                className={cn(
                  "mx-auto font-bold text-lg",
                  currentPlayer === 'X' ? "text-primary" : "text-accent-foreground"
                )}
              >
                Player {currentPlayer === 'X' ? '1 (Odd)' : '2 (Even)'}
              </div>
            ) : (
              <div 
                className={cn(
                  "w-12 h-12 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-2xl",
                  currentPlayer === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
                )}
              >
                {currentPlayer}
              </div>
            )}
            {waitingForAI && (
              <p className="text-sm text-muted-foreground mt-2">AI is thinking...</p>
            )}
          </div>
        )}
        
        {winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">Winner</p>
            {variant === 'numerical' ? (
              <div 
                className={cn(
                  "mx-auto font-bold text-xl",
                  winner === 'X' ? "text-primary" : "text-accent-foreground"
                )}
              >
                Player {winner === 'X' ? '1 (Odd)' : '2 (Even)'}
              </div>
            ) : (
              <div 
                className={cn(
                  "w-14 h-14 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-3xl",
                  winner === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
                )}
              >
                {winner}
              </div>
            )}
          </div>
        )}
        
        {isDraw && !winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">
              Draw!
            </p>
            <p className="text-muted-foreground">
              {variant === 'numerical' 
                ? "No more numbers available or no winning combinations possible" 
                : "No more moves available"}
            </p>
          </div>
        )}
      </div>
      
      {variant === 'numerical' && gameStarted && !winner && !isDraw && (
        renderNumberOptions()
      )}
      
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
        {/* Render cells based on game mode */}
        {variant === 'numerical' ? (
          Array.from({ length: boardSize }, (_, rowIndex) => (
            Array.from({ length: boardSize }, (_, colIndex) => {
              const cellValue = numericalBoard[rowIndex][colIndex];
              const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center font-bold transition-all duration-300",
                    gameStarted && cellValue === null && !winner && !isDraw && !waitingForAI 
                      ? "hover:border-primary/50" : "",
                    isWinningCell(rowIndex, colIndex) ? "bg-primary/10 border-primary" : "",
                    isSelected ? "bg-primary/5 border-primary/70" : "",
                    boardSize > 3 ? "text-xl" : "text-3xl"
                  )}
                  onClick={() => {
                    if (!gameStarted) {
                      setGameStarted(true);
                      if (settings?.timeLimit) {
                        setTimeLeft(settings.timeLimit);
                      }
                    }
                    
                    if (cellValue === null && !winner && !isDraw && !waitingForAI && 
                        !(settings?.opponent === 'ai' && currentPlayer === 'O')) {
                      setSelectedCell([rowIndex, colIndex]);
                    }
                  }}
                  disabled={cellValue !== null || winner !== null || isDraw || waitingForAI || 
                            (settings?.opponent === 'ai' && currentPlayer === 'O')}
                  aria-label={`Cell ${rowIndex}-${colIndex}`}
                >
                  {cellValue !== null && (
                    <span 
                      className={cn(
                        "animate-scale-in",
                        cellValue % 2 === 1 ? "text-red-600" : "text-blue-600"
                      )}
                    >
                      {cellValue}
                    </span>
                  )}
                </button>
              );
            })
          )).flat()
        ) : (
          board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center text-3xl font-bold transition-all duration-300",
                  gameStarted && !cell && !winner && !isDraw && !waitingForAI ? "hover:border-primary/50" : "",
                  isWinningCell(rowIndex, colIndex) ? "bg-primary/10 border-primary" : "",
                  boardSize > 3 ? "text-xl" : "text-3xl"
                )}
                onClick={() => handleClick(rowIndex, colIndex)}
                disabled={!!winner || isDraw || waitingForAI || (settings?.opponent === 'ai' && currentPlayer === 'O')}
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
          )).flat()
        )}
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
