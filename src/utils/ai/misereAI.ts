import { GameRules } from '../gameAI';

class MisereRules extends GameRules {
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
    // In Misere, the evaluation is flipped - you want the opponent to get 3 in a row
    const winner = this.checkWinner(board);
    
    if (winner === player) {
      return -10; // Negative score if player would win (bad in Misere)
    } else if (winner !== null) {  // Other player won
      return 10; // Positive score if opponent would win (good in Misere)
    } else {
      return 0;
    }
  }

  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // In Misere, a "winning" move is actually one that would make you lose in traditional rules
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    const winner = this.checkWinner(tempBoard);
    return winner !== player; // In Misere, NOT forming a line is a "winning" move
  }
}

export default MisereRules;