
import React, { useState, useEffect } from 'react';

const ChaosTicTacToe = () => {
  // Initialize the board as a 3x3 grid with null values
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastSwap, setLastSwap] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [shouldSwap, setShouldSwap] = useState(false);

  // Check for a winner
  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], // top row
      [3, 4, 5], // middle row
      [6, 7, 8], // bottom row
      [0, 3, 6], // left column
      [1, 4, 7], // middle column
      [2, 5, 8], // right column
      [0, 4, 8], // diagonal
      [2, 4, 6]  // diagonal
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    // Check for a draw
    if (squares.every(square => square !== null)) {
      return 'draw';
    }

    return null;
  };

  // AI move logic
  const makeAIMove = () => {
    if (winner || board.every(square => square !== null)) return;

    // Simple AI: find any empty spot
    let availableSpots = board.map((square, index) => square === null ? index : null).filter(index => index !== null);
    
    // If there are available spots, choose one randomly
    if (availableSpots.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSpots.length);
      const aiMove = availableSpots[randomIndex];
      
      handleMove(aiMove);
    }
  };

  // Randomly swap two tiles after both players have moved
  const performChaosSwap = (newBoard) => {
    // Create a copy of the board to work with
    const boardCopy = [...newBoard];
    
    // Generate two random tile indices
    const index1 = Math.floor(Math.random() * 9);
    let index2 = Math.floor(Math.random() * 9);
    
    // Ensure we don't pick the same index twice
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * 9);
    }
    
    // Swap the contents of the two tiles
    [boardCopy[index1], boardCopy[index2]] = [boardCopy[index2], boardCopy[index1]];
    
    // Store the last swap for visual feedback
    setLastSwap([index1, index2]);
    
    return boardCopy;
  };

  // Handle player/AI moves
  const handleMove = (index) => {
    // If the game is over or the square is already filled, do nothing
    if (winner || board[index] !== null) return;
    
    // Create a copy of the board
    const newBoard = [...board];
    
    // Set the current player's mark
    newBoard[index] = isXNext ? 'X' : 'O';
    
    // Add to game history
    setGameHistory([...gameHistory, { board: [...newBoard], move: index, player: isXNext ? 'X' : 'O' }]);
    
    // Increment turn count
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    
    // Determine if we should swap (after every 2 moves)
    const newShouldSwap = newTurnCount % 2 === 0;
    setShouldSwap(newShouldSwap);
    
    // Perform the chaos swap if both players have moved
    let boardToUse = newBoard;
    if (newShouldSwap) {
      boardToUse = performChaosSwap(newBoard);
    }
    
    // Update the board
    setBoard(boardToUse);
    
    // Check for a winner
    const gameWinner = calculateWinner(boardToUse);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      // Switch turns
      setIsXNext(!isXNext);
    }
  };

  // AI takes its turn after player moves
  useEffect(() => {
    if (!isXNext && !winner) {
      const aiTimer = setTimeout(() => {
        makeAIMove();
      }, 700);
      
      return () => clearTimeout(aiTimer);
    }
  }, [isXNext, winner]);

  // Restart the game
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameHistory([]);
    setLastSwap(null);
    setTurnCount(0);
    setShouldSwap(false);
  };

  // Render individual square
  const renderSquare = (index) => {
    const isLastSwapped = lastSwap && (lastSwap[0] === index || lastSwap[1] === index);
    
    return (
      <button 
        className={`w-20 h-20 border border-gray-400 flex items-center justify-center text-4xl font-bold 
          ${isLastSwapped ? 'bg-yellow-200' : 'bg-white'}`}
        onClick={() => isXNext && handleMove(index)}
      >
        {board[index] === 'X' ? <span className="text-blue-600">X</span> : 
         board[index] === 'O' ? <span className="text-red-600">O</span> : null}
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
      return `Next player: ${isXNext ? 'X (You)' : 'O (AI)'}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Chaos Tic-Tac-Toe</h1>
      
      <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
        <h2 className="font-bold">Chaos Rules:</h2>
        <p>Standard Tic-Tac-Toe rules apply, but after both players have moved:</p>
        <p>• Two random tiles swap their contents</p>
        <p>• The swap happens after a complete round (both X and O have played)</p>
        <p>• Watch for unexpected changes to the board!</p>
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">{renderSquare(0)}{renderSquare(1)}{renderSquare(2)}</div>
        <div className="flex gap-2">{renderSquare(3)}{renderSquare(4)}{renderSquare(5)}</div>
        <div className="flex gap-2">{renderSquare(6)}{renderSquare(7)}{renderSquare(8)}</div>
      </div>
      
      <div className="text-xl font-semibold mb-4">{getStatus()}</div>
      
      {lastSwap && !winner && (
        <div className="text-sm mb-4 text-gray-700">
          Last swap: Tiles {lastSwap[0] + 1} and {lastSwap[1] + 1} 
          (Turn {turnCount - 1}-{turnCount})
        </div>
      )}
      
      {!winner && (
        <div className="text-sm mb-4 text-gray-600">
          Next swap will occur after {isXNext ? "both" : "this"} turn{!isXNext ? "" : "s"}
        </div>
      )}
      
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={restartGame}
      >
        Restart Game
      </button>
      
      <div className="mt-6 w-full max-w-md">
        <h3 className="font-bold mb-2">Game History:</h3>
        <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
          {gameHistory.map((entry, index) => (
            <div key={index} className="text-sm mb-1">
              {index % 2 === 0 ? 'Player' : 'AI'} placed {entry.player} at position {entry.move + 1}
            </div>
          ))}
          {gameHistory.length === 0 && <div className="text-sm text-gray-500">No moves yet</div>}
        </div>
      </div>
    </div>
  );
};

export default ChaosTicTacToe;
