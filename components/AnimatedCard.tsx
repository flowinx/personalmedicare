import React, { useCallback, useEffect, useMemo } from 'react';
import {
    Animated,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useEntranceAnimation } from '../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
  shadowColor?: string;
  animated?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = React.memo(({
  children,
  style,
  onPress,
  delay = 0,
  elevation = 3,
  borderRadius = 12,
  backgroundColor = '#ffffff',
  shadowColor = '#000',
  animated = true,
}) => {
  const { fadeAnim, slideAnim, scaleAnim, startAnimation } = useEntranceAnimation();

  const handleStartAnimation = useCallback(() => {
    if (animated) {
      setTimeout(() => {
        startAnimation();
      }, delay);
    }
  }, [animated, delay, startAnimation]);

  useEffect(() => {
    handleStartAnimation();
  }, [handleStartAnimation]);

  const cardStyle: ViewStyle = useMemo(() => ({
    backgroundColor,
    borderRadius,
    elevation,
    shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: elevation * 2,
    shadowOffset: { width: 0, height: elevation },
  }), [backgroundColor, borderRadius, elevation, shadowColor]);

  const animatedStyle = useMemo(() => ({
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { scale: scaleAnim },
    ],
  }), [fadeAnim, slideAnim, scaleAnim]);

  if (!animated) {
    return (
      <View style={[styles.card, cardStyle, style]}>
        {children}
      </View>
    );
  }

  const AnimatedComponent = onPress ? Animated.View : Animated.View;

  return (
    <AnimatedComponent
      style={[
        styles.card,
        cardStyle,
        style,
        animatedStyle,
      ]}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          style={styles.touchable}
        >
          {children}
        </TouchableOpacity>
      ) : (
        children
      )}
    </AnimatedComponent>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  touchable: {
    flex: 1,
  },
}); 