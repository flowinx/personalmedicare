import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, getProfile, updateProfile } from '../db/profile';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: { name: string; email: string; avatar_uri?: string | null }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async () => {
    console.log('[ProfileContext] refreshProfile called, user:', user ? 'authenticated' : 'not authenticated');
    
    if (!user) {
      console.log('[ProfileContext] No user, clearing profile');
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[ProfileContext] Loading profile for user:', user.uid);
      const profileData = await getProfile();
      setProfile(profileData);
      console.log('[ProfileContext] Profile refreshed:', profileData);
    } catch (error) {
      console.error('[ProfileContext] Error refreshing profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: { name: string; email: string; avatar_uri?: string | null }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await updateProfile(data);
      await refreshProfile(); // Atualiza o contexto após salvar
      console.log('[ProfileContext] Profile updated and refreshed');
    } catch (error) {
      console.error('[ProfileContext] Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('[ProfileContext] useEffect triggered, user changed:', user ? 'authenticated' : 'not authenticated');
    refreshProfile();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, updateProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 