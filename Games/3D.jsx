import React, { useState, useEffect } from 'react';

const TicTacToe3D = () => {
  // Game states
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  
  // Game configuration
  const [gridSize, setGridSize] = useState(3);
  const [playerNames, setPlayerNames] = useState({ X: 'Player 1', O: 'Player 2' });
  const [aiOpponent, setAiOpponent] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'
  const [highlightWinningLine, setHighlightWinningLine] = useState(true);
  const [viewMode, setViewMode] = useState('layers'); // Only 'layers' for now, 'isometric' coming soon
  
  // Initialize the 3D board
  const createEmptyBoard = (size) => {
    return Array(size).fill().map(() => 
      Array(size).fill().map(() => 
        Array(size).fill(null)
      )
    );
  };
  
  const [board, setBoard] = useState(createEmptyBoard(gridSize));
  
  // Reset the game
  const resetGame = () => {
    setBoard(createEmptyBoard(gridSize));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setGameState('playing');
  };
  
  // Start a new game with the current configuration
  const startGame = () => {
    // Update board size if grid size has changed
    if (board.length !== gridSize) {
      setBoard(createEmptyBoard(gridSize));
    }
    resetGame();
  };
  
  // Handle cell click
  const handleCellClick = (z, y, x) => {
    // Ignore clicks if game is over or cell is already filled
    if (gameState === 'gameOver' || board[z][y][x] !== null) {
      return;
    }
    
    // Update board
    const newBoard = [...board];
    newBoard[z][y][x] = currentPlayer;
    setBoard(newBoard);
    
    // Check for winner
    const gameResult = checkWinner(newBoard);
    if (gameResult.winner) {
      setWinner(gameResult.winner);
      setWinningLine(gameResult.line);
      setGameState('gameOver');
      return;
    }
    
    // Check for draw
    if (isBoardFull(newBoard)) {
      setGameState('gameOver');
      return;
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    
    // AI move if enabled and it's AI's turn
    if (aiOpponent && currentPlayer === 'X') {
      setTimeout(() => {
        makeAiMove(newBoard);
      }, 500);
    }
  };
  
  // AI move
  const makeAiMove = (currentBoard) => {
    if (gameState === 'gameOver') return;
    
    let move;
    
    switch (aiDifficulty) {
      case 'hard':
        move = findBestMove(currentBoard);
        break;
      case 'medium':
        // 50% chance of making the best move, 50% chance of making a random move
        move = Math.random() > 0.5 ? findBestMove(currentBoard) : findRandomMove(currentBoard);
        break;
      case 'easy':
      default:
        move = findRandomMove(currentBoard);
        break;
    }
    
    if (move) {
      const [z, y, x] = move;
      handleCellClick(z, y, x);
    }
  };
  
  // Find a random valid move
  const findRandomMove = (currentBoard) => {
    const emptyCells = [];
    
    for (let z = 0; z < gridSize; z++) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (currentBoard[z][y][x] === null) {
            emptyCells.push([z, y, x]);
          }
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  };
  
  // Find the best move using a simple heuristic
  const findBestMove = (currentBoard) => {
    // This is a simplified version - a real implementation would use minimax
    // First, check if AI can win in the next move
    for (let z = 0; z < gridSize; z++) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (currentBoard[z][y][x] === null) {
            currentBoard[z][y][x] = 'O';
            if (checkWinner(currentBoard).winner === 'O') {
              currentBoard[z][y][x] = null;
              return [z, y, x];
            }
            currentBoard[z][y][x] = null;
          }
        }
      }
    }
    
    // Check if player can win in the next move and block
    for (let z = 0; z < gridSize; z++) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (currentBoard[z][y][x] === null) {
            currentBoard[z][y][x] = 'X';
            if (checkWinner(currentBoard).winner === 'X') {
              currentBoard[z][y][x] = null;
              return [z, y, x];
            }
            currentBoard[z][y][x] = null;
          }
        }
      }
    }
    
    // Try to take the center
    const center = Math.floor(gridSize / 2);
    if (currentBoard[center][center][center] === null) {
      return [center, center, center];
    }
    
    // Take a random move
    return findRandomMove(currentBoard);
  };
  
  // Check if the board is full (draw)
  const isBoardFull = (currentBoard) => {
    for (let z = 0; z < gridSize; z++) {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (currentBoard[z][y][x] === null) {
            return false;
          }
        }
      }
    }
    return true;
  };
  
  // Function to check for a winner
  const checkWinner = (currentBoard) => {
    const lines = generateWinningLines(gridSize);
    
    for (const line of lines) {
      const values = line.map(([z, y, x]) => currentBoard[z][y][x]);
      
      if (values.every(val => val === 'X')) {
        return { winner: 'X', line };
      }
      if (values.every(val => val === 'O')) {
        return { winner: 'O', line };
      }
    }
    
    return { winner: null, line: [] };
  };
  
  // Generate all possible winning lines for a given grid size
  const generateWinningLines = (size) => {
    const lines = [];
    
    // Horizontal lines (in each layer)
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        lines.push(Array(size).fill().map((_, x) => [z, y, x]));
      }
    }
    
    // Vertical lines (in each layer)
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        lines.push(Array(size).fill().map((_, y) => [z, y, x]));
      }
    }
    
    // Depth lines (across layers)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        lines.push(Array(size).fill().map((_, z) => [z, y, x]));
      }
    }
    
    // Diagonal lines in each layer
    for (let z = 0; z < size; z++) {
      // Main diagonal (\)
      lines.push(Array(size).fill().map((_, i) => [z, i, i]));
      // Anti-diagonal (/)
      lines.push(Array(size).fill().map((_, i) => [z, i, size - 1 - i]));
    }
    
    // Diagonal lines across layers, across rows
    for (let y = 0; y < size; y++) {
      // Main diagonal (\)
      lines.push(Array(size).fill().map((_, i) => [i, y, i]));
      // Anti-diagonal (/)
      lines.push(Array(size).fill().map((_, i) => [i, y, size - 1 - i]));
    }
    
    // Diagonal lines across layers, across columns
    for (let x = 0; x < size; x++) {
      // Main diagonal (\)
      lines.push(Array(size).fill().map((_, i) => [i, i, x]));
      // Anti-diagonal (/)
      lines.push(Array(size).fill().map((_, i) => [i, size - 1 - i, x]));
    }
    
    // 3D diagonals (through the cube)
    // Main diagonal from (0,0,0) to (size-1,size-1,size-1)
    lines.push(Array(size).fill().map((_, i) => [i, i, i]));
    
    // Main diagonal from (0,0,size-1) to (size-1,size-1,0)
    lines.push(Array(size).fill().map((_, i) => [i, i, size - 1 - i]));
    
    // Main diagonal from (0,size-1,0) to (size-1,0,size-1)
    lines.push(Array(size).fill().map((_, i) => [i, size - 1 - i, i]));
    
    // Main diagonal from (0,size-1,size-1) to (size-1,0,0)
    lines.push(Array(size).fill().map((_, i) => [i, size - 1 - i, size - 1 - i]));
    
    return lines;
  };
  
  // Check if a cell is part of the winning line
  const isCellInWinningLine = (z, y, x) => {
    return winningLine.some(([wz, wy, wx]) => wz === z && wy === y && wx === x);
  };
  
  // Styling
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f7f7f7',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '20px'
    },
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    configItem: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    input: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      width: '100%',
      boxSizing: 'border-box'
    },
    select: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      width: '100%',
      boxSizing: 'border-box'
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.3s'
    },
    buttonSection: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px'
    },
    gameBoard: {
      textAlign: 'center'
    },
    gameStatus: {
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#e0f7fa',
      borderRadius: '4px',
      textAlign: 'center'
    },
    grid: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      alignItems: 'center'
    },
    layer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      margin: '10px 0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    layerTitle: {
      backgroundColor: '#e0e0e0',
      padding: '5px',
      fontWeight: 'bold'
    },
    row: {
      display: 'flex',
      gap: '2px'
    },
    cell: {
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      cursor: 'pointer',
      backgroundColor: '#fff',
      transition: 'all 0.3s'
    },
    winningCell: {
      backgroundColor: '#81c784'
    },
    cellX: {
      color: '#f44336'
    },
    cellO: {
      color: '#2196f3'
    },
    comingSoonBanner: {
      padding: '10px',
      backgroundColor: '#ffecb3',
      borderRadius: '4px',
      marginBottom: '20px',
      color: '#795548',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };
  
  // Game Menu Component
  const GameMenu = () => {
    return (
      <div style={styles.menu}>
        <h2 style={{...styles.title, marginTop: 0}}>Game Configuration</h2>
        
        <div style={styles.configItem}>
          <label style={styles.label}>Grid Size:</label>
          <select 
            style={styles.select}
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
          >
            <option value={3}>3×3×3</option>
            <option value={4}>4×4×4</option>
            <option value={5}>5×5×5</option>
          </select>
        </div>
        
        <div style={styles.configItem}>
          <label style={styles.label}>Player X Name:</label>
          <input
            style={styles.input}
            type="text"
            value={playerNames.X}
            onChange={(e) => setPlayerNames({...playerNames, X: e.target.value})}
          />
        </div>
        
        <div style={styles.configItem}>
          <label style={styles.label}>Player O:</label>
          <select
            style={styles.select}
            value={aiOpponent ? 'ai' : 'human'}
            onChange={(e) => setAiOpponent(e.target.value === 'ai')}
          >
            <option value="human">Human</option>
            <option value="ai">AI</option>
          </select>
        </div>
        
        {aiOpponent && (
          <div style={styles.configItem}>
            <label style={styles.label}>AI Name:</label>
            <input
              style={styles.input}
              type="text"
              value={playerNames.O}
              onChange={(e) => setPlayerNames({...playerNames, O: e.target.value})}
            />
          </div>
        )}
        
        {aiOpponent && (
          <div style={styles.configItem}>
            <label style={styles.label}>AI Difficulty:</label>
            <select
              style={styles.select}
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        )}
        
        <div style={styles.comingSoonBanner}>
          🚧 Isometric View Coming Soon! 🚧
        </div>
        
        <div style={styles.configItem}>
          <label style={{...styles.label, display: 'inline-flex', alignItems: 'center'}}>
            <input
              type="checkbox"
              checked={highlightWinningLine}
              onChange={(e) => setHighlightWinningLine(e.target.checked)}
              style={{marginRight: '8px'}}
            />
            Highlight Winning Line
          </label>
        </div>
        
        <div style={styles.buttonSection}>
          <button
            style={styles.button}
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  };
  
  // Game Board Component
  const GameBoard = () => {
    return (
      <div style={styles.gameBoard}>
        <div style={styles.gameStatus}>
          {winner 
            ? `Game Over! ${playerNames[winner]} wins!` 
            : gameState === 'gameOver' 
              ? "Game Over! It's a draw!" 
              : `Current Turn: ${playerNames[currentPlayer]} (${currentPlayer})`}
        </div>
        
        <div style={styles.grid}>
          {board.map((layer, z) => (
            <div key={z} style={styles.layer}>
              <div style={styles.layerTitle}>Layer {z + 1}</div>
              {layer.map((row, y) => (
                <div key={y} style={styles.row}>
                  {row.map((cell, x) => {
                    const isWinningCell = highlightWinningLine && isCellInWinningLine(z, y, x);
                    const cellStyle = {
                      ...styles.cell,
                      ...(isWinningCell ? styles.winningCell : {}),
                      ...(cell === 'X' ? styles.cellX : {}),
                      ...(cell === 'O' ? styles.cellO : {})
                    };
                    
                    return (
                      <div
                        key={x}
                        style={cellStyle}
                        onClick={() => handleCellClick(z, y, x)}
                      >
                        {cell}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div style={styles.buttonSection}>
          <button
            style={{...styles.button, backgroundColor: '#ff9800'}}
            onClick={resetGame}
          >
            New Game
          </button>
          <button
            style={{...styles.button, backgroundColor: '#f44336'}}
            onClick={() => setGameState('menu')}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>3D Tic-Tac-Toe</h1>
      
      {gameState === 'menu' && <GameMenu />}
      {gameState === 'playing' && <GameBoard />}
      {gameState === 'gameOver' && <GameBoard />}
    </div>
  );
};

export default TicTacToe3D;
