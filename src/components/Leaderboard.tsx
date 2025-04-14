import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGlobalLeaderboard, fetchWeeklyLeaderboard, LeaderboardEntry } from '@/utils/leaderboard';
import { useAuth } from '@/contexts/AuthContext';

const Leaderboard = ({ className }: { className?: string }) => {
  const { user } = useAuth();
  // State for filters
  const [gameMode, setGameMode] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [timeFrame, setTimeFrame] = useState<string>('week');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch leaderboard data based on filters
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let data: LeaderboardEntry[] = [];
        
        if (timeFrame === 'week') {
          data = await fetchWeeklyLeaderboard({
            variant: gameMode !== 'all' ? gameMode : undefined,
            difficulty: difficulty !== 'all' ? difficulty : undefined,
            limit: 10
          });
        } else {
          data = await fetchGlobalLeaderboard({
            variant: gameMode !== 'all' ? gameMode : undefined,
            difficulty: difficulty !== 'all' ? difficulty : undefined,
            timeFrame: timeFrame === '24h' ? 'day' : 
                      timeFrame === 'year' ? 'year' : 
                      timeFrame === 'all' ? 'all' : 'week',
            limit: 10
          });
        }
        
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [gameMode, difficulty, timeFrame]);
  
  // If no entries match the filters, show placeholder entries
  const placeholderEntries = [
    { position: 1, username: '---', total_score: 0, variant: '---' },
    { position: 2, username: '---', total_score: 0, variant: '---' },
    { position: 3, username: '---', total_score: 0, variant: '---' },
    { position: 4, username: '---', total_score: 0, variant: '---' },
    { position: 5, username: '---', total_score: 0, variant: '---' },
  ];

  const entriesToDisplay = leaderboardData.length > 0 
    ? leaderboardData.map((entry, index) => ({
        position: index + 1,
        username: entry.username || 'Anonymous',
        total_score: entry.total_score,
        variant: entry.variant
      }))
    : placeholderEntries;

  return (
    <Card className={`w-full shadow-md border border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5" /> Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4 mb-4">
          {/* Filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Game Mode</label>
              <Select value={gameMode} onValueChange={setGameMode}>
                <SelectTrigger>
                  <SelectValue placeholder="All Game Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="feral">Feral</SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                  <SelectItem value="misere">Misere</SelectItem>
                  <SelectItem value="chaos">Chaos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Time Period</label>
              <Tabs defaultValue="week" value={timeFrame} onValueChange={setTimeFrame} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="24h">24h</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-md border">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Rank</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Player</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Game</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {entriesToDisplay.map((entry, index) => (
                  <tr 
                    key={index}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{entry.position}</td>
                    <td className="p-4 align-middle">{entry.username}</td>
                    <td className="p-4 align-middle">{entry.variant}</td>
                    <td className="p-4 align-middle">{entry.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {user ? (
          <Button variant="outline" size="sm" asChild>
            <a href="/profile">View your stats</a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <a href="/auth">Sign in to track your scores</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Leaderboard;