import { GameRules } from '../gameAI';

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

export default TraditionalRules;