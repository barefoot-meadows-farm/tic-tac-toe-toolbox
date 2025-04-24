import React, { useState, useEffect, useRef } from 'react';
import { GameSettings } from '@/components/GameStart';

interface UnrestrictedNInARowProps {
  settings?: GameSettings;
}

const UnrestrictedNInARow = ({ settings }: UnrestrictedNInARowProps) => {
  // Game configuration from settings
  const boardSize = settings?.boardSize || 5;
  const winCondition = settings?.winLength || 5;
  const timeLimit = settings?.timeLimit || 0; // 0 means no time limit
  const [showLastMove, setShowLastMove] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-start the game
  const [customWinCondition, setCustomWinCondition] = useState('');
  
  // Game state
  const [board, setBoard] = useState({}); // Using an object to store sparse board
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lastMove, setLastMove] = useState(null);
  
  // Viewport state
  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 7, height: 7 }); // Initial viewport size
  const [cellSize, setCellSize] = useState(50); // Cell size in pixels
  
  // Touch and drag state
  const [dragging, setDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [movedDuringTouch, setMovedDuringTouch] = useState(false);
  
  // Refs
  const boardRef = useRef(null);
  const lastTouchDistance = useRef(null);
  const touchMoveThreshold = 10; // Pixels to move before considering it a drag

  // Initialize or reset the game
  useEffect(() => {
    resetGame();
  }, [winCondition]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isPlaying && timeLimit > 0 && !winner) {
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
  }, [isPlaying, timeLimit, currentPlayer, winner]);

  // Navigation controls implementation
  const moveViewport = (dx, dy) => {
    setViewportCenter(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };
  
  const handleZoom = (zoomIn) => {
    setCellSize(prevSize => {
      const change = zoomIn ? 5 : -5;
      return Math.max(20, Math.min(100, prevSize + change));
    });
  };
  
  // Touch and mouse events for dragging
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStartPos({ x: touch.clientX, y: touch.clientY });
    setMovedDuringTouch(false);
  };
  
  const handleTouchMove = (e) => {
    if (!dragging) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartPos.x;
    const dy = touch.clientY - dragStartPos.y;
    
    // Determine if we've moved enough to consider it a drag
    if (Math.abs(dx) > touchMoveThreshold || Math.abs(dy) > touchMoveThreshold) {
      setMovedDuringTouch(true);
    }
    
    // Move the viewport based on the touch movement
    setViewportCenter(prev => ({
      x: prev.x - Math.round(dx / cellSize),
      y: prev.y - Math.round(dy / cellSize)
    }));
    
    // Update the drag start position
    setDragStartPos({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = () => {
    setDragging(false);
  };
  
  // Mouse events for dragging (desktop)
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setMovedDuringTouch(false);
    }
  };
  
  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    
    if (Math.abs(dx) > touchMoveThreshold || Math.abs(dy) > touchMoveThreshold) {
      setMovedDuringTouch(true);
    }
    
    // Move the viewport based on the mouse movement
    setViewportCenter(prev => ({
      x: prev.x - Math.round(dx / cellSize),
      y: prev.y - Math.round(dy / cellSize)
    }));
    
    // Update the drag start position
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  // Pinch-to-zoom implementation for touch devices
  const handleTouchZoom = (e) => {
    if (e.touches.length < 2) {
      lastTouchDistance.current = null;
      return;
    }
    
    e.preventDefault();
    
    // Calculate the distance between two touch points
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    if (lastTouchDistance.current) {
      const delta = distance - lastTouchDistance.current;
      if (Math.abs(delta) > 5) {
        handleZoom(delta > 0);
      }
    }
    
    lastTouchDistance.current = distance;
  };

  // Reset the game
  const resetGame = () => {
    setBoard({});
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setLastMove(null);
    setTimeLeft(timeLimit);
    setIsPlaying(false);
    // Reset viewport to center
    setViewportCenter({ x: 0, y: 0 });
  };

  // Start the game
  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  // Handle cell click
  const handleCellClick = (x, y) => {
    // Don't place a mark if we were dragging
    if (!isPlaying || winner || board[`${x},${y}`] || movedDuringTouch) return;
    
    // Create new board state
    const newBoard = { ...board };
    newBoard[`${x},${y}`] = currentPlayer;
    setBoard(newBoard);
    setLastMove({ x, y });
    
    // Check for winner
    if (checkWinner(newBoard, x, y, currentPlayer)) {
      setWinner(currentPlayer);
      setIsPlaying(false);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      
      // Reset timer for the next player
      if (timeLimit > 0) {
        setTimeLeft(timeLimit);
      }
    }
  };

  // Check for winner
  const checkWinner = (boardState, x, y, player) => {
    const directions = [
      [1, 0],  // horizontal
      [0, 1],  // vertical
      [1, 1],  // diagonal top-left to bottom-right
      [1, -1]  // diagonal top-right to bottom-left
    ];
    
    for (const [dx, dy] of directions) {
      let count = 1; // Start with 1 for the placed piece
      const line = [`${x},${y}`];
      
      // Check in both directions
      for (const multiplier of [1, -1]) {
        for (let i = 1; i <= winCondition; i++) {
          const checkX = x + (dx * i * multiplier);
          const checkY = y + (dy * i * multiplier);
          const key = `${checkX},${checkY}`;
          
          if (boardState[key] === player) {
            count++;
            line.push(key);
          } else {
            break;
          }
        }
      }
      
      if (count >= winCondition) {
        setWinningLine(line);
        return true;
      }
    }
    
    return false;
  };

  // Convert coordinate to screen position
  const coordToPosition = (coord, isX = true) => {
    const viewportStart = isX 
      ? viewportCenter.x - Math.floor(viewportSize.width / 2)
      : viewportCenter.y - Math.floor(viewportSize.height / 2);
    
    return (coord - viewportStart) * cellSize;
  };

  // Handle custom win condition
  const handleCustomWinCondition = () => {
    const value = parseInt(customWinCondition, 10);
    if (value && value > 0) {
      setWinCondition(value);
      setCustomWinCondition('');
    }
  };

  // Render the grid
  const renderGrid = () => {
    const startX = viewportCenter.x - Math.floor(viewportSize.width / 2);
    const startY = viewportCenter.y - Math.floor(viewportSize.height / 2);
    const endX = startX + viewportSize.width;
    const endY = startY + viewportSize.height;
    
    const grid = [];
    
    // Grid lines
    for (let x = startX; x <= endX; x++) {
      grid.push(
        <line 
          key={`vline-${x}`}
          x1={coordToPosition(x)}
          y1={coordToPosition(startY, false)}
          x2={coordToPosition(x)}
          y2={coordToPosition(endY, false)}
          stroke="#ddd"
          strokeWidth="1"
        />
      );
    }
    
    for (let y = startY; y <= endY; y++) {
      grid.push(
        <line 
          key={`hline-${y}`}
          x1={coordToPosition(startX)}
          y1={coordToPosition(y, false)}
          x2={coordToPosition(endX)}
          y2={coordToPosition(y, false)}
          stroke="#ddd"
          strokeWidth="1"
        />
      );
    }
    
    // Coordinate labels at the edges
    for (let x = startX; x <= endX; x++) {
      grid.push(
        <text
          key={`xlabel-${x}`}
          x={coordToPosition(x) + cellSize / 2}
          y={coordToPosition(startY, false) - 5}
          textAnchor="middle"
          fontSize="10"
          fill="#999"
        >
          {x}
        </text>
      );
    }
    
    for (let y = startY; y <= endY; y++) {
      grid.push(
        <text
          key={`ylabel-${y}`}
          x={coordToPosition(startX) - 5}
          y={coordToPosition(y, false) + cellSize / 2}
          textAnchor="end"
          fontSize="10"
          fill="#999"
          dominantBaseline="middle"
        >
          {y}
        </text>
      );
    }
    
    // Origin marker
    grid.push(
      <circle
        key="origin"
        cx={coordToPosition(0)}
        cy={coordToPosition(0, false)}
        r="3"
        fill="#666"
      />
    );
    
    return grid;
  };

  // Render the pieces
  const renderPieces = () => {
    const pieces = [];
    const startX = viewportCenter.x - Math.floor(viewportSize.width / 2) - 1;
    const startY = viewportCenter.y - Math.floor(viewportSize.height / 2) - 1;
    const endX = startX + viewportSize.width + 2;
    const endY = startY + viewportSize.height + 2;
    
    // Only render pieces in the viewport for efficiency
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        const value = board[key];
        
        if (value) {
          const isLastMoveCell = lastMove && lastMove.x === x && lastMove.y === y && showLastMove;
          const isWinningCell = winningLine.includes(key);
          
          // Determine cell background color
          let bgColor = 'white';
          if (isWinningCell) {
            bgColor = '#c8e6c9'; // Light green
          } else if (isLastMoveCell) {
            bgColor = '#fff9c4'; // Light yellow
          }
          
          pieces.push(
            <g key={key}>
              <rect
                x={coordToPosition(x) + 1}
                y={coordToPosition(y, false) + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={bgColor}
                rx="2"
                ry="2"
              />
              <text
                x={coordToPosition(x) + cellSize / 2}
                y={coordToPosition(y, false) + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={cellSize * 0.6}
                fontWeight="bold"
                fill={value === 'X' ? '#f44336' : '#2196f3'}
              >
                {value}
              </text>
            </g>
          );
        }
      }
    }
    
    return pieces;
  };

  // Render clickable cells
  const renderClickableAreas = () => {
    const areas = [];
    const startX = viewportCenter.x - Math.floor(viewportSize.width / 2);
    const startY = viewportCenter.y - Math.floor(viewportSize.height / 2);
    const endX = startX + viewportSize.width;
    const endY = startY + viewportSize.height;
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        if (!board[`${x},${y}`]) {
          areas.push(
            <rect
              key={`clickable-${x}-${y}`}
              x={coordToPosition(x) + 1}
              y={coordToPosition(y, false) + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              fill="transparent"
              stroke="transparent"
              onClick={() => handleCellClick(x, y)}
              style={{ cursor: 'pointer' }}
            />
          );
        }
      }
    }
    
    return areas;
  };

  // Add event listeners
  useEffect(() => {
    const updateViewportSize = () => {
      if (boardRef.current) {
        const width = Math.floor(boardRef.current.clientWidth / cellSize);
        const height = Math.floor(boardRef.current.clientHeight / cellSize);
        setViewportSize({ width, height });
      }
    };
    
    updateViewportSize();
    
    // Add keyboard navigation support
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          moveViewport(0, -1);
          break;
        case 'ArrowDown':
          moveViewport(0, 1);
          break;
        case 'ArrowLeft':
          moveViewport(-1, 0);
          break;
        case 'ArrowRight':
          moveViewport(1, 0);
          break;
        case '+':
        case '=':
          handleZoom(true);
          break;
        case '-':
        case '_':
          handleZoom(false);
          break;
        case 'Home':
          setViewportCenter({ x: 0, y: 0 });
          break;
        default:
          break;
      }
    };
    
    // Handle wheel events for zooming
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleZoom(e.deltaY < 0);
      }
    };
    
    window.addEventListener('resize', updateViewportSize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('resize', updateViewportSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [cellSize, isPlaying]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-1">Unrestricted N-in-a-Row</h1>
      <p className="text-gray-600 mb-4">Get {winCondition} in a row on an infinite board!</p>
      
      {(
        <div className="mb-4 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold">
              {winner ? (
                `Player ${winner} Wins!`
              ) : (
                `Player ${currentPlayer}'s Turn`
              )}
            </div>
            
            {timeLimit > 0 && isPlaying && (
              <div className="text-lg">
                Time: {timeLeft}s
              </div>
            )}
          </div>
          
          <div className="flex flex-col w-full">
            {/* Navigation controls */}
            <div className="flex justify-center mb-2">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10"
                  onClick={() => moveViewport(0, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10"
                  onClick={() => moveViewport(-1, 0)}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10"
                  onClick={() => moveViewport(1, 0)}
                >
                  →
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10"
                  onClick={() => moveViewport(0, 1)}
                >
                  ↓
                </button>
              </div>
              
              <div className="inline-flex rounded-md shadow-sm ml-4" role="group">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10"
                  onClick={() => handleZoom(true)}
                >
                  +
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10"
                  onClick={() => handleZoom(false)}
                >
                  −
                </button>
              </div>
              
              <button
                type="button"
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:z-10"
                onClick={() => setViewportCenter({ x: 0, y: 0 })}
              >
                Center (0,0)
              </button>
            </div>
            
            <div 
              ref={boardRef}
              className="w-full border border-gray-400 relative select-none"
              style={{ height: '500px', overflow: 'hidden', touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            >
              <svg width="100%" height="100%">
                {renderGrid()}
                {renderPieces()}
                {isPlaying && renderClickableAreas()}
              </svg>
              
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-70 p-2 rounded text-sm">
                <div>Center: ({viewportCenter.x}, {viewportCenter.y})</div>
                <div>Zoom: {Math.round((cellSize / 50) * 100)}%</div>
                <div className="text-xs text-gray-500">Drag to pan, use buttons to zoom</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              onClick={resetGame}
            >
              Reset Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnrestrictedNInARow;