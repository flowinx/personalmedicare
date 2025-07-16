import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, getProfile, updateProfile } from '../db/profile';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: { name: string; email: string; avatar_uri?: string | null }) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      console.log('[ProfileContext] Profile refreshed:', profileData);
    } catch (error) {
      console.error('[ProfileContext] Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: { name: string; email: string; avatar_uri?: string | null }) => {
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
    refreshProfile();
  }, []);

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