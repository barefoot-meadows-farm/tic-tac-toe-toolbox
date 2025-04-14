-- Enhance game_stats table with additional fields for comprehensive tracking
ALTER TABLE game_stats
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS moves_count INTEGER,
ADD COLUMN IF NOT EXISTS game_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS player_symbol VARCHAR(1);

-- Add indexes for frequently queried columns to improve performance
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_variant ON game_stats(variant);
CREATE INDEX IF NOT EXISTS idx_game_stats_difficulty ON game_stats(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_stats_result ON game_stats(result);
CREATE INDEX IF NOT EXISTS idx_game_stats_created_at ON game_stats(created_at);

-- Create a view for global leaderboard data
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT 
  p.username,
  g.user_id,
  g.variant,
  g.difficulty,
  COUNT(*) AS games_played,
  SUM(CASE WHEN g.result = 'win' THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN g.result = 'loss' THEN 1 ELSE 0 END) AS losses,
  SUM(CASE WHEN g.result = 'draw' THEN 1 ELSE 0 END) AS draws,
  SUM(g.score) AS total_score,
  MAX(g.created_at) AS last_played
FROM game_stats g
JOIN profiles p ON g.user_id = p.id
GROUP BY p.username, g.user_id, g.variant, g.difficulty;

-- Create a materialized view for faster leaderboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_weekly AS
SELECT 
  p.username,
  g.user_id,
  g.variant,
  g.difficulty,
  COUNT(*) AS games_played,
  SUM(CASE WHEN g.result = 'win' THEN 1 ELSE 0 END) AS wins,
  SUM(CASE WHEN g.result = 'loss' THEN 1 ELSE 0 END) AS losses,
  SUM(CASE WHEN g.result = 'draw' THEN 1 ELSE 0 END) AS draws,
  SUM(g.score) AS total_score
FROM game_stats g
JOIN profiles p ON g.user_id = p.id
WHERE g.created_at > (CURRENT_DATE - INTERVAL '7 days')
GROUP BY p.username, g.user_id, g.variant, g.difficulty;

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard_weekly()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard_weekly;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to refresh the materialized view when game_stats is updated
CREATE TRIGGER refresh_leaderboard_weekly_trigger
AFTER INSERT OR UPDATE OR DELETE ON game_stats
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_leaderboard_weekly();

-- Create a function to calculate player score based on game result, difficulty, and other factors
CREATE OR REPLACE FUNCTION calculate_game_score(
  p_result VARCHAR,
  p_difficulty VARCHAR,
  p_moves_count INTEGER,
  p_game_duration_seconds INTEGER
) RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 0;
  difficulty_multiplier FLOAT := 1.0;
  efficiency_bonus INTEGER := 0;
BEGIN
  -- Base score based on result
  IF p_result = 'win' THEN
    base_score := 100;
  ELSIF p_result = 'draw' THEN
    base_score := 30;
  ELSE -- loss
    base_score := 10;
  END IF;
  
  -- Apply difficulty multiplier
  IF p_difficulty = 'easy' THEN
    difficulty_multiplier := 1.0;
  ELSIF p_difficulty = 'medium' THEN
    difficulty_multiplier := 1.5;
  ELSIF p_difficulty = 'hard' THEN
    difficulty_multiplier := 2.0;
  END IF;
  
  -- Apply efficiency bonus for wins (fewer moves and faster completion)
  IF p_result = 'win' AND p_moves_count IS NOT NULL AND p_game_duration_seconds IS NOT NULL THEN
    -- Bonus for fewer moves (assuming 9 is the minimum for a win in standard tic-tac-toe)
    IF p_moves_count <= 9 THEN
      efficiency_bonus := efficiency_bonus + 20;
    ELSIF p_moves_count <= 12 THEN
      efficiency_bonus := efficiency_bonus + 10;
    END IF;
    
    -- Bonus for faster completion
    IF p_game_duration_seconds < 30 THEN
      efficiency_bonus := efficiency_bonus + 20;
    ELSIF p_game_duration_seconds < 60 THEN
      efficiency_bonus := efficiency_bonus + 10;
    END IF;
  END IF;
  
  -- Calculate final score
  RETURN FLOOR(base_score * difficulty_multiplier) + efficiency_bonus;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update game_stats with calculated score
CREATE OR REPLACE FUNCTION update_game_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.score := calculate_game_score(NEW.result, NEW.difficulty, NEW.moves_count, NEW.game_duration_seconds);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically calculate and update score when a game is recorded
CREATE TRIGGER calculate_game_score_trigger
BEFORE INSERT OR UPDATE ON game_stats
FOR EACH ROW
EXECUTE FUNCTION update_game_score();