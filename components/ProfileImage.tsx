import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ImageStyle, View, ViewStyle } from 'react-native';

interface ProfileImageProps {
  uri?: string | null;
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

export function ProfileImage({ 
  uri, 
  size = 80, 
  style, 
  containerStyle,
  fallbackIcon = 'person'
}: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);

  const isValidUri = uri && uri.trim() !== '' && uri !== 'null' && uri !== 'undefined';

  const handleImageError = () => {
    console.log('Image failed to load:', uri);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', uri);
    setImageError(false);
  };

  if (!isValidUri || imageError) {
    return (
      <View 
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#f0eaff',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: '#fff',
          },
          containerStyle
        ]}
      >
        <Ionicons name={fallbackIcon} size={size * 0.4} color="#b081ee" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: '#fff',
        },
        style
      ]}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
} 