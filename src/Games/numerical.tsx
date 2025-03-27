
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GameSettings } from '@/components/GameStart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface NumericalTicTacToeProps {
  settings?: GameSettings;
}

const NumericalTicTacToe: React.FC<NumericalTicTacToeProps> = ({ settings }) => {
  // Game configuration options derived from settings
  const boardSize = settings?.boardSize || 3;
  const timeLimit = settings?.timeLimit || 0; // 0 means no time limit
  const aiEnabled = settings?.opponent === 'ai';
  const aiDifficulty = settings?.difficulty || 'medium';
  const showLastMove = true;
  
  // Game state
  const [board, setBoard] = useState<Array<number | null>>(Array(boardSize * boardSize).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 for odd player, 2 for even player
  const [winner, setWinner] = useState<number | string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [usedNumbers, setUsedNumbers] = useState({
    odd: [] as number[],    // Numbers used by player 1 (1, 3, 5, 7, 9)
    even: [] as number[]    // Numbers used by player 2 (2, 4, 6, 8)
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // Available numbers for each player
  const oddNumbers = [1, 3, 5, 7, 9].filter(num => !usedNumbers.odd.includes(num));
  const evenNumbers = [2, 4, 6, 8].filter(num => !usedNumbers.even.includes(num));
  
  // Target sum (traditionally 15 for all board sizes)
  const targetSum = 15;

  // Initialize game on component mount
  useEffect(() => {
    resetGame();
    startGame(); // Auto-start game immediately
  }, [boardSize]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (timeLimit > 0 && !winner) {
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
  }, [timeLimit, currentPlayer, winner]);

  // AI move effect - trigger AI moves when it's the AI's turn
  useEffect(() => {
    // If AI is enabled, it plays as player 2 (even numbers)
    if (aiEnabled && currentPlayer === 2 && !winner && !isAiThinking) {
      setIsAiThinking(true);
      
      // Simulate AI thinking with a short delay
      const thinkingTime = aiDifficulty === 'hard' ? 1200 : aiDifficulty === 'medium' ? 800 : 500;
      
      setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, thinkingTime);
    }
  }, [currentPlayer, winner, aiEnabled]);

  // Reset the game
  const resetGame = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setCurrentPlayer(1);
    setWinner(null);
    setLastMove(null);
    setWinningLine([]);
    setTimeLeft(timeLimit);
    setUsedNumbers({
      odd: [],
      even: []
    });
    setIsAiThinking(false);
  };

  // Start the game
  const startGame = () => {
    resetGame();
  };

  // AI move logic
  const makeAiMove = () => {
    if (winner) return;
    
    // Find empty cells
    const emptyCells = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    if (emptyCells.length === 0) return;
    
    // Get available numbers for AI (even numbers)
    if (evenNumbers.length === 0) {
      setWinner('Draw'); // No more numbers available
      return;
    }
    
    let selectedCell = -1;
    let selectedNumber = -1;
    
    // AI difficulty logic
    if (aiDifficulty === 'easy') {
      // Easy: random moves
      selectedCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      selectedNumber = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
    } else {
      // Medium/Hard: Try to find winning combinations or block opponent
      
      // First, try to find a winning move
      let foundWinningMove = false;
      
      for (const cell of emptyCells) {
        for (const num of evenNumbers) {
          const tempBoard = [...board];
          tempBoard[cell] = num;
          
          if (wouldWin(tempBoard, cell, num)) {
            selectedCell = cell;
            selectedNumber = num;
            foundWinningMove = true;
            break;
          }
        }
        if (foundWinningMove) break;
      }
      
      // If no winning move, try to block opponent or make strategic move
      if (!foundWinningMove) {
        // Hard difficulty: more sophisticated blocking and strategic play
        if (aiDifficulty === 'hard') {
          // Check if opponent can win with any of their numbers
          for (const cell of emptyCells) {
            for (const num of oddNumbers) {
              const tempBoard = [...board];
              tempBoard[cell] = num;
              
              if (wouldWin(tempBoard, cell, num)) {
                // Found a blocking move
                selectedCell = cell;
                
                // Pick the highest even number for more aggressive blocking
                selectedNumber = Math.max(...evenNumbers);
                foundWinningMove = true;
                break;
              }
            }
            if (foundWinningMove) break;
          }
        }
        
        // If still no strategic move found, aim for center or corners
        if (!foundWinningMove) {
          const centerIndex = Math.floor(board.length / 2);
          const cornerIndices = [0, boardSize - 1, board.length - boardSize, board.length - 1];
          
          // Prefer center
          if (board[centerIndex] === null) {
            selectedCell = centerIndex;
          } 
          // Then corners
          else {
            const emptyCorners = cornerIndices.filter(idx => board[idx] === null);
            if (emptyCorners.length > 0) {
              selectedCell = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
            } 
            // Then any empty cell
            else {
              selectedCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
          }
          
          // Choose number based on difficulty
          if (aiDifficulty === 'hard' || aiDifficulty === 'medium') {
            // Prefer medium/large even numbers for better sum potential
            const preferredNumbers = evenNumbers.filter(n => n >= 4);
            selectedNumber = preferredNumbers.length > 0 
              ? preferredNumbers[Math.floor(Math.random() * preferredNumbers.length)]
              : evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
          } else {
            selectedNumber = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
          }
        }
      }
    }
    
    if (selectedCell >= 0 && selectedNumber > 0) {
      // Place the move
      const newBoard = [...board];
      newBoard[selectedCell] = selectedNumber;
      setBoard(newBoard);
      
      // Update used numbers
      const newUsedNumbers = { ...usedNumbers };
      newUsedNumbers.even = [...newUsedNumbers.even, selectedNumber];
      setUsedNumbers(newUsedNumbers);
      
      // Check for winner
      if (checkWinner(newBoard, selectedCell, selectedNumber)) {
        setWinner(2);
      } else if (checkDraw(newBoard)) {
        setWinner('Draw');
      } else {
        // Switch back to player 1
        setCurrentPlayer(1);
        
        // Reset timer for the next player
        if (timeLimit > 0) {
          setTimeLeft(timeLimit);
        }
      }
    }
  };

  // Check if a move would win
  const wouldWin = (boardState: Array<number | null>, index: number, number: number): boolean => {
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
      
      if (values.length === boardSize) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        if (sum === targetSum) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check for winner
  const checkWinner = (boardState: Array<number | null>, index: number, number: number): boolean => {
    return wouldWin(boardState, index, number);
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
    if (winner || lastMove === null) return;
    
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
      setLastMove(null);
    } else if (checkDraw(newBoard)) {
      setWinner('Draw');
      setLastMove(null);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      
      // Check if next player has run out of numbers and declare draw if so
      const nextPlayerNumbers = currentPlayer === 1 ? evenNumbers : oddNumbers;
      if (nextPlayerNumbers.length === 0) {
        setWinner('Draw');
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
    if (board[index] !== null || winner !== null) return;
    
    // If it's the AI's turn, ignore human clicks
    if (aiEnabled && currentPlayer === 2) return;
    
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
            className={cn(
              "w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full transition-colors",
              currentPlayer === 1 
                ? "bg-red-200 hover:bg-red-300 text-red-900" 
                : "bg-blue-200 hover:bg-blue-300 text-blue-900",
              lastMove === null && "opacity-50 cursor-not-allowed",
              isAiThinking && "pointer-events-none opacity-50"
            )}
            onClick={() => handleNumberSelect(number)}
            disabled={lastMove === null || winner !== null || isAiThinking}
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
    let bgColor = 'bg-card';
    if (isWinningCell) {
      bgColor = 'bg-green-100';
    } else if (isLastMoveCell) {
      bgColor = 'bg-muted';
    }
    
    const cellValue = board[index];
    let textColor = 'text-primary';
    
    if (cellValue !== null) {
      textColor = cellValue % 2 === 1 ? 'text-red-600' : 'text-blue-600';
    }
    
    return (
      <Button
        key={index}
        variant="outline"
        className={cn(
          "flex items-center justify-center text-2xl font-bold aspect-square p-0 h-full w-full",
          bgColor,
          textColor,
          cellValue === null && !isLastMoveCell && !isAiThinking && "hover:bg-muted/50"
        )}
        onClick={() => handleCellClick(index)}
        disabled={cellValue !== null || winner !== null || (aiEnabled && currentPlayer === 2) || isAiThinking}
      >
        {cellValue !== null ? cellValue : ''}
      </Button>
    );
  };

  // Render the game board
  const renderBoard = () => {
    return (
      <div 
        className="grid gap-2 w-full max-w-[320px] mx-auto aspect-square"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}
      >
        {board.map((_, index) => renderCell(index))}
      </div>
    );
  };

  // Get player status text
  const getPlayerStatusText = () => {
    if (winner) {
      return winner === 'Draw' ? 'Game Draw!' : `Player ${winner} Wins!`;
    }
    
    if (isAiThinking) {
      return "AI is thinking...";
    }
    
    if (aiEnabled && currentPlayer === 2) {
      return "AI's Turn (Even Numbers)";
    }
    
    return `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? 'Odd' : 'Even'} Numbers)`;
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-center">Numerical Tic-Tac-Toe</CardTitle>
        <p className="text-center text-muted-foreground text-sm">Get numbers that sum to {targetSum} in a line!</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-medium">
            {getPlayerStatusText()}
          </div>
          
          {timeLimit > 0 && !winner && (
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
        
        {!winner && currentPlayer === 1 && renderNumberOptions()}
        {!winner && currentPlayer === 2 && !aiEnabled && renderNumberOptions()}
        
        {renderBoard()}
        
        <div className="bg-muted/30 p-3 rounded-md mt-4">
          <h3 className="font-medium mb-2">Game Rules:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Player 1 uses odd numbers (1, 3, 5, 7, 9)</li>
            <li>• Player 2 uses even numbers (2, 4, 6, 8)</li>
            <li>• Each number can only be used once</li>
            <li>• Create a line of numbers that sum to {targetSum} to win</li>
            <li>• First select a cell, then choose a number to place</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button
          variant="outline"
          onClick={resetGame}
          className="flex items-center"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Game
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NumericalTicTacToe;
