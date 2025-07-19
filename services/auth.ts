import * as AppleAuthentication from 'expo-apple-authentication';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

// Altere para a URL real do seu backend
const BACKEND_URL = 'https://glasscare.lexbix.com:3001';

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('[Auth] Erro ao enviar email de reset:', error);
    
    let errorMessage = 'Erro ao solicitar recuperação de senha.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email não encontrado. Verifique se o email está correto.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    }
    
    throw new Error(errorMessage);
  }
}

// ----------- GOOGLE -----------
// Configure seu Client ID Web do Google
const GOOGLE_CLIENT_ID = 'SUA_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export async function signInWithGoogle() {
  // Implementação simplificada - você precisará implementar a autenticação Google
  // usando um hook em um componente React ou uma biblioteca específica
  throw new Error('Autenticação Google não implementada ainda.');
}

// ----------- APPLE -----------
export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    // Envie credential.identityToken para o backend se necessário
    return credential;
  } catch (e) {
    throw new Error('Login Apple cancelado ou falhou.');
  }
}

export async function signup(fullname: string, email: string, password: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: fullname, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Erro ao cadastrar usuário.');
  }
} 