import * as AppleAuthentication from 'expo-apple-authentication';

// Altere para a URL real do seu backend
const BACKEND_URL = 'https://glasscare.lexbix.com:3001';

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Erro ao solicitar recuperação de senha.');
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