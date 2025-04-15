import { GameRules } from '../gameAI';

class NumericalRules extends GameRules {
  xValues: number[];
  oValues: number[];
  targetSum: number;
  
  constructor(targetSum: number = 15) {
    super();
    this.targetSum = targetSum;
    
    // Set number pools based on target sum
    if (targetSum === 34) {
      this.xValues = [1, 3, 5, 7, 9, 11, 13, 15];
      this.oValues = [2, 4, 6, 8, 10, 12, 14, 16];
    } else {
      // Default to standard 15 sum
      this.xValues = [1, 3, 5, 7, 9];
      this.oValues = [2, 4, 6, 8];
    }
  }

  checkWinner(board: GameBoard, lastMove?: [number, number]): Player {
    const size = board.size;
    
    // Check rows
    for (let row = 0; row < size; row++) {
      const rowSum = board.cells[row].reduce((sum, cell) => {
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

export default NumericalRules;