
export interface GameVariant {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  rules: string[];
  featured?: boolean;
}

export const gameVariants: GameVariant[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The timeless game of X\'s and O\'s that everyone knows and loves.',
    difficulty: 'easy',
    featured: true,
    rules: [
      'Players take turns placing their mark (X or O) on the board',
      'First player to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins',
      'If the board fills up with no winner, the game is a draw'
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    description: 'Play on 9 different boards simultaneously in this strategic variant.',
    difficulty: 'hard',
    featured: true,
    rules: [
      'The board consists of 9 smaller tic-tac-toe boards arranged in a 3×3 grid',
      'Win a small board to claim it with your mark',
      'Win three small boards in a row to win the game',
      'Your opponent must play in the board corresponding to the cell you played in'
    ]
  },
  {
    id: 'misere',
    name: 'Misère',
    description: 'The reverse version where getting three in a row loses the game.',
    difficulty: 'medium',
    featured: true,
    rules: [
      'Same as classic, but the goal is to avoid making a line of three',
      'First player to get 3 of their marks in a row loses',
      'If the board fills up with no three in a row, the game is a draw'
    ]
  },
  {
    id: '3d',
    name: '3D',
    description: 'Play in three dimensions with 27 cells arranged in a 3×3×3 cube.',
    difficulty: 'hard',
    rules: [
      'Similar to classic, but played on a 3×3×3 cube',
      'Win by getting 3 in a row in any direction (including diagonals through the cube)',
      'There are 49 possible winning lines'
    ]
  },
  {
    id: 'wild',
    name: 'Wild',
    description: 'Players can choose to place either X or O on each turn.',
    difficulty: 'medium',
    rules: [
      'Each player can place either an X or an O on their turn',
      'First player to create a line of three identical symbols wins',
      'Adds a new layer of strategy to the classic game'
    ]
  },
  {
    id: 'numttt',
    name: 'Numerical',
    description: 'Use numbers instead of X\'s and O\'s. Sum of three numbers must equal 15 to win.',
    difficulty: 'medium',
    rules: [
      'Player 1 uses odd numbers (1, 3, 5, 7, 9) and Player 2 uses even numbers (2, 4, 6, 8)',
      'Each number can only be used once',
      'Win by getting three numbers that sum to 15',
      'This is equivalent to classic tic-tac-toe on a magic square'
    ]
  },
  {
    id: 'quantum',
    name: 'Quantum',
    description: 'A mind-bending variant where moves remain in superposition until observed.',
    difficulty: 'hard',
    rules: [
      'Players place their marks in "superposition" - not committed until a line is completed',
      'When a cell is "observed" (part of a potential winning line), it collapses to one player\'s mark',
      'Inspired by quantum mechanics principles'
    ]
  },
  {
    id: 'notakto',
    name: 'Notakto',
    description: 'Both players play as X. The player who completes a line loses.',
    difficulty: 'medium',
    rules: [
      'Both players play as X',
      'The player who completes a line of three X\'s loses',
      'A strategic variant that becomes a game of forced moves'
    ]
  }
];

export const getFeaturedGames = (): GameVariant[] => {
  return gameVariants.filter(game => game.featured);
};

export const getGameById = (id: string): GameVariant | undefined => {
  return gameVariants.find(game => game.id === id);
};
