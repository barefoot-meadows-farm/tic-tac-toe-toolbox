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
  evaluateBoard(board: GameBoard, player: Player): number {
    // In Misere, the evaluation is flipped - you want the opponent to get 3 in a row
    const traditionalEval = super.evaluateBoard(board, player);
    return -traditionalEval;  // Flip the evaluation
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
    
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.cells[row][col] === player) {
          playerCount++;
        } else if (board.cells[row][col] === opponent) {
          opponentCount++;
        }
      }
    }
    
    // Give a small bonus for controlling more of the board
    const controlBonus = (playerCount - opponentCount) * 0.5;
    
    return basicEval + controlBonus;
  }
}

// Abstract AI Strategy interface
abstract class AIStrategy {
  abstract getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null;
}

// Easy AI: Random Moves
class EasyAI extends AIStrategy {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const emptyCells = board.getEmptyCells();
    if (emptyCells.length === 0) {
      return null;  // No valid moves
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
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
    
    // Check for winning moves
    for (const [row, col] of emptyCells) {
      if (rules.isWinningMove(board, row, col, player)) {
        return [row, col];
      }
    }
    
    // Check for blocking moves
    for (const [row, col] of emptyCells) {
      if (rules.isWinningMove(board, row, col, opponent)) {
        return [row, col];
      }
    }
    
    // Take center if available (basic strategy)
    const center = Math.floor(board.size / 2);
    if (board.isValidMove(center, center)) {
      return [center, center];
    }
    
    // Take a corner if available
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
    
    // Take a random move
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
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
    
    // 1. Check for winning moves
    for (const [row, col] of validMoves) {
      // Create a temporary board with this move
      const tempBoard = board.clone();
      tempBoard.makeMove(row, col, player, GameMode.FERAL);
      
      // Check if this results in a win
      const winner = rules.checkWinner(tempBoard);
      if (winner === player) {
        return [row, col];
      }
    }
    
    // 2. Check for opponent's winning moves to block
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
    
    // 3. Overwrite opponent's pieces in strategic positions
    // First check if there are any opponent pieces to overwrite
    const opponentPieces: [number, number][] = [];
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.cells[row][col] === opponent) {
          opponentPieces.push([row, col]);
        }
      }
    }
    
    // Prioritize overwriting center and corners
    const center = Math.floor(board.size / 2);
    const corners = [
      [0, 0], 
      [0, board.size - 1], 
      [board.size - 1, 0], 
      [board.size - 1, board.size - 1]
    ];
    
    // Try to take center by overwriting if needed
    if (board.cells[center][center] === opponent) {
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
    let bestScore = -Infinity;
    let bestMove: [number, number] | null = null;
    
    // Get valid moves based on game mode
    const validMoves = this.getValidMoves(board, player, rules);
    if (validMoves.length === 0) {
      return null;
    }
    
    // Try each possible move
    for (const [row, col] of validMoves) {
      // Create a new board with this move
      const newBoard = this.createNewBoardWithMove(board, row, col, player, rules);
      
      // Evaluate using minimax with alpha-beta pruning
      // Limit depth to avoid excessive computation in complex games
      const maxDepth = (rules instanceof FeralRules) ? 4 : 6;
      const score = this.minimax(
        newBoard, 0, maxDepth, false, player, opponent, rules, -Infinity, Infinity
      );
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = [row, col];
      }
    }
    
    return bestMove;
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
        // Use heuristic evaluation at max depth
        return rules.evaluateBoard(board, player);
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
