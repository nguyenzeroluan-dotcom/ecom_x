import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { UserProfile, AuthContextType } from '../types';
import { useNotification } from './NotificationContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await getUserProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                } else {
                    // Create init profile if missing
                    const newProfile = {
                        id: session.user.id,
                        email: session.user.email || '',
                        avatar_url: `https://ui-avatars.com/api/?name=${session.user.email}&background=random`,
                        role: 'customer' as const
                    };
                    await updateUserProfile(session.user.id, newProfile);
                    setUser(newProfile as UserProfile);
                }
            }
        } catch (error) {
            console.error("Session check failed:", error);
        } finally {
            setLoading(false);
        }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
         const profile = await getUserProfile(session.user.id);
         setUser(profile || { id: session.user.id, email: session.user.email || '', role: 'customer' });
      } else {
         setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Simplified Sign In (Magic Link or Password would go here)
  // For this demo, we simulate a "login" if Supabase Auth isn't fully set up in the user's project
  const signIn = async (email: string) => {
    try {
        // Try actual Supabase Login (Magic Link)
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        addNotification('success', 'Check your email for the login link!');
    } catch (e: any) {
        console.error(e);
        addNotification('error', e.message || 'Login failed');
    }
  };

  const demoLogin = () => {
      // Fallback for demo purposes without backend email sending
      const mockUser: UserProfile = {
          id: 'demo-user-123',
          email: 'admin@nexus.ai',
          full_name: 'Demo Admin',
          avatar_url: 'https://i.pravatar.cc/150?u=nexus-admin',
          ai_style_preference: 'Futuristic Minimalist',
          address: '123 Innovation Drive, Tech City',
          role: 'admin' // Demo user is an admin
      };
      setUser(mockUser);
      addNotification('success', 'Logged in as Demo Admin');
  };

  const signOut = async () => {
    if (user?.id === 'demo-user-123') {
        setUser(null);
    } else {
        await supabase.auth.signOut();
    }
    addNotification('info', 'Signed out successfully');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
      if (!user) return;
      
      if (user.id === 'demo-user-123') {
          setUser(prev => prev ? ({ ...prev, ...updates }) : null);
          addNotification('success', 'Profile updated (Local Demo)');
          return;
      }

      try {
          const updated = await updateUserProfile(user.id, updates);
          if (updated) {
              setUser(updated);
              addNotification('success', 'Profile updated successfully');
          }
      } catch (e: any) {
          addNotification('error', 'Failed to update profile');
      }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateProfile, demoLogin, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
