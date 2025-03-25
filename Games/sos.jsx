
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const SOS = () => {
  // Get theme context
  const { isDarkMode } = useTheme();
  
  // Game pieces array
  const pieces = ['S', 'O'];
  
  // Initial state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
  const [player1UsesFirst, setPlayer1UsesFirst] = useState(true); // Player 1 starts with 'S'
  const [player2UsesFirst, setPlayer2UsesFirst] = useState(false); // Player 2 starts with 'O'
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [winningSequence, setWinningSequence] = useState([]);
  
  // Get the current piece for the current player
  const getCurrentPiece = () => {
    if (isPlayer1Turn) {
      return player1UsesFirst ? pieces[0] : pieces[1];
    } else {
      return player2UsesFirst ? pieces[0] : pieces[1];
    }
  };
  
  // Function to check for winner
  const checkWinner = (boardState) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      // Check if the pattern forms "SOS"
      if (boardState[a] === 'S' && boardState[b] === 'O' && boardState[c] === 'S') {
        return {
          player: isPlayer1Turn ? 1 : 2, // Current player made the winning move
          piece: 'SOS',
          pattern
        };
      }
    }
    
    // Check for draw
    if (boardState.every(cell => cell !== null)) {
      return {
        player: 'draw',
        piece: null,
        pattern: []
      };
    }
    
    return null;
  };
  
  // Handle cell click
  const handleCellClick = (index) => {
    // Return if cell is already filled or there's a winner
    if (board[index] || winner) return;
    
    // Get the current piece for this player
    const currentPiece = getCurrentPiece();
    
    // Create a new board with the move
    const newBoard = [...board];
    newBoard[index] = currentPiece;
    
    // Update game history
    const moveDescription = `Player ${isPlayer1Turn ? '1' : '2'} placed ${currentPiece} at position ${index + 1}`;
    const newHistory = [...gameHistory, moveDescription];
    
    // Check for winner
    const gameResult = checkWinner(newBoard);
    
    // Alternate the piece for the current player
    if (isPlayer1Turn) {
      setPlayer1UsesFirst(!player1UsesFirst);
    } else {
      setPlayer2UsesFirst(!player2UsesFirst);
    }
    
    // Set last move for highlighting
    setLastMove(index);
    
    // Update state
    setBoard(newBoard);
    setIsPlayer1Turn(!isPlayer1Turn);
    setGameHistory(newHistory);
    
    if (gameResult) {
      setWinner(gameResult);
      setWinningSequence(gameResult.pattern || []);
    }
  };
  
  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayer1Turn(true);
    setPlayer1UsesFirst(true); // Player 1 starts with 'S' again
    setPlayer2UsesFirst(false); // Player 2 starts with 'O' again
    setWinner(null);
    setGameHistory([]);
    setLastMove(null);
    setWinningSequence([]);
  };
  
  // Check if a cell is part of the winning sequence
  const isWinningCell = (index) => {
    return winningSequence.includes(index);
  };
  
  // Game status message
  const getGameStatus = () => {
    if (winner) {
      if (winner.player === 'draw') {
        return "Game ended in a draw!";
      }
      return `Player ${winner.player} wins by creating SOS!`;
    }
    
    const currentPlayer = isPlayer1Turn ? 1 : 2;
    const currentPiece = getCurrentPiece();
    const nextPlayer = isPlayer1Turn ? 2 : 1;
    const nextPiece = getNextPiece();
    
    return (
      <div>
        <div>Player {currentPlayer}'s turn (using '{currentPiece}')</div>
        <div className="text-sm text-muted-foreground">Next: Player {nextPlayer} will use '{nextPiece}'</div>
      </div>
    );
  };
  
  // Get next piece for the next player
  const getNextPiece = () => {
    if (isPlayer1Turn) {
      // What piece will Player 2 use next?
      return player2UsesFirst ? pieces[0] : pieces[1];
    } else {
      // What piece will Player 1 use next?
      return player1UsesFirst ? pieces[0] : pieces[1];
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">SOS Tic Tac Toe</h1>
        <p className="mb-4 text-muted-foreground">
          In this variant:
          <br />• Player 1 starts with 'S', then alternates to 'O' on their next turn
          <br />• Player 2 starts with 'O', then alternates to 'S' on their next turn
          <br />• Each player alternates their own playing piece with each of their turns
          <br />• <strong>Win by creating an "SOS" pattern in any row, column, or diagonal</strong>
        </p>
        
        <div className="mb-4">
          {getGameStatus()}
        </div>
        
        <div className="w-full max-w-sm mx-auto mb-6">
          <div 
            className="board-grid bg-muted/30 p-4 rounded-lg shadow-sm"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}
          >
            {board.map((cell, index) => (
              <button
                key={index}
                className={cn(
                  "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center text-3xl font-bold transition-all duration-300",
                  !cell && !winner ? "hover:border-primary/50" : "",
                  isWinningCell(index) ? "bg-primary/10 border-primary" : "",
                  lastMove === index ? "bg-accent/20" : ""
                )}
                onClick={() => handleCellClick(index)}
                disabled={!!winner || !!board[index]}
              >
                {cell && <span className={cell === 'S' ? "text-primary" : "text-accent-foreground"}>{cell}</span>}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={resetGame}
            variant="outline" 
            className="px-4 py-2 rounded hover:bg-primary/10"
            type="button"
          >
            Reset Game
          </Button>
        </div>
      </div>
      
      <div className="w-full md:w-64">
        <h2 className="text-xl font-bold mb-2">Game History</h2>
        <div className="border border-border p-2 h-64 overflow-y-auto rounded-md bg-background/50">
          {gameHistory.length === 0 ? (
            <p className="text-muted-foreground">Game moves will appear here...</p>
          ) : (
            <ol className="list-decimal pl-5">
              {gameHistory.map((move, index) => (
                <li key={index} className="mb-1">{move}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOS;
