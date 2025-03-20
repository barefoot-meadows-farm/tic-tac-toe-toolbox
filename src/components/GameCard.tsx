
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameVariant } from '@/utils/games';

interface GameCardProps {
  game: GameVariant;
  className?: string;
  featured?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, className, featured = false }) => {
  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    hard: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden group transition-all duration-300 hover:shadow-lg border-border/50",
        featured ? "md:h-full" : "",
        className
      )}
    >
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl md:text-2xl font-bold">
            {game.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "transition-colors",
              difficultyColor[game.difficulty]
            )}
          >
            {game.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-0">
        <p className="text-muted-foreground mb-4">
          {game.description}
        </p>
        <div className="space-y-2">
          {game.rules.slice(0, featured ? game.rules.length : 1).map((rule, index) => (
            <div key={index} className="flex gap-2 text-sm">
              <span className="text-primary">•</span>
              <span className="text-foreground/80">{rule}</span>
            </div>
          ))}
          {!featured && game.rules.length > 1 && (
            <p className="text-sm text-muted-foreground">
              And {game.rules.length - 1} more rules...
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-6 mt-4">
        <Link 
          to={`/game/${game.id}`}
          className="flex items-center text-primary font-medium group/link"
        >
          Play Now 
          <ArrowRight 
            className="ml-2 w-4 h-4 transition-transform group-hover/link:translate-x-1" 
          />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
