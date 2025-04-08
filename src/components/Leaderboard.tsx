import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Leaderboard = ({ className }: { className?: string }) => {
  // Placeholder data for the leaderboard
  const placeholderEntries = [
    { position: 1, name: '---', score: '---', game: '---' },
    { position: 2, name: '---', score: '---', game: '---' },
    { position: 3, name: '---', score: '---', game: '---' },
    { position: 4, name: '---', score: '---', game: '---' },
    { position: 5, name: '---', score: '---', game: '---' },
  ];

  return (
    <Card className={`w-full shadow-md border border-border/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5" /> Leaderboard
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-muted-foreground">
            Coming Soon: Track your scores and compete with others!
          </p>
        </div>
        
        <div className="overflow-hidden rounded-md border">
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
              {placeholderEntries.map((entry) => (
                <tr 
                  key={entry.position}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle">{entry.position}</td>
                  <td className="p-4 align-middle">{entry.name}</td>
                  <td className="p-4 align-middle">{entry.game}</td>
                  <td className="p-4 align-middle">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button variant="outline" size="sm" disabled>
          Sign in to track your scores
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Leaderboard;