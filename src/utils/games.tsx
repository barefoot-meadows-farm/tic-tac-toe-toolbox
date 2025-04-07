
export interface GameVariant {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  rules: string[];
  featured?: boolean;
  premium?: boolean;
}

export const gameVariants: GameVariant[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'The classic game of X\'s and O\'s that everyone knows and loves.',
    difficulty: 'easy',
    featured: true,
    premium: false,
    rules: [
      'Players take turns placing their mark (X or O) on the board',
      'First player to get 3 of their marks in a row (horizontally, vertically, or diagonally) wins',
      'If the board fills up with no winner, the game is a draw'
    ]
  },
  {
    id: 'misere',
    name: 'Misère',
    description: 'The reverse version where getting three in a row loses the game.',
    difficulty: 'medium',
    featured: true,
    premium: false,
    rules: [
      'Same as traditional, but the goal is to avoid making a line of three',
      'First player to get 3 of their marks in a row loses',
      'If the board fills up with no three in a row, the game is a draw'
    ]
  },
  {
    id: 'feral',
    name: 'Feral',
    description: 'Like Traditional Tic-Tac-Toe but players can overwrite an opponent\'s placement.',
    difficulty: 'medium',
    premium: false,
    rules: [
      'Similar to traditional, but players can place their mark over an opponent\'s mark',
      'This adds a new layer of strategy as no placement is permanent',
      'First player to get 3 of their marks in a row wins'
    ]
  },
  {
    id: 'numerical',
    name: 'Numerical',
    description: 'Use numbers instead of X\'s and O\'s. Sum of three numbers must equal 15 to win.',
    difficulty: 'medium',
    premium: false,
    rules: [
      'Player 1 uses odd numbers (1, 3, 5, 7, 9) and Player 2 uses even numbers (2, 4, 6, 8)',
      'Each number can only be used once',
      'Win by getting three numbers that sum to 15',
      'This is equivalent to traditional tic-tac-toe on a magic square'
    ]
  },
  {
    id: 'unrestricted',
    name: 'Unrestricted',
    description: 'Play on a seemingly infinite board where players decide the winning line length.',
    difficulty: 'hard',
    premium: true,
    rules: [
      'Similar to traditional but on a much larger board',
      'Players vote before the match starts to determine how many marks in a row are needed to win',
      'This allows for more complex strategies and longer games',
      'No draw condition unless players agree to end the game'
    ]
  }
];

export const getFeaturedGames = (): GameVariant[] => {
  return gameVariants.filter(game => game.featured);
};

export const getGameById = (id: string): GameVariant | undefined => {
  return gameVariants.find(game => game.id === id);
};

export const getPremiumGames = (): GameVariant[] => {
  return gameVariants.filter(game => game.premium);
};

export const getFreeGames = (): GameVariant[] => {
  return gameVariants.filter(game => !game.premium);
};
