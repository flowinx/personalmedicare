import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Configurações de animação padrão
export const AnimationConfig = {
  duration: 300,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
};

// Animações de entrada
export const fadeIn = (value: Animated.Value, duration = 300) => {
  value.setValue(0);
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

export const slideInUp = (value: Animated.Value, distance = 50, duration = 300) => {
  value.setValue(distance);
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

export const slideInRight = (value: Animated.Value, distance = 100, duration = 300) => {
  value.setValue(distance);
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

export const scaleIn = (value: Animated.Value, duration = 300) => {
  value.setValue(0.8);
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

// Animações de saída
export const fadeOut = (value: Animated.Value, duration = 200) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

export const slideOutDown = (value: Animated.Value, distance = 50, duration = 200) => {
  return Animated.timing(value, {
    toValue: distance,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

// Animações de interação
export const pressIn = (value: Animated.Value, scale = 0.95) => {
  return Animated.timing(value, {
    toValue: scale,
    duration: 100,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

export const pressOut = (value: Animated.Value) => {
  return Animated.timing(value, {
    toValue: 1,
    duration: 100,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  });
};

// Animações de loading
export const pulse = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

export const rotate = (value: Animated.Value) => {
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Animações de shake
export const shake = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -10,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 10,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ]);
};

// Animações de sucesso
export const successBounce = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
};

// Animações de transição
export const transitionFade = (value: Animated.Value, toValue: number, duration = 300) => {
  return Animated.timing(value, {
    toValue,
    duration,
    easing: AnimationConfig.easing,
    useNativeDriver: true,
  });
};

// Hook para animação de entrada
export const useEntranceAnimation = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const startAnimation = useCallback(() => {
    Animated.parallel([
      fadeIn(fadeAnim),
      slideInUp(slideAnim),
      scaleIn(scaleAnim),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return {
    fadeAnim,
    slideAnim,
    scaleAnim,
    startAnimation,
  };
};

// Hook para animação de botão
export const useButtonAnimation = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    pressIn(scaleAnim).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    pressOut(scaleAnim).start();
  }, [scaleAnim]);

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
  };
}; 