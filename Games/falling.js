import React, { useState, useEffect } from 'react';

const FallingTicTacToe = () => {
  // Game configuration state
  const [gameStarted, setGameStarted] = useState(false);
  const [boardSize, setBoardSize] = useState(7);
  const [winLength, setWinLength] = useState(4);
  const [player1Type, setPlayer1Type] = useState('human');
  const [player2Type, setPlayer2Type] = useState('human');
  const [difficulty, setDifficulty] = useState('medium');
  const [cpuDelay, setCpuDelay] = useState(800);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  
  // Game state
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('Configure your game settings and press Start Game');
  const [gameHistory, setGameHistory] = useState([]);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fallingPiece, setFallingPiece] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winningSequence, setWinningSequence] = useState([]);
  const [hoveredColumn, setHoveredColumn] = useState(null);

  // Initialize board based on size
  useEffect(() => {
    resetBoard();
  }, [boardSize]);

  // Computer player logic
  useEffect(() => {
    if (!gameStarted || gameStatus !== 'Game in progress' || isAnimating) return;
    
    const isCurrentPlayerComputer = 
      (currentPlayer === 'X' && player1Type === 'computer') || 
      (currentPlayer === 'O' && player2Type === 'computer');
    
    if (isCurrentPlayerComputer) {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, cpuDelay);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, gameStarted, gameStatus, isAnimating]);

  // Game initialization and reset functions
  const resetBoard = () => {
    // Create an empty board - a 2D array with all null values
    const newBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setWinningSequence([]);
  };

  const startGame = () => {
    resetBoard();
    setCurrentPlayer('X');
    setGameStatus('Game in progress');
    setGameStarted(true);
    setGameHistory([]);
    addToHistory("Game started");
  };

  const resetGame = () => {
    resetBoard();
    setCurrentPlayer('X');
    setGameStatus('Game in progress');
    addToHistory("Game reset");
  };

  const newGame = () => {
    setGameStarted(false);
    setGameStatus('Configure your game settings and press Start Game');
  };

  // Handle player move
  const handleColumnClick = (colIndex) => {
    // Check if the game is active and not currently animating
    if (!gameStarted || gameStatus !== 'Game in progress' || isAnimating) {
      return;
    }

    // Check if the column is full
    if (board[0][colIndex] !== null) {
      return; // Column is full
    }

    // Find the first empty cell in the column (bottom-most)
    let rowIndex = boardSize - 1;
    while (rowIndex >= 0 && board[rowIndex][colIndex] !== null) {
      rowIndex--;
    }

    // Start the falling animation
    animateFallingPiece(colIndex, rowIndex);
  };

  const animateFallingPiece = (colIndex, finalRowIndex) => {
    setIsAnimating(true);
    setFallingPiece({ row: 0, col: colIndex, player: currentPlayer });
    
    let currentRow = 0;
    const animationInterval = setInterval(() => {
      if (currentRow >= finalRowIndex) {
        clearInterval(animationInterval);
        // Animation complete, update the board
        setFallingPiece(null);
        makeMove(finalRowIndex, colIndex);
        return;
      }
      
      currentRow++;
      setFallingPiece({ row: currentRow, col: colIndex, player: currentPlayer });
    }, animationSpeed / Math.max(finalRowIndex, 3)); // Scale animation speed based on drop distance with minimum divisor
  };

  const makeMove = (rowIndex, colIndex) => {
    // Create a new board with the current move
    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = currentPlayer;
    setBoard(newBoard);
    
    // Set last move for highlighting
    setLastMove({ row: rowIndex, col: colIndex });
    
    // Add to history
    addToHistory(`Player ${currentPlayer} placed in column ${colIndex + 1}`);
    
    // Check for winner
    const winner = checkWinner(newBoard, rowIndex, colIndex);
    if (winner) {
      setGameStatus(`Player ${winner} wins!`);
      // Update score
      if (winner === 'X') {
        setPlayer1Score(player1Score + 1);
      } else {
        setPlayer2Score(player2Score + 1);
      }
      setIsAnimating(false);
      return;
    }
    
    // Check for draw
    if (isBoardFull(newBoard)) {
      setGameStatus('Game ended in a draw!');
      setIsAnimating(false);
      return;
    }
    
    // Switch to next player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    setIsAnimating(false);
  };

  const isBoardFull = (boardState) => {
    // Check if the top row is full
    return boardState[0].every(cell => cell !== null);
  };

  // Computer player move
  const makeComputerMove = () => {
    // Get list of valid moves (columns that aren't full)
    const validColumns = [];
    for (let col = 0; col < boardSize; col++) {
      if (board[0][col] === null) {
        validColumns.push(col);
      }
    }
    
    if (validColumns.length === 0) return; // No valid moves
    
    let selectedColumn;
    
    if (difficulty === 'easy') {
      // Easy: Random column
      selectedColumn = validColumns[Math.floor(Math.random() * validColumns.length)];
    } else {
      // Medium or Hard: Strategic move
      selectedColumn = findStrategicMove(validColumns, difficulty === 'hard');
    }
    
    // Find the row where the piece will land
    let rowIndex = boardSize - 1;
    while (rowIndex >= 0 && board[rowIndex][selectedColumn] !== null) {
      rowIndex--;
    }
    
    // Animate the move
    animateFallingPiece(selectedColumn, rowIndex);
  };

  // Find strategic move for computer player
  const findStrategicMove = (validColumns, isHardMode) => {
    const currentMark = currentPlayer;
    const opponentMark = currentPlayer === 'X' ? 'O' : 'X';
    
    // Try each column to see if we can win
    for (const col of validColumns) {
      // Find the row where the piece would land
      let row = boardSize - 1;
      while (row >= 0 && board[row][col] !== null) {
        row--;
      }
      
      // Simulate the move
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = currentMark;
      
      // Check if this is a winning move
      if (checkWinner(tempBoard, row, col)) {
        return col;
      }
    }
    
    // Check if opponent can win in their next move and block
    for (const col of validColumns) {
      // Find the row where the piece would land
      let row = boardSize - 1;
      while (row >= 0 && board[row][col] !== null) {
        row--;
      }
      
      // Simulate opponent's move
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = opponentMark;
      
      // Check if opponent would win
      if (checkWinner(tempBoard, row, col)) {
        return col;
      }
    }
    
    // If hard mode, check for setups that could lead to future wins
    if (isHardMode) {
      // Try to find a move that creates a potential two-in-a-row
      const colScores = validColumns.map(col => {
        // Find the row where the piece would land
        let row = boardSize - 1;
        while (row >= 0 && board[row][col] !== null) {
          row--;
        }
        
        // If this would be the top row, less desirable
        if (row === 0) {
          return { col, score: -5 };
        }
        
        // Simulate our move
        const tempBoard = board.map(r => [...r]);
        tempBoard[row][col] = currentMark;
        
        // Count how many potential winning lines this contributes to
        let score = countPotentialWins(tempBoard, row, col, currentMark);
        
        // Simulate opponent's next move in the same column
        if (row > 0) {
          const nextRow = row - 1;
          tempBoard[nextRow][col] = opponentMark;
          
          // Check if this creates a winning opportunity for opponent
          if (countPotentialWins(tempBoard, nextRow, col, opponentMark) > 1) {
            score -= 10; // Penalize moves that could help opponent
          }
        }
        
        // Prefer center columns
        const centerDistance = Math.abs(col - (boardSize - 1) / 2);
        score -= centerDistance;
        
        return { col, score };
      });
      
      // Sort by score in descending order
      colScores.sort((a, b) => b.score - a.score);
      
      // If there's a clearly better move, take it
      if (colScores.length > 0 && colScores[0].score > 0) {
        return colScores[0].col;
      }
    }
    
    // If no strategic move found, prefer center columns
    const centerColumn = Math.floor(boardSize / 2);
    const sortedColumns = [...validColumns].sort((a, b) => 
      Math.abs(a - centerColumn) - Math.abs(b - centerColumn)
    );
    
    return sortedColumns[0];
  };

  // Helper function to count potential winning lines
  const countPotentialWins = (boardState, row, col, mark) => {
    let count = 0;
    
    // Define directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      let markCount = 1; // Current position
      let emptyCount = 0;
      
      // Check both directions along this line
      for (let dir = -1; dir <= 1; dir += 2) {
        for (let step = 1; step < winLength; step++) {
          const newRow = row + dir * step * dx;
          const newCol = col + dir * step * dy;
          
          // Check bounds
          if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            break;
          }
          
          if (boardState[newRow][newCol] === mark) {
            markCount++;
          } else if (boardState[newRow][newCol] === null) {
            emptyCount++;
          } else {
            break; // Opponent's piece
          }
        }
      }
      
      // Count as potential win if we have enough spaces to complete a winning line
      if (markCount + emptyCount >= winLength) {
        count++;
        // Extra weight for lines with more marks already in place
        if (markCount >= 2) {
          count += markCount - 1;
        }
      }
    }
    
    return count;
  };

  // Check for winner
  const checkWinner = (boardState, lastRow, lastCol) => {
    if (lastRow === undefined || lastCol === undefined) return null;
    
    const mark = boardState[lastRow][lastCol];
    if (!mark) return null;
    
    // Define directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      let inARow = 1; // Start with 1 for the current position
      const sequence = [{row: lastRow, col: lastCol}];
      
      // Look in both directions along this line
      for (let dir = -1; dir <= 1; dir += 2) {
        if (dir === 0) continue; // Skip the center point
        
        for (let step = 1; step < winLength; step++) {
          const newRow = lastRow + step * dir * dx;
          const newCol = lastCol + step * dir * dy;
          
          // Check bounds
          if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            break;
          }
          
          // If position has same mark, count it
          if (boardState[newRow][newCol] === mark) {
            inARow++;
            sequence.push({row: newRow, col: newCol});
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
    
    return null;
  };

  // History tracking
  const addToHistory = (action) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry = `[${timestamp}] ${action}`;
    setGameHistory([newEntry, ...gameHistory.slice(0, 9)]);
  };

  // Column hover handling
  const handleColumnHover = (colIndex) => {
    if (gameStarted && gameStatus === 'Game in progress' && !isAnimating) {
      setHoveredColumn(colIndex);
    }
  };

  const handleColumnLeave = () => {
    setHoveredColumn(null);
  };

  // Rendering functions
  const renderBoard = () => {
    return (
      <div className="flex flex-col bg-blue-800 p-2 rounded-lg mx-auto">
        {/* Column selection buttons */}
        <div className="flex mb-2">
          {Array(boardSize).fill(null).map((_, colIndex) => (
            <button 
              key={`col-${colIndex}`}
              className={`flex-1 h-8 mx-px rounded-t-lg 
                ${board[0][colIndex] === null ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-400 cursor-not-allowed'}
                ${hoveredColumn === colIndex && board[0][colIndex] === null ? 'bg-blue-400' : ''}
                transition-colors`}
              onClick={() => handleColumnClick(colIndex)}
              onMouseEnter={() => handleColumnHover(colIndex)}
              onMouseLeave={handleColumnLeave}
              disabled={board[0][colIndex] !== null || isAnimating}
            >
              ▼
            </button>
          ))}
        </div>
        
        {/* Game grid */}
        <div className="grid gap-1 bg-blue-800 p-1" style={{ 
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}>
          {Array(boardSize).fill(null).map((_, rowIndex) => (
            // For each row
            Array(boardSize).fill(null).map((_, colIndex) => (
              // For each cell in the row
              renderCell(rowIndex, colIndex)
            ))
          ))}
        </div>
      </div>
    );
  };

  const renderCell = (rowIndex, colIndex) => {
    const cellContent = board[rowIndex][colIndex];
    const isFallingPieceHere = fallingPiece && 
                               fallingPiece.row === rowIndex && 
                               fallingPiece.col === colIndex;
    const isLastMove = lastMove && 
                       lastMove.row === rowIndex && 
                       lastMove.col === colIndex;
    const isWinningCell = winningSequence.some(pos => 
                           pos.row === rowIndex && pos.col === colIndex);
    
    const displayMark = isFallingPieceHere ? fallingPiece.player : cellContent;
    
    // Calculate rotation for X pieces when falling
    const rotationStyle = {};
    if (isFallingPieceHere && displayMark === 'X') {
      const rotationDegrees = (rowIndex * 90) % 360;
      rotationStyle.transform = `rotate(${rotationDegrees}deg)`;
      rotationStyle.transition = 'transform 0.2s ease-in-out';
    }
    
    const cellClasses = `
      flex items-center justify-center w-full h-full
      ${isWinningCell ? 'ring-2 ring-yellow-300' : ''}
      ${isLastMove && !isWinningCell ? 'ring-1 ring-white' : ''}
      bg-white
      transition-all duration-150
    `;
    
    return (
      <div 
        key={`${rowIndex}-${colIndex}`}
        className="aspect-square p-1"
      >
        <div className={cellClasses}>
          {displayMark === 'X' && (
            <div 
              className="text-red-600 font-bold text-3xl" 
              style={rotationStyle}
            >
              X
            </div>
          )}
          {displayMark === 'O' && (
            <div className="text-yellow-500 font-bold text-3xl">
              O
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate valid win lengths for current board size
  const validWinLengths = [];
  for (let i = 3; i <= Math.min(5, boardSize); i++) {
    validWinLengths.push(i);
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Falling Tic-Tac-Toe</h1>
      
      <div className="w-full bg-blue-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Game Rules:</h2>
        <p className="text-sm mb-1">• Similar to Connect Four, pieces fall to the bottom of each column</p>
        <p className="text-sm mb-1">• Players take turns placing X or O in a column of their choice</p>
        <p className="text-sm mb-1">• Get {winLength} in a row horizontally, vertically, or diagonally to win</p>
        <p className="text-sm mb-1">• Current board size: {boardSize}×{boardSize}</p>
      </div>
      
      {!gameStarted ? (
        <div className="w-full bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Game Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-lg">Board Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Board Size: {boardSize}×{boardSize}</label>
                <input 
                  type="range" 
                  min="4" 
                  max="10" 
                  value={boardSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setBoardSize(newSize);
                    // Adjust win length if it's now invalid
                    if (winLength > Math.min(5, newSize)) {
                      setWinLength(Math.min(5, newSize));
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Win Condition: {winLength} in a row</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={winLength}
                  onChange={(e) => setWinLength(parseInt(e.target.value))}
                >
                  {validWinLengths.map(length => (
                    <option key={length} value={length}>{length} in a row</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Animation Speed:</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
                >
                  <option value={600}>Slow</option>
                  <option value={300}>Medium</option>
                  <option value={150}>Fast</option>
                </select>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-3 text-lg">Player Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player X:</label>
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
                <label className="block text-sm font-medium mb-1">Player O:</label>
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
          <div className="md:w-3/5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold">
                <span className={currentPlayer === 'X' ? 'text-red-600 underline' : ''}>
                  Player X: {player1Score}
                </span>
              </div>
              <div className="text-xl font-bold">
                <span className={currentPlayer === 'O' ? 'text-yellow-600 underline' : ''}>
                  Player O: {player2Score}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-lg font-semibold">
                {gameStatus === 'Game in progress' 
                  ? `Current Turn: Player ${currentPlayer}` 
                  : gameStatus}
              </div>
            </div>
            
            {renderBoard()}
            
            <div className="flex justify-center gap-4 mt-6">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={resetGame}
                disabled={isAnimating}
              >
                Reset Board
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={newGame}
                disabled={isAnimating}
              >
                New Game
              </button>
            </div>
          </div>
          
          <div className="md:w-2/5">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
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
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Game Guide</h3>
              <div className="text-sm">
                <p className="mb-1">• Click on a column to drop your piece</p>
                <p className="mb-1">• Pieces will stack from the bottom up</p>
                <p className="mb-1">• Your goal is to connect {winLength} of your pieces in a row</p>
                <p className="mb-1">• Winning sequences are highlighted with a yellow ring</p>
                <p className="mb-1">• The most recent move has a white ring</p>
              </div>
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

export default FallingTicTacToe;
