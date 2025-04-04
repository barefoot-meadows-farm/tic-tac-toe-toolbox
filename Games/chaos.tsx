
import React, { useState, useEffect } from 'react';
import { GameSettings } from '@/components/GameStart';
import { getAIMove } from '@/utils/gameAI';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { trackGameComplete } from '@/utils/analytics';

type Player = 'X' | 'O' | null;
type Board = Player[][];

interface ChaosTicTacToeProps {
  settings?: GameSettings;
}

const ChaosTicTacToe: React.FC<ChaosTicTacToeProps> = ({ settings }) => {
  const boardSize = settings?.boardSize || 3;
  
  // Initialize the board as a 3x3 grid with null values
  const [board, setBoard] = useState<Board>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>(
    settings?.firstPlayer === 'player2' ? 'O' : 'X'
  );
  const [winner, setWinner] = useState<Player | 'draw'>(null);
  const [gameHistory, setGameHistory] = useState<Array<{ board: Board, move: [number, number], player: Player }>>([]);
  const [lastSwap, setLastSwap] = useState<[number, number] | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [shouldSwap, setShouldSwap] = useState(false);
  const [swappedTiles, setSwappedTiles] = useState<[[number, number], [number, number]] | null>(null);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Get auth context for tracking game completion
  const { user } = useAuth();

  // Check for a winner
  const calculateWinner = (squares: Board): Player | 'draw' => {
    const size = squares.length;
    
    // Define winning lines (rows, columns, and diagonals)
    const lines: Array<Array<[number, number]>> = [];
    
    // Add rows
    for (let i = 0; i < size; i++) {
      const row: Array<[number, number]> = [];
      for (let j = 0; j < size; j++) {
        row.push([i, j]);
      }
      lines.push(row);
    }
    
    // Add columns
    for (let i = 0; i < size; i++) {
      const col: Array<[number, number]> = [];
      for (let j = 0; j < size; j++) {
        col.push([j, i]);
      }
      lines.push(col);
    }
    
    // Add main diagonal
    const mainDiag: Array<[number, number]> = [];
    for (let i = 0; i < size; i++) {
      mainDiag.push([i, i]);
    }
    lines.push(mainDiag);
    
    // Add other diagonal
    const otherDiag: Array<[number, number]> = [];
    for (let i = 0; i < size; i++) {
      otherDiag.push([i, size - 1 - i]);
    }
    lines.push(otherDiag);

    // Check all possible winning lines
    for (const line of lines) {
      const firstCell = squares[line[0][0]][line[0][1]];
      if (firstCell && line.every(([r, c]) => squares[r][c] === firstCell)) {
        return firstCell;
      }
    }

    // Check for a draw
    if (squares.every(row => row.every(cell => cell !== null))) {
      return 'draw';
    }

    return null;
  };

  // AI move logic
  const makeAIMove = () => {
    if (winner || board.every(row => row.every(cell => cell !== null))) return;
    
    // Set waiting state for UX feedback
    setWaitingForAI(true);
    
    // Short delay for better UX
    setTimeout(() => {
      // Use the existing AI logic from gameAI.ts
      const aiMove = getAIMove(
        board,
        currentPlayer,
        settings!,
        'chaos'
      );
      
      if (aiMove) {
        const [row, col] = aiMove;
        handleMove(row, col, false);
      }
      
      setWaitingForAI(false);
    }, 700);
  };

  // Randomly swap two tiles after both players have moved
  const performChaosSwap = (newBoard: Board): [Board, [[number, number], [number, number]]] => {
    // Create a copy of the board to work with
    const boardCopy = newBoard.map(row => [...row]);
    
    // Generate two random tile indices
    const size = boardCopy.length;
    const r1 = Math.floor(Math.random() * size);
    const c1 = Math.floor(Math.random() * size);
    
    let r2 = Math.floor(Math.random() * size);
    let c2 = Math.floor(Math.random() * size);
    
    // Ensure we don't pick the same tile twice
    while (r1 === r2 && c1 === c2) {
      r2 = Math.floor(Math.random() * size);
      c2 = Math.floor(Math.random() * size);
    }
    
    // Store the swap positions for visual feedback
    const swapPositions: [[number, number], [number, number]] = [[r1, c1], [r2, c2]];
    
    // Swap the contents of the two tiles
    [boardCopy[r1][c1], boardCopy[r2][c2]] = [boardCopy[r2][c2], boardCopy[r1][c1]];
    
    return [boardCopy, swapPositions];
  };

  // Handle player/AI moves
  const handleMove = (row: number, col: number, isHuman: boolean = true) => {
    // If the game is over or the square is already filled, do nothing
    if (winner || board[row][col] !== null) return;
    
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Create a copy of the board
    const newBoard = board.map(r => [...r]);
    
    // Set the current player's mark
    newBoard[row][col] = currentPlayer;
    
    // Add to game history
    setGameHistory([...gameHistory, { 
      board: newBoard.map(r => [...r]), 
      move: [row, col], 
      player: currentPlayer 
    }]);
    
    // Update the board
    setBoard(newBoard);
    
    // Increment turn count
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    
    // Determine if we should swap (after both players have moved, every 2 moves)
    const newShouldSwap = newTurnCount % 2 === 0;
    setShouldSwap(newShouldSwap);
    
    // Perform the chaos swap if both players have moved
    if (newShouldSwap) {
      const [boardAfterSwap, swapPositions] = performChaosSwap(newBoard);
      setSwappedTiles(swapPositions);
      
      // After a short delay to show the original move, update with the swap
      setTimeout(() => {
        setBoard(boardAfterSwap);
        
        // Check for a winner after the swap
        const gameWinner = calculateWinner(boardAfterSwap);
        if (gameWinner) {
          setWinner(gameWinner);
          trackGameCompletion(gameWinner);
        } else {
          // Switch turns
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
        
        // Clear the swapped tiles highlight after a delay
        setTimeout(() => {
          setSwappedTiles(null);
        }, 1000);
      }, 500);
    } else {
      // Check for a winner
      const gameWinner = calculateWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        trackGameCompletion(gameWinner);
      } else {
        // Switch turns
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      }
    }
  };

  // Track game completion for analytics
  const trackGameCompletion = (result: Player | 'draw') => {
    if (!user) return;
    
    trackGameComplete(
      {
        gameId: 'chaos',
        variant: 'chaos',
        opponent: settings?.opponent || 'ai',
        difficulty: settings?.difficulty,
        result: result === 'X' ? 'win' : result === 'O' ? 'loss' : 'draw'
      },
      user
    );
  };

  // AI takes its turn after player moves
  useEffect(() => {
    if (gameStarted && 
        !winner && 
        settings?.opponent === 'ai' && 
        currentPlayer === 'O' && 
        !waitingForAI) {
      makeAIMove();
    }
  }, [currentPlayer, winner, settings?.opponent, gameStarted]);

  // Restart the game
  const restartGame = () => {
    setBoard(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setCurrentPlayer(settings?.firstPlayer === 'player2' ? 'O' : 'X');
    setWinner(null);
    setGameHistory([]);
    setLastSwap(null);
    setTurnCount(0);
    setShouldSwap(false);
    setSwappedTiles(null);
    setWaitingForAI(false);
    setGameStarted(false);
  };

  // Check if a cell is in the last swapped tiles
  const isSwappedCell = (rowIndex: number, colIndex: number) => {
    if (!swappedTiles) return false;
    
    return (
      (swappedTiles[0][0] === rowIndex && swappedTiles[0][1] === colIndex) ||
      (swappedTiles[1][0] === rowIndex && swappedTiles[1][1] === colIndex)
    );
  };

  // Render individual square
  const renderSquare = (rowIndex: number, colIndex: number) => {
    const isSwapped = isSwappedCell(rowIndex, colIndex);
    
    return (
      <button 
        key={`${rowIndex}-${colIndex}`}
        className={`w-20 h-20 border border-gray-400 flex items-center justify-center text-4xl font-bold 
          ${isSwapped ? 'bg-yellow-200 transition-colors duration-300' : 'bg-white'}
          hover:bg-gray-50 transition-all duration-200`}
        onClick={() => {
          if (!waitingForAI && currentPlayer === 'X' && !winner) {
            handleMove(rowIndex, colIndex);
          }
        }}
        disabled={waitingForAI || board[rowIndex][colIndex] !== null || winner !== null ||
                 (settings?.opponent === 'ai' && currentPlayer === 'O')}
      >
        {board[rowIndex][colIndex] === 'X' ? 
          <span className="text-blue-600">X</span> : 
          board[rowIndex][colIndex] === 'O' ? 
          <span className="text-red-600">O</span> : null}
      </button>
    );
  };

  // Get the status message
  const getStatus = () => {
    if (winner === 'X') {
      return 'Winner: X';
    } else if (winner === 'O') {
      return 'Winner: O';
    } else if (winner === 'draw') {
      return 'Game ended in a draw!';
    } else {
      return `Next player: ${currentPlayer === 'X' ? 'X' : 'O'} ${waitingForAI ? '(AI is thinking...)' : ''}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Chaos Tic-Tac-Toe</h1>
      
      <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
        <h2 className="font-bold">Chaos Rules:</h2>
        <p className="mb-1">• Standard Tic-Tac-Toe rules apply, but after both players have moved:</p>
        <p className="mb-1">• Two random tiles swap their contents</p>
        <p className="mb-1">• The swap happens after a complete round (both X and O have played)</p>
        <p>• Watch for unexpected changes to the board!</p>
      </div>
      
      <div className="mb-4 text-xl font-semibold flex items-center gap-2">
        <div>{getStatus()}</div>
        {shouldSwap && !winner && (
          <Shuffle className="h-5 w-5 text-amber-500 animate-pulse" />
        )}
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        {Array(boardSize).fill(null).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array(boardSize).fill(null).map((_, colIndex) => 
              renderSquare(rowIndex, colIndex)
            )}
          </div>
        ))}
      </div>
      
      {swappedTiles && (
        <div className="text-sm mb-4 text-gray-700 flex items-center">
          <Shuffle className="h-4 w-4 mr-2 text-amber-500" />
          Last swap: Tiles ({swappedTiles[0][0] + 1},{swappedTiles[0][1] + 1}) and ({swappedTiles[1][0] + 1},{swappedTiles[1][1] + 1})
        </div>
      )}
      
      {!winner && shouldSwap && (
        <div className="text-sm mb-4 text-gray-600">
          Tiles will swap after this turn
        </div>
      )}
      
      <Button 
        className="mt-4 px-6"
        onClick={restartGame}
      >
        Restart Game
      </Button>
      
      <div className="mt-6 w-full max-w-md">
        <h3 className="font-bold mb-2">Game History:</h3>
        <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
          {gameHistory.map((entry, index) => (
            <div key={index} className="text-sm mb-1">
              {entry.player} placed at position ({entry.move[0] + 1}, {entry.move[1] + 1})
              {index % 2 === 1 && index > 0 && " - Swap occurred"}
            </div>
          ))}
          {gameHistory.length === 0 && <div className="text-sm text-gray-500">No moves yet</div>}
        </div>
      </div>
    </div>
  );
};

export default ChaosTicTacToe;
