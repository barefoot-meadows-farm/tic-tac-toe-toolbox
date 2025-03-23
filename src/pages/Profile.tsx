
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, User, Trophy, Calendar } from 'lucide-react';

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface GameStat {
  id: string;
  game_id: string;
  variant: string;
  result: 'win' | 'loss' | 'draw';
  opponent: 'ai' | 'human';
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
}

const Profile = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null }>({ 
    username: '', 
    avatar_url: null 
  });
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
    },
  });
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Fetch profile data
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setProfile(data);
            form.reset({
              username: data.username || '',
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      
      const fetchGameStats = async () => {
        try {
          const { data, error } = await supabase
            .from('game_stats')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          if (data) {
            setGameStats(data as GameStat[]);
          }
        } catch (error) {
          console.error('Error fetching game stats:', error);
        }
      };
      
      fetchProfile();
      fetchGameStats();
    }
  }, [user, form]);
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getWinRate = () => {
    if (gameStats.length === 0) return 0;
    const wins = gameStats.filter(stat => stat.result === 'win').length;
    return Math.round((wins / gameStats.length) * 100);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.username || 'Player'}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{user.email}</p>
                  {isPremium && (
                    <span className="flex items-center gap-1 text-primary-foreground bg-primary px-2 py-0.5 rounded-full text-xs">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Games Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gameStats.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getWinRate()}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    {isPremium ? (
                      <>
                        <Crown className="h-5 w-5 mr-1 text-primary" />
                        Premium
                      </>
                    ) : (
                      'Free Tier'
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="stats">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">Game History</TabsTrigger>
                <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Game History</CardTitle>
                    <CardDescription>
                      Your recent games and performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {gameStats.length > 0 ? (
                      <div className="space-y-4">
                        {gameStats.slice(0, 10).map((stat) => (
                          <div key={stat.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full 
                                ${stat.result === 'win' ? 'bg-green-100' : 
                                  stat.result === 'loss' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <Trophy className={`h-4 w-4 
                                  ${stat.result === 'win' ? 'text-green-600' : 
                                    stat.result === 'loss' ? 'text-red-600' : 'text-blue-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{stat.variant} - {stat.result}</p>
                                <p className="text-sm text-muted-foreground">
                                  vs {stat.opponent} {stat.difficulty && `(${stat.difficulty})`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(stat.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">You haven't played any games yet.</p>
                        <Button className="mt-4" asChild>
                          <a href="/collection">Play Now</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Username" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
