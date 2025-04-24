
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GameSettings } from '@/components/GameStart';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Shuffle } from 'lucide-react';
import { getAIMove } from '@/utils/gameAI';
import { trackGameComplete } from '@/utils/analytics';

interface ChaosTicTacToeProps {
  settings?: GameSettings;
}

type Player = 'X' | 'O' | null;
type Board = (Player)[][];

const ChaosTicTacToe: React.FC<ChaosTicTacToeProps> = ({ settings }) => {
  // Game configuration options derived from settings
  const boardSize = settings?.boardSize || 3; // Use board size from settings
  const winLength = settings?.winLength || 3; // Use win length from settings
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
  const [roundComplete, setRoundComplete] = useState(false);
  const [swappedTiles, setSwappedTiles] = useState<[[number, number], [number, number]] | null>(null);
  const [showSwapAnimation, setShowSwapAnimation] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Ref to track if a round is in progress
  const roundInProgressRef = useRef(false);

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

  // AI move effect - trigger AI moves when it's the AI's turn
  useEffect(() => {
    // If AI is enabled, it plays as player O
    if (aiEnabled && currentPlayer === 'O' && gameStarted && !winner && !roundInProgressRef.current) {
      setIsAiThinking(true);
      
      // Simulate AI thinking with a short delay
      const thinkingTime = aiDifficulty === 'hard' ? 1200 : aiDifficulty === 'medium' ? 800 : 500;
      
      setTimeout(() => {
        makeAiMove();
        setIsAiThinking(false);
      }, thinkingTime);
    }
  }, [currentPlayer, winner, aiEnabled, gameStarted]);

  // Effect to handle the chaos swap after a round is complete
  useEffect(() => {
    if (roundComplete && !winner) {
      // Delay to show the round completion before swap
      setTimeout(() => {
        performChaosSwap();
      }, 1000);
    }
  }, [roundComplete]);
  
  // Debug effect to monitor game state (can be removed after fixing)
  useEffect(() => {
    console.log('Game state update:', { 
      currentPlayer, 
      roundInProgress: roundInProgressRef.current,
      roundComplete,
      aiEnabled,
      isAiThinking
    });
  }, [currentPlayer, roundComplete, aiEnabled, isAiThinking]);
  
  // Debug effect to log state changes
  useEffect(() => {
    console.log('Game state update:', { 
      currentPlayer, 
      roundInProgress: roundInProgressRef.current,
      roundComplete,
      aiEnabled,
      moveCount
    });
  }, [currentPlayer, roundComplete, aiEnabled, moveCount]);

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
    setRoundComplete(false);
    setSwappedTiles(null);
    setShowSwapAnimation(false);
    setMoveCount(0);
    roundInProgressRef.current = false;
    setGameStarted(true);
  };

  // AI move logic
  const makeAiMove = () => {
    // Only check for winner, not roundInProgressRef
    if (winner) return;
    
    // Set the flag to prevent multiple moves
    roundInProgressRef.current = true;
    
    // Find empty cells
    const flatBoard = board.flat();
    const emptyCells = flatBoard.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    if (emptyCells.length === 0) {
      roundInProgressRef.current = false;
      return;
    }
    
    // Get AI move based on difficulty
    const aiMove = getAIMove(
      board.map(row => [...row]), // Create a deep copy of the board
      currentPlayer,
      settings,
      'traditional' // Use traditional logic for move calculation
    );
    
    // Update the board directly instead of using handleCellClick to avoid recursion issues
    if (aiMove) {
      const [row, col] = aiMove;
      // Create a new board with the AI's move
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove([row, col]);
      setMoveCount(moveCount + 1);
      
      // Check for winner
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        trackGameComplete({
          gameType: 'chaos',
          result: gameWinner === 'Draw' ? 'draw' : gameWinner === currentPlayer ? 'win' : 'loss'
        });
        roundInProgressRef.current = false;
        return;
      }
      
      // Check for draw
      if (isBoardFull(newBoard)) {
        setWinner('Draw');
        trackGameComplete({
          gameType: 'chaos',
          result: 'draw'
        });
        roundInProgressRef.current = false;
        return;
      }
      
      // Switch to player's turn
      setCurrentPlayer('X');
      
      // Set round complete to trigger the chaos swap
      setRoundComplete(true);
    } else {
      // Fallback to random move if AI doesn't return a move
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const row = Math.floor(randomIndex / boardSize);
      const col = randomIndex % boardSize;
      
      // Create a new board with the AI's move
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove([row, col]);
      setMoveCount(moveCount + 1);
      
      // Check for winner
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        trackGameComplete({
          gameType: 'chaos',
          result: gameWinner === 'Draw' ? 'draw' : gameWinner === currentPlayer ? 'win' : 'loss'
        });
        roundInProgressRef.current = false;
        return;
      }
      
      // Check for draw
      if (isBoardFull(newBoard)) {
        setWinner('Draw');
        trackGameComplete({
          gameType: 'chaos',
          result: 'draw'
        });
        roundInProgressRef.current = false;
        return;
      }
      
      // Switch to player's turn
      setCurrentPlayer('X');
      
      // Set round complete to trigger the chaos swap
      setRoundComplete(true);
    }
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (winner || board[row][col] !== null || roundInProgressRef.current || (aiEnabled && currentPlayer === 'O')) {
      return;
    }
    
    roundInProgressRef.current = true;
    
    // Update the board with the current player's mark
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastMove([row, col]);
    setMoveCount(moveCount + 1);
    
    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      trackGameComplete({
        gameType: 'chaos',
        result: gameWinner === 'Draw' ? 'draw' : gameWinner === currentPlayer ? 'win' : 'loss'
      });
      roundInProgressRef.current = false;
      return;
    }
    
    // Check for draw
    if (isBoardFull(newBoard)) {
      setWinner('Draw');
      trackGameComplete({
        gameType: 'chaos',
        result: 'draw'
      });
      roundInProgressRef.current = false;
      return;
    }
    
    // If it's a player vs AI game and the player just moved
    if (aiEnabled && currentPlayer === 'X') {
      // Mark the round as complete after player's move
      // The AI will move in the next effect cycle
      setCurrentPlayer('O');
      // Important: We need to set roundInProgressRef to false to allow AI to make its move
      // Reset immediately to ensure AI can make its move
      roundInProgressRef.current = false;
    } 
    // If it's a player vs player game
    else if (!aiEnabled) {
      // Switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      
      // Check if a full round is complete (both players have moved)
      // In player vs player, a round is complete when player X is about to play again
      if ((moveCount + 1) % 2 === 0) {
        setRoundComplete(true);
      } else {
        roundInProgressRef.current = false;
      }
    }
  };

  // Perform the chaos swap
  const performChaosSwap = () => {
    // Get all board positions
    const positions: [number, number][] = [];
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        positions.push([i, j]);
      }
    }
    
    // Randomly select two positions
    const randomIndex1 = Math.floor(Math.random() * positions.length);
    let randomIndex2 = Math.floor(Math.random() * positions.length);
    // Ensure we select two different positions
    while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * positions.length);
    }
    
    const pos1 = positions[randomIndex1];
    const pos2 = positions[randomIndex2];
    
    // Store the swapped tiles for animation
    setSwappedTiles([pos1, pos2]);
    setShowSwapAnimation(true);
    
    // Create a new board with the swapped tiles
    const newBoard = board.map(row => [...row]);
    const temp = newBoard[pos1[0]][pos1[1]];
    newBoard[pos1[0]][pos1[1]] = newBoard[pos2[0]][pos2[1]];
    newBoard[pos2[0]][pos2[1]] = temp;
    
    // Apply the new board after a delay for animation
    setTimeout(() => {
      setBoard(newBoard);
      setShowSwapAnimation(false);
      
      // Check if the swap created a winner
      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        trackGameComplete({
          gameType: 'chaos',
          result: gameWinner === 'Draw' ? 'draw' : gameWinner === currentPlayer ? 'win' : 'loss'
        });
      } else if (isBoardFull(newBoard)) {
        setWinner('Draw');
        trackGameComplete({
          gameType: 'chaos',
          result: 'draw'
        });
      }
      
      // Reset round state
      setRoundComplete(false);
      roundInProgressRef.current = false;
    }, 1000);
  };

  // Check for a winner
  const checkWinner = (board: Board): Player | null => {
    // Check rows
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j <= boardSize - winLength; j++) {
        let match = true;
        const firstCell = board[i][j];
        if (!firstCell) continue;
        
        const line: [number, number][] = [];
        for (let k = 0; k < winLength; k++) {
          if (board[i][j + k] !== firstCell) {
            match = false;
            break;
          }
          line.push([i, j + k]);
        }
        
        if (match) {
          setWinningLine(line);
          return firstCell;
        }
      }
    }
    
    // Check columns
    for (let i = 0; i <= boardSize - winLength; i++) {
      for (let j = 0; j < boardSize; j++) {
        let match = true;
        const firstCell = board[i][j];
        if (!firstCell) continue;
        
        const line: [number, number][] = [];
        for (let k = 0; k < winLength; k++) {
          if (board[i + k][j] !== firstCell) {
            match = false;
            break;
          }
          line.push([i + k, j]);
        }
        
        if (match) {
          setWinningLine(line);
          return firstCell;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= boardSize - winLength; i++) {
      for (let j = 0; j <= boardSize - winLength; j++) {
        let match = true;
        const firstCell = board[i][j];
        if (!firstCell) continue;
        
        const line: [number, number][] = [];
        for (let k = 0; k < winLength; k++) {
          if (board[i + k][j + k] !== firstCell) {
            match = false;
            break;
          }
          line.push([i + k, j + k]);
        }
        
        if (match) {
          setWinningLine(line);
          return firstCell;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= boardSize - winLength; i++) {
      for (let j = winLength - 1; j < boardSize; j++) {
        let match = true;
        const firstCell = board[i][j];
        if (!firstCell) continue;
        
        const line: [number, number][] = [];
        for (let k = 0; k < winLength; k++) {
          if (board[i + k][j - k] !== firstCell) {
            match = false;
            break;
          }
          line.push([i + k, j - k]);
        }
        
        if (match) {
          setWinningLine(line);
          return firstCell;
        }
      }
    }
    
    return null;
  };

  // Check if the board is full
  const isBoardFull = (board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card shadow-md border border-border/50">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Shuffle className="h-5 w-5" /> Chaos Tic-Tac-Toe
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Game status */}
        <div className="mb-4 text-center">
          {winner ? (
            <div className="text-xl font-bold">
              {winner === 'Draw' ? 'Game ended in a Draw!' : `Player ${winner} wins!`}
            </div>
          ) : roundComplete ? (
            <div className="text-lg font-semibold animate-pulse">
              Round complete! Chaos swap incoming...
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="text-lg">
                Player {currentPlayer}'s turn
                {isAiThinking && <span className="ml-2 animate-pulse">AI thinking...</span>}
              </div>
              {timeLimit > 0 && (
                <div className="text-sm font-mono">
                  Time: {timeLeft}s
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Game board */}
        <div className={cn(
          "grid gap-2 mb-4",
          boardSize === 3 ? "grid-cols-3" : 
          boardSize === 4 ? "grid-cols-4" : 
          boardSize === 5 ? "grid-cols-5" : "grid-cols-3"
        )}>
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isLastMove = lastMove && lastMove[0] === rowIndex && lastMove[1] === colIndex;
              const isWinningCell = winningLine.some(([r, c]) => r === rowIndex && c === colIndex);
              const isSwappedCell = showSwapAnimation && swappedTiles && 
                (swappedTiles[0][0] === rowIndex && swappedTiles[0][1] === colIndex || 
                 swappedTiles[1][0] === rowIndex && swappedTiles[1][1] === colIndex);
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "aspect-square flex items-center justify-center text-2xl font-bold rounded-md transition-all",
                    "border-2 border-border/50 hover:bg-accent/50",
                    isLastMove && "bg-accent/30",
                    isWinningCell && "bg-green-500/20 border-green-500",
                    isSwappedCell && "animate-pulse bg-yellow-500/30 border-yellow-500",
                    !cell && !winner && !isAiThinking && "hover:bg-accent/20"
                  )}
                  disabled={!!winner || isAiThinking || (aiEnabled && currentPlayer === 'O')}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell}
                </button>
              );
            })
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetGame}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          Restart
        </Button>
        
        {!gameStarted && (
          <Button
            onClick={() => setGameStarted(true)}
            size="sm"
          >
            Start Game
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChaosTicTacToe;
