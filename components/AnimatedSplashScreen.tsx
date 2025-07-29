import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export default function AnimatedSplashScreen({ onAnimationFinish }: AnimatedSplashScreenProps) {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const backgroundOpacity = useSharedValue(1);
  const particlesOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Partículas flutuantes
  const particle1Y = useSharedValue(height);
  const particle2Y = useSharedValue(height);
  const particle3Y = useSharedValue(height);
  const particle4Y = useSharedValue(height);
  const particle5Y = useSharedValue(height);

  useEffect(() => {
    // Sequência de animações
    const startAnimations = () => {
      // 1. Fade in do background
      backgroundOpacity.value = withTiming(1, { duration: 500 });

      // 2. Partículas começam a flutuar
      setTimeout(() => {
        particlesOpacity.value = withTiming(0.6, { duration: 800 });
        
        // Animação contínua das partículas
        particle1Y.value = withRepeat(
          withTiming(-100, { duration: 4000 }),
          -1,
          false
        );
        particle2Y.value = withDelay(
          500,
          withRepeat(
            withTiming(-100, { duration: 3500 }),
            -1,
            false
          )
        );
        particle3Y.value = withDelay(
          1000,
          withRepeat(
            withTiming(-100, { duration: 4500 }),
            -1,
            false
          )
        );
        particle4Y.value = withDelay(
          1500,
          withRepeat(
            withTiming(-100, { duration: 3800 }),
            -1,
            false
          )
        );
        particle5Y.value = withDelay(
          2000,
          withRepeat(
            withTiming(-100, { duration: 4200 }),
            -1,
            false
          )
        );
      }, 300);

      // 3. Logo aparece com escala e rotação
      setTimeout(() => {
        logoOpacity.value = withTiming(1, { duration: 600 });
        logoScale.value = withSequence(
          withSpring(1.2, { damping: 8, stiffness: 100 }),
          withSpring(1, { damping: 12, stiffness: 150 })
        );
        logoRotation.value = withSpring(360, { damping: 15, stiffness: 100 });
        
        // Efeito de brilho pulsante
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 1000 }),
            withTiming(0.3, { duration: 1000 })
          ),
          -1,
          true
        );
        
        // Pulso do logo
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        );
      }, 800);

      // 4. Título aparece
      setTimeout(() => {
        titleOpacity.value = withTiming(1, { duration: 800 });
        titleTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      }, 1400);

      // 5. Subtítulo aparece
      setTimeout(() => {
        subtitleOpacity.value = withTiming(1, { duration: 800 });
        subtitleTranslateY.value = withSpring(0, { damping: 12, stiffness: 100 });
      }, 1800);

      // 6. Finaliza a animação
      setTimeout(() => {
        backgroundOpacity.value = withTiming(0, { duration: 800 }, () => {
          runOnJS(onAnimationFinish)();
        });
      }, 3500);
    };

    startAnimations();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value * pulseScale.value },
        { rotate: `${logoRotation.value}deg` },
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleTranslateY.value }],
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backgroundOpacity.value,
    };
  });

  const particlesAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: particlesOpacity.value,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const createParticleStyle = (particleY: Animated.SharedValue<number>, delay: number) => {
    return useAnimatedStyle(() => {
      return {
        transform: [{ translateY: particleY.value }],
        opacity: interpolate(
          particleY.value,
          [height, height - 200, -100],
          [0, 1, 0],
          Extrapolate.CLAMP
        ),
      };
    });
  };

  const particle1Style = createParticleStyle(particle1Y, 0);
  const particle2Style = createParticleStyle(particle2Y, 500);
  const particle3Style = createParticleStyle(particle3Y, 1000);
  const particle4Style = createParticleStyle(particle4Y, 1500);
  const particle5Style = createParticleStyle(particle5Y, 2000);

  return (
    <Animated.View style={[styles.container, backgroundAnimatedStyle]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#b081ee', '#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Partículas flutuantes */}
      <Animated.View style={[styles.particlesContainer, particlesAnimatedStyle]}>
        <Animated.View style={[styles.particle, particle1Style, { left: '10%' }]}>
          <Ionicons name="medical" size={20} color="rgba(255,255,255,0.3)" />
        </Animated.View>
        <Animated.View style={[styles.particle, particle2Style, { left: '80%' }]}>
          <Ionicons name="heart" size={16} color="rgba(255,255,255,0.4)" />
        </Animated.View>
        <Animated.View style={[styles.particle, particle3Style, { left: '30%' }]}>
          <Ionicons name="fitness" size={18} color="rgba(255,255,255,0.3)" />
        </Animated.View>
        <Animated.View style={[styles.particle, particle4Style, { left: '70%' }]}>
          <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.4)" />
        </Animated.View>
        <Animated.View style={[styles.particle, particle5Style, { left: '50%' }]}>
          <Ionicons name="pulse" size={22} color="rgba(255,255,255,0.3)" />
        </Animated.View>
      </Animated.View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        {/* Efeito de brilho atrás do logo */}
        <Animated.View style={[styles.glow, glowAnimatedStyle]} />
        
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Título */}
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Personal Medicare
        </Animated.Text>

        {/* Subtítulo */}
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Cuidando da sua saúde com tecnologia
        </Animated.Text>
      </View>

      {/* Indicador de carregamento */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View style={[styles.loadingProgress, { width: '100%' }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
  },
  loadingBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});