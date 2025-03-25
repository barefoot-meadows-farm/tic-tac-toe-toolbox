
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const FeralTicTacToe = () => {
  // Get theme context
  const { isDarkMode } = useTheme();
  
  // Game configuration state
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState(3);
  const [winLength, setWinLength] = useState(3);
  const [player1Type, setPlayer1Type] = useState('human');
  const [player2Type, setPlayer2Type] = useState('human');
  const [difficulty, setDifficulty] = useState('medium');
  const [cpuDelay, setCpuDelay] = useState(800);
  
  // Game state
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [overwriteCount, setOverwriteCount] = useState({ X: 0, O: 0 });
  const [gameStatus, setGameStatus] = useState('Configure your game settings and press Start Game');
  const [gameHistory, setGameHistory] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [winningSequence, setWinningSequence] = useState([]);

  // Initialize board based on size
  useEffect(() => {
    resetBoard();
  }, [boardSize]);

  // Computer player logic
  useEffect(() => {
    if (!gameStarted || gameStatus !== 'Game in progress') return;
    
    const isCurrentPlayerComputer = 
      (currentPlayer === 'X' && player1Type === 'computer') || 
      (currentPlayer === 'O' && player2Type === 'computer');
    
    if (isCurrentPlayerComputer) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, cpuDelay);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, gameStarted, gameStatus]);

  // Game initialization and reset functions
  const resetBoard = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setWinningSequence([]);
    setMoveHistory([]);
  };

  const startGame = () => {
    resetBoard();
    setCurrentPlayer('X');
    setOverwriteCount({ X: 0, O: 0 });
    setGameStatus('Game in progress');
    setGameStarted(true);
    setGameHistory([]);
    addToHistory("Game started");
  };

  const resetGame = () => {
    resetBoard();
    setCurrentPlayer('X');
    setOverwriteCount({ X: 0, O: 0 });
    setGameStatus('Game in progress');
    addToHistory("Game reset");
  };

  const newGame = () => {
    setGameStarted(false);
    setGameStatus('Configure your game settings and press Start Game');
  };

  // Handle player move
  const handleCellClick = (index) => {
    // Check if the game is active
    if (!gameStarted || gameStatus !== 'Game in progress') {
      return;
    }

    // In Feral Tic-Tac-Toe, players can always place their mark, even on occupied cells
    makeMove(index);
  };

  const makeMove = (index) => {
    // Create a new board with the current move
    const newBoard = [...board];
    const wasOverwrite = newBoard[index] !== null;
    
    // If this is an overwrite, record it
    if (wasOverwrite) {
      setOverwriteCount({
        ...overwriteCount,
        [currentPlayer]: overwriteCount[currentPlayer] + 1
      });
    }
    
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    // Update move history
    const newMoveHistory = [...moveHistory, { player: currentPlayer, position: index, wasOverwrite }];
    setMoveHistory(newMoveHistory);
    
    // Set last move for highlighting
    setLastMove(index);
    
    // Animate the placement
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    // Add to history
    addToHistory(`Player ${currentPlayer} ${wasOverwrite ? 'overwrote' : 'placed'} at position ${index}`);
    
    // Check for winner
    const winner = checkWinner(newBoard, index);
    if (winner) {
      setGameStatus(`Player ${winner} wins!`);
      // Update score
      if (winner === 'X') {
        setPlayer1Score(player1Score + 1);
      } else {
        setPlayer2Score(player2Score + 1);
      }
      return;
    }
    
    // Switch to next player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Computer player move
  const makeComputerMove = () => {
    let moveIndex;
    
    if (difficulty === 'easy') {
      // Easy: Random move, might overwrite randomly
      moveIndex = Math.floor(Math.random() * (boardSize * boardSize));
    } else {
      // Medium/Hard: Strategic move
      moveIndex = findStrategicMove(difficulty === 'hard');
    }
    
    makeMove(moveIndex);
  };

  // Find strategic move for computer player
  const findStrategicMove = (isHardMode) => {
    const currentMark = currentPlayer;
    const opponentMark = currentPlayer === 'X' ? 'O' : 'X';
    
    // Check if we can win in the next move
    for (let i = 0; i < board.length; i++) {
      const tempBoard = [...board];
      tempBoard[i] = currentMark;
      if (checkWinner(tempBoard)) {
        return i;
      }
    }
    
    // Check if opponent can win in their next move and block
    for (let i = 0; i < board.length; i++) {
      const tempBoard = [...board];
      tempBoard[i] = opponentMark;
      if (checkWinner(tempBoard)) {
        return i;
      }
    }
    
    if (isHardMode) {
      // Try to create forks (two ways to win)
      for (let i = 0; i < board.length; i++) {
        const tempBoard = [...board];
        // Skip if we're not overwriting our own mark
        if (tempBoard[i] === currentMark) continue;
        
        tempBoard[i] = currentMark;
        if (countWinningDirections(tempBoard, i, currentMark) >= 2) {
          return i;
        }
      }
      
      // Try to block opponent's forks
      // First, find squares that could create forks for opponent
      const potentialForks = [];
      for (let i = 0; i < board.length; i++) {
        const tempBoard = [...board];
        // Skip if we're not overwriting our own mark
        if (tempBoard[i] === opponentMark) continue;
        
        tempBoard[i] = opponentMark;
        if (countWinningDirections(tempBoard, i, opponentMark) >= 2) {
          potentialForks.push(i);
        }
      }
      
      if (potentialForks.length > 0) {
        // If there's only one potential fork, block it
        if (potentialForks.length === 1) {
          return potentialForks[0];
        }
        
        // If there are multiple potential forks, try to create a threat
        // that will force the opponent to defend rather than create a fork
        for (let i = 0; i < board.length; i++) {
          if (board[i] !== null && board[i] !== currentMark) continue;
          
          const tempBoard = [...board];
          tempBoard[i] = currentMark;
          
          let canWinNextTurn = false;
          for (let j = 0; j < board.length; j++) {
            if (tempBoard[j] !== null) continue;
            
            const tempBoard2 = [...tempBoard];
            tempBoard2[j] = currentMark;
            if (checkWinner(tempBoard2)) {
              canWinNextTurn = true;
              break;
            }
          }
          
          if (canWinNextTurn) {
            return i;
          }
        }
        
        // If we can't create a threat, just block one of the forks
        return potentialForks[0];
      }
    }
    
    // Try to take center
    const center = Math.floor(board.length / 2);
    if (boardSize % 2 === 1 && (board[center] === null || board[center] === opponentMark)) {
      return center;
    }
    
    // Try to take corners if empty or opponent's
    const corners = [0, boardSize - 1, board.length - boardSize, board.length - 1];
    const availableCorners = corners.filter(i => board[i] !== currentMark);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any open space or overwrite opponent's marks
    const availableSpaces = Array.from({length: board.length}, (_, i) => i)
      .filter(i => board[i] !== currentMark);
    if (availableSpaces.length > 0) {
      return availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    }
    
    // If all else fails, overwrite own mark (this should rarely happen)
    return Math.floor(Math.random() * board.length);
  };

  // Helper function to count potential winning directions from a position
  const countWinningDirections = (boardState, pos, mark) => {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    let count = 0;
    
    // Define directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      let inARow = 1; // Start with 1 for the current position
      
      // Look in both directions along this line
      for (let dir = -1; dir <= 1; dir += 2) {
        if (dir === 0) continue; // Skip the center point
        
        // Look ahead by winLength - 1 positions
        for (let step = 1; step < winLength; step++) {
          const newRow = row + step * dir * dx;
          const newCol = col + step * dir * dy;
          
          // Check bounds
          if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            break;
          }
          
          const newPos = newRow * boardSize + newCol;
          
          // If position has our mark or is empty, count it as potential
          if (boardState[newPos] === mark || boardState[newPos] === null) {
            inARow++;
          } else {
            break;
          }
        }
      }
      
      // If we have enough potential spaces in a row to win
      if (inARow >= winLength) {
        count++;
      }
    }
    
    return count;
  };

  // Check for winner
  const checkWinner = (boardState, lastMoveIndex) => {
    // If no last move provided, check the entire board
    const indices = lastMoveIndex !== undefined 
      ? [lastMoveIndex] 
      : Array.from({length: boardState.length}, (_, i) => i);
    
    for (const pos of indices) {
      if (boardState[pos] === null) continue;
      
      const mark = boardState[pos];
      const row = Math.floor(pos / boardSize);
      const col = pos % boardSize;
      
      // Define directions: horizontal, vertical, diagonal down-right, diagonal down-left
      const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
      ];
      
      for (const [dx, dy] of directions) {
        let inARow = 1; // Start with 1 for the current position
        const sequence = [pos];
        
        // Look in both directions along this line
        for (let dir = -1; dir <= 1; dir += 2) {
          if (dir === 0) continue; // Skip the center point
          
          // Look ahead by winLength - 1 positions
          for (let step = 1; step < winLength; step++) {
            const newRow = row + step * dir * dx;
            const newCol = col + step * dir * dy;
            
            // Check bounds
            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
              break;
            }
            
            const newPos = newRow * boardSize + newCol;
            
            // If position has same mark, count it
            if (boardState[newPos] === mark) {
              inARow++;
              sequence.push(newPos);
            } else {
              break;
            }
          }
        }
        
        // Check if we have a winner
        if (inARow >= winLength) {
          setWinningSequence(sequence);
          return mark;
        }
      }
    }
    
    return null;
  };

  // History tracking
  const addToHistory = (action) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry = `[${timestamp}] ${action}`;
    setGameHistory([newEntry, ...gameHistory.slice(0, 9)]);
  };

  // Rendering functions
  const renderBoard = () => {
    return (
      <div 
        className={`grid gap-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} p-1 mx-auto`}
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          width: `${boardSize * 70 + (boardSize - 1) * 4 + 8}px`
        }}
      >
        {board.map((cell, index) => renderCell(index))}
      </div>
    );
  };

  const renderCell = (index) => {
    const isHighlighted = lastMove === index;
    const isWinningCell = winningSequence.includes(index);
    
    const cellClasses = `
      flex items-center justify-center h-16 w-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} font-bold text-3xl cursor-pointer
      ${isHighlighted && isAnimating ? 'scale-110 transform transition-transform duration-200' : ''}
      ${isWinningCell ? (isDarkMode ? 'bg-green-900' : 'bg-green-200') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}
      ${board[index] === 'X' ? 'text-blue-600' : ''}
      ${board[index] === 'O' ? 'text-red-600' : ''}
    `;
    
    return (
      <div
        key={index}
        className={cellClasses}
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
      </div>
    );
  };

  // Calculate maximum win length based on board size
  const maxWinLength = boardSize;

  return (
    <div className="flex flex-col items-center p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Feral Tic-Tac-Toe</h1>
      
      <div className={`w-full ${isDarkMode ? 'bg-blue-950' : 'bg-blue-100'} p-4 rounded-lg mb-6`}>
        <h2 className="text-xl font-semibold mb-2">Game Rules:</h2>
        <p className="text-sm mb-1">• Players take turns placing X or O on the grid</p>
        <p className="text-sm mb-1">• Unlike traditional Tic-Tac-Toe, players can overwrite existing marks</p>
        <p className="text-sm mb-1">• Get {winLength} in a row (horizontally, vertically, or diagonally) to win</p>
        <p className="text-sm">• Board can be {boardSize}×{boardSize}</p>
      </div>
      
      {!gameStarted ? (
        <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md mb-6`}>
          <h2 className="text-2xl font-bold mb-4 text-center">Game Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-lg">Board Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Board Size:</label>
                <select 
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  value={boardSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setBoardSize(newSize);
                    // Adjust win length if it's now invalid
                    if (winLength > newSize) {
                      setWinLength(newSize);
                    }
                  }}
                >
                  <option value={3}>3×3</option>
                  <option value={4}>4×4</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Win Condition:</label>
                <select 
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  value={winLength}
                  onChange={(e) => setWinLength(parseInt(e.target.value))}
                >
                  <option value={3}>3 in a row</option>
                  {boardSize >= 4 && <option value={4}>4 in a row</option>}
                </select>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-lg">Player Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player X:</label>
                <select 
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                  value={player1Type}
                  onChange={(e) => setPlayer1Type(e.target.value)}
                >
                  <option value="human">Human</option>
                  <option value="computer">Computer</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player O:</label>
                <select 
                  className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
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
                      className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
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
              type="button"
            >
              Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full gap-8 mb-6">
          <div className="md:w-3/5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">
                <span className={currentPlayer === 'X' ? 'text-blue-600 underline' : ''}>
                  Player X: {player1Score}
                </span>
              </div>
              <div className="text-xl font-bold">
                <span className={currentPlayer === 'O' ? 'text-red-600 underline' : ''}>
                  Player O: {player2Score}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {gameStatus === 'Game in progress' 
                  ? `Current Turn: Player ${currentPlayer}` 
                  : gameStatus}
              </div>
            </div>
            
            {renderBoard()}
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2 px-4 rounded"
                onClick={resetGame}
                type="button"
              >
                Reset Board
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={newGame}
                type="button"
              >
                New Game
              </button>
            </div>
          </div>
          
          <div className="md:w-2/5">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg mb-4`}>
              <h3 className="font-bold mb-2">Current Settings</h3>
              <p><strong>Board Size:</strong> {boardSize}×{boardSize}</p>
              <p><strong>Win Condition:</strong> {winLength} in a row</p>
              <p><strong>Player X:</strong> {player1Type === 'human' ? 'Human' : 'Computer'}</p>
              <p><strong>Player O:</strong> {player2Type === 'human' ? 'Human' : 'Computer'}</p>
              {(player1Type === 'computer' || player2Type === 'computer') && (
                <>
                  <p><strong>Computer Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                  <p><strong>CPU Move Delay:</strong> {cpuDelay}ms</p>
                </>
              )}
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg mb-4`}>
              <h3 className="font-bold mb-2">Overwrite Stats</h3>
              <p><strong>Player X overwrites:</strong> {overwriteCount.X}</p>
              <p><strong>Player O overwrites:</strong> {overwriteCount.O}</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded-lg`}>
              <h3 className="font-bold mb-2">Game History</h3>
              <div className={`h-48 overflow-y-auto text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {gameHistory.map((entry, index) => (
                  <div key={index} className="mb-1">{entry}</div>
                ))}
                {gameHistory.length === 0 && <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No moves yet</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeralTicTacToe;
