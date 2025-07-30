import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithApple, signInWithGoogle } from '../services/firebase';

interface AuthSocialButtonsProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
}

export const AuthSocialButtons: React.FC<AuthSocialButtonsProps> = ({
  onSuccess,
  onError
}) => {
  const handleAppleSignIn = async () => {
    try {
      const user = await signInWithApple();
      onSuccess?.(user);
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      
      if (error.message.includes('EXPO_DEV_LIMITATION')) {
        Alert.alert(
          'Desenvolvimento',
          'Apple Sign-In será testado no build final.\n\nPara desenvolvimento, use:\n• Email e senha\n• Google Sign-In\n\nApple Sign-In funcionará perfeitamente na App Store!',
          [{ text: 'Entendi', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Erro no Apple Sign-In',
          error.message || 'Erro desconhecido',
          [{ text: 'OK' }]
        );
        onError?.(error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      onSuccess?.(user);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.message.includes('EXPO_DEV_LIMITATION')) {
        Alert.alert(
          'Desenvolvimento',
          'Google Sign-In será testado no build final.\n\nPara desenvolvimento, use:\n• Email e senha\n\nGoogle Sign-In funcionará perfeitamente na App Store!',
          [{ text: 'Entendi', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Erro no Google Sign-In',
          error.message || 'Erro desconhecido',
          [{ text: 'OK' }]
        );
        onError?.(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Apple Sign-In Button */}
      <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
        <Ionicons name="logo-apple" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.appleButtonText}>Continuar com Apple</Text>
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.icon} />
        <Text style={styles.googleButtonText}>Continuar com Google</Text>
      </TouchableOpacity>

      {/* Development Notice */}
      {__DEV__ && (
        <Text style={styles.devNotice}>
          💡 Desenvolvimento: Logins sociais funcionam apenas no build final
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 48,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
    minHeight: 48,
  },
  icon: {
    marginRight: 8,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '600',
  },
  devNotice: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});