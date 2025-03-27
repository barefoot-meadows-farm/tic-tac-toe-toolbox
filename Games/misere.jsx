
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';
import { GameSettings } from '@/components/GameStart';

const MisereTicTacToe = ({ settings }) => {
  // Game configuration options derived from settings
  const boardSize = settings?.boardSize || 3;
  const timeLimit = settings?.timeLimit || 0; // 0 means no time limit
  const aiEnabled = settings?.opponent === 'ai';
  const aiDifficulty = settings?.difficulty || 'medium';
  const showLastMove = true;
  
  // Game state
  const [board, setBoard] = useState(Array(boardSize * boardSize).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winCondition, setWinCondition] = useState(boardSize >= 3 ? 3 : boardSize); // Number in a row needed to lose
  const [loser, setLoser] = useState(null); // In Misère, we track the loser instead of winner
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState(null);
  const [losingLine, setLosingLine] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true); // Start the game immediately
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Initialize or reset the game board when configuration changes
  useEffect(() => {
    resetGame();
    setIsPlaying(true); // Auto-start game
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

  // AI move effect - trigger when it's AI's turn
  useEffect(() => {
    if (isPlaying && aiEnabled && currentPlayer === 'O' && !loser && !isAiThinking) {
      setIsAiThinking(true);
      
      // Add a delay to simulate thinking
      const thinkingTime = aiDifficulty === 'hard' ? 1200 : aiDifficulty === 'medium' ? 800 : 500;
      
      setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, thinkingTime);
    }
  }, [currentPlayer, loser, isPlaying, aiEnabled]);

  // Reset the game
  const resetGame = () => {
    // Create empty board with current board size
    setBoard(Array(boardSize * boardSize).fill(''));
    setCurrentPlayer('X');
    setLoser(null);
    setLastMove(null);
    setLosingLine([]);
    setTimeLeft(timeLimit);
    setIsAiThinking(false);
  };

  // Make AI move - properly implementing MISERE RULES (avoid forming lines)
  const makeAiMove = () => {
    // Find empty cells
    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        emptyCells.push(i);
      }
    }
    
    if (emptyCells.length === 0) return;
    
    let bestMove = -1;
    
    // CRUCIAL FIX: In Misere, the goal is to NOT form lines and force opponent to do so
    if (aiDifficulty === 'easy') {
      // Easy: Choose random but avoid immediate loss if possible
      const nonLosingMoves = emptyCells.filter(index => {
        const tempBoard = [...board];
        tempBoard[index] = 'O';
        return !checkLineFormed(tempBoard, index, 'O');
      });
      
      // If there are non-losing moves, choose one of them randomly
      if (nonLosingMoves.length > 0) {
        bestMove = nonLosingMoves[Math.floor(Math.random() * nonLosingMoves.length)];
      } else {
        // All moves lead to loss, just pick random
        bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    } else if (aiDifficulty === 'medium' || aiDifficulty === 'hard') {
      // First priority: Don't create a line that makes me lose
      const nonLosingMoves = emptyCells.filter(index => {
        const tempBoard = [...board];
        tempBoard[index] = 'O';
        return !checkLineFormed(tempBoard, index, 'O');
      });
      
      if (nonLosingMoves.length > 0) {
        // If I have moves that don't make me lose
        if (aiDifficulty === 'hard') {
          // Hard: Try to force opponent to form a line (make them lose)
          const forcingMoves = nonLosingMoves.filter(index => {
            const tempBoard = [...board];
            tempBoard[index] = 'O';
            
            // See if there's a cell where the opponent MUST play and would form a line
            return emptyCells
              .filter(cell => cell !== index)
              .some(nextCell => {
                // For each possible next move by the opponent
                const tempBoard2 = [...tempBoard];
                tempBoard2[nextCell] = 'X';
                
                // Check if this forces them into a line
                if (checkLineFormed(tempBoard2, nextCell, 'X')) {
                  // Check if they have any alternative moves that don't form a line
                  const remainingCells = emptyCells.filter(cell => 
                    cell !== index && cell !== nextCell
                  );
                  
                  // If all remaining moves would also form a line, this is a forcing move
                  return remainingCells.every(alternativeCell => {
                    const alternativeBoard = [...tempBoard];
                    alternativeBoard[alternativeCell] = 'X';
                    return checkLineFormed(alternativeBoard, alternativeCell, 'X');
                  });
                }
                return false;
              });
          });
          
          if (forcingMoves.length > 0) {
            // We found moves that force opponent to lose
            bestMove = forcingMoves[Math.floor(Math.random() * forcingMoves.length)];
          } else {
            // No immediate forcing moves, try to create traps
            // Prefer center and corners for strategic advantage
            const strategicMoves = nonLosingMoves.filter(index => {
              const row = Math.floor(index / boardSize);
              const col = index % boardSize;
              return (row === 0 || row === boardSize - 1) && 
                     (col === 0 || col === boardSize - 1) ||
                     (row === Math.floor(boardSize / 2) && col === Math.floor(boardSize / 2));
            });
            
            if (strategicMoves.length > 0) {
              bestMove = strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
            } else {
              bestMove = nonLosingMoves[Math.floor(Math.random() * nonLosingMoves.length)];
            }
          }
        } else {
          // Medium: Just don't lose, prefer center/corners
          const preferredMoves = nonLosingMoves.filter(index => {
            const row = Math.floor(index / boardSize);
            const col = index % boardSize;
            return (row === 0 || row === boardSize - 1) && 
                   (col === 0 || col === boardSize - 1) ||
                   (row === Math.floor(boardSize / 2) && col === Math.floor(boardSize / 2));
          });
          
          if (preferredMoves.length > 0) {
            bestMove = preferredMoves[Math.floor(Math.random() * preferredMoves.length)];
          } else {
            bestMove = nonLosingMoves[Math.floor(Math.random() * nonLosingMoves.length)];
          }
        }
      } else {
        // All moves lead to me losing - pick any move
        bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }
    
    if (bestMove >= 0) {
      handleCellClick(bestMove);
    }
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
    
    // If it's AI's turn and human tries to play, ignore
    if (aiEnabled && currentPlayer === 'O') return;
    
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
              boardSize > 3 ? "text-xl" : "text-3xl",
              isAiThinking && "pointer-events-none"
            )}
            onClick={() => handleCellClick(index)}
            disabled={!isPlaying || loser || cell !== '' || (aiEnabled && currentPlayer === 'O') || isAiThinking}
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
    } else if (isAiThinking) {
      return 'AI is thinking...';
    } else if (aiEnabled && currentPlayer === 'O') {
      return "AI's Turn";
    } else {
      return `Player ${currentPlayer}'s Turn`;
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-center">Misère Tic Tac Toe</CardTitle>
          <p className="text-center text-muted-foreground text-sm">Avoid getting {winCondition} in a row to win!</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
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
          
          <div className="bg-muted/30 p-3 rounded-md mt-4">
            <h3 className="font-medium mb-2">Game Rules:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Unlike traditional Tic-Tac-Toe, the player who makes {winCondition} in a row LOSES</li>
              <li>• You must make a move on your turn, even if it forces you to lose</li>
              <li>• Plan ahead to force your opponent into making the losing line</li>
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
    </div>
  );
};

export default MisereTicTacToe;
