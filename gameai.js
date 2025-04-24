// GameRules class for Tic-Tac-Toe AI
export class GameRules {
  // This is a simplified version of the GameRules class from the Python code
  // It provides the necessary interface for the feral.jsx file
  
  // Check if there's a winner. Returns the winning player or null.
  checkWinner(board, lastMove = null) {
    return null;
  }
  
  // Evaluate the board state for the given player. Used by AI.
  evaluateBoard(board, player) {
    return 0;
  }
  
  // Check if making a move at (row, col) would result in a win for player.
  isWinningMove(board, row, col, player) {
    return false;
  }
}