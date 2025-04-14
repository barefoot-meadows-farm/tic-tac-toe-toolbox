import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Types for leaderboard data
export type LeaderboardEntry = {
  username: string;
  user_id: string;
  variant: string;
  difficulty: string | null;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  total_score: number;
  last_played?: string;
};

export type LeaderboardFilter = {
  variant?: string;
  difficulty?: string;
  timeFrame?: 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
};

/**
 * Fetch global leaderboard data with optional filters
 */
export const fetchGlobalLeaderboard = async (
  filter: LeaderboardFilter = {}
): Promise<LeaderboardEntry[]> => {
  try {
    let query = supabase.from('global_leaderboard').select('*');

    // Apply filters
    if (filter.variant && filter.variant !== 'all') {
      query = query.eq('variant', filter.variant);
    }

    if (filter.difficulty && filter.difficulty !== 'all') {
      query = query.eq('difficulty', filter.difficulty);
    }

    // Apply time filter if needed
    if (filter.timeFrame && filter.timeFrame !== 'all') {
      // For time-based filtering, we'll use the weekly materialized view
      // or query the base view with a time constraint
      if (filter.timeFrame === 'week') {
        // Use the materialized view for weekly data
        return fetchWeeklyLeaderboard(filter);
      } else {
        // Calculate the date range based on timeFrame
        const now = new Date();
        let startDate: Date;

        switch (filter.timeFrame) {
          case 'day':
            startDate = new Date(now.setDate(now.getDate() - 1));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            startDate = new Date(0); // Beginning of time
        }

        query = query.gte('last_played', startDate.toISOString());
      }
    }

    // Order by total score descending
    query = query.order('total_score', { ascending: false });

    // Apply limit if specified
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return [];
  }
};

/**
 * Fetch weekly leaderboard data from the materialized view
 */
export const fetchWeeklyLeaderboard = async (
  filter: LeaderboardFilter = {}
): Promise<LeaderboardEntry[]> => {
  try {
    let query = supabase.from('leaderboard_weekly').select('*');

    // Apply filters
    if (filter.variant && filter.variant !== 'all') {
      query = query.eq('variant', filter.variant);
    }

    if (filter.difficulty && filter.difficulty !== 'all') {
      query = query.eq('difficulty', filter.difficulty);
    }

    // Order by total score descending
    query = query.order('total_score', { ascending: false });

    // Apply limit if specified
    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data as LeaderboardEntry[];
  } catch (error) {
    console.error('Error fetching weekly leaderboard:', error);
    return [];
  }
};

/**
 * Fetch user's personal stats
 */
export const fetchUserStats = async (userId: string): Promise<{
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  totalScore: number;
  highestScore: number;
  favoriteVariant: string | null;
}> => {
  try {
    // Get total games and results
    const { data: statsData, error: statsError } = await supabase
      .from('game_stats')
      .select('result, score, variant')
      .eq('user_id', userId);

    if (statsError) throw statsError;

    if (!statsData || statsData.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        totalScore: 0,
        highestScore: 0,
        favoriteVariant: null
      };
    }

    // Calculate stats
    const totalGames = statsData.length;
    const wins = statsData.filter(game => game.result === 'win').length;
    const losses = statsData.filter(game => game.result === 'loss').length;
    const draws = statsData.filter(game => game.result === 'draw').length;
    const totalScore = statsData.reduce((sum, game) => sum + (game.score || 0), 0);
    const highestScore = Math.max(...statsData.map(game => game.score || 0));

    // Find favorite variant (most played)
    const variantCounts: Record<string, number> = {};
    statsData.forEach(game => {
      if (game.variant) {
        variantCounts[game.variant] = (variantCounts[game.variant] || 0) + 1;
      }
    });

    let favoriteVariant: string | null = null;
    let maxCount = 0;

    Object.entries(variantCounts).forEach(([variant, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteVariant = variant;
      }
    });

    return {
      totalGames,
      wins,
      losses,
      draws,
      totalScore,
      highestScore,
      favoriteVariant
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalScore: 0,
      highestScore: 0,
      favoriteVariant: null
    };
  }
};