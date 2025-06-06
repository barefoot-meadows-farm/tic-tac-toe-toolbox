
import React from 'react';
import { Grid3X3, X, Hash, Swords, Shuffle, Settings } from 'lucide-react';

export interface GameVariant {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'variable';
  imageUrl?: string;
  rules?: string[];
  featured?: boolean;
  premium?: boolean;
  component?: React.LazyExoticComponent<React.ComponentType<any>>;
  icon?: React.ReactNode;
  tags?: string[];
}

export const gameVariants: GameVariant[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic Tic-Tac-Toe. Get three in a row to win.',
    difficulty: 'easy',
    component: React.lazy(() => import('../../Games/tictactoe.jsx')),
    icon: <Grid3X3 className="h-6 w-6" />,
    tags: ['classic', 'beginner-friendly'],
    premium: false
  },
  {
    id: 'misere',
    name: 'Misère',
    description: 'Reverse Tic-Tac-Toe. The player who gets three in a row loses!',
    difficulty: 'medium',
    component: React.lazy(() => import('../../Games/misere.jsx')),
    icon: <X className="h-6 w-6" />,
    tags: ['strategy', 'twist'],
    premium: false
  },
  {
    id: 'numerical',
    name: 'Numerical',
    description: 'Use numbers instead of X and O. Win by getting three numbers that sum to 15.',
    difficulty: 'hard',
    component: React.lazy(() => import('../Games/numerical.tsx')),
    icon: <Hash className="h-6 w-6" />,
    tags: ['math', 'strategy'],
    premium: false
  },
  {
    id: 'feral',
    name: 'Feral',
    description: 'You can overwrite your opponent\'s marks with your own.',
    difficulty: 'medium',
    component: React.lazy(() => import('../../Games/feral.jsx')),
    icon: <Swords className="h-6 w-6" />,
    tags: ['aggressive', 'strategy'],
    premium: false
  },
  {
    id: 'chaos',
    name: 'Chaos',
    description: 'After each round, two random cells on the board swap positions.',
    difficulty: 'hard',
    component: React.lazy(() => import('../Games/chaos.tsx')),
    icon: <Shuffle className="h-6 w-6" />,
    tags: ['unpredictable', 'fun'],
    premium: true
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Create your own game by mixing rules from different modes.',
    difficulty: 'variable',
    component: React.lazy(() => import('../Games/custom.tsx')),
    icon: <Settings className="h-6 w-6" />,
    tags: ['customizable', 'creative'],
    premium: true
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
