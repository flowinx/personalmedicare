import React, { useEffect } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    ViewStyle
} from 'react-native';
import { pulse, rotate } from '../utils/animations';

interface AnimatedLoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  style?: ViewStyle;
  color?: string;
  showText?: boolean;
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  size = 'medium',
  text = 'Carregando...',
  style,
  color = '#b081ee',
  showText = true,
}) => {
  const pulseAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    pulse(pulseAnim).start();
    rotate(rotateAnim).start();
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          spinner: styles.smallSpinner,
          text: styles.smallText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          spinner: styles.largeSpinner,
          text: styles.largeText,
        };
      default:
        return {
          container: styles.mediumContainer,
          spinner: styles.mediumSpinner,
          text: styles.mediumText,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          sizeStyles.spinner,
          {
            borderColor: color,
            transform: [
              { scale: pulseAnim },
              { rotate: spin },
            ],
          },
        ]}
      />
      {showText && (
        <Animated.Text
          style={[
            styles.text,
            sizeStyles.text,
            { color },
            { opacity: pulseAnim },
          ]}
        >
          {text}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRadius: 50,
  },
  text: {
    marginTop: 12,
    fontWeight: '500',
  },
  // Tamanhos
  smallContainer: {
    padding: 16,
  },
  smallSpinner: {
    width: 24,
    height: 24,
  },
  smallText: {
    fontSize: 12,
  },
  mediumContainer: {
    padding: 24,
  },
  mediumSpinner: {
    width: 40,
    height: 40,
  },
  mediumText: {
    fontSize: 14,
  },
  largeContainer: {
    padding: 32,
  },
  largeSpinner: {
    width: 60,
    height: 60,
  },
  largeText: {
    fontSize: 16,
  },
}); 