import { AIStrategy, GameBoard, Player, GameRules, GameMode } from '../gameAI';

// Base class for Chaos mode AI
abstract class BaseChaosAI extends AIStrategy {
  protected getValidMoves(board: GameBoard): [number, number][] {
    const validMoves: [number, number][] = [];
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (board.isValidMove(row, col)) {
          validMoves.push([row, col]);
        }
      }
    }
    return validMoves;
  }

  protected categorizePositions(validMoves: [number, number][], boardSize: number): {
    center: [number, number][],
    corners: [number, number][],
    edges: [number, number][]
  } {
    const center = Math.floor(boardSize / 2);
    const positions = {
      center: [] as [number, number][],
      corners: [] as [number, number][],
      edges: [] as [number, number][]
    };

    for (const [row, col] of validMoves) {
      if (row === center && col === center) {
        positions.center.push([row, col]);
      } else if ((row === 0 || row === boardSize - 1) && (col === 0 || col === boardSize - 1)) {
        positions.corners.push([row, col]);
      } else {
        positions.edges.push([row, col]);
      }
    }

    return positions;
  }

  protected findWinningMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const validMoves = this.getValidMoves(board);
    for (const [row, col] of validMoves) {
      if (rules.isWinningMove(board, row, col, player)) {
        return [row, col];
      }
    }
    return null;
  }
}

// Easy difficulty Chaos AI
export class EasyChaosAI extends BaseChaosAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 80% random, 20% strategic
    const useStrategic = Math.random() < 0.2;

    if (useStrategic) {
      // 40% chance to block opponent
      const opponent = player === 'X' ? 'O' : 'X';
      if (Math.random() < 0.4) {
        const blockingMove = this.findWinningMove(board, opponent, rules);
        if (blockingMove) return blockingMove;
      }
    }

    // Position preference (33/33/34%)
    const positions = this.categorizePositions(validMoves, board.size);
    const roll = Math.random();

    if (roll < 0.33 && positions.center.length > 0) {
      return positions.center[Math.floor(Math.random() * positions.center.length)];
    } else if (roll < 0.66 && positions.corners.length > 0) {
      return positions.corners[Math.floor(Math.random() * positions.corners.length)];
    } else if (positions.edges.length > 0) {
      return positions.edges[Math.floor(Math.random() * positions.edges.length)];
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

// Medium difficulty Chaos AI
export class MediumChaosAI extends BaseChaosAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 50/50 random vs strategic
    const useStrategic = Math.random() < 0.5;

    if (useStrategic) {
      // 65% chance to block opponent
      const opponent = player === 'X' ? 'O' : 'X';
      if (Math.random() < 0.65) {
        const blockingMove = this.findWinningMove(board, opponent, rules);
        if (blockingMove) return blockingMove;
      }

      const positions = this.categorizePositions(validMoves, board.size);
      
      // Position preferences
      if (Math.random() < 0.6 && positions.center.length > 0) { // 60% center
        return positions.center[0];
      } else if (Math.random() < 0.5 && positions.corners.length > 0) { // 50% corners
        return positions.corners[Math.floor(Math.random() * positions.corners.length)];
      } else if (Math.random() < 0.1 && positions.edges.length > 0) { // 10% edges
        return positions.edges[Math.floor(Math.random() * positions.edges.length)];
      }
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}

// Hard difficulty Chaos AI
export class HardChaosAI extends BaseChaosAI {
  getMove(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 90/10 strategic vs random
    const useStrategic = Math.random() < 0.9;

    if (useStrategic) {
      // Try to win
      const winningMove = this.findWinningMove(board, player, rules);
      if (winningMove) return winningMove;

      // 90% chance to block opponent
      const opponent = player === 'X' ? 'O' : 'X';
      if (Math.random() < 0.9) {
        const blockingMove = this.findWinningMove(board, opponent, rules);
        if (blockingMove) return blockingMove;
      }

      // Two-move look-ahead for winning opportunities
      const twoMoveWin = this.findTwoMoveLookAhead(board, player, rules);
      if (twoMoveWin) return twoMoveWin;

      const positions = this.categorizePositions(validMoves, board.size);
      
      // Position preferences
      if (Math.random() < 0.8 && positions.center.length > 0) { // 80% center
        return positions.center[0];
      } else if (Math.random() < 0.8 && positions.corners.length > 0) { // 80% corners
        return positions.corners[Math.floor(Math.random() * positions.corners.length)];
      } else if (Math.random() < 0.1 && positions.edges.length > 0) { // 10% edges
        return positions.edges[Math.floor(Math.random() * positions.edges.length)];
      }
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  private findTwoMoveLookAhead(board: GameBoard, player: Player, rules: GameRules): [number, number] | null {
    const validMoves = this.getValidMoves(board);
    const opponent = player === 'X' ? 'O' : 'X';

    for (const [row, col] of validMoves) {
      const tempBoard = board.clone();
      tempBoard.makeMove(row, col, player);

      // Check if this move creates a winning opportunity after opponent's move
      let forcedWin = true;
      const opponentMoves = this.getValidMoves(tempBoard);

      for (const [oppRow, oppCol] of opponentMoves) {
        const futureBoard = tempBoard.clone();
        futureBoard.makeMove(oppRow, oppCol, opponent);

        // If we can't win after any of opponent's moves, this isn't a forced win
        if (!this.findWinningMove(futureBoard, player, rules)) {
          forcedWin = false;
          break;
        }
      }

      if (forcedWin && opponentMoves.length > 0) {
        return [row, col];
      }
    }

    return null;
  }
}