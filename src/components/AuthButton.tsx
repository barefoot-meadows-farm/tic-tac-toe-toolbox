
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  Crown, 
  CircleUser
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AuthButton() {
  const { user, signOut, isPremium } = useAuth();
  const navigate = useNavigate();
  
  // Show login button if not logged in
  if (!user) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link to="/auth" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </Button>
    );
  }
  
  // Show user avatar with dropdown if logged in
  const userEmail = user.email || '';
  const userInitials = userEmail.charAt(0).toUpperCase();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          {isPremium && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
              <Crown className="h-3 w-3" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {isPremium && (
              <p className="font-medium text-sm flex items-center">
                Premium Member <Crown className="h-3 w-3 ml-1 text-primary" />
              </p>
            )}
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex items-center">
            <CircleUser className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer flex items-center text-destructive focus:text-destructive"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
