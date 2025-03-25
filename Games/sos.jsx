import React, { useState } from 'react';

const SOS = () => {
  // Game pieces array
  const pieces = ['S', 'O'];
  
  // Initial state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayer1Turn, setIsPlayer1Turn] = useState(true);
  const [player1UsesFirst, setPlayer1UsesFirst] = useState(true); // Player 1 starts with 'S'
  const [player2UsesFirst, setPlayer2UsesFirst] = useState(false); // Player 2 starts with 'O'
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  
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
    
    // Update state
    setBoard(newBoard);
    setIsPlayer1Turn(!isPlayer1Turn);
    setGameHistory(newHistory);
    
    if (gameResult) {
      setWinner(gameResult);
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
  };
  
  // Render board cell
  const renderCell = (index) => {
    const isWinningCell = winner && winner.pattern.includes(index);
    
    return (
      <div 
        className={`w-16 h-16 flex items-center justify-center border-2 border-gray-500 text-4xl font-bold cursor-pointer ${isWinningCell ? 'bg-green-200' : 'hover:bg-gray-100'}`}
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
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
        <div className="text-sm text-gray-600">Next: Player {nextPlayer} will use '{nextPiece}'</div>
      </div>
    );
  };
  
  return (
    <div className="p-4 flex flex-col md:flex-row items-start gap-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">SOS Tic Tac Toe</h1>
        <p className="mb-4">
          In this variant:
          <br />• Player 1 starts with 'S', then alternates to 'O' on their next turn
          <br />• Player 2 starts with 'O', then alternates to 'S' on their next turn
          <br />• Each player alternates their own playing piece with each of their turns
          <br />• <strong>Win by creating an "SOS" pattern in any row, column, or diagonal</strong>
        </p>
        
        <div className="mb-4">
          {getGameStatus()}
        </div>
        
        <div className="grid grid-cols-3 gap-1 mb-4">
          {Array(9).fill(null).map((_, index) => (
            <div key={index}>
              {renderCell(index)}
            </div>
          ))}
        </div>
        
        <button 
          onClick={resetGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset Game
        </button>
      </div>
      
      <div className="w-full md:w-64">
        <h2 className="text-xl font-bold mb-2">Game History</h2>
        <div className="border p-2 h-64 overflow-y-auto">
          {gameHistory.length === 0 ? (
            <p className="text-gray-500">Game moves will appear here...</p>
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
