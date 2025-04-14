import { AIStrategy } from '../gameAI';
import { GameBoard, Player, GameRules } from '../gameAI';
import { Difficulty } from '../gameAI';

// Base class for Misere AI implementations
export class MisereAI extends AIStrategy {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    // Base implementation - should be overridden by specific difficulty classes
    const emptyCells = board.getEmptyCells();
    if (emptyCells.length === 0) {
      return null;
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Helper method to find valid moves
  protected getValidMoves(board: GameBoard, player: Player): [number, number][] {
    return board.getEmptyCells();
  }

  // Helper method to categorize moves by position type
  protected categorizeMoves(validMoves: [number, number][], boardSize: number): {
    centerMoves: [number, number][],
    cornerMoves: [number, number][],
    edgeMoves: [number, number][]
  } {
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

    return { centerMoves, cornerMoves, edgeMoves };
  }

  // Helper method to check if a move would create a winning line (which is bad in Misere)
  protected wouldCreateWinningLine(board: GameBoard, row: number, col: number, player: Player, rules: GameRules): boolean {
    // In Misere, creating a line is bad (opposite of traditional rules)
    const tempBoard = board.clone();
    tempBoard.makeMove(row, col, player);
    
    // Check if this results in a win (which is bad in Misere)
    const winner = rules.checkWinner(tempBoard);
    return winner === player;
  }

  // Helper method to find fork moves (two-way winning threats)
  protected findForkMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const emptyCells = board.getEmptyCells();
    
    for (const [row, col] of emptyCells) {
      // Create a temporary board with this move
      const tempBoard = board.clone();
      tempBoard.makeMove(row, col, player);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (this.wouldCreateWinningLine(tempBoard, r, c, player, rules)) {
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
}

// Easy AI for Misere mode
export class MisereEasyAI extends MisereAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    // Get valid moves
    const validMoves = this.getValidMoves(board, player);
    if (validMoves.length === 0) {
      return null;  // No valid moves
    }
    
    // Determine if we should attempt a strategic move (20% chance) or random move (80% chance)
    const attemptStrategicMove = Math.random() < 0.2;
    
    if (attemptStrategicMove) {
      const opponent = player === 'X' ? 'O' : 'X';
      
      // 40% chance to block opponent's winning move
      if (Math.random() < 0.4) {
        for (const [row, col] of validMoves) {
          // Check if opponent would win with this move
          if (this.wouldCreateWinningLine(board, row, col, opponent, rules)) {
            return [row, col]; // Block the opponent
          }
        }
      }
      
      // 50% chance to avoid making winning moves (which are bad in Misere)
      if (Math.random() < 0.5) {
        const nonWinningMoves = validMoves.filter(
          ([row, col]) => !this.wouldCreateWinningLine(board, row, col, player, rules)
        );
        
        if (nonWinningMoves.length > 0) {
          return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
        }
      }
    }
    
    // Make a random move with equal position preference (33/33/34%)
    const { centerMoves, cornerMoves, edgeMoves } = this.categorizeMoves(validMoves, board.size);
    
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

// Medium AI for Misere mode
export class MisereMediumAI extends MisereAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const opponent = player === 'X' ? 'O' : 'X';
    const validMoves = this.getValidMoves(board, player);
    
    if (validMoves.length === 0) {
      return null;
    }
    
    // 50/50 random vs strategic move selection
    const useStrategicMove = Math.random() < 0.5;
    
    if (useStrategicMove) {
      // 65% chance to block opponent's winning move
      if (Math.random() < 0.65) {
        for (const [row, col] of validMoves) {
          if (this.wouldCreateWinningLine(board, row, col, opponent, rules)) {
            return [row, col]; // Block the opponent
          }
        }
      }
      
      // 65% chance to avoid making winning moves (which are bad in Misere)
      if (Math.random() < 0.65) {
        const nonWinningMoves = validMoves.filter(
          ([row, col]) => !this.wouldCreateWinningLine(board, row, col, player, rules)
        );
        
        if (nonWinningMoves.length > 0) {
          return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
        }
      }
      
      // 50% chance to avoid forks with single-move look-ahead
      if (Math.random() < 0.5) {
        // Avoid creating forks (which would be bad in Misere)
        const forkMove = this.findForkMove(board, player, rules);
        if (forkMove) {
          // In Misere, we want to avoid creating forks, so find a different move
          const nonForkMoves = validMoves.filter(
            ([row, col]) => row !== forkMove[0] || col !== forkMove[1]
          );
          
          if (nonForkMoves.length > 0) {
            return nonForkMoves[Math.floor(Math.random() * nonForkMoves.length)];
          }
        }
      }
      
      // Apply position preferences (60% center, 50% corners, 10% edges)
      const { centerMoves, cornerMoves, edgeMoves } = this.categorizeMoves(validMoves, board.size);
      
      // Try center first (60% preference)
      if (centerMoves.length > 0 && Math.random() < 0.6) {
        return centerMoves[Math.floor(Math.random() * centerMoves.length)];
      }
      
      // Then try corners (50% preference)
      if (cornerMoves.length > 0 && Math.random() < 0.5) {
        return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
      }
      
      // Then try edges (10% preference)
      if (edgeMoves.length > 0 && Math.random() < 0.1) {
        return edgeMoves[Math.floor(Math.random() * edgeMoves.length)];
      }
    }
    
    // If no strategic move was made or if random move was chosen,
    // take a random move from all valid moves
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

// Hard AI for Misere mode
export class MisereHardAI extends MisereAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const opponent = player === 'X' ? 'O' : 'X';
    const validMoves = this.getValidMoves(board, player);
    
    if (validMoves.length === 0) {
      return null;
    }
    
    // Strategic vs random move selection (90/10 split)
    const useStrategicMove = Math.random() < 0.9;
    
    if (useStrategicMove) {
      // 90% chance to block opponent's winning move
      if (Math.random() < 0.9) {
        for (const [row, col] of validMoves) {
          if (this.wouldCreateWinningLine(board, row, col, opponent, rules)) {
            return [row, col]; // Block the opponent
          }
        }
      }
      
      // 90% chance to avoid making winning moves (which are bad in Misere)
      if (Math.random() < 0.9) {
        const nonWinningMoves = validMoves.filter(
          ([row, col]) => !this.wouldCreateWinningLine(board, row, col, player, rules)
        );
        
        if (nonWinningMoves.length > 0) {
          return nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
        }
      }
      
      // 90% chance to avoid forks with two-move look-ahead
      if (Math.random() < 0.9) {
        // Avoid creating forks (which would be bad in Misere)
        const forkMove = this.findAdvancedForkMove(board, player, rules);
        if (forkMove) {
          // In Misere, we want to avoid creating forks, so find a different move
          const nonForkMoves = validMoves.filter(
            ([row, col]) => row !== forkMove[0] || col !== forkMove[1]
          );
          
          if (nonForkMoves.length > 0) {
            return nonForkMoves[Math.floor(Math.random() * nonForkMoves.length)];
          }
        }
      }
      
      // Apply position preferences (80% center, 80% corners, 10% edges)
      return this.getStrategicPositionMove(board, validMoves);
    }
    
    // Random move (10% chance)
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
  
  // Advanced fork detection with two-move look-ahead
  private findAdvancedForkMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const emptyCells = board.getEmptyCells();
    const opponent = player === 'X' ? 'O' : 'X';
    
    // First, check for immediate fork opportunities
    for (const [row, col] of emptyCells) {
      // Create a temporary board with this move
      const tempBoard = board.clone();
      tempBoard.makeMove(row, col, player);
      
      // Count potential winning lines after this move
      let winningLines = 0;
      const tempEmptyCells = tempBoard.getEmptyCells();
      
      for (const [r, c] of tempEmptyCells) {
        if (this.wouldCreateWinningLine(tempBoard, r, c, player, rules)) {
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
      const boardAfterMove1 = board.clone();
      boardAfterMove1.makeMove(row1, col1, player);
      const emptyCellsAfterMove1 = boardAfterMove1.getEmptyCells();
      
      // Simulate opponent's response
      for (const [row2, col2] of emptyCellsAfterMove1) {
        const boardAfterOpponentMove = boardAfterMove1.clone();
        boardAfterOpponentMove.makeMove(row2, col2, opponent);
        const emptyCellsAfterOpponentMove = boardAfterOpponentMove.getEmptyCells();
        
        // Check if any of player's next moves creates a fork
        for (const [row3, col3] of emptyCellsAfterOpponentMove) {
          const boardAfterMove2 = boardAfterOpponentMove.clone();
          boardAfterMove2.makeMove(row3, col3, player);
          
          // Count potential winning lines
          let winningLines = 0;
          const finalEmptyCells = boardAfterMove2.getEmptyCells();
          
          for (const [r, c] of finalEmptyCells) {
            if (this.wouldCreateWinningLine(boardAfterMove2, r, c, player, rules)) {
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
    const { centerMoves, cornerMoves, edgeMoves } = this.categorizeMoves(validMoves, board.size);
    
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
}