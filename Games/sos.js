import React, { useState, useEffect } from 'react';

const SOSGame = () => {
  const [boardSize, setBoardSize] = useState(3);
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentLetter, setCurrentLetter] = useState('S');
  const [gameStatus, setGameStatus] = useState('Configure your game settings and press Start Game');
  const [player1Type, setPlayer1Type] = useState('human');
  const [player2Type, setPlayer2Type] = useState('human');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [difficulty, setDifficulty] = useState('easy');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [cpuDelay, setCpuDelay] = useState(1000);
  const [showWinningLine, setShowWinningLine] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize or reset the board when board size changes
  useEffect(() => {
    resetBoard();
  }, [boardSize]);

  // Computer player logic
  useEffect(() => {
    if (!gameStarted) return;
    
    if ((currentPlayer === 1 && player1Type === 'computer') || 
        (currentPlayer === 2 && player2Type === 'computer')) {
      if (gameStatus === 'Game in progress') {
        // Add a delay for computer moves to make the game feel more natural
        const timer = setTimeout(() => {
          makeComputerMove();
        }, cpuDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [currentPlayer, player1Type, player2Type, gameStatus, board, gameStarted]);

  const resetBoard = () => {
    const newBoard = Array(boardSize * boardSize).fill('');
    setBoard(newBoard);
    setCurrentLetter('S');
    setCurrentPlayer(1);
    setShowWinningLine(false);
    setWinningCells([]);
  };

  const startGame = () => {
    resetBoard();
    setGameStatus('Game in progress');
    setGameStarted(true);
    setGameHistory([]);
    addToHistory("Game started");
  };

  const resetGame = () => {
    resetBoard();
    setGameStatus('Game in progress');
    addToHistory("Game reset");
  };

  const newGame = () => {
    setGameStarted(false);
    setGameStatus('Configure your game settings and press Start Game');
  };

  const makeComputerMove = () => {
    // Get all empty cells
    const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
    
    if (emptyCells.length === 0) return;
    
    let move;
    
    if (difficulty === 'easy') {
      // Easy: random move
      move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      // Medium or hard: Look for winning moves or block opponent
      // Try to find a winning move
      move = findStrategicMove();
      
      // If no strategic move found, use random move
      if (move === null) {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }
    
    handleCellClick(move);
  };
  
  const findStrategicMove = () => {
    // This is a simplified strategy for SOS
    // For a more advanced strategy, we would need to check for potential "SOS" formations
    
    const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(cell => cell !== null);
    
    // First check if we can complete an SOS
    if (currentLetter === 'S') {
      // When placing an 'S', look for existing 'SO' sequences that can be completed
      for (let i = 0; i < emptyCells.length; i++) {
        const position = emptyCells[i];
        const tempBoard = [...board];
        tempBoard[position] = 'S';
        
        if (checkForWinner(tempBoard, position)) {
          return position;
        }
      }
    }
    
    // If we're placing an 'O', look for positions between two 'S's
    if (currentLetter === 'O') {
      for (let i = 0; i < emptyCells.length; i++) {
        const position = emptyCells[i];
        const row = Math.floor(position / boardSize);
        const col = position % boardSize;
        
        // Check horizontally
        if (col > 0 && col < boardSize - 1) {
          if (board[row * boardSize + col - 1] === 'S' && board[row * boardSize + col + 1] === 'S') {
            return position;
          }
        }
        
        // Check vertically
        if (row > 0 && row < boardSize - 1) {
          if (board[(row - 1) * boardSize + col] === 'S' && board[(row + 1) * boardSize + col] === 'S') {
            return position;
          }
        }
        
        // Check diagonal top-left to bottom-right
        if (row > 0 && row < boardSize - 1 && col > 0 && col < boardSize - 1) {
          if (board[(row - 1) * boardSize + col - 1] === 'S' && board[(row + 1) * boardSize + col + 1] === 'S') {
            return position;
          }
        }
        
        // Check diagonal top-right to bottom-left
        if (row > 0 && row < boardSize - 1 && col > 0 && col < boardSize - 1) {
          if (board[(row - 1) * boardSize + col + 1] === 'S' && board[(row + 1) * boardSize + col - 1] === 'S') {
            return position;
          }
        }
      }
    }
    
    // If no immediate strategic move, try to set up a future win or prevent opponent's win
    if (difficulty === 'hard') {
      if (currentLetter === 'S') {
        // Place S strategically where it could later form part of an SOS
        // This is a simplified approach; a more complex strategy would evaluate multiple steps ahead
        for (let i = 0; i < emptyCells.length; i++) {
          const position = emptyCells[i];
          const row = Math.floor(position / boardSize);
          const col = position % boardSize;
          
          // Check for empty spaces that could complete an SOS pattern
          if (col < boardSize - 2 && board[row * boardSize + col + 1] === '' && board[row * boardSize + col + 2] === '') {
            return position;
          }
          
          if (row < boardSize - 2 && board[(row + 1) * boardSize + col] === '' && board[(row + 2) * boardSize + col] === '') {
            return position;
          }
          
          if (row < boardSize - 2 && col < boardSize - 2 && 
              board[(row + 1) * boardSize + col + 1] === '' && 
              board[(row + 2) * boardSize + col + 2] === '') {
            return position;
          }
          
          if (row < boardSize - 2 && col > 1 && 
              board[(row + 1) * boardSize + col - 1] === '' && 
              board[(row + 2) * boardSize + col - 2] === '') {
            return position;
          }
        }
      }
    }
    
    return null;
  };

  const handleCellClick = (index) => {
    if (!gameStarted || board[index] !== '' || gameStatus !== 'Game in progress') {
      return;
    }

    // Create a new board with the current letter placed
    const newBoard = [...board];
    newBoard[index] = currentLetter;
    setBoard(newBoard);
    
    // Animation effect for the newly placed letter
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Add to history
    addToHistory(`Player ${currentPlayer} placed ${currentLetter} at position ${index}`);
    
    // Check for winner
    if (checkForWinner(newBoard, index)) {
      const winner = currentPlayer;
      setGameStatus(`Player ${winner} wins!`);
      
      // Update score
      if (winner === 1) {
        setPlayer1Score(player1Score + 1);
      } else {
        setPlayer2Score(player2Score + 1);
      }
      
      return;
    }
    
    // Check for draw
    if (!newBoard.includes('')) {
      setGameStatus('Draw!');
      return;
    }

    // Switch letter for next turn
    setCurrentLetter(currentLetter === 'S' ? 'O' : 'S');
    
    // Switch player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const checkForWinner = (boardState, lastMoveIndex) => {
    if (lastMoveIndex === undefined || boardState[lastMoveIndex] === '') {
      return false;
    }

    const row = Math.floor(lastMoveIndex / boardSize);
    const col = lastMoveIndex % boardSize;
    
    // Define directions to check: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      const sosSequence = [];
      
      for (let i = -2; i <= 0; i++) {
        // For each starting position, check if an 'SOS' sequence exists
        const cells = [
          [row + i * dx, col + i * dy],
          [row + (i + 1) * dx, col + (i + 1) * dy],
          [row + (i + 2) * dx, col + (i + 2) * dy]
        ];
        
        if (cells.every(([r, c]) => 
          r >= 0 && r < boardSize && 
          c >= 0 && c < boardSize)) {
          const indices = cells.map(([r, c]) => r * boardSize + c);
          
          if (boardState[indices[0]] === 'S' && 
              boardState[indices[1]] === 'O' && 
              boardState[indices[2]] === 'S') {
            setWinningCells(indices);
            setShowWinningLine(true);
            return true;
          }
        }
      }
    }
    
    return false;
  };

  const addToHistory = (action) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry = `[${timestamp}] ${action}`;
    setGameHistory([newEntry, ...gameHistory.slice(0, 9)]);
  };

  // Render a cell with appropriate styling
  const renderCell = (index) => {
    const isWinningCell = winningCells.includes(index);
    
    return (
      <div 
        key={index} 
        className={`flex items-center justify-center text-3xl font-bold cursor-pointer
                   h-16 border-2 border-gray-300 transition-all duration-200
                   ${isWinningCell ? 'bg-green-200' : 'hover:bg-gray-100'}
                   ${board[index] && isAnimating ? 'scale-110' : ''}`}
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">SOS Game</h1>
      
      <div className="w-full bg-blue-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Game Rules:</h2>
        <p className="text-sm mb-1">• Players take turns placing either an S or an O on the grid</p>
        <p className="text-sm mb-1">• The letter alternates each turn (S, O, S, O...)</p>
        <p className="text-sm mb-1">• The goal is to form the sequence "SOS" horizontally, vertically, or diagonally</p>
        <p className="text-sm">• First player to create an SOS wins the game</p>
      </div>
      
      {!gameStarted ? (
        <div className="w-full bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Game Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-lg">Board Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Board Size:</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={boardSize}
                  onChange={(e) => setBoardSize(parseInt(e.target.value))}
                >
                  <option value={3}>3x3</option>
                  <option value={4}>4x4</option>
                  <option value={5}>5x5</option>
                </select>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-lg">Player Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player 1:</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={player1Type}
                  onChange={(e) => setPlayer1Type(e.target.value)}
                >
                  <option value="human">Human</option>
                  <option value="computer">Computer</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player 2:</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={player2Type}
                  onChange={(e) => setPlayer2Type(e.target.value)}
                >
                  <option value="human">Human</option>
                  <option value="computer">Computer</option>
                </select>
              </div>
            </div>
            
            {(player1Type === 'computer' || player2Type === 'computer') && (
              <div className="md:col-span-2">
                <h3 className="font-bold mb-3 text-lg">Computer Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Computer Difficulty:</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">CPU Move Delay (ms):</label>
                    <input 
                      type="range" 
                      min="200" 
                      max="2000" 
                      step="200"
                      value={cpuDelay}
                      onChange={(e) => setCpuDelay(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center">{cpuDelay}ms</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-6">
            <button 
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded text-lg"
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">
                <span className={currentPlayer === 1 ? 'text-blue-600 underline' : ''}>
                  Player 1: {player1Score}
                </span>
              </div>
              <div className="text-xl font-bold">
                <span className={currentPlayer === 2 ? 'text-red-600 underline' : ''}>
                  Player 2: {player2Score}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-lg font-semibold">
                {gameStatus === 'Game in progress' 
                  ? `Current Turn: Player ${currentPlayer} (${currentLetter})` 
                  : gameStatus}
              </div>
            </div>
            
            <div 
              className="grid gap-1 mb-6" 
              style={{ 
                gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                width: `${Math.min(400, boardSize * 70)}px`,
                margin: '0 auto'
              }}
            >
              {Array(boardSize * boardSize).fill(null).map((_, index) => renderCell(index))}
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={resetGame}
              >
                Reset Board
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={newGame}
              >
                New Game
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Current Settings</h3>
              <p><strong>Board Size:</strong> {boardSize}x{boardSize}</p>
              <p><strong>Player 1:</strong> {player1Type === 'human' ? 'Human' : 'Computer'}</p>
              <p><strong>Player 2:</strong> {player2Type === 'human' ? 'Human' : 'Computer'}</p>
              {(player1Type === 'computer' || player2Type === 'computer') && (
                <>
                  <p><strong>Computer Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                  <p><strong>CPU Move Delay:</strong> {cpuDelay}ms</p>
                </>
              )}
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Game History</h3>
              <div className="h-48 overflow-y-auto text-sm">
                {gameHistory.map((entry, index) => (
                  <div key={index} className="mb-1">{entry}</div>
                ))}
                {gameHistory.length === 0 && <div className="text-gray-500">No moves yet</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSGame;
