import React, { useState, useEffect } from 'react';

const UltimateTicTacToe = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Type, setPlayer1Type] = useState('human');
  const [player2Type, setPlayer2Type] = useState('human');
  const [difficulty, setDifficulty] = useState('medium');
  const [cpuDelay, setCpuDelay] = useState(800);
  const [gameStatus, setGameStatus] = useState('Configure your game settings and press Start Game');
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedCell, setAnimatedCell] = useState(null);
  
  // Ultimate Tic-Tac-Toe specific state
  const initialGlobalBoard = Array(9).fill(null);
  const initialLocalBoards = Array(9).fill().map(() => Array(9).fill(null));
  const [globalBoard, setGlobalBoard] = useState(initialGlobalBoard);
  const [localBoards, setLocalBoards] = useState(initialLocalBoards);
  const [nextBoardIndex, setNextBoardIndex] = useState(null);
  const [lastMove, setLastMove] = useState(null);

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
  }, [currentPlayer, gameStarted, gameStatus, nextBoardIndex, localBoards, globalBoard]);

  // Game initialization
  const startGame = () => {
    // Reset all game state
    setGlobalBoard(initialGlobalBoard);
    setLocalBoards(initialLocalBoards);
    setNextBoardIndex(null);
    setCurrentPlayer('X');
    setGameStatus('Game in progress');
    setGameStarted(true);
    setGameHistory([]);
    addToHistory("Game started");
  };

  const resetGame = () => {
    setGlobalBoard(initialGlobalBoard);
    setLocalBoards(initialLocalBoards);
    setNextBoardIndex(null);
    setCurrentPlayer('X');
    setGameStatus('Game in progress');
    addToHistory("Game reset");
  };

  const newGame = () => {
    setGameStarted(false);
    setGameStatus('Configure your game settings and press Start Game');
  };

  // Handle player moves
  const handleCellClick = (boardIndex, cellIndex) => {
    // Check if the move is valid
    if (!gameStarted || 
        gameStatus !== 'Game in progress' || 
        (nextBoardIndex !== null && boardIndex !== nextBoardIndex) || 
        localBoards[boardIndex][cellIndex] !== null || 
        globalBoard[boardIndex] !== null) {
      return;
    }

    // Make the move
    makeMove(boardIndex, cellIndex);
  };

  const makeMove = (boardIndex, cellIndex) => {
    // Update local board
    const newLocalBoards = localBoards.map((board, idx) => 
      idx === boardIndex ? board.map((cell, i) => 
        i === cellIndex ? currentPlayer : cell
      ) : board
    );
    setLocalBoards(newLocalBoards);
    
    // Animate the cell
    setIsAnimating(true);
    setAnimatedCell({ boardIndex, cellIndex });
    setTimeout(() => {
      setIsAnimating(false);
      setAnimatedCell(null);
    }, 300);

    // Add to history
    addToHistory(`Player ${currentPlayer} placed at board ${boardIndex + 1}, cell ${cellIndex + 1}`);
    setLastMove({ boardIndex, cellIndex });
    
    // Check if local board is won
    const localWinner = checkWinner(newLocalBoards[boardIndex]);
    if (localWinner) {
      const newGlobalBoard = [...globalBoard];
      newGlobalBoard[boardIndex] = localWinner;
      setGlobalBoard(newGlobalBoard);
      
      // Check if global board is won
      const globalWinner = checkWinner(newGlobalBoard);
      if (globalWinner) {
        setGameStatus(`Player ${globalWinner} wins the game!`);
        // Update score
        if (globalWinner === 'X') {
          setPlayer1Score(player1Score + 1);
        } else {
          setPlayer2Score(player2Score + 1);
        }
        return;
      }
      
      // Check for draw on global board
      if (isGlobalBoardFull(newGlobalBoard)) {
        setGameStatus('Game ended in a draw!');
        return;
      }
    }
    
    // Set next board for the next player
    let nextBoard = cellIndex;
    // If the target board is already won or full, allow play in any open board
    if (globalBoard[nextBoard] !== null || isBoardFull(newLocalBoards[nextBoard])) {
      nextBoard = null;
    }
    setNextBoardIndex(nextBoard);
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Computer player
  const makeComputerMove = () => {
    let boardToPlay, cellToPlay;
    
    // Determine valid boards to play in
    const validBoards = [];
    if (nextBoardIndex === null) {
      // Can play in any board that isn't won and isn't full
      for (let i = 0; i < 9; i++) {
        if (globalBoard[i] === null && !isBoardFull(localBoards[i])) {
          validBoards.push(i);
        }
      }
    } else if (globalBoard[nextBoardIndex] === null && !isBoardFull(localBoards[nextBoardIndex])) {
      validBoards.push(nextBoardIndex);
    }
    
    if (validBoards.length === 0) return;
    
    // Make the computer's decision based on difficulty
    if (difficulty === 'easy') {
      // Random move
      boardToPlay = validBoards[Math.floor(Math.random() * validBoards.length)];
      const emptyCells = localBoards[boardToPlay]
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
      cellToPlay = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else {
      // Strategic move based on difficulty
      const move = findBestMove(validBoards);
      boardToPlay = move.boardIndex;
      cellToPlay = move.cellIndex;
    }
    
    makeMove(boardToPlay, cellToPlay);
  };

  const findBestMove = (validBoards) => {
    // Try to find a winning move first
    for (const boardIndex of validBoards) {
      const emptyCells = localBoards[boardIndex]
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
      
      // Check if any move can win a local board
      for (const cellIndex of emptyCells) {
        const tempBoard = [...localBoards[boardIndex]];
        tempBoard[cellIndex] = currentPlayer;
        if (checkWinner(tempBoard) === currentPlayer) {
          return { boardIndex, cellIndex };
        }
      }
    }
    
    // In hard mode, also look for moves that send opponent to won/full boards
    if (difficulty === 'hard') {
      for (const boardIndex of validBoards) {
        const emptyCells = localBoards[boardIndex]
          .map((cell, index) => cell === null ? index : null)
          .filter(index => index !== null);
        
        for (const cellIndex of emptyCells) {
          // Check if this move sends opponent to a won/full board
          if (globalBoard[cellIndex] !== null || isBoardFull(localBoards[cellIndex])) {
            return { boardIndex, cellIndex };
          }
        }
      }
      
      // Look for moves to set up future wins
      for (const boardIndex of validBoards) {
        const board = localBoards[boardIndex];
        // Check for potential fork opportunities (two ways to win)
        const result = findForkOpportunity(board, currentPlayer);
        if (result !== -1) {
          return { boardIndex, cellIndex: result };
        }
      }
    }
    
    // If no strategic move or medium difficulty, find a good move
    for (const boardIndex of validBoards) {
      const emptyCells = localBoards[boardIndex]
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null);
      
      // Try to take center of the board
      if (emptyCells.includes(4)) {
        return { boardIndex, cellIndex: 4 };
      }
      
      // Try to take corners
      const corners = [0, 2, 6, 8].filter(corner => emptyCells.includes(corner));
      if (corners.length > 0) {
        return { boardIndex, cellIndex: corners[Math.floor(Math.random() * corners.length)] };
      }
    }
    
    // Fall back to random move if no strategy applies
    const boardToPlay = validBoards[Math.floor(Math.random() * validBoards.length)];
    const emptyCells = localBoards[boardToPlay]
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null);
    const cellToPlay = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    return { boardIndex: boardToPlay, cellIndex: cellToPlay };
  };

  // Helper functions for strategic move-finding
  const findForkOpportunity = (board, player) => {
    // Check each empty cell for potential fork (multiple ways to win)
    const emptyCells = board
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null);
    
    for (const cellIndex of emptyCells) {
      const tempBoard = [...board];
      tempBoard[cellIndex] = player;
      
      let winningLines = 0;
      
      // Check rows, columns, and diagonals for potential wins after this move
      for (let i = 0; i < 3; i++) {
        // Check row
        const rowStart = Math.floor(cellIndex / 3) * 3;
        const row = [tempBoard[rowStart], tempBoard[rowStart + 1], tempBoard[rowStart + 2]];
        if (countInLine(row, player) === 2 && countInLine(row, null) === 1) {
          winningLines++;
        }
        
        // Check column
        const colStart = cellIndex % 3;
        const col = [tempBoard[colStart], tempBoard[colStart + 3], tempBoard[colStart + 6]];
        if (countInLine(col, player) === 2 && countInLine(col, null) === 1) {
          winningLines++;
        }
      }
      
      // Check diagonals
      if (cellIndex % 2 === 0) { // only cells on diagonals
        const diag1 = [tempBoard[0], tempBoard[4], tempBoard[8]];
        const diag2 = [tempBoard[2], tempBoard[4], tempBoard[6]];
        
        if (cellIndex % 4 === 0) { // on main diagonal
          if (countInLine(diag1, player) === 2 && countInLine(diag1, null) === 1) {
            winningLines++;
          }
        }
        
        if (cellIndex === 2 || cellIndex === 4 || cellIndex === 6) { // on other diagonal
          if (countInLine(diag2, player) === 2 && countInLine(diag2, null) === 1) {
            winningLines++;
          }
        }
      }
      
      if (winningLines >= 2) {
        return cellIndex;
      }
    }
    
    return -1;
  };

  // Utility function for counting pieces in a line
  const countInLine = (line, value) => {
    return line.filter(cell => cell === value).length;
  };

  // Check win conditions
  const checkWinner = (board) => {
    // Check rows
    for (let i = 0; i < 9; i += 3) {
      if (board[i] && board[i] === board[i + 1] && board[i] === board[i + 2]) {
        return board[i];
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[i] && board[i] === board[i + 3] && board[i] === board[i + 6]) {
        return board[i];
      }
    }
    
    // Check diagonals
    if (board[0] && board[0] === board[4] && board[0] === board[8]) {
      return board[0];
    }
    if (board[2] && board[2] === board[4] && board[2] === board[6]) {
      return board[2];
    }
    
    // Check for draw - if the board is full
    if (isBoardFull(board)) {
      return 'T'; // T for Tie
    }
    
    return null;
  };

  const isBoardFull = (board) => {
    return !board.includes(null);
  };

  const isGlobalBoardFull = (board) => {
    // A global board is full if all cells are filled with X, O, or T (tie)
    return !board.includes(null);
  };

  // History tracking
  const addToHistory = (action) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry = `[${timestamp}] ${action}`;
    setGameHistory([newEntry, ...gameHistory.slice(0, 9)]);
  };

  // Rendering functions
  const renderGlobalBoard = () => {
    return (
      <div className="grid grid-cols-3 gap-1 bg-gray-800 p-1 max-w-lg mx-auto">
        {Array(9).fill(null).map((_, index) => renderLocalBoard(index))}
      </div>
    );
  };

  const renderLocalBoard = (boardIndex) => {
    const isActive = nextBoardIndex === null || nextBoardIndex === boardIndex;
    const isPlayable = globalBoard[boardIndex] === null && !isBoardFull(localBoards[boardIndex]);
    const localWinner = globalBoard[boardIndex];
    
    const boardClasses = `
      grid grid-cols-3 gap-px bg-gray-300 p-px relative
      ${isActive && isPlayable ? 'bg-yellow-300' : 'bg-gray-300'}
      ${localWinner === 'X' ? 'bg-blue-200' : ''}
      ${localWinner === 'O' ? 'bg-red-200' : ''}
      ${localWinner === 'T' ? 'bg-gray-400' : ''}
      ${lastMove && lastMove.boardIndex === boardIndex ? 'outline outline-offset-1 outline-2 outline-purple-500' : ''}
    `;

    return (
      <div key={boardIndex} className={boardClasses}>
        {localBoards[boardIndex].map((cell, cellIndex) => renderCell(boardIndex, cellIndex))}
        
        {localWinner && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 text-6xl font-bold">
            {localWinner === 'T' ? '=' : localWinner}
          </div>
        )}
      </div>
    );
  };

  const renderCell = (boardIndex, cellIndex) => {
    const cell = localBoards[boardIndex][cellIndex];
    const isHighlighted = animatedCell && 
                          animatedCell.boardIndex === boardIndex && 
                          animatedCell.cellIndex === cellIndex;
    const isValid = gameStatus === 'Game in progress' && 
                   (nextBoardIndex === null || nextBoardIndex === boardIndex) && 
                   globalBoard[boardIndex] === null && 
                   cell === null;
    
    const cellClasses = `
      flex items-center justify-center h-10 w-10 bg-white
      ${isValid ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'}
      ${isHighlighted && isAnimating ? 'scale-110 transform transition-transform duration-200' : ''}
      ${cell === 'X' ? 'text-blue-600' : ''}
      ${cell === 'O' ? 'text-red-600' : ''}
      ${lastMove && lastMove.boardIndex === boardIndex && lastMove.cellIndex === cellIndex ? 'bg-yellow-100' : ''}
    `;
    
    return (
      <div 
        key={`${boardIndex}-${cellIndex}`} 
        className={cellClasses}
        onClick={() => handleCellClick(boardIndex, cellIndex)}
      >
        {cell === 'X' && <span className="text-xl font-bold">X</span>}
        {cell === 'O' && <span className="text-xl font-bold">O</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ultimate Tic-Tac-Toe</h1>
      
      <div className="w-full bg-blue-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Game Rules:</h2>
        <p className="text-sm mb-1">• The game consists of 9 smaller tic-tac-toe boards arranged in a 3x3 grid</p>
        <p className="text-sm mb-1">• Each move determines which board your opponent must play in next</p>
        <p className="text-sm mb-1">• Win a small board by getting three in a row on it</p>
        <p className="text-sm mb-1">• Win the game by getting three small boards in a row</p>
        <p className="text-sm mb-1">• If sent to a board that's already won or full, you can play in any open board</p>
        <p className="text-sm">• A tied board counts as filled but doesn't belong to either player</p>
      </div>
      
      {!gameStarted ? (
        <div className="w-full bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Game Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3 text-lg">Player Options</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Player 1 (X):</label>
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
                <label className="block text-sm font-medium mb-1">Player 2 (O):</label>
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
              <div>
                <h3 className="font-bold mb-3 text-lg">Computer Settings</h3>
                
                <div className="mb-4">
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
                
                <div className="mb-4">
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
                <span className={currentPlayer === 'X' ? 'text-blue-600 underline' : ''}>
                  Player 1 (X): {player1Score}
                </span>
              </div>
              <div className="text-xl font-bold">
                <span className={currentPlayer === 'O' ? 'text-red-600 underline' : ''}>
                  Player 2 (O): {player2Score}
                </span>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-lg font-semibold">
                {gameStatus === 'Game in progress' 
                  ? `Current Turn: Player ${currentPlayer}` 
                  : gameStatus}
              </div>
              {gameStatus === 'Game in progress' && nextBoardIndex !== null && (
                <div className="text-md mt-1">
                  Must play in board {nextBoardIndex + 1}
                </div>
              )}
              {gameStatus === 'Game in progress' && nextBoardIndex === null && (
                <div className="text-md mt-1">
                  Can play in any open board
                </div>
              )}
            </div>
            
            {renderGlobalBoard()}
            
            <div className="flex justify-center gap-4 mt-6">
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
          
          <div className="md:w-2/5">
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">Current Settings</h3>
              <p><strong>Player 1 (X):</strong> {player1Type === 'human' ? 'Human' : 'Computer'}</p>
              <p><strong>Player 2 (O):</strong> {player2Type === 'human' ? 'Human' : 'Computer'}</p>
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
                <p className="mb-1"><strong>Highlighted board:</strong> The active board where you must play</p>
                <p className="mb-1"><strong>Blue/Red backgrounds:</strong> Boards won by X/O</p>
                <p className="mb-1"><strong>Gray backgrounds:</strong> Tied boards</p>
                <p className="mb-1"><strong>Purple outline:</strong> The board containing your last move</p>
                <p><strong>Yellow highlight:</strong> The cell of the last move</p>
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

export default UltimateTicTacToe;
