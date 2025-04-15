import { GameRules, GameBoard, Player } from '../gameAI';

// Custom Rules class that combines mechanics from different game modes
class CustomRules extends GameRules {
  // Board dimensions
  boardSize: number;
  
  // Cell behavior
  allowOverwriting: boolean;
  randomSwaps: boolean;
  swapsPerRound: number;
  
  // Win conditions
  winCondition: 'line' | 'sum';
  winLength: number;
  targetSum: number;
  inversedWinCondition: boolean; // For Misere mode
  
  // Turn mechanics
  turnMechanics: 'standard' | 'modified';
  
  // Numerical mode values
  xValues: number[];
  oValues: number[];
  
  constructor(customRules: Record<string, any> = {}) {
    super();
    
    // Set default values
    this.boardSize = customRules.boardSize || 3;
    this.allowOverwriting = customRules.allowOverwriting || false;
    this.randomSwaps = customRules.randomSwaps || false;
    this.swapsPerRound = customRules.swapsPerRound || 1;
    this.winCondition = customRules.winCondition || 'line';
    this.winLength = customRules.winLength || 3;
    this.targetSum = customRules.targetSum || 15;
    this.inversedWinCondition = customRules.inversedWinCondition || false;
    this.turnMechanics = customRules.turnMechanics || 'standard';
    
    // Initialize numerical values based on target sum
    this.initializeNumericalValues();
  }
  
  // Initialize numerical values based on target sum
  private initializeNumericalValues(): void {
    if (this.targetSum === 34) {
      this.xValues = [1, 3, 5, 7, 9, 11, 13, 15];
      this.oValues = [2, 4, 6, 8, 10, 12, 14, 16];
    } else {
      // Default to standard 15 sum
      this.xValues = [1, 3, 5, 7, 9];
      this.oValues = [2, 4, 6, 8];
    }
  }
  
  // Check for winner based on selected win condition
  checkWinner(board: GameBoard, lastMove?: [number, number]): Player {
    let winner: Player = null;
    
    if (this.winCondition === 'line') {
      winner = this.checkLineWinner(board);
    } else if (this.winCondition === 'sum') {
      winner = this.checkSumWinner(board);
    }
    
    // Apply Misere rule if enabled (invert the winner)
    if (this.inversedWinCondition && winner !== null) {
      return winner === 'X' ? 'O' : 'X';
    }
    
    return winner;
  }
  
  // Check for winner based on line formation (Traditional/Misere/Feral)
  private checkLineWinner(board: GameBoard): Player {
    const size = board.size;
    
    // Check rows
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - this.winLength; col++) {
        const player = board.cells[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < this.winLength; i++) {
            if (board.cells[row][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return player;
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - this.winLength; row++) {
        const player = board.cells[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < this.winLength; i++) {
            if (board.cells[row + i][col] !== player) {
              win = false;
              break;
            }
          }
          if (win) return player;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= size - this.winLength; row++) {
      for (let col = 0; col <= size - this.winLength; col++) {
        const player = board.cells[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < this.winLength; i++) {
            if (board.cells[row + i][col + i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return player;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= size - this.winLength; row++) {
      for (let col = this.winLength - 1; col < size; col++) {
        const player = board.cells[row][col];
        if (player !== null) {
          let win = true;
          for (let i = 1; i < this.winLength; i++) {
            if (board.cells[row + i][col - i] !== player) {
              win = false;
              break;
            }
          }
          if (win) return player;
        }
      }
    }
    
    return null;
  }
  
  // Check for winner based on sum (Numerical)
  private checkSumWinner(board: GameBoard): Player {
    const size = board.size;
    
    // Check rows
    for (let row = 0; row < size; row++) {
      const rowSum = board.cells[row].reduce((sum, cell, index) => {
        if (cell === 'X') return sum + this.xValues[0];
        if (cell === 'O') return sum + this.oValues[0];
        return sum;
      }, 0);
      
      if (rowSum === this.targetSum) return 'X';
      // For player O, calculate their target sum based on their number pool
      const oTargetSum = this.oValues.slice(0, 3).reduce((sum, val) => sum + val, 0);
      if (rowSum === oTargetSum) return 'O';
    }
    
    // Check columns
    for (let col = 0; col < size; col++) {
      let colSum = 0;
      for (let row = 0; row < size; row++) {
        const cell = board.cells[row][col];
        if (cell === 'X') colSum += this.xValues[0];
        if (cell === 'O') colSum += this.oValues[0];
      }
      
      if (colSum === this.targetSum) return 'X';
      // For player O, calculate their target sum based on their number pool
      const oTargetSum = this.oValues.slice(0, 3).reduce((sum, val) => sum + val, 0);
      if (colSum === oTargetSum) return 'O';
    }
    
    // Check main diagonal
    let diagSum = 0;
    for (let i = 0; i < size; i++) {
      const cell = board.cells[i][i];
      if (cell === 'X') diagSum += this.xValues[0];
      if (cell === 'O') diagSum += this.oValues[0];
    }
    if (diagSum === this.targetSum) return 'X';
    // For player O, calculate their target sum based on their number pool
    const oTargetSum = this.oValues.slice(0, 3).reduce((sum, val) => sum + val, 0);
    if (diagSum === oTargetSum) return 'O';
    
    // Check other diagonal
    diagSum = 0;
    for (let i = 0; i < size; i++) {
      const cell = board.cells[i][size - 1 - i];
      if (cell === 'X') diagSum += this.xValues[0];
      if (cell === 'O') diagSum += this.oValues[0];
    }
    if (diagSum === this.targetSum) return 'X';
    if (diagSum === oTargetSum) return 'O';
    
    return null;
  }
  
  // Apply random swaps if Chaos mode is enabled
  applyRandomSwaps(board: GameBoard): void {
    if (!this.randomSwaps) return;
    
    const size = board.size;
    const occupiedCells: [number, number][] = [];
    
    // Find all occupied cells
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board.cells[row][col] !== null) {
          occupiedCells.push([row, col]);
        }
      }
    }
    
    // Need at least 2 occupied cells to swap
    if (occupiedCells.length < 2) return;
    
    // Perform the specified number of swaps
    for (let i = 0; i < this.swapsPerRound; i++) {
      // Randomly select two different cells
      const idx1 = Math.floor(Math.random() * occupiedCells.length);
      let idx2 = idx1;
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * occupiedCells.length);
      }
      
      const [row1, col1] = occupiedCells[idx1];
      const [row2, col2] = occupiedCells[idx2];
      
      // Swap the cells
      const temp = board.cells[row1][col1];
      board.cells[row1][col1] = board.cells[row2][col2];
      board.cells[row2][col2] = temp;
    }
  }
  
  // Check if a move is valid based on custom rules
  isValidMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // First check if move is in bounds
    if (!(0 <= row && row < board.size && 0 <= col && col < board.size)) {
      return false;
    }
    
    // For standard mode, cell must be empty
    if (!this.allowOverwriting) {
      return board.cells[row][col] === null;
    }
    
    // In Feral mode (allowOverwriting), you can play in empty cells OR overwrite opponent's moves
    const currentCell = board.cells[row][col];
    return (currentCell === null || 
            (currentCell !== player && currentCell !== null));
  }
  
  // Evaluate board for AI
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
  
  // Check if a move would result in a win
  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // Create a temporary board with the move
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    // Check if this results in a win
    const winner = this.checkWinner(tempBoard);
    return winner === player;
  }
}

export default CustomRules;