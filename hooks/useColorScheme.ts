import { useContext } from 'react';
import { ColorSchemeName, useColorScheme as useSystemColorScheme } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';

export function useColorScheme(): ColorSchemeName {
  const { colorScheme } = useContext(ThemeContext) || {};
  const systemScheme = useSystemColorScheme();
  return colorScheme || systemScheme || 'light';
}
