import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User, Session} from '@supabase/supabase-js';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/components/ui/use-toast';
import {data} from "autoprefixer";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  isPremium: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Improved AuthProvider with better error handling and session management
export function AuthProvider({children}: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    let mounted = true;

    // Define function to fetch premium status
    const fetchPremiumStatus = async (userId: string, retryCount = 0) => {
      console.log('Fetching premium status for user:', userId, 'attempt:', retryCount + 1);
      try {
        const {data, error} = await Promise.race([
          supabase
            .from('subscriptions')
            .select('is_premium')
            .eq('user_id', userId)
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          )
        ]);

        if (error) throw error;

        console.log('Subscription data:', data);

        if (mounted) {
          setIsPremium(data?.is_premium || false);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        if (retryCount < 2 && mounted) {
          console.log('Retrying subscription fetch...');
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return fetchPremiumStatus(userId, retryCount + 1);
        }
        // Set isPremium to false after all retries fail
        if (mounted) {
          setIsPremium(false);
        }
      }
    };

    // First immediately check for an existing session
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const {data: {user: UserResponse}} = await supabase.auth.getUser();
        console.log(data);
        // if (!mounted) return;
        console.log('Current session:', user);
        if (user) {
          // User is logged in, set session and user state
          // and fetch their premium status
          setUser(user);
          await fetchPremiumStatus(user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Important: Always set loading to false even if there's an error
        console.log('Session check complete');
        console.log('Mounted:', mounted);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Then set up the auth listener
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);

        if (currentSession?.user) {
          console.log('User is logged in:', currentSession.user);
          setSession(currentSession);
          setUser(currentSession.user);
          await fetchPremiumStatus(currentSession.user.id);
        } else {
          console.log('User is logged out');
          setSession(null);
          setUser(null);
          setIsPremium(false);
        }

        // Always update loading state on auth state change
        console.log('Mounted:', mounted);
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Call check session immediately
    checkSession();

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const {error} = await supabase.auth.signInWithPassword({email, password});

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {username}
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created!",
        description: "You've successfully signed up. Welcome!",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        isPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// To this pattern:
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };