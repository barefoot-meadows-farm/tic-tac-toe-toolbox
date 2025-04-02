# Tic-Tac-Toe AI with Multiple Difficulty Levels
# Compatible with various game modes

import random
import math
from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Tuple, Optional, Dict, Any

# Enums for game configuration
class Player(Enum):
    X = "X"
    O = "O"
    EMPTY = " "

class Difficulty(Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class GameMode(Enum):
    TRADITIONAL = "Traditional"
    MISERE = "Misere"  # Win by avoiding three in a row
    NUMERICAL = "Numerical"  # Use numbers instead of X/O
    FERAL = "Feral"  # Special rule variations

# Base Game Board Class
class Board:
    def __init__(self, size: int = 3):
        self.size = size
        self.reset()
    
    def reset(self):
        """Reset the board to an empty state."""
        self.cells = [[Player.EMPTY for _ in range(self.size)] for _ in range(self.size)]
        
    def make_move(self, row: int, col: int, player: Player, game_mode: GameMode = GameMode.TRADITIONAL) -> bool:
        """Place a move on the board. Returns True if successful."""
        if not self.is_valid_move(row, col, player, game_mode):
            return False
        self.cells[row][col] = player
        return True
    
    def is_valid_move(self, row: int, col: int, player: Player = None, game_mode: GameMode = GameMode.TRADITIONAL) -> bool:
        """
        Check if a move is valid.
        
        For traditional modes: The cell must be empty
        For feral mode: Can overwrite opponent's moves but not your own
        """
        # First check if move is in bounds
        if not (0 <= row < self.size and 0 <= col < self.size):
            return False
            
        # For traditional mode (and most others), cell must be empty
        if game_mode != GameMode.FERAL:
            return self.cells[row][col] == Player.EMPTY
            
        # Feral mode logic - must provide player to validate
        if player is None:
            return False
            
        # In Feral mode, you can play in empty cells OR overwrite opponent's moves
        current_cell = self.cells[row][col]
        return (current_cell == Player.EMPTY or 
                (current_cell != player and current_cell != Player.EMPTY))
    
    def get_empty_cells(self) -> List[Tuple[int, int]]:
        """Return a list of coordinates for all empty cells."""
        empty_cells = []
        for row in range(self.size):
            for col in range(self.size):
                if self.cells[row][col] == Player.EMPTY:
                    empty_cells.append((row, col))
        return empty_cells
    
    def is_full(self) -> bool:
        """Check if the board is completely filled."""
        return len(self.get_empty_cells()) == 0
    
    def display(self):
        """Print the current state of the board."""
        for row in range(self.size):
            row_str = "|"
            for col in range(self.size):
                row_str += f" {self.cells[row][col].value} |"
            print(row_str)
            if row < self.size - 1:
                print("-" * (4 * self.size + 1))

# Abstract Game Rules Interface
class GameRules(ABC):
    @abstractmethod
    def check_winner(self, board: Board, last_move: Tuple[int, int] = None) -> Optional[Player]:
        """Check if there's a winner. Returns the winning player or None."""
        pass
    
    @abstractmethod
    def evaluate_board(self, board: Board, player: Player) -> int:
        """Evaluate the board state for the given player. Used by AI."""
        pass
    
    @abstractmethod
    def is_winning_move(self, board: Board, row: int, col: int, player: Player) -> bool:
        """Check if making a move at (row, col) would result in a win for player."""
        pass

# Traditional Tic-Tac-Toe Rules
class TraditionalRules(GameRules):
    def check_winner(self, board: Board, last_move: Tuple[int, int] = None) -> Optional[Player]:
        """Check if there's a winner in traditional rules (3 in a row)."""
        # Check rows
        for row in range(board.size):
            if board.cells[row][0] != Player.EMPTY and all(board.cells[row][0] == board.cells[row][col] for col in range(board.size)):
                return board.cells[row][0]
                
        # Check columns
        for col in range(board.size):
            if board.cells[0][col] != Player.EMPTY and all(board.cells[0][col] == board.cells[row][col] for row in range(board.size)):
                return board.cells[0][col]
                
        # Check main diagonal
        if board.cells[0][0] != Player.EMPTY and all(board.cells[0][0] == board.cells[i][i] for i in range(board.size)):
            return board.cells[0][0]
            
        # Check other diagonal
        if board.cells[0][board.size-1] != Player.EMPTY and all(board.cells[0][board.size-1] == board.cells[i][board.size-1-i] for i in range(board.size)):
            return board.cells[0][board.size-1]
            
        return None
    
    def evaluate_board(self, board: Board, player: Player) -> int:
        """
        Evaluate the board state for the given player.
        Returns: 10 for win, -10 for loss, 0 for neutral/draw
        """
        winner = self.check_winner(board)
        
        if winner == player:
            return 10
        elif winner is not None:  # Other player won
            return -10
        else:
            return 0
    
    def is_winning_move(self, board: Board, row: int, col: int, player: Player) -> bool:
        """Check if making a move at (row, col) would result in a win for player."""
        # Create a temporary board with the move
        temp_board = Board(board.size)
        for r in range(board.size):
            for c in range(board.size):
                temp_board.cells[r][c] = board.cells[r][c]
        
        # Make the move
        temp_board.make_move(row, col, player)
        
        # Check if this results in a win
        winner = self.check_winner(temp_board)
        return winner == player

# Misere Rules: Win by avoiding three in a row
class MisereRules extends TraditionalRules {
  evaluateBoard(board: GameBoard, player: Player): number {
    // In Misere, the evaluation is flipped - you want the opponent to get 3 in a row
    const traditionalEval = super.evaluateBoard(board, player);
    return -traditionalEval;  // Flip the evaluation
  }
  
  isWinningMove(board: GameBoard, row: number, col: number, player: Player): boolean {
    // In Misere, a "winning" move is actually one that would make you lose in traditional rules
    // So we need to invert the result of the traditional check
    const wouldFormLine = super.isWinningMove(board, row, col, player);
    return !wouldFormLine; // In Misere, NOT forming a line is a "winning" move
  }
}

# Numerical Rules: Uses numbers (1-9) instead of X/O
class NumericalRules(GameRules):
    def __init__(self):
        self.x_values = [1, 3, 5, 7, 9]  # Odd numbers for X
        self.o_values = [2, 4, 6, 8]     # Even numbers for O
        
    def check_winner(self, board: Board, last_move: Tuple[int, int] = None) -> Optional[Player]:
        """Check for magic square (sum of 15) in any row, column, or diagonal."""
        # This is a placeholder. In a real implementation, you would track
        # the numerical values and check for lines that sum to 15.
        return None
    
    def evaluate_board(self, board: Board, player: Player) -> int:
        """Evaluate based on potential to form magic squares."""
        # Placeholder for a more sophisticated evaluation function
        return 0
    
    def is_winning_move(self, board: Board, row: int, col: int, player: Player) -> bool:
        """Check if making a move would create a line summing to 15."""
        # Placeholder implementation
        return False

# Feral Rules: Allows overwriting opponent's moves
class FeralRules(TraditionalRules):
    def __init__(self):
        super().__init__()
        self.game_mode = GameMode.FERAL
    
    def check_winner(self, board: Board, last_move: Tuple[int, int] = None) -> Optional[Player]:
        """
        Check for winner using traditional win conditions.
        The win conditions are the same, but the ability to overwrite opponent's moves
        creates very different gameplay dynamics.
        """
        # Use the same win conditions as traditional Tic-Tac-Toe
        return super().check_winner(board, last_move)
    
    def is_valid_move(self, board: Board, row: int, col: int, player: Player) -> bool:
        """
        In Feral mode, moves are valid if:
        1. The cell is empty, OR
        2. The cell contains the opponent's mark (you can overwrite)
        
        You cannot overwrite your own marks.
        """
        # Check if the move is in bounds
        if not (0 <= row < board.size and 0 <= col < board.size):
            return False
            
        # Get current cell value
        current = board.cells[row][col]
        
        # Valid if empty or contains opponent's mark
        return current == Player.EMPTY or (current != player and current != Player.EMPTY)
    
    def evaluate_board(self, board: Board, player: Player) -> int:
        """
        Evaluate the board state for Feral mode.
        Similar to traditional evaluation but with awareness of overwrite possibility.
        """
        # Get basic evaluation
        basic_eval = super().evaluate_board(board, player)
        
        # In Feral mode, having more pieces on the board is slightly less valuable
        # since they can be overwritten, but controlling key positions still matters
        
        # Count player's pieces vs opponent's pieces to determine board control
        opponent = Player.O if player == Player.X else Player.X
        player_count = sum(row.count(player) for row in board.cells)
        opponent_count = sum(row.count(opponent) for row in board.cells)
        
        # Give a small bonus for controlling more of the board
        control_bonus = (player_count - opponent_count) * 0.5
        
        return basic_eval + control_bonus

# Abstract AI Strategy Interface
class AIStrategy(ABC):
    @abstractmethod
    def get_move(self, board: Board, player: Player, rules: GameRules) -> Tuple[int, int]:
        """Determine the next move for the AI."""
        pass

# Easy AI: Random Moves
class EasyAI(AIStrategy):
    def get_move(self, board: Board, player: Player, rules: GameRules) -> Tuple[int, int]:
        """Simply choose a random valid move."""
        empty_cells = board.get_empty_cells()
        if not empty_cells:
            return None  # No valid moves
        return random.choice(empty_cells)

# Medium AI: Basic Strategy
class MediumAI(AIStrategy):
    def get_move(self, board: Board, player: Player, rules: GameRules) -> Tuple[int, int]:
        """
        Use basic strategy:
        1. Win if possible
        2. Block opponent's win if needed
        3. Otherwise, make a strategic move (center, corners, etc.)
        """
        # Find opponent player
        opponent = Player.O if player == Player.X else Player.X
        
        # Handle Feral mode specially
        if isinstance(rules, FeralRules):
            return self._get_feral_move(board, player, rules, opponent)
        
        # Standard mode logic
        empty_cells = board.get_empty_cells()
        if not empty_cells:
            return None
            
        # Check for winning moves
        for row, col in empty_cells:
            if rules.is_winning_move(board, row, col, player):
                return (row, col)
        
        # Check for blocking moves
        for row, col in empty_cells:
            if rules.is_winning_move(board, row, col, opponent):
                return (row, col)
        
        # Take center if available (basic strategy)
        center = board.size // 2
        if board.is_valid_move(center, center, player):
            return (center, center)
            
        # Take a corner if available
        corners = [(0, 0), (0, board.size-1), (board.size-1, 0), (board.size-1, board.size-1)]
        available_corners = [corner for corner in corners if board.is_valid_move(corner[0], corner[1], player)]
        if available_corners:
            return random.choice(available_corners)
            
        # Take a random move
        return random.choice(empty_cells)
        
    def _get_feral_move(self, board: Board, player: Player, rules: FeralRules, opponent: Player) -> Tuple[int, int]:
        """Special strategy for Feral mode that considers overwriting."""
        # Get all valid moves (including overwrites)
        valid_moves = []
        for row in range(board.size):
            for col in range(board.size):
                if rules.is_valid_move(board, row, col, player):
                    valid_moves.append((row, col))
                    
        if not valid_moves:
            return None
            
        # 1. Check for winning moves
        for row, col in valid_moves:
            # Create a temporary board with this move
            temp_board = Board(board.size)
            for r in range(board.size):
                for c in range(board.size):
                    temp_board.cells[r][c] = board.cells[r][c]
            
            temp_board.make_move(row, col, player, GameMode.FERAL)
            
            # Check if this results in a win
            winner = rules.check_winner(temp_board)
            if winner == player:
                return (row, col)
        
        # 2. Check for opponent's winning moves to block
        opponent_valid_moves = []
        for row in range(board.size):
            for col in range(board.size):
                if rules.is_valid_move(board, row, col, opponent):
                    opponent_valid_moves.append((row, col))
                    
        for row, col in opponent_valid_moves:
            # Create a temporary board with opponent's move
            temp_board = Board(board.size)
            for r in range(board.size):
                for c in range(board.size):
                    temp_board.cells[r][c] = board.cells[r][c]
            
            temp_board.make_move(row, col, opponent, GameMode.FERAL)
            
            # Check if this results in a win for opponent
            winner = rules.check_winner(temp_board)
            if winner == opponent:
                # Block by overwriting this position
                return (row, col)
        
        # 3. Overwrite opponent's pieces in strategic positions
        # First check if there are any opponent pieces to overwrite
        opponent_pieces = []
        for row in range(board.size):
            for col in range(board.size):
                if board.cells[row][col] == opponent:
                    opponent_pieces.append((row, col))
                    
        # Prioritize overwriting center and corners
        center = board.size // 2
        corners = [(0, 0), (0, board.size-1), (board.size-1, 0), (board.size-1, board.size-1)]
        
        # Try to take center by overwriting if needed
        if board.cells[center][center] == opponent:
            return (center, center)
            
        # Try to take corners by overwriting if needed
        for row, col in corners:
            if board.cells[row][col] == opponent:
                return (row, col)
        
        # 4. Take empty center or corners
        if board.cells[center][center] == Player.EMPTY:
            return (center, center)
            
        empty_corners = [(r, c) for r, c in corners if board.cells[r][c] == Player.EMPTY]
        if empty_corners:
            return random.choice(empty_corners)
            
        # 5. Take a random valid move
        return random.choice(valid_moves)

# Hard AI: Minimax Algorithm
class HardAI(AIStrategy):
    def get_move(self, board: Board, player: Player, rules: GameRules) -> Tuple[int, int]:
        """Use minimax algorithm with alpha-beta pruning to find optimal move."""
        opponent = Player.O if player == Player.X else Player.X
        best_score = -math.inf
        best_move = None
        
        # Get valid moves based on game mode
        valid_moves = self._get_valid_moves(board, player, rules)
        if not valid_moves:
            return None
        
        # Apply alpha-beta pruning for efficiency
        alpha = -math.inf
        beta = math.inf
        
        # Try each possible move
        for row, col in valid_moves:
            # Create a new board with this move
            new_board = self._create_new_board_with_move(board, row, col, player, rules)
            
            # Evaluate using minimax with alpha-beta pruning
            # Limit depth to avoid excessive computation in complex games
            max_depth = 9 if isinstance(rules, FeralRules) else 9
            score = self._minimax(new_board, 0, max_depth, False, player, opponent, rules, alpha, beta)
            
            if score > best_score:
                best_score = score
                best_move = (row, col)
                
            # Update alpha
            alpha = max(alpha, best_score)
                
        return best_move
    
    def _get_valid_moves(self, board: Board, player: Player, rules: GameRules) -> List[Tuple[int, int]]:
        """Get all valid moves based on the game rules."""
        if isinstance(rules, FeralRules):
            # For Feral mode, we need to check each cell individually
            valid_moves = []
            for row in range(board.size):
                for col in range(board.size):
                    if rules.is_valid_move(board, row, col, player):
                        valid_moves.append((row, col))
            return valid_moves
        else:
            # For traditional modes, only empty cells are valid
            return board.get_empty_cells()
    
    def _create_new_board_with_move(self, board: Board, row: int, col: int, player: Player, rules: GameRules) -> Board:
        """Create a new board with the specified move applied."""
        new_board = Board(board.size)
        for r in range(board.size):
            for c in range(board.size):
                new_board.cells[r][c] = board.cells[r][c]
        
        # Apply the move using the appropriate game mode
        if isinstance(rules, FeralRules):
            new_board.make_move(row, col, player, GameMode.FERAL)
        else:
            new_board.make_move(row, col, player)
            
        return new_board
    
    def _minimax(self, board: Board, depth: int, max_depth: int, is_maximizing: bool, 
                player: Player, opponent: Player, rules: GameRules, 
                alpha: float = -math.inf, beta: float = math.inf) -> float:
        """
        Minimax algorithm with alpha-beta pruning implementation.
        
        Args:
            board: Current board state
            depth: Current recursion depth
            max_depth: Maximum recursion depth to limit search
            is_maximizing: Whether it's maximizing player's turn
            player: The AI player
            opponent: The opponent player
            rules: Game rules being used
            alpha: Alpha value for pruning
            beta: Beta value for pruning
            
        Returns:
            The optimal score for the current board state
        """
        # Check for terminal states
        winner = rules.check_winner(board)
        if winner == player:
            return 10 - depth  # Win (prefer quicker wins)
        elif winner == opponent:
            return depth - 10  # Loss (prefer longer losses)
        elif board.is_full() or depth >= max_depth:
            # Either a draw or we've reached our maximum search depth
            if depth >= max_depth:
                # Use heuristic evaluation at max depth
                return rules.evaluate_board(board, player)
            return 0  # Draw
            
        current_player = player if is_maximizing else opponent
        
        # Get valid moves for the current player
        valid_moves = self._get_valid_moves(board, current_player, rules)
        
        if is_maximizing:
            # AI's turn (maximizing)
            best_score = -math.inf
            
            for row, col in valid_moves:
                # Create a new board with this move
                new_board = self._create_new_board_with_move(board, row, col, current_player, rules)
                
                # Recursive call
                score = self._minimax(new_board, depth + 1, max_depth, False, player, opponent, rules, alpha, beta)
                best_score = max(best_score, score)
                
                # Alpha-beta pruning
                alpha = max(alpha, best_score)
                if beta <= alpha:
                    break  # Beta cutoff
        else:
            # Opponent's turn (minimizing)
            best_score = math.inf
            
            for row, col in valid_moves:
                # Create a new board with this move
                new_board = self._create_new_board_with_move(board, row, col, current_player, rules)
                
                # Recursive call
                score = self._minimax(new_board, depth + 1, max_depth, True, player, opponent, rules, alpha, beta)
                best_score = min(best_score, score)
                
                # Alpha-beta pruning
                beta = min(beta, best_score)
                if beta <= alpha:
                    break  # Alpha cutoff
                
        return best_score

# AI Factory to create the appropriate AI based on difficulty
class AIFactory:
    @staticmethod
    def create_ai(difficulty: Difficulty) -> AIStrategy:
        """Create and return an AI with the specified difficulty."""
        if difficulty == Difficulty.EASY:
            return EasyAI()
        elif difficulty == Difficulty.MEDIUM:
            return MediumAI()
        elif difficulty == Difficulty.HARD:
            return HardAI()
        else:
            raise ValueError(f"Unknown difficulty: {difficulty}")

# Rules Factory to create the appropriate rules based on game mode
class RulesFactory:
    @staticmethod
    def create_rules(mode: GameMode) -> GameRules:
        """Create and return the rules for the specified game mode."""
        if mode == GameMode.TRADITIONAL:
            return TraditionalRules()
        elif mode == GameMode.MISERE:
            return MisereRules()
        elif mode == GameMode.NUMERICAL:
            return NumericalRules()
        elif mode == GameMode.FERAL:
            return FeralRules()
        else:
            raise ValueError(f"Unknown game mode: {mode}")

# Main Game Controller
class TicTacToeGame:
    def __init__(self, mode: GameMode = GameMode.TRADITIONAL, 
                 difficulty: Difficulty = Difficulty.MEDIUM,
                 board_size: int = 3,
                 human_player: Player = Player.X):
        self.board = Board(board_size)
        self.rules = RulesFactory.create_rules(mode)
        self.ai = AIFactory.create_ai(difficulty)
        self.mode = mode
        self.difficulty = difficulty
        self.human_player = human_player
        self.ai_player = Player.O if human_player == Player.X else Player.X
        self.current_player = Player.X  # X always goes first
        
    def reset_game(self):
        """Reset the game to its initial state."""
        self.board.reset()
        self.current_player = Player.X
    
    def make_human_move(self, row: int, col: int) -> bool:
        """Process a human player's move."""
        if self.current_player != self.human_player:
            return False
            
        # Use appropriate game mode for move validation
        if not self.board.make_move(row, col, self.human_player, self.mode):
            return False
            
        self.current_player = self.ai_player
        return True
    
    def make_ai_move(self) -> Tuple[int, int]:
        """Let the AI make its move."""
        if self.current_player != self.ai_player:
            return None
            
        move = self.ai.get_move(self.board, self.ai_player, self.rules)
        if move:
            row, col = move
            # Use appropriate game mode for move execution
            self.board.make_move(row, col, self.ai_player, self.mode)
            self.current_player = self.human_player
            return move
        return None
    
    def check_game_over(self) -> Tuple[bool, Optional[Player]]:
        """Check if the game is over, and who the winner is (if any)."""
        winner = self.rules.check_winner(self.board)
        
        if winner:
            return True, winner
        elif self.board.is_full():
            return True, None  # Draw
        else:
            return False, None
    
    def display(self):
        """Display the current state of the game."""
        print(f"\nGame Mode: {self.mode.value}")
        print(f"Difficulty: {self.difficulty.value}")
        print(f"Current Player: {self.current_player.value}")
        self.board.display()

# Example usage
def play_console_game():
    """Example of how to play a game in the console."""
    # Select game mode
    print("Select Game Mode:")
    for i, mode in enumerate(GameMode):
        print(f"{i+1}. {mode.value}")
    mode_choice = int(input("Enter choice (1-4): "))
    mode = list(GameMode)[mode_choice-1]
    
    # Select difficulty
    print("\nSelect Difficulty:")
    for i, diff in enumerate(Difficulty):
        print(f"{i+1}. {diff.value}")
    diff_choice = int(input("Enter choice (1-3): "))
    difficulty = list(Difficulty)[diff_choice-1]
    
    # Create the game
    game = TicTacToeGame(mode=mode, difficulty=difficulty)
    
    # Game loop
    game_over = False
    winner = None
    
    while not game_over:
        game.display()
        
        if game.current_player == game.human_player:
            # Human's turn
            valid_move = False
            while not valid_move:
                try:
                    row = int(input(f"Enter row (0-{game.board.size-1}): "))
                    col = int(input(f"Enter column (0-{game.board.size-1}): "))
                    valid_move = game.make_human_move(row, col)
                    if not valid_move:
                        print("Invalid move! Try again.")
                except ValueError:
                    print("Please enter valid numbers!")
        else:
            # AI's turn
            print("\nAI is thinking...")
            ai_move = game.make_ai_move()
            if ai_move:
                row, col = ai_move
                print(f"AI chose: ({row}, {col})")
        
        # Check if game is over
        game_over, winner = game.check_game_over()
    
    # Game over
    game.display()
    if winner:
        if winner == game.human_player:
            print("Congratulations! You won!")
        else:
            print("AI wins! Better luck next time.")
    else:
        print("It's a draw!")

if __name__ == "__main__":
    play_console_game()
