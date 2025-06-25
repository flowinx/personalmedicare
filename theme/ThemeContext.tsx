import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeContextProps {
  colorScheme: ColorSchemeName;
  setColorScheme: (scheme: ColorSchemeName) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  colorScheme: 'light',
  setColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeName>('light');

  useEffect(() => {
    // Inicializa com o tema do sistema
    const systemScheme = Appearance.getColorScheme();
    setColorSchemeState(systemScheme || 'light');
  }, []);

  const setColorScheme = (scheme: ColorSchemeName) => {
    setColorSchemeState(scheme);
    // Aqui pode-se salvar em AsyncStorage se quiser persistir
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 