import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imageCache } from '../utils/imageCache';

interface OptimizedImageProps {
  uri?: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  containerStyle,
  placeholder,
  fallbackIcon = 'person',
  onLoad,
  onError
}) => {
  const [cachedUri, setCachedUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(!!uri);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uri) {
      setCachedUri(undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    imageCache.getCachedImage(uri)
      .then((cached) => {
        setCachedUri(cached);
        setLoading(false);
        onLoad?.();
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        onError?.();
      });
  }, [uri]);

  if (!uri || error) {
    return (
      <View style={[styles.fallback, containerStyle, style]}>
        {placeholder || <Ionicons name={fallbackIcon} size={24} color="#999" />}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loading, containerStyle, style]}>
        <ActivityIndicator size="small" color="#b081ee" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: cachedUri }}
      style={style}
      onLoad={onLoad}
      onError={() => {
        setError(true);
        onError?.();
      }}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});