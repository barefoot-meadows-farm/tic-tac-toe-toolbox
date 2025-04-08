import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, ZoomIn, ZoomOut, Flag, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { trackGameComplete } from '@/utils/analytics';
import { getAIMove } from '@/utils/gameAI';

type Player = 'X' | 'O' | null;
type Board = (Player)[][];

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

const UnrestrictedGame: React.FC<UnrestrictedGameProps> = ({ 
  className,
  settings
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  
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
        
        // Get the AI move based on the current board state and settings
        const aiMove = getAIMove(
          board, 
          currentPlayer, 
          {
            ...settings,
            boardSize: board.length,
            winLength: winLength
          }, 
          'unrestricted'
        );
        
        if (aiMove) {
          const [row, col] = aiMove;
          handleClick(row, col);
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
  
  // Check for a winner
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
  
  // Handle cell click
  const handleClick = (row: number, col: number) => {
    if (board[row][col] || winner || isDraw || waitingForAI) {
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
      if (settings?.timeLimit) {
        setTimeLeft(settings.timeLimit);
      }
    }
    
    // Create a new board with the move
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    
    // Expand the board if the move is near the edge
    const expandedBoard = expandBoardIfNeeded(row, col);
    
    // Apply the move to the expanded board
    if (expandedBoard !== board) {
      expandedBoard[row + (row < 2 ? 2 : 0)][col + (col < 2 ? 2 : 0)] = currentPlayer;
      setBoard(expandedBoard);
    } else {
      setBoard(newBoard);
    }
    
    // Increment move counter
    setMoveCount(prev => prev + 1);
    
    // Check for winner
    const potentialWinner = checkWinner(newBoard, row, col);
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
    if (checkDraw(newBoard)) {
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
    setVisibleArea({
      startRow: 0,
      startCol: 0,
      endRow: initialBoardSize - 1,
      endCol: initialBoardSize - 1
    });
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
  const isWinningCell = (row: number, col: number) => {
    return winningLine.some(([r, c]) => r === row && c === col);
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
  
  // Render the visible portion of the board
  const renderBoard = () => {
    // Calculate the visible rows and columns based on the visible area and zoom level
    const visibleRows = Math.ceil((visibleArea.endRow - visibleArea.startRow + 1) / zoomLevel);
    const visibleCols = Math.ceil((visibleArea.endCol - visibleArea.startCol + 1) / zoomLevel);
    
    // Calculate the start and end indices for the visible portion
    const startRow = Math.floor(visibleArea.startRow);
    const startCol = Math.floor(visibleArea.startCol);
    const endRow = Math.min(board.length - 1, startRow + visibleRows);
    const endCol = Math.min(board.length - 1, startCol + visibleCols);
    
    // Create an array of visible rows and columns
    const visibleBoard = [];
    for (let row = startRow; row <= endRow; row++) {
      const visibleRow = [];
      for (let col = startCol; col <= endCol; col++) {
        visibleRow.push({ row, col, value: board[row][col] });
      }
      visibleBoard.push(visibleRow);
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
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
      >
        <div 
          className={cn(
            "board-grid grid bg-muted/30 p-4 rounded-lg shadow-sm",
            (winner || isDraw) ? "opacity-90" : ""
          )}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${visibleBoard[0]?.length || 1}, 1fr)`,
            gridTemplateRows: `repeat(${visibleBoard.length || 1}, 1fr)`,
            gap: '0.25rem',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left'
          }}
        >
          {visibleBoard.flat().map(({ row, col, value }) => (
            <button
              key={`${row}-${col}`}
              className={cn(
                "cell-hover aspect-square bg-background border border-border/50 rounded-md flex items-center justify-center text-lg font-bold transition-all duration-300",
                gameStarted && !value && !winner && !isDraw && !waitingForAI ? "hover:border-primary/50" : "",
                isWinningCell(row, col) ? "bg-primary/10 border-primary" : ""
              )}
              onClick={() => handleClick(row, col)}
              disabled={!!value || !!winner || isDraw || waitingForAI || (settings?.opponent === 'ai' && currentPlayer === 'O')}
              aria-label={`Cell ${row}-${col}`}
            >
              {value === 'X' && (
                <span className="text-primary animate-x-mark">X</span>
              )}
              {value === 'O' && (
                <span className="text-accent-foreground animate-o-mark">O</span>
              )}
            </button>
          ))}
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
              <p>Board expands as you play near the edges</p>
              <p>Get {winLength} in a row to win</p>
              <p>Use zoom and pan controls to navigate</p>
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
      <div className="flex justify-center space-x-2 mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomIn}
          disabled={zoomLevel >= 2}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.4}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleArrowNavigation('up')}
          title="Pan Up"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleArrowNavigation('down')}
          title="Pan Down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleArrowNavigation('left')}
          title="Pan Left"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => handleArrowNavigation('right')}
          title="Pan Right"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
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
        <p>Board Size: {board.length}x{board.length}</p>
        <p>Win Condition: {winLength} in a row</p>
        {moveLimit && <p>Move Limit: {moveLimit}</p>}
      </div>
    </div>
  );
};

export default UnrestrictedGame;