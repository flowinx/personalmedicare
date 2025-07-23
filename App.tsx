import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from './components/CustomDrawerContent';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './theme/ThemeContext';

// Importar as telas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddMemberScreen from './screens/AddMemberScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import EditMemberScreen from './screens/EditMemberScreen';
import AddTreatmentScreen from './screens/AddTreatmentScreen';
import TreatmentsScreen from './screens/TreatmentsScreen';
import TreatmentDetailScreen from './screens/TreatmentDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReportsScreen from './screens/ReportsScreen';

type AuthStackParamList = {
  Login: undefined;
};

type HomeStackParamList = {
  HomeMain: undefined;
  MemberDetail: { id: string };
  EditMember: { memberId: string };
};

type TreatmentsStackParamList = {
  TreatmentsMain: undefined;
  TreatmentDetail: { treatmentId: string };
};

const AuthStackNavigator = createStackNavigator<AuthStackParamList>();
const HomeStackNavigator = createStackNavigator<HomeStackParamList>();
const TreatmentsStackNavigator = createStackNavigator<TreatmentsStackParamList>();
const Drawer = createDrawerNavigator();

SplashScreen.preventAutoHideAsync();

function AuthStack() {
  return (
    <AuthStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNavigator.Screen name="Login" component={LoginScreen} />
    </AuthStackNavigator.Navigator>
  );
}

// Stack Navigator para telas que precisam ser empilhadas (como detalhes)
function HomeStack() {
  return (
    <HomeStackNavigator.Navigator>
      <HomeStackNavigator.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <HomeStackNavigator.Screen 
        name="MemberDetail" 
        component={MemberDetailScreen}
        options={{ headerShown: false }}
      />
      <HomeStackNavigator.Screen 
        name="EditMember" 
        component={EditMemberScreen}
        options={{ headerShown: false }}
      />
    </HomeStackNavigator.Navigator>
  );
}

function TreatmentsStack() {
  return (
    <TreatmentsStackNavigator.Navigator>
      <TreatmentsStackNavigator.Screen 
        name="TreatmentsMain" 
        component={TreatmentsScreen} 
        options={{ headerShown: false }}
      />
      <TreatmentsStackNavigator.Screen 
        name="TreatmentDetail" 
        component={TreatmentDetailScreen}
        options={{ 
          title: 'Detalhes do Tratamento',
          headerStyle: { backgroundColor: '#b081ee' },
          headerTintColor: '#fff'
        }}
      />
    </TreatmentsStackNavigator.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#f8f9fa',
          width: 280,
        },
        drawerActiveTintColor: '#b081ee',
        drawerInactiveTintColor: '#666',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b081ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen 
        name="HomeStack" 
        component={HomeStack}
        options={{
          title: 'Detalhe do Membro',
          drawerLabel: 'Início',
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AddMember" 
        component={AddMemberScreen}
        options={{
          title: 'Adicionar Membro',
          drawerLabel: 'Adicionar Membro',
          drawerIcon: ({ color }) => (
            <Ionicons name="person-add-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="TreatmentsStack" 
        component={TreatmentsStack}
        options={{
          title: 'Tratamentos',
          drawerLabel: 'Tratamentos',
          drawerIcon: ({ color }) => (
            <Ionicons name="medical-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="AddTreatment" 
        component={AddTreatmentScreen}
        options={{
          title: 'Novo Tratamento',
          drawerLabel: 'Novo Tratamento',
          drawerIcon: ({ color }) => (
            <Ionicons name="add-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil',
          drawerLabel: 'Meu Perfil',
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Relatórios',
          drawerLabel: 'Relatórios',
          drawerIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          drawerLabel: 'Configurações',
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b081ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
    'Inter': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ProfileProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ProfileProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});