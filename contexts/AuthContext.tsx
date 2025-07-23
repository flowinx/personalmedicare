import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('[AuthContext] AuthProvider renderizado - user:', user ? 'existe' : 'null', 'loading:', loading);

  useEffect(() => {
    console.log('[AuthContext] Iniciando monitoramento de autenticação...');
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('[AuthContext] Estado de autenticação mudou:', user ? `Usuário: ${user.email}` : 'Nenhum usuário');
        setUser(user);
        setLoading(false);
      }, (error) => {
        console.error('[AuthContext] Erro no monitoramento de autenticação:', error);
        setUser(null);
        setLoading(false);
      });

      return () => {
        console.log('[AuthContext] Limpando monitoramento de autenticação');
        unsubscribe();
      };
    } catch (error) {
      console.error('[AuthContext] Erro ao configurar monitoramento:', error);
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    try {
      console.log('[AuthContext] Fazendo logout...');
      await auth.signOut();
      console.log('[AuthContext] Logout realizado com sucesso');
    } catch (error) {
      console.error('[AuthContext] Erro ao fazer logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  console.log('[AuthContext] Estado atual - user:', user ? user.email : 'null', 'loading:', loading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 