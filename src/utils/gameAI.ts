import { GameSettings } from '@/components/GameStart';

// Player types
type Player = 'X' | 'O' | null;
type Board = (Player)[][];

// Enums for game configuration
enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

enum GameMode {
  TRADITIONAL = 'traditional',
  MISERE = 'misere',
  FERAL = 'feral',
  NUMERICAL = 'numerical'
}

// Base GameBoard class
class GameBoard {
  size: number;
  cells: Board;

  constructor(size: number = 3) {
    this.size = size;
    this.reset();
  }

  reset(): void {
    this.cells = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
  }

  makeMove(row: number, col: number, player: Player, gameMode: GameMode = GameMode.TRADITIONAL): boolean {
    if (!this.isValidMove(row, col, player, gameMode)) {
      return false;
    }
    this.cells[row][col] = player;
    return true;
  }

  isValidMove(row: number, col: number, player: Player = null, gameMode: GameMode = GameMode.TRADITIONAL): boolean {
    // First check if move is in bounds
    if (!(0 <= row && row < this.size && 0 <= col && col < this.size)) {
      return false;
    }

    // For traditional mode (and most others), cell must be empty
    if (gameMode !== GameMode.FERAL) {
      return this.cells[row][col] === null;
    }

    // Feral mode logic - must provide player to validate
    if (player === null) {
      return false;
    }

    // In Feral mode, you can play in empty cells OR overwrite opponent's moves
    const currentCell = this.cells[row][col];
    return (currentCell === null || 
            (currentCell !== player && currentCell !== null));
  }

  getEmptyCells(): [number, number][] {
    const emptyCells: [number, number][] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.cells[row][col] === null) {
          emptyCells.push([row, col]);
        }
      }
    }
    return emptyCells;
  }

  isFull(): boolean {
    return this.getEmptyCells().length === 0;
  }

  clone(): GameBoard {
    const newBoard = new GameBoard(this.size);
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        newBoard.cells[row][col] = this.cells[row][col];
      }
    }
    return newBoard;
  }
}

// Abstract GameRules interface
abstract class GameRules {
  abstract checkWinner(board: GameBoard, lastMove?: [number, number]): Player;
  abstract evaluateBoard(board: GameBoard, player: Player): number;
  abstract isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean;
}

// Traditional Tic-Tac-Toe Rules
class TraditionalRules extends GameRules {
  checkWinner(board: GameBoard, lastMove?: [number, number]): Player {
    const size = board.size;
    
    // Check rows
    for (let row = 0; row < size; row++) {
      if (board.cells[row][0] !== null && 
          board.cells[row].every(cell => cell === board.cells[row][0])) {
        return board.cells[row][0];
      }
    }
    
    // Check columns
    for (let col = 0; col < size; col++) {
      if (board.cells[0][col] !== null) {
        let allSame = true;
        for (let row = 1; row < size; row++) {
          if (board.cells[row][col] !== board.cells[0][col]) {
            allSame = false;
            break;
          }
        }
        if (allSame) {
          return board.cells[0][col];
        }
      }
    }
    
    // Check main diagonal
    if (board.cells[0][0] !== null) {
      let allSame = true;
      for (let i = 1; i < size; i++) {
        if (board.cells[i][i] !== board.cells[0][0]) {
          allSame = false;
          break;
        }
      }
      if (allSame) {
        return board.cells[0][0];
      }
    }
    
    // Check other diagonal
    if (board.cells[0][size - 1] !== null) {
      let allSame = true;
      for (let i = 1; i < size; i++) {
        if (board.cells[i][size - 1 - i] !== board.cells[0][size - 1]) {
          allSame = false;
          break;
        }
      }
      if (allSame) {
        return board.cells[0][size - 1];
      }
    }
    
    return null;
  }

  evaluateBoard(board: GameBoard, player: Player): number {
    const winner = this.checkWinner(board);
    
    if (winner === player) {
      return 10;
    } else if (winner !== null) {  // Other player won
      return -10;
    } else {
      return 0;
    }
  }

  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // Create a temporary board with the move
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    // Check if this results in a win
    const winner = this.checkWinner(tempBoard);
    return winner === player;
  }
}

// Misere Rules: Win by avoiding three in a row
class MisereRules extends TraditionalRules {
  checkWinner(board: GameBoard, lastMove?: [number, number]): Player {
    // In Misere, the player who completes a line loses
    const lineFormer = super.checkWinner(board, lastMove);
    if (lineFormer === null) {
      return null; // No line formed yet
    }
    // Return the opposite player as winner since forming a line loses in Misere
    return lineFormer === 'X' ? 'O' : 'X';
  }

  evaluateBoard(board: GameBoard, player: Player): number {
    const winner = this.checkWinner(board);
    if (winner === player) {
      return 10; // Player wins (opponent formed a line)
    } else if (winner !== null) {
      return -10; // Player loses (formed a line)
    }
    return 0; // Game continues
  }

  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // A winning move in Misere is one that forces the opponent to complete a line
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    // If this move forms a line, it's a losing move
    if (super.checkWinner(tempBoard) === player) {
      return false;
    }
    
    // Check if this move forces opponent to complete a line on their next turn
    const opponent = player === 'X' ? 'O' : 'X';
    const emptyCells = tempBoard.getEmptyCells();
    
    // If no empty cells left and no line formed, it's a draw
    if (emptyCells.length === 0) {
      return false;
    }
    
    // Check if ALL opponent's possible next moves would form a line
    return emptyCells.every(([r, c]) => {
      const nextBoard = tempBoard.clone();
      nextBoard.makeMove(r, c, opponent);
      return super.checkWinner(nextBoard) === opponent;
    });
  }
}

// Numerical Rules: Uses numbers instead of X/O
class NumericalRules extends GameRules {
  xValues: number[];
  oValues: number[];
  
  constructor() {
    super();
    this.xValues = [1, 3, 5, 7, 9];  // Odd numbers for X
    this.oValues = [2, 4, 6, 8];     // Even numbers for O
  }
  
  // Helper to convert the board to a numerical representation
  getBoardNumericalValues(board: GameBoard): number[][] {
    const numBoard = Array(board.size).fill(0).map(() => Array(board.size).fill(0));
    
    // Track which values have been used
    const usedXValues: Set<number> = new Set();
    const usedOValues: Set<number> = new Set();
    let nextXIndex = 0;
    let nextOIndex = 0;
    
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.cells[row][col] === 'X') {
          // Assign the next available X value
          while (usedXValues.has(this.xValues[nextXIndex])) {
            nextXIndex = (nextXIndex + 1) % this.xValues.length;
          }
          numBoard[row][col] = this.xValues[nextXIndex];
          usedXValues.add(this.xValues[nextXIndex]);
          nextXIndex = (nextXIndex + 1) % this.xValues.length;
        } else if (board.cells[row][col] === 'O') {
          // Assign the next available O value
          while (usedOValues.has(this.oValues[nextOIndex])) {
            nextOIndex = (nextOIndex + 1) % this.oValues.length;
          }
          numBoard[row][col] = this.oValues[nextOIndex];
          usedOValues.add(this.oValues[nextOIndex]);
          nextOIndex = (nextOIndex + 1) % this.oValues.length;
        }
      }
    }
    
    return numBoard;
  }
  
  checkWinner(board: GameBoard): Player {
    const size = board.size;
    const numBoard = this.getBoardNumericalValues(board);
    
    // Check for magic square (sum of 15) in any row, column, or diagonal
    // Check rows
    for (let row = 0; row < size; row++) {
      let sum = 0;
      let hasPlayer: Player = null;
      let allSamePlayer = true;
      
      for (let col = 0; col < size; col++) {
        sum += numBoard[row][col];
        if (hasPlayer === null && board.cells[row][col] !== null) {
          hasPlayer = board.cells[row][col];
        } else if (hasPlayer !== board.cells[row][col] && board.cells[row][col] !== null) {
          allSamePlayer = false;
        }
      }
      
      if (sum === 15 && allSamePlayer && hasPlayer !== null) {
        return hasPlayer;
      }
    }
    
    // Check columns
    for (let col = 0; col < size; col++) {
      let sum = 0;
      let hasPlayer: Player = null;
      let allSamePlayer = true;
      
      for (let row = 0; row < size; row++) {
        sum += numBoard[row][col];
        if (hasPlayer === null && board.cells[row][col] !== null) {
          hasPlayer = board.cells[row][col];
        } else if (hasPlayer !== board.cells[row][col] && board.cells[row][col] !== null) {
          allSamePlayer = false;
        }
      }
      
      if (sum === 15 && allSamePlayer && hasPlayer !== null) {
        return hasPlayer;
      }
    }
    
    // Check diagonals
    // Main diagonal
    let sum = 0;
    let hasPlayer: Player = null;
    let allSamePlayer = true;
    
    for (let i = 0; i < size; i++) {
      sum += numBoard[i][i];
      if (hasPlayer === null && board.cells[i][i] !== null) {
        hasPlayer = board.cells[i][i];
      } else if (hasPlayer !== board.cells[i][i] && board.cells[i][i] !== null) {
        allSamePlayer = false;
      }
    }
    
    if (sum === 15 && allSamePlayer && hasPlayer !== null) {
      return hasPlayer;
    }
    
    // Other diagonal
    sum = 0;
    hasPlayer = null;
    allSamePlayer = true;
    
    for (let i = 0; i < size; i++) {
      sum += numBoard[i][size - 1 - i];
      if (hasPlayer === null && board.cells[i][size - 1 - i] !== null) {
        hasPlayer = board.cells[i][size - 1 - i];
      } else if (hasPlayer !== board.cells[i][size - 1 - i] && board.cells[i][size - 1 - i] !== null) {
        allSamePlayer = false;
      }
    }
    
    if (sum === 15 && allSamePlayer && hasPlayer !== null) {
      return hasPlayer;
    }
    
    return null;
  }
  
  evaluateBoard(board: GameBoard, player: Player): number {
    // Check for winner
    const winner = this.checkWinner(board);
    if (winner === player) {
      return 10;
    } else if (winner !== null) {
      return -10;
    }
    
    // If no winner, calculate potential for forming magic squares
    const numBoard = this.getBoardNumericalValues(board);
    let score = 0;
    
    // Check potential in rows
    for (let row = 0; row < board.size; row++) {
      let sum = 0;
      let emptyCells = 0;
      let playerCells = 0;
      
      for (let col = 0; col < board.size; col++) {
        if (board.cells[row][col] === null) {
          emptyCells++;
        } else if (board.cells[row][col] === player) {
          sum += numBoard[row][col];
          playerCells++;
        }
      }
      
      // If 2 player cells and 1 empty, and potential for magic square
      if (playerCells === 2 && emptyCells === 1 && (15 - sum) > 0) {
        score += 3;
      }
    }
    
    // Similar checks for columns and diagonals...
    // (Additional evaluation logic for columns and diagonals would go here)
    
    return score;
  }
  
  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // Create a temporary board with the move
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    // Check if this results in a win
    const winner = this.checkWinner(tempBoard);
    return winner === player;
  }
}

// Feral Rules: Allows overwriting opponent's moves
class FeralRules extends TraditionalRules {
  constructor() {
    super();
  }
  
  isValidMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // Check if the move is in bounds
    if (!(0 <= row && row < board.size && 0 <= col && col < board.size)) {
      return false;
    }
    
    // Get current cell value
    const current = board.cells[row][col];
    
    // Valid if empty or contains opponent's mark
    return current === null || (current !== player && current !== null);
  }
  
  evaluateBoard(board: GameBoard, player: Player): number {
    // Get basic evaluation
    const basicEval = super.evaluateBoard(board, player);
    
    // In Feral mode, having more pieces on the board is slightly less valuable
    // since they can be overwritten, but controlling key positions still matters
    
    // Count player's pieces vs opponent's pieces to determine board control
    const opponent = player === 'X' ? 'O' : 'X';
    let playerCount = 0;
    let opponentCount = 0;
    let playerPositionScore = 0;
    let opponentPositionScore = 0;
    
    const center = Math.floor(board.size / 2);
    const isCorner = (r: number, c: number) => {
      return (r === 0 || r === board.size - 1) && (c === 0 || c === board.size - 1);
    };
    
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.cells[row][col] === player) {
          playerCount++;
          // Add position-based scoring (aligned with Traditional mode)
          if (row === center && col === center) {
            playerPositionScore += 3; // Center is most valuable
          } else if (isCorner(row, col)) {
            playerPositionScore += 2; // Corners are next most valuable
          } else {
            playerPositionScore += 1; // Edges are least valuable
          }
        } else if (board.cells[row][col] === opponent) {
          opponentCount++;
          // Add position-based scoring for opponent
          if (row === center && col === center) {
            opponentPositionScore += 3;
          } else if (isCorner(row, col)) {
            opponentPositionScore += 2;
          } else {
            opponentPositionScore += 1;
          }
        }
      }
    }
    
    // Calculate position advantage
    const positionAdvantage = (playerPositionScore - opponentPositionScore) * 0.3;
    
    // Give a small bonus for controlling more of the board
    const controlBonus = (playerCount - opponentCount) * 0.5;
    
    return basicEval + controlBonus + positionAdvantage;
  }
}

// Abstract AI Strategy interface
abstract class AIStrategy {
  abstract getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null;
}

// Easy AI: Random Moves
class EasyAI extends AIStrategy {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    // Get valid moves based on game mode
    const validMoves = this.getValidMoves(board, player, rules);
    if (validMoves.length === 0) {
      return null;  // No valid moves
    }
    
    // Add a response delay of 0.5-0.9 seconds to simulate thinking time
    // This is implemented client-side, so we just return the move
    // The actual delay will be applied when rendering
    
    // Determine if we should attempt a strategic move (20% chance) or random move (80% chance)
    const attemptStrategicMove = Math.random() < 0.2;
    
    if (attemptStrategicMove) {
      // Try to find a winning move or blocking move
      const smartMove = this.findSmartMove(board, player, rules);
      if (smartMove) {
        return smartMove;
      }
    }
    
    // Make a random move with equal position preference
    return this.makeRandomMove(validMoves, board.size);
  }
  
  private getValidMoves(board: GameBoard, player: Player, rules: GameRules): [number, number][] {
    if (rules instanceof FeralRules) {
      // For Feral mode, we need to check each cell individually
      const validMoves: [number, number][] = [];
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (rules.isValidMove(board, row, col, player)) {
            validMoves.push([row, col]);
          }
        }
      }
      return validMoves;
    } else {
      // For traditional modes, only empty cells are valid
      return board.getEmptyCells();
    }
  }
  
  private findSmartMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const opponent = player === 'X' ? 'O' : 'X';
    const validMoves = this.getValidMoves(board, player, rules);
    
    // Check for winning moves (with 50% chance of taking it)
    if (Math.random() < 0.5) {
      for (const [row, col] of validMoves) {
        if (rules.isWinningMove(board, row, col, player)) {
          return [row, col];
        }
      }
    }
    
    // Check for blocking moves (with 40% chance of blocking)
    if (Math.random() < 0.4) {
      for (const [row, col] of validMoves) {
        // Create a temporary board to test if opponent would win
        const tempBoard = board.clone();
        if (rules instanceof FeralRules) {
          tempBoard.makeMove(row, col, opponent, GameMode.FERAL);
        } else {
          tempBoard.makeMove(row, col, opponent);
        }
        
        // Check if this would be a win for the opponent
        const winner = rules.checkWinner(tempBoard);
        if (winner === opponent) {
          return [row, col]; // Block the opponent
        }
      }
    }
    
    return null; // No smart move found or chance failed
  }
  
  private makeRandomMove(validMoves: [number, number][], boardSize: number): [number, number] {
    // Categorize moves by position type
    const centerMoves: [number, number][] = [];
    const cornerMoves: [number, number][] = [];
    const edgeMoves: [number, number][] = [];
    
    const center = Math.floor(boardSize / 2);
    
    for (const [row, col] of validMoves) {
      // Check if this is a center move
      if (row === center && col === center) {
        centerMoves.push([row, col]);
      }
      // Check if this is a corner move
      else if ((row === 0 || row === boardSize - 1) && (col === 0 || col === boardSize - 1)) {
        cornerMoves.push([row, col]);
      }
      // Otherwise it's an edge move
      else {
        edgeMoves.push([row, col]);
      }
    }
    
    // Equal position preference (33/33/34% for center/corners/edges)
    const positionRoll = Math.random();
    
    if (positionRoll < 0.33 && centerMoves.length > 0) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    } else if (positionRoll < 0.66 && cornerMoves.length > 0) {
      return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
    } else if (edgeMoves.length > 0) {
      return edgeMoves[Math.floor(Math.random() * edgeMoves.length)];
    }
    
    // If the preferred position type is empty, choose from all valid moves
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

}

// Medium AI: Basic Strategy
class MediumAI extends AIStrategy {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    // Find opponent player
    const opponent = player === 'X' ? 'O' : 'X';
    
    // Handle Feral mode specially
    if (rules instanceof FeralRules) {
      return this.getFeralMove(board, player, rules, opponent);
    }
    
    // Standard mode logic
    const emptyCells = board.getEmptyCells();
    if (emptyCells.length === 0) {
      return null;
    }
    
    // 50/50 random vs strategic move selection
    const useStrategicMove = Math.random() < 0.5;
    
    if (useStrategicMove) {
      // Try strategic moves with probabilistic decision-making
      
      // 65% chance to make winning moves
      if (Math.random() < 0.65) {
        for (const [row, col] of emptyCells) {
          if (rules.isWinningMove(board, row, col, player)) {
            return [row, col];
          }
        }
      }
      
      // 65% chance to block winning moves
      if (Math.random() < 0.65) {
        for (const [row, col] of emptyCells) {
          if (rules.isWinningMove(board, row, col, opponent)) {
            return [row, col];
          }
        }
      }
      
      // 50% chance to create/block forks with single-move look-ahead
      if (Math.random() < 0.5) {
        // Check for fork creation
        const forkMove = this.findForkMove(board, player, rules);
        if (forkMove) {
          return forkMove;
        }
        
        // Check for blocking opponent's fork
        const blockForkMove = this.findForkMove(board, opponent, rules);
        if (blockForkMove) {
          return blockForkMove;
        }
      }
      
      // 60% chance to take center when available
      const center = Math.floor(board.size / 2);
      if (Math.random() < 0.6 && board.isValidMove(center, center)) {
        return [center, center];
      }
      
      // 50% chance to prioritize corners
      if (Math.random() < 0.5) {
        const corners = [
          [0, 0], 
          [0, board.size - 1], 
          [board.size - 1, 0], 
          [board.size - 1, board.size - 1]
        ] as [number, number][];
        
        const availableCorners = corners.filter(
          ([r, c]) => board.isValidMove(r, c)
        );
        
        if (availableCorners.length > 0) {
          return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
      }
      
      // 10% chance for edge selection
      if (Math.random() < 0.1) {
        const edges: [number, number][] = [];
        for (let i = 0; i < board.size; i++) {
          // Top and bottom edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (board.isValidMove(0, i)) edges.push([0, i]);
            if (board.isValidMove(board.size - 1, i)) edges.push([board.size - 1, i]);
          }
          // Left and right edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (board.isValidMove(i, 0)) edges.push([i, 0]);
            if (board.isValidMove(i, board.size - 1)) edges.push([i, board.size - 1]);
          }
        }
        
        if (edges.length > 0) {
          return edges[Math.floor(Math.random() * edges.length)];
        }
      }
    }
    
    // If no strategic move was made or if random move was chosen,
    // take a random move from all empty cells
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Helper method to find fork moves (two-way winning threats)
  private findForkMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const emptyCells = board.getEmptyCells();
    
    for (const [row, col] of emptyCells) {
      // Create a temporary board with this move
      const tempBoard = board.clone();
      tempBoard.makeMove(row, col, player);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (rules.isWinningMove(tempBoard, r, c, player)) {
          winningLines++;
        }
      }
      
      // If there are at least two winning threats, this is a fork
      if (winningLines >= 2) {
        return [row, col];
      }
    }
    
    return null;
  }
  
  private getFeralMove(
    board: GameBoard, 
    player: Player, 
    rules: FeralRules, 
    opponent: Player
  ): [number, number] | null {
    // Get all valid moves (including overwrites)
    const validMoves: [number, number][] = [];
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (rules.isValidMove(board, row, col, player)) {
          validMoves.push([row, col]);
        }
      }
    }
    
    if (validMoves.length === 0) {
      return null;
    }
    
    // 50/50 random vs strategic move selection (aligned with Traditional mode)
    const useStrategicMove = Math.random() < 0.5;
    
    if (useStrategicMove) {
      // Try strategic moves with probabilistic decision-making
      
      // 65% chance to make winning moves (aligned with Traditional mode)
      if (Math.random() < 0.65) {
        for (const [row, col] of validMoves) {
          if (rules.isWinningMove(board, row, col, player)) {
            return [row, col];
          }
        }
      }
      
      // 65% chance to block winning moves (aligned with Traditional mode)
      if (Math.random() < 0.65) {
        for (const [row, col] of validMoves) {
          // Check if this would be a winning move for the opponent
          const tempBoard = board.clone();
          tempBoard.makeMove(row, col, opponent, GameMode.FERAL);
          if (rules.checkWinner(tempBoard) === opponent) {
            return [row, col]; // Block the opponent
          }
        }
      }
      
      // 50% chance to create/block forks with single-move look-ahead (aligned with Traditional mode)
      if (Math.random() < 0.5) {
        // Check for fork creation
        const forkMove = this.findForkMove(board, player, rules);
        if (forkMove) {
          return forkMove;
        }
        
        // Check for blocking opponent's fork
        const blockForkMove = this.findForkMove(board, opponent, rules);
        if (blockForkMove) {
          return blockForkMove;
        }
      }
      
      // 60% chance to take center when available (aligned with Traditional mode)
      const center = Math.floor(board.size / 2);
      if (Math.random() < 0.6) {
        // In Feral mode, we can take center even if occupied by opponent
        if (board.cells[center][center] === null || board.cells[center][center] === opponent) {
          return [center, center];
        }
      }
      
      // 50% chance to prioritize corners (aligned with Traditional mode)
      if (Math.random() < 0.5) {
        const corners = [
          [0, 0], 
          [0, board.size - 1], 
          [board.size - 1, 0], 
          [board.size - 1, board.size - 1]
        ] as [number, number][];
        
        // Filter corners that are valid moves (empty or opponent's)
        const availableCorners = corners.filter(
          ([r, c]) => board.cells[r][c] === null || board.cells[r][c] === opponent
        );
        
        if (availableCorners.length > 0) {
          return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
      }
      
      // 10% chance for edge selection (aligned with Traditional mode)
      if (Math.random() < 0.1) {
        const edges: [number, number][] = [];
        for (let i = 0; i < board.size; i++) {
          // Top and bottom edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (board.cells[0][i] === null || board.cells[0][i] === opponent) edges.push([0, i]);
            if (board.cells[board.size - 1][i] === null || board.cells[board.size - 1][i] === opponent) edges.push([board.size - 1, i]);
          }
          // Left and right edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (board.cells[i][0] === null || board.cells[i][0] === opponent) edges.push([i, 0]);
            if (board.cells[i][board.size - 1] === null || board.cells[i][board.size - 1] === opponent) edges.push([i, board.size - 1]);
          }
        }
        
        if (edges.length > 0) {
          return edges[Math.floor(Math.random() * edges.length)];
        }
      }
    }
    
    // If no strategic move was made or if random move was chosen,
    // take a random move from all valid moves
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
      return [center, center];
    }
    
    // Try to take corners by overwriting if needed
    for (const [row, col] of corners) {
      if (board.cells[row][col] === opponent) {
        return [row, col];
      }
    }
    
    // 4. Take empty center or corners
    if (board.cells[center][center] === null) {
      return [center, center];
    }
    
    const emptyCorners = corners.filter(([r, c]) => board.cells[r][c] === null);
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    
    // 5. Take a random valid move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

// Hard AI: Minimax Algorithm
class HardAI extends AIStrategy {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const opponent = player === 'X' ? 'O' : 'X';
    
    // Get valid moves based on game mode
    const validMoves = this.getValidMoves(board, player, rules);
    if (validMoves.length === 0) {
      return null;
    }
    
    // Handle Feral mode specially
    if (rules instanceof FeralRules) {
      return this.getFeralMove(board, player, rules, opponent);
    }
    
    // Strategic vs random move selection (90/10 split)
    const useStrategicMove = Math.random() < 0.9;
    
    if (useStrategicMove) {
      // 90% chance to make winning moves
      if (Math.random() < 0.9) {
        for (const [row, col] of validMoves) {
          if (rules.isWinningMove(board, row, col, player)) {
            return [row, col];
          }
        }
      }
      
      // 90% chance to block opponent's winning moves
      if (Math.random() < 0.9) {
        for (const [row, col] of validMoves) {
          if (rules.isWinningMove(board, row, col, opponent)) {
            return [row, col];
          }
        }
      }
      
      // 90% chance to create or block forks with two-move look-ahead
      if (Math.random() < 0.9) {
        // Check for fork creation
        const forkMove = this.findAdvancedForkMove(board, player, rules);
        if (forkMove) {
          return forkMove;
        }
        
        // Check for blocking opponent's fork
        const blockForkMove = this.findAdvancedForkMove(board, opponent, rules);
        if (blockForkMove) {
          return blockForkMove;
        }
      }
      
      // Position preference strategy
      return this.getStrategicPositionMove(board, validMoves);
    }
    
    // Random move (10% chance)
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  private getValidMoves(board: GameBoard, player: Player, rules: GameRules): [number, number][] {
    if (rules instanceof FeralRules) {
      // For Feral mode, we need to check each cell individually
      const validMoves: [number, number][] = [];
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (rules.isValidMove(board, row, col, player)) {
            validMoves.push([row, col]);
          }
        }
      }
      return validMoves;
    } else {
      // For traditional modes, only empty cells are valid
      return board.getEmptyCells();
    }
  }
  
  private createNewBoardWithMove(
    board: GameBoard, 
    row: number, 
    col: number, 
    player: Player, 
    rules: GameRules
  ): GameBoard {
    const newBoard = board.clone();
    
    // Apply the move using the appropriate game mode
    if (rules instanceof FeralRules) {
      newBoard.makeMove(row, col, player, GameMode.FERAL);
    } else {
      newBoard.makeMove(row, col, player);
    }
    
    return newBoard;
  }
  
  // Advanced fork detection with two-move look-ahead
  private findAdvancedForkMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const emptyCells = board.getEmptyCells();
    const opponent = player === 'X' ? 'O' : 'X';
    
    // First, check for immediate fork opportunities
    for (const [row, col] of emptyCells) {
      // Create a temporary board with this move
      const tempBoard = this.createNewBoardWithMove(board, row, col, player, rules);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (rules.isWinningMove(tempBoard, r, c, player)) {
          winningLines++;
        }
      }
      
      // If there are at least two winning threats, this is a fork
      if (winningLines >= 2) {
        return [row, col];
      }
    }
    
    // Second, look two moves ahead for potential forks
    for (const [row1, col1] of emptyCells) {
      // First move by player
      const boardAfterMove1 = this.createNewBoardWithMove(board, row1, col1, player, rules);
      const emptyCellsAfterMove1 = boardAfterMove1.getEmptyCells();
      
      // Simulate opponent's response
      for (const [row2, col2] of emptyCellsAfterMove1) {
        const boardAfterOpponentMove = this.createNewBoardWithMove(boardAfterMove1, row2, col2, opponent, rules);
        const emptyCellsAfterOpponentMove = boardAfterOpponentMove.getEmptyCells();
        
        // Check if any of player's next moves creates a fork
        for (const [row3, col3] of emptyCellsAfterOpponentMove) {
          const boardAfterMove2 = this.createNewBoardWithMove(boardAfterOpponentMove, row3, col3, player, rules);
          
          // Count potential winning lines
          let winningLines = 0;
          const finalEmptyCells = boardAfterMove2.getEmptyCells();
          
          for (const [r, c] of finalEmptyCells) {
            if (rules.isWinningMove(boardAfterMove2, r, c, player)) {
              winningLines++;
            }
          }
          
          // If this sequence leads to a fork, the initial move is good
          if (winningLines >= 2) {
            return [row1, col1];
          }
        }
      }
    }
    
    return null; // No fork move found
  }
  
  // Strategic position selection based on probabilities
  private getStrategicPositionMove(board: GameBoard, validMoves: [number, number][]): [number, number] {
    // Categorize moves by position type
    const centerMoves: [number, number][] = [];
    const cornerMoves: [number, number][] = [];
    const edgeMoves: [number, number][] = [];
    
    const center = Math.floor(board.size / 2);
    
    for (const [row, col] of validMoves) {
      // Check if this is a center move
      if (row === center && col === center) {
        centerMoves.push([row, col]);
      }
      // Check if this is a corner move
      else if ((row === 0 || row === board.size - 1) && (col === 0 || col === board.size - 1)) {
        cornerMoves.push([row, col]);
      }
      // Otherwise it's an edge move
      else {
        edgeMoves.push([row, col]);
      }
    }
    
    // Apply position preferences based on probabilities
    // 80% preference for center and corners, 10% for edges
    const positionRoll = Math.random();
    
    // Try center first (80% preference when available)
    if (centerMoves.length > 0 && positionRoll < 0.8) {
      return centerMoves[Math.floor(Math.random() * centerMoves.length)];
    }
    
    // Then try corners (80% preference when available)
    if (cornerMoves.length > 0 && positionRoll < 0.8) {
      return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
    }
    
    // Then try edges (10% preference)
    if (edgeMoves.length > 0 && positionRoll < 0.1) {
      return edgeMoves[Math.floor(Math.random() * edgeMoves.length)];
    }
    
    // If we get here, choose from all available moves
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  private getFeralMove(
    board: GameBoard, 
    player: Player, 
    rules: FeralRules, 
    opponent: Player
  ): [number, number] | null {
    // Get all valid moves (including overwrites)
    const validMoves: [number, number][] = [];
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (rules.isValidMove(board, row, col, player)) {
          validMoves.push([row, col]);
        }
      }
    }
    
    if (validMoves.length === 0) {
      return null;
    }
    
    // Strategic vs random move selection (90/10 split - aligned with Traditional mode)
    const useStrategicMove = Math.random() < 0.9;
    
    if (useStrategicMove) {
      // 90% chance to make winning moves (aligned with Traditional mode)
      if (Math.random() < 0.9) {
        for (const [row, col] of validMoves) {
          if (rules.isWinningMove(board, row, col, player)) {
            return [row, col];
          }
        }
      }
      
      // 90% chance to block opponent's winning moves
      if (Math.random() < 0.9) {
        const opponentValidMoves: [number, number][] = [];
        for (let row = 0; row < board.size; row++) {
          for (let col = 0; col < board.size; col++) {
            if (rules.isValidMove(board, row, col, opponent)) {
              opponentValidMoves.push([row, col]);
            }
          }
        }
        
        for (const [row, col] of opponentValidMoves) {
          // Create a temporary board with opponent's move
          const tempBoard = board.clone();
          tempBoard.makeMove(row, col, opponent, GameMode.FERAL);
          
          // Check if this results in a win for opponent
          const winner = rules.checkWinner(tempBoard);
          if (winner === opponent) {
            // Block by overwriting this position
            return [row, col];
          }
        }
      }
      
      // Position preference strategy for Feral mode
      const center = Math.floor(board.size / 2);
      const corners = [
        [0, 0], 
        [0, board.size - 1], 
        [board.size - 1, 0], 
        [board.size - 1, board.size - 1]
      ] as [number, number][];
      
      // 80% preference for center
      if (Math.random() < 0.8) {
        // Try to take center by overwriting if needed
        if (board.cells[center][center] !== player && rules.isValidMove(board, center, center, player)) {
          return [center, center];
        }
      }
      
      // 70% chance to create/block forks with single-move look-ahead (aligned with Traditional mode)
      if (Math.random() < 0.7) {
        // Check for fork creation
        const forkMove = this.findForkMove(board, player, rules);
        if (forkMove) {
          return forkMove;
        }
        
        // Check for blocking opponent's fork
        const blockForkMove = this.findForkMove(board, opponent, rules);
        if (blockForkMove) {
          return blockForkMove;
        }
      }
      
      // 80% preference for corners (aligned with Traditional mode)
      if (Math.random() < 0.8) {
        // Filter corners that are valid moves (empty or opponent's)
        const validCorners = corners.filter(([r, c]) => rules.isValidMove(board, r, c, player));
        if (validCorners.length > 0) {
          return validCorners[Math.floor(Math.random() * validCorners.length)];
        }
      }
      
      // 30% preference for edges (aligned with Traditional mode)
      if (Math.random() < 0.3) {
        const edges: [number, number][] = [];
        for (let i = 0; i < board.size; i++) {
          // Top and bottom edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (rules.isValidMove(board, 0, i, player)) edges.push([0, i]);
            if (rules.isValidMove(board, board.size - 1, i, player)) edges.push([board.size - 1, i]);
          }
          // Left and right edges (excluding corners)
          if (i > 0 && i < board.size - 1) {
            if (rules.isValidMove(board, i, 0, player)) edges.push([i, 0]);
            if (rules.isValidMove(board, i, board.size - 1, player)) edges.push([i, board.size - 1]);
          }
        }
        
        if (edges.length > 0) {
          return edges[Math.floor(Math.random() * edges.length)];
        }
      }
    }
    
    // Random move (10% chance or if no strategic move was made)
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  // Minimax algorithm with alpha-beta pruning for evaluation
  private minimax(
    board: GameBoard, 
    depth: number, 
    maxDepth: number, 
    isMaximizing: boolean, 
    player: Player, 
    opponent: Player, 
    rules: GameRules, 
    alpha: number = -Infinity, 
    beta: number = Infinity
  ): number {
    // Check for terminal states
    const winner = rules.checkWinner(board);
    if (winner === player) {
      return 10 - depth;  // Win (prefer quicker wins)
    } else if (winner === opponent) {
      return depth - 10;  // Loss (prefer longer losses)
    } else if (board.isFull() || depth >= maxDepth) {
      // Either a draw or we've reached our maximum search depth
      if (depth >= maxDepth) {
        // Use enhanced heuristic evaluation at max depth
        return this.evaluateBoardWithForks(board, player, opponent, rules);
      }
      return 0;  // Draw
    }
    
    const currentPlayer = isMaximizing ? player : opponent;
    
    // Get valid moves for the current player
    const validMoves = this.getValidMoves(board, currentPlayer, rules);
    
    if (isMaximizing) {
      // AI's turn (maximizing)
      let bestScore = -Infinity;
      
      for (const [row, col] of validMoves) {
        // Create a new board with this move
        const newBoard = this.createNewBoardWithMove(
          board, row, col, currentPlayer, rules
        );
        
        // Recursive call
        const score = this.minimax(
          newBoard, depth + 1, maxDepth, false, player, opponent, rules, alpha, beta
        );
        bestScore = Math.max(bestScore, score);
        
        // Alpha-beta pruning
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) {
          break;  // Beta cutoff
        }
      }
      
      return bestScore;
    } else {
      // Opponent's turn (minimizing)
      let bestScore = Infinity;
      
      for (const [row, col] of validMoves) {
        // Create a new board with this move
        const newBoard = this.createNewBoardWithMove(
          board, row, col, currentPlayer, rules
        );
        
        // Recursive call
        const score = this.minimax(
          newBoard, depth + 1, maxDepth, true, player, opponent, rules, alpha, beta
        );
        bestScore = Math.min(bestScore, score);
        
        // Alpha-beta pruning
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
          break;  // Alpha cutoff
        }
      }
      
      return bestScore;
    }
  }
  
  // Enhanced board evaluation that considers forks
  private evaluateBoardWithForks(board: GameBoard, player: Player, opponent: Player, rules: GameRules): number {
    const baseEvaluation = rules.evaluateBoard(board, player);
    
    // If there's already a winner or the board is full, return the base evaluation
    if (baseEvaluation !== 0 || board.isFull()) {
      return baseEvaluation;
    }
    
    // Count potential winning lines and forks
    let playerForkCount = 0;
    let opponentForkCount = 0;
    
    // Check for player's forks
    const emptyCells = board.getEmptyCells();
    for (const [row, col] of emptyCells) {
      // Create a temporary board with player's move
      const tempBoard = this.createNewBoardWithMove(board, row, col, player, rules);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (rules.isWinningMove(tempBoard, r, c, player)) {
          winningLines++;
        }
      }
      
      // If there are at least two winning threats, this is a fork
      if (winningLines >= 2) {
        playerForkCount++;
      }
    }
    
    // Check for opponent's forks
    for (const [row, col] of emptyCells) {
      // Create a temporary board with opponent's move
      const tempBoard = this.createNewBoardWithMove(board, row, col, opponent, rules);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (rules.isWinningMove(tempBoard, r, c, opponent)) {
          winningLines++;
        }
      }
      
      // If there are at least two winning threats, this is a fork
      if (winningLines >= 2) {
        opponentForkCount++;
      }
    }
    
    // Adjust evaluation based on fork counts
    // Player forks are good, opponent forks are bad
    return baseEvaluation + (playerForkCount * 2) - (opponentForkCount * 2);
  }
}

// Factory to create the appropriate AI based on difficulty
class AIFactory {
  static createAI(difficulty: string): AIStrategy {
    if (difficulty === Difficulty.EASY) {
      return new EasyAI();
    } else if (difficulty === Difficulty.MEDIUM) {
      return new MediumAI();
    } else if (difficulty === Difficulty.HARD) {
      return new HardAI();
    } else {
      // Default to medium if unknown difficulty
      return new MediumAI();
    }
  }
}

// Factory to create the appropriate rules based on game mode
class RulesFactory {
  static createRules(mode: string): GameRules {
    if (mode === GameMode.TRADITIONAL || mode === 'traditional') {
      return new TraditionalRules();
    } else if (mode === GameMode.MISERE || mode === 'misere') {
      return new MisereRules();
    } else if (mode === GameMode.NUMERICAL || mode === 'numerical') {
      return new NumericalRules();
    } else if (mode === GameMode.FERAL || mode === 'feral') {
      return new FeralRules();
    } else {
      // Default to traditional if unknown mode
      return new TraditionalRules();
    }
  }
}

// Main Game Controller - this is what will be exported for use in React components
export class TicTacToeAI {
  board: GameBoard;
  rules: GameRules;
  ai: AIStrategy;
  mode: string;
  difficulty: string;
  humanPlayer: Player;
  aiPlayer: Player;
  currentPlayer: Player;
  boardSize: number;
  
  constructor(
    mode: string = 'traditional',
    difficulty: string = 'medium',
    boardSize: number = 3,
    humanPlayer: Player = 'X'
  ) {
    this.boardSize = boardSize;
    this.board = new GameBoard(boardSize);
    this.mode = mode;
    this.difficulty = difficulty;
    this.rules = RulesFactory.createRules(mode);
    this.ai = AIFactory.createAI(difficulty);
    this.humanPlayer = humanPlayer;
    this.aiPlayer = humanPlayer === 'X' ? 'O' : 'X';
    this.currentPlayer = 'X';  // X always goes first
  }
  
  resetGame(): void {
    this.board.reset();
    this.currentPlayer = 'X';
  }
  
  makeHumanMove(row: number, col: number): boolean {
    if (this.currentPlayer !== this.humanPlayer) {
      return false;
    }
    
    // Use appropriate game mode for move validation
    if (!this.board.makeMove(row, col, this.humanPlayer, this.mode as GameMode)) {
      return false;
    }
    
    this.currentPlayer = this.aiPlayer;
    return true;
  }
  
  makeAIMove(): [number, number] | null {
    if (this.currentPlayer !== this.aiPlayer) {
      return null;
    }
    
    const move = this.ai.getMove(this.board, this.aiPlayer, this.rules);
    if (move) {
      const [row, col] = move;
      // Use appropriate game mode for move execution
      this.board.makeMove(row, col, this.aiPlayer, this.mode as GameMode);
      this.currentPlayer = this.humanPlayer;
      return move;
    }
    return null;
  }
  
  checkGameOver(): [boolean, Player | 'draw'] {
    const winner = this.rules.checkWinner(this.board);
    
    if (winner) {
      return [true, winner];
    } else if (this.board.isFull()) {
      return [true, 'draw'];  // Draw
    } else {
      return [false, null];
    }
  }
  
  // Helper function to get the board state for React components
  getBoardState(): Board {
    return this.board.cells;
  }
}

// Export the necessary components for use in React
export {
  GameMode,
  Difficulty,
  RulesFactory,
  AIFactory
};

// Helper function to get AI move for a given board state
// This is what will be primarily used by the React component
export const getAIMove = (
  board: Board,
  currentPlayer: Player,
  gameSettings: GameSettings,
  variant: string
): [number, number] | null => {
  // Get AI configuration from settings
  const difficulty = gameSettings?.difficulty || 'medium';
  const boardSize = board.length;
  
  // Create a board from the current state
  const gameBoard = new GameBoard(boardSize);
  gameBoard.cells = [...board];
  
  // Get the appropriate rules for this game variant
  const rules = RulesFactory.createRules(variant);
  
  // Create the AI
  const ai = AIFactory.createAI(difficulty);
  
  // Get the AI's move
  return ai.getMove(gameBoard, currentPlayer, rules);
};
