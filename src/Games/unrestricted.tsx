import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Flag, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { trackGameComplete } from '@/utils/analytics';
import { getAIMove } from '@/utils/gameAI';

type Player = 'X' | 'O' | null;
type Coordinate = [number, number]; // [x, y] coordinate
type BoardMap = Record<string, Player>; // Map of coordinates to player marks

interface UnrestrictedGameProps {
  className?: string;
  settings?: {
    opponent: 'ai' | 'human';
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit: number | null;
    firstPlayer: 'player1' | 'player2' | 'random';
    customRules: {
      winLength?: number;
      moveLimit?: number;
    };
  } | null;
}

// Define Board type
type Board = (Player)[][];

const UnrestrictedGame: React.FC<UnrestrictedGameProps> = ({ 
  className,
  settings
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  
  // Viewport size (visible grid size)
  const VIEWPORT_SIZE = 5;
  
  // Initial board size (smaller than the max to allow for expansion)
  const initialBoardSize = 10;
  const maxBoardSize = 50;
  
  // Win condition (default 3, configurable up to 10)
  const winLength = settings?.customRules?.winLength || 3;
  
  // Move limit (optional)
  const moveLimit = settings?.customRules?.moveLimit || null;
  
  // Board state
  const [board, setBoard] = useState<Board>(
    Array(initialBoardSize).fill(null).map(() => Array(initialBoardSize).fill(null))
  );
  
  // Visible board area (for panning)
  const [visibleArea, setVisibleArea] = useState({
    startRow: 0,
    startCol: 0,
    endRow: initialBoardSize - 1,
    endCol: initialBoardSize - 1
  });
  
  // Viewport center coordinates (for navigation)
  const [viewportCenter, setViewportCenter] = useState<[number, number]>([0, 0]);
  
  // Board map for storing moves in the infinite grid
  const [boardMap, setBoardMap] = useState<BoardMap>({});
  
  // Animation state for sliding effect
  const [isSliding, setIsSliding] = useState(false);
  
  // Zoom level (1 = normal, > 1 = zoomed in, < 1 = zoomed out)
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>(getInitialPlayer());
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningLine, setWinningLine] = useState<number[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(settings?.timeLimit || null);
  
  // Touch/mouse interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  
  // Convert viewport coordinates to world coordinates
  const viewportToWorld = (viewportRow: number, viewportCol: number): Coordinate => {
    const worldRow = viewportCenter[1] - Math.floor(VIEWPORT_SIZE/2) + viewportRow;
    const worldCol = viewportCenter[0] - Math.floor(VIEWPORT_SIZE/2) + viewportCol;
    return [worldCol, worldRow];
  };
  
  // Convert coordinate to string key for boardMap
  const coordToKey = (coord: Coordinate): string => {
    return `${coord[0]},${coord[1]}`;
  };
  
  // Handle cell click in the virtual grid
  const handleCellClick = (coord: Coordinate) => {
    const key = coordToKey(coord);
    
    // Check if cell is already occupied or game is over
    if (boardMap[key] || winner || isDraw || waitingForAI) {
      return;
    }
    
    // Start game if not started
    if (!gameStarted) {
      setGameStarted(true);
      if (settings?.timeLimit) {
        setTimeLeft(settings.timeLimit);
      }
    }
    
    // Update the boardMap with the new move
    setBoardMap(prev => ({
      ...prev,
      [key]: currentPlayer
    }));
    
    // Increment move counter
    setMoveCount(prev => prev + 1);
    
    // Check for winner based on the last move
    const potentialWinner = checkWinnerInBoardMap(coord, currentPlayer);
    if (potentialWinner) {
      setWinner(potentialWinner);
      
      // Track the game completion
      if (user) {
        trackGameComplete(
          {
            gameId: 'unrestricted',
            variant: 'unrestricted',
            opponent: settings?.opponent || 'ai',
            difficulty: settings?.difficulty,
            result: potentialWinner === 'X' ? 'win' : 'loss'
          }, 
          user
        );
      }
      
      return;
    }
    
    // Check for draw
    if (moveLimit && moveCount + 1 >= moveLimit) {
      setIsDraw(true);
      
      // Track the game completion as a draw
      if (user) {
        trackGameComplete(
          {
            gameId: 'unrestricted',
            variant: 'unrestricted',
            opponent: settings?.opponent || 'ai',
            difficulty: settings?.difficulty,
            result: 'draw'
          }, 
          user
        );
      }
      
      return;
    }
    
    // Reset the timer when a move is made
    if (settings?.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
    
    // Switch player
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };
  
  // Check for winner in the boardMap
  const checkWinnerInBoardMap = (lastMove: Coordinate, player: Player): Player => {
    if (!player) return null;
    
    const [lastX, lastY] = lastMove;
    
    // Directions: horizontal, vertical, diagonal down-right, diagonal up-right
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      let count = 1; // Start with 1 for the current cell
      let line = [[lastY, lastX]];
      
      // Check in positive direction
      for (let i = 1; i < winLength; i++) {
        const x = lastX + dx * i;
        const y = lastY + dy * i;
        const key = coordToKey([x, y]);
        
        if (boardMap[key] !== player) break;
        count++;
        line.push([y, x]);
      }
      
      // Check in negative direction
      for (let i = 1; i < winLength; i++) {
        const x = lastX - dx * i;
        const y = lastY - dy * i;
        const key = coordToKey([x, y]);
        
        if (boardMap[key] !== player) break;
        count++;
        line.push([y, x]);
      }
      
      // Check if we have a winner
      if (count >= winLength) {
        setWinningLine(line);
        return player;
      }
    }
    
    return null;
  };
  
  // Shift the viewport in a direction
  const shiftViewport = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (isSliding) return; // Prevent multiple shifts while animation is in progress
    
    setIsSliding(true);
    
    // Apply the sliding animation class based on direction
    const boardElement = boardContainerRef.current?.querySelector('.board-grid');
    if (boardElement) {
      boardElement.classList.add('sliding');
      boardElement.classList.add(`sliding-${direction}`);
    }
    
    setTimeout(() => {
      setViewportCenter(prev => {
        const [x, y] = prev;
        switch (direction) {
          case 'up': return [x, y - 1];
          case 'down': return [x, y + 1];
          case 'left': return [x - 1, y];
          case 'right': return [x + 1, y];
          default: return prev;
        }
      });
      
      // Remove the animation classes after the state update
      setTimeout(() => {
        if (boardElement) {
          boardElement.classList.remove('sliding');
          boardElement.classList.remove(`sliding-${direction}`);
        }
        setIsSliding(false);
      }, 300);
    }, 50);
  };
  
  // Determine first player based on settings
  function getInitialPlayer(): 'X' | 'O' {
    if (!settings || settings.firstPlayer === 'random') {
      return Math.random() < 0.5 ? 'X' : 'O';
    }
    return settings.firstPlayer === 'player1' ? 'X' : 'O';
  }
  
  // Reset the game when settings change
  useEffect(() => {
    resetGame();
  }, [settings]);
  
  // AI move handling
  useEffect(() => {
    // When it's AI's turn and game is in progress
    if (gameStarted && 
        !winner && 
        !isDraw && 
        settings?.opponent === 'ai' && 
        currentPlayer === 'O') {
      
      // Add a small delay to make the AI move seem more natural
      const aiMoveTimer = setTimeout(() => {
        setWaitingForAI(true);
        
        // For the unrestricted mode, we need to create a virtual board from the boardMap
        // centered around the current viewport
        const virtualBoardSize = 7; // Slightly larger than viewport for better AI decisions
        const virtualBoard: Board = Array(virtualBoardSize).fill(null).map(() => Array(virtualBoardSize).fill(null));
        
        // Fill the virtual board with moves from boardMap
        const centerX = viewportCenter[0];
        const centerY = viewportCenter[1];
        const offset = Math.floor(virtualBoardSize / 2);
        
        for (let r = 0; r < virtualBoardSize; r++) {
          for (let c = 0; c < virtualBoardSize; c++) {
            const worldX = centerX - offset + c;
            const worldY = centerY - offset + r;
            const key = coordToKey([worldX, worldY]);
            virtualBoard[r][c] = boardMap[key] || null;
          }
        }
        
        // Get the AI move based on the virtual board
        const aiMove = getAIMove(
          virtualBoard, 
          currentPlayer, 
          {
            ...settings,
            boardSize: virtualBoardSize,
            winLength: winLength
          }, 
          'unrestricted'
        );
        
        if (aiMove) {
          const [row, col] = aiMove;
          // Convert AI move from virtual board coordinates to world coordinates
          const worldX = centerX - offset + col;
          const worldY = centerY - offset + row;
          handleCellClick([worldX, worldY]);
        } else {
          // If AI couldn't find a move in the current viewport, try a random empty cell
          const emptyCells = [];
          for (let r = 0; r < VIEWPORT_SIZE; r++) {
            for (let c = 0; c < VIEWPORT_SIZE; c++) {
              const worldCoord = viewportToWorld(r, c);
              const key = coordToKey(worldCoord);
              if (!boardMap[key]) {
                emptyCells.push(worldCoord);
              }
            }
          }
          
          if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            handleCellClick(randomCell);
          }
        }
        
        setWaitingForAI(false);
      }, 500);
      
      return () => clearTimeout(aiMoveTimer);
    }
  }, [gameStarted, winner, isDraw, settings?.opponent, currentPlayer, board]);
  
  // Timer logic
  useEffect(() => {
    if (!gameStarted || winner || isDraw || !settings?.timeLimit) return;
    
    if (timeLeft === 0) {
      // Time's up, switch player
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      setTimeLeft(settings.timeLimit);
      return;
    }
    
    const timer = setTimeout(() => {
      if (timeLeft !== null) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, winner, isDraw, settings?.timeLimit, currentPlayer]);
  
  // Move limit check
  useEffect(() => {
    if (moveLimit && moveCount >= moveLimit && !winner && !isDraw) {
      setIsDraw(true);
      
      // Track the game completion as a draw due to move limit
      if (user) {
        trackGameComplete(
          {
            gameId: 'unrestricted',
            variant: 'unrestricted',
            opponent: settings?.opponent || 'ai',
            difficulty: settings?.difficulty,
            result: 'draw'
          }, 
          user
        );
      }
    }
  }, [moveCount, moveLimit, winner, isDraw]);
  
  // Check if a cell is near the edge of the board
  const isNearEdge = (row: number, col: number): boolean => {
    const edgeDistance = 2; // How close to the edge to trigger expansion
    return (
      row < edgeDistance || 
      col < edgeDistance || 
      row >= board.length - edgeDistance || 
      col >= board.length - edgeDistance
    );
  };
  
  // Expand the board if a move is placed near the edge
  const expandBoardIfNeeded = (row: number, col: number): Board => {
    if (!isNearEdge(row, col) || board.length >= maxBoardSize) {
      return board;
    }
    
    // Determine which directions to expand
    const expandTop = row < 2;
    const expandLeft = col < 2;
    const expandBottom = row >= board.length - 2;
    const expandRight = col >= board.length - 2;
    
    // Calculate new dimensions, ensuring we don't exceed maxBoardSize
    const newRowsTop = expandTop ? Math.min(2, maxBoardSize - board.length) : 0;
    const newColsLeft = expandLeft ? Math.min(2, maxBoardSize - board.length) : 0;
    const newRowsBottom = expandBottom ? Math.min(2, maxBoardSize - board.length) : 0;
    const newColsRight = expandRight ? Math.min(2, maxBoardSize - board.length) : 0;
    
    const newSize = board.length + newRowsTop + newRowsBottom;
    
    // Create new expanded board
    const newBoard: Board = Array(newSize).fill(null).map(() => Array(newSize).fill(null));
    
    // Copy existing board contents to the new board
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        newBoard[r + newRowsTop][c + newColsLeft] = board[r][c];
      }
    }
    
    // Update visible area to include the new cells
    setVisibleArea(prev => ({
      startRow: prev.startRow - (expandTop ? newRowsTop : 0),
      startCol: prev.startCol - (expandLeft ? newColsLeft : 0),
      endRow: prev.endRow + (expandBottom ? newRowsBottom : 0),
      endCol: prev.endCol + (expandRight ? newColsRight : 0)
    }));
    
    return newBoard;
  };
  
  // This function is kept for compatibility but is no longer used directly
  // It's replaced by checkWinnerInBoardMap which works with the infinite grid
  const checkWinner = (board: Board, lastRow: number, lastCol: number): Player => {
    const size = board.length;
    const player = board[lastRow][lastCol];
    if (!player) return null;
    
    // Directions: horizontal, vertical, diagonal down-right, diagonal up-right
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      let count = 1; // Start with 1 for the current cell
      let line = [[lastRow, lastCol]];
      
      // Check in positive direction
      for (let i = 1; i < winLength; i++) {
        const r = lastRow + dr * i;
        const c = lastCol + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
        count++;
        line.push([r, c]);
      }
      
      // Check in negative direction
      for (let i = 1; i < winLength; i++) {
        const r = lastRow - dr * i;
        const c = lastCol - dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break;
        count++;
        line.push([r, c]);
      }
      
      // Check if we have a winner
      if (count >= winLength) {
        setWinningLine(line);
        return player;
      }
    }
    
    return null;
  };
  
  // Check for a draw - this is kept for compatibility but is no longer used directly
  const checkDraw = (board: Board): boolean => {
    // If move limit is set and reached, it's a draw
    if (moveLimit && moveCount >= moveLimit) {
      return true;
    }
    
    // If the board is completely full, it's a draw
    // This is unlikely in Unrestricted mode but included for completeness
    return board.every(row => row.every(cell => cell !== null));
  };
  
  // Check for a draw
  const checkDraw = (board: Board): boolean => {
    // If move limit is set and reached, it's a draw
    if (moveLimit && moveCount >= moveLimit) {
      return true;
    }
    
    // If the board is completely full, it's a draw
    // This is unlikely in Unrestricted mode but included for completeness
    return board.every(row => row.every(cell => cell !== null));
  };
  
  // This function is kept for compatibility with AI move handling
  // but delegates to handleCellClick for actual implementation
  const handleClick = (row: number, col: number) => {
    // Convert board coordinates to world coordinates
    // This is an approximation since we're working with a virtual infinite grid
    const worldX = viewportCenter[0] - Math.floor(VIEWPORT_SIZE/2) + col;
    const worldY = viewportCenter[1] - Math.floor(VIEWPORT_SIZE/2) + row;
    
    // Use the handleCellClick function with world coordinates
    handleCellClick([worldX, worldY]);
  };
  
  // Handle player resignation
  const handleResign = () => {
    if (winner || isDraw) return;
    
    // Set the winner as the opponent
    setWinner(currentPlayer === 'X' ? 'O' : 'X');
    
    // Track the game completion as a resignation
    if (user) {
      trackGameComplete(
        {
          gameId: 'unrestricted',
          variant: 'unrestricted',
          opponent: settings?.opponent || 'ai',
          difficulty: settings?.difficulty,
          result: 'resignation'
        }, 
        user
      );
    }
    
    toast({
      title: "Game Ended",
      description: `Player ${currentPlayer} has resigned. ${currentPlayer === 'X' ? 'O' : 'X'} wins!`,
    });
  };
  
  // Reset the game
  const resetGame = () => {
    setBoard(Array(initialBoardSize).fill(null).map(() => Array(initialBoardSize).fill(null)));
    setBoardMap({}); // Reset the boardMap for the infinite grid
    setVisibleArea({
      startRow: 0,
      startCol: 0,
      endRow: initialBoardSize - 1,
      endCol: initialBoardSize - 1
    });
    setViewportCenter([0, 0]); // Reset viewport to center coordinates
    setZoomLevel(1);
    setCurrentPlayer(getInitialPlayer());
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setGameStarted(false);
    setMoveCount(0);
    if (settings?.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
  };
  
  // Check if a cell is part of the winning line
  const isWinningCell = (coord: Coordinate) => {
    const [x, y] = coord;
    return winningLine.some(([r, c]) => r === y && c === x);
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomLevel < 2) {
      setZoomLevel(prev => prev + 0.2);
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomLevel > 0.4) {
      setZoomLevel(prev => prev - 0.2);
    }
  };
  
  // Handle panning start
  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPanning(true);
    
    // Get the client coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setLastPanPosition({ x: clientX, y: clientY });
  };
  
  // Handle panning move
  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    
    // Get the client coordinates
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate the delta
    const deltaX = clientX - lastPanPosition.x;
    const deltaY = clientY - lastPanPosition.y;
    
    // Update the visible area based on the delta and zoom level
    const panSpeed = 0.05 / zoomLevel;
    setVisibleArea(prev => {
      const newStartRow = Math.max(0, prev.startRow - deltaY * panSpeed);
      const newStartCol = Math.max(0, prev.startCol - deltaX * panSpeed);
      const newEndRow = Math.min(board.length - 1, prev.endRow - deltaY * panSpeed);
      const newEndCol = Math.min(board.length - 1, prev.endCol - deltaX * panSpeed);
      
      // Ensure we maintain the visible area size
      const visibleRows = prev.endRow - prev.startRow;
      const visibleCols = prev.endCol - prev.startCol;
      
      return {
        startRow: newStartRow,
        startCol: newStartCol,
        endRow: newStartRow + visibleRows,
        endCol: newStartCol + visibleCols
      };
    });
    
    setLastPanPosition({ x: clientX, y: clientY });
  };
  
  // Handle panning end
  const handlePanEnd = () => {
    setIsPanning(false);
  };
  
  // Handle arrow key navigation
  const handleArrowNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 2;
    
    setVisibleArea(prev => {
      switch (direction) {
        case 'up':
          return {
            ...prev,
            startRow: Math.max(0, prev.startRow - panAmount),
            endRow: Math.max(panAmount, prev.endRow - panAmount)
          };
        case 'down':
          return {
            ...prev,
            startRow: Math.min(board.length - 1 - (prev.endRow - prev.startRow), prev.startRow + panAmount),
            endRow: Math.min(board.length - 1, prev.endRow + panAmount)
          };
        case 'left':
          return {
            ...prev,
            startCol: Math.max(0, prev.startCol - panAmount),
            endCol: Math.max(panAmount, prev.endCol - panAmount)
          };
        case 'right':
          return {
            ...prev,
            startCol: Math.min(board.length - 1 - (prev.endCol - prev.startCol), prev.startCol + panAmount),
            endCol: Math.min(board.length - 1, prev.endCol + panAmount)
          };
        default:
          return prev;
      }
    });
  };
  
  // Render the game board
  const renderBoard = () => {
    // Create a 5x5 grid for the viewport
    const grid = [];
    
    for (let row = 0; row < VIEWPORT_SIZE; row++) {
      const gridRow = [];
      for (let col = 0; col < VIEWPORT_SIZE; col++) {
        // Convert viewport coordinates to world coordinates
        const worldCoord = viewportToWorld(row, col);
        const key = coordToKey(worldCoord);
        
        // Get the cell value from the board map
        const value = boardMap[key] || null;
        
        // Determine if this cell is at the edge of the viewport
        const isEdgeCell = row === 0 || col === 0 || row === VIEWPORT_SIZE - 1 || col === VIEWPORT_SIZE - 1;
        
        gridRow.push({ coord: worldCoord, value, isEdgeCell });
      }
      grid.push(gridRow);
    }
    
    return (
      <div 
        className="board-container relative overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '600px',
          maxHeight: '600px',
          margin: '0 auto'
        }}
        ref={boardContainerRef}
      >
        <div 
          className={cn(
            "board-grid grid bg-muted/30 p-4 rounded-lg shadow-md transition-all duration-300",
            isSliding ? "transform-gpu translate-y-1" : "",
            (winner || isDraw) ? "opacity-90" : ""
          )}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${VIEWPORT_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${VIEWPORT_SIZE}, 1fr)`,
            gap: '0.25rem',
            transform: isSliding ? 'scale(0.98)' : 'scale(1)',
            transition: 'transform 300ms ease-in-out'
          }}
        >
          {/* Coordinate labels for columns (top) */}
          <div className="absolute top-0 left-0 right-0 flex justify-between px-4 py-1 text-xs text-muted-foreground">
            {Array.from({ length: VIEWPORT_SIZE }).map((_, i) => {
              const worldX = viewportCenter[0] - Math.floor(VIEWPORT_SIZE/2) + i;
              return (
                <span key={`col-${i}`} className="text-center">{worldX}</span>
              );
            })}
          </div>
          
          {/* Coordinate labels for rows (left side) */}
          <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-4 px-1 text-xs text-muted-foreground">
            {Array.from({ length: VIEWPORT_SIZE }).map((_, i) => {
              const worldY = viewportCenter[1] - Math.floor(VIEWPORT_SIZE/2) + i;
              return (
                <span key={`row-${i}`} className="text-center">{worldY}</span>
              );
            })}
          </div>
          
          {grid.flat().map(({ coord, value, isEdgeCell }, index) => {
            const [x, y] = coord;
            
            return (
              <button
                key={`${x}-${y}`}
                className={cn(
                  "cell-hover aspect-square bg-background border rounded-md flex items-center justify-center text-lg font-bold transition-all duration-300 relative",
                  isEdgeCell ? "border-border" : "border-border/30",
                  gameStarted && !value && !winner && !isDraw && !waitingForAI ? "hover:border-primary/50 hover:bg-primary/5" : "",
                  isWinningCell(coord) ? "bg-primary/10 border-primary" : "",
                  x === 0 && y === 0 ? "bg-muted/20" : ""
                )}
                onClick={() => handleCellClick(coord)}
                disabled={!!value || !!winner || isDraw || waitingForAI || (settings?.opponent === 'ai' && currentPlayer === 'O')}
                aria-label={`Cell ${x},${y}`}
                style={{
                  boxShadow: isEdgeCell ? '0 0 0 1px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {value === 'X' && (
                  <span className="text-primary animate-x-mark text-2xl">X</span>
                )}
                {value === 'O' && (
                  <span className="text-accent-foreground animate-o-mark text-2xl">O</span>
                )}
                <span className="text-xs text-muted-foreground absolute bottom-1 right-1 opacity-70">{x},{y}</span>
                {x === 0 && y === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] text-primary font-medium">origin</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
        {settings?.timeLimit && gameStarted && !winner && !isDraw && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">Time left: {timeLeft}s</p>
            <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-1000"
                style={{ 
                  width: `${(timeLeft! / settings.timeLimit) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {moveLimit && (
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">Moves: {moveCount}/{moveLimit}</p>
            <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ 
                  width: `${(moveCount / moveLimit) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      
        {!gameStarted && (
          <div className="animate-fade-in">
            <p className="text-lg text-muted-foreground mb-4">
              Click on a cell to begin
            </p>
            <div className="text-sm text-muted-foreground mb-4">
              <p className="font-medium">Game Rules:</p>
              <p>Navigate the infinite board using directional buttons</p>
              <p>Get {winLength} in a row to win</p>
              <p>Center coordinates are (0,0)</p>
            </div>
          </div>
        )}
        
        {gameStarted && !winner && !isDraw && (
          <div className="animate-fade-in">
            <p className="text-xl font-medium mb-2">Current player</p>
            <div 
              className={cn(
                "w-12 h-12 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-2xl",
                currentPlayer === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
              )}
            >
              {currentPlayer}
            </div>
            {waitingForAI && (
              <p className="text-sm text-muted-foreground mt-2">AI is thinking...</p>
            )}
          </div>
        )}
        
        {winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">Winner</p>
            <div 
              className={cn(
                "w-14 h-14 mx-auto border-2 rounded-md flex items-center justify-center font-bold text-3xl",
                winner === 'X' ? "border-primary text-primary" : "border-accent-foreground text-accent-foreground"
              )}
            >
              {winner}
            </div>
          </div>
        )}
        
        {isDraw && !winner && (
          <div className="animate-scale-in">
            <p className="text-xl font-medium mb-2">
              Draw!
            </p>
            <p className="text-muted-foreground">
              {moveLimit && moveCount >= moveLimit 
                ? "Move limit reached" 
                : "No more moves available"}
            </p>
          </div>
        )}
      </div>
      
      {/* Navigation Controls */}
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-[200px] mx-auto">
        <div className="col-start-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-full aspect-square shadow-sm hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => shiftViewport('up')}
            title="Move Up"
            disabled={isSliding}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-full aspect-square shadow-sm hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={() => shiftViewport('left')}
          title="Move Left"
          disabled={isSliding}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="col-start-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-full aspect-square shadow-sm hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => shiftViewport('down')}
            title="Move Down"
            disabled={isSliding}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="col-start-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-full aspect-square shadow-sm hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => shiftViewport('right')}
            title="Move Right"
            disabled={isSliding}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Current Viewport Info */}
      <div className="text-center mb-4 p-3 bg-muted/20 rounded-lg border border-border/50 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary/70"></div>
          <h3 className="text-sm font-medium">Viewport Information</h3>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Center: <span className="text-primary">({viewportCenter[0]}, {viewportCenter[1]})</span></p>
          <p>Viewing area: <span className="font-mono">({viewportCenter[0] - Math.floor(VIEWPORT_SIZE/2)},{viewportCenter[1] - Math.floor(VIEWPORT_SIZE/2)})</span> to <span className="font-mono">({viewportCenter[0] + Math.floor(VIEWPORT_SIZE/2)},{viewportCenter[1] + Math.floor(VIEWPORT_SIZE/2)})</span></p>
          <p className="text-[10px] opacity-70 mt-1">Use the navigation controls to explore the infinite grid</p>
        </div>
      </div>
      
      {/* Game Board */}
      <div className="mb-6 h-[400px]">
        {renderBoard()}
      </div>
      
      {/* Game Controls */}
      <div className="mt-6 flex justify-center space-x-4">
        <Button 
          onClick={resetGame} 
          variant="outline" 
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Restart Game
        </Button>
        
        {gameStarted && !winner && !isDraw && (
          <Button 
            onClick={handleResign} 
            variant="destructive" 
            className="gap-2"
          >
            <Flag className="w-4 h-4" />
            Resign
          </Button>
        )}
      </div>
      
      {/* Game Info */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Board: Infinite</p>
        <p>Win Condition: {winLength} in a row</p>
        {moveLimit && <p>Move Limit: {moveLimit}</p>}
        <p>Total Moves Placed: {Object.keys(boardMap).length}</p>
      </div>
    </div>
  );
};

export default UnrestrictedGame;