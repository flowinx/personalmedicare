import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from './components/CustomDrawerContent';
import AnimatedSplashScreen from './components/AnimatedSplashScreen';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './theme/ThemeContext';
import { initDatabase } from './db/index';

// Importar as telas
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddMemberScreen from './screens/AddMemberScreen';
import MemberDetailScreen from './screens/MemberDetailScreen';
import EditMemberScreen from './screens/EditMemberScreen';
import AddTreatmentScreen from './app/(drawer)/addTreatment';
import TreatmentsScreen from './screens/TreatmentsScreen';
import TreatmentDetailScreen from './screens/TreatmentDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrivacySecurityScreen from './screens/PrivacySecurityScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import RemindersScreen from './screens/RemindersScreen';
import ExportDataScreen from './screens/ExportDataScreen';
import FamilySyncScreen from './screens/FamilySyncScreen';
import ThemeScreen from './screens/ThemeScreen';
import LanguageScreen from './screens/LanguageScreen';
import AboutScreen from './screens/AboutScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';
import ContactScreen from './screens/ContactScreen';
import ReportsScreen from './screens/ReportsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './screens/TermsOfServiceScreen';
import DataCollectionScreen from './screens/DataCollectionScreen';
import FarmacinhaScreen from './screens/FarmacinhaScreen';
import WeightTrackingScreen from './screens/WeightTrackingScreen';

type AuthStackParamList = {
  Login: undefined;
};

type HomeStackParamList = {
  HomeMain: undefined;
  MemberDetail: { id: string };
  EditMember: { memberId: string };
  WeightTracking: { memberId: string };
};

type TreatmentsStackParamList = {
  TreatmentsMain: undefined;
  TreatmentDetail: { treatmentId: string };
};

type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile: undefined;
  PrivacySecurity: undefined;
  ChangePassword: undefined;
  Reminders: undefined;
  ExportData: undefined;
  FamilySync: undefined;
  Theme: undefined;
  Language: undefined;
  About: undefined;
  HelpCenter: undefined;
  Contact: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataCollection: undefined;
};

const AuthStackNavigator = createStackNavigator<AuthStackParamList>();
const HomeStackNavigator = createStackNavigator<HomeStackParamList>();
const TreatmentsStackNavigator = createStackNavigator<TreatmentsStackParamList>();
const SettingsStackNavigator = createStackNavigator<SettingsStackParamList>();
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
      <HomeStackNavigator.Screen
        name="WeightTracking"
        component={WeightTrackingScreen}
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

function SettingsStack() {
  return (
    <SettingsStackNavigator.Navigator>
      <SettingsStackNavigator.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="ExportData"
        component={ExportDataScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="FamilySync"
        component={FamilySyncScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="Theme"
        component={ThemeScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="Language"
        component={LanguageScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="About"
        component={AboutScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
      <SettingsStackNavigator.Screen
        name="DataCollection"
        component={DataCollectionScreen}
        options={{ headerShown: false }}
      />
    </SettingsStackNavigator.Navigator>
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
          title: 'Personal MediCare',
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
          title: 'Personal MediCare',
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
          title: 'Personal MediCare',
          drawerLabel: 'Tratamentos',
          drawerIcon: ({ color }) => (
            <Ionicons name="medical-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Farmacinha"
        component={FarmacinhaScreen}
        options={{
          title: 'Personal MediCare',
          drawerLabel: 'Farmacinha',
          drawerIcon: ({ color }) => (
            <Ionicons name="medical" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AddTreatment"
        component={AddTreatmentScreen}
        options={{
          title: 'Personal MediCare',
          drawerItemStyle: { display: 'none' }, // Oculta do menu drawer
        }}
      />

      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Personal MediCare',
          drawerLabel: 'Relatórios',
          drawerIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          title: 'Personal MediCare',
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
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const handleSplashFinish = () => {
    setShowAnimatedSplash(false);
  };

  // Inicializar Firebase (sem dependência de autenticação)
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('[App] Firebase inicializado automaticamente na importação');
        // O Firebase já é inicializado quando importamos o módulo
        // Não precisamos fazer nada aqui no startup
      } catch (error) {
        console.error('[App] Erro na inicialização do Firebase:', error);
      }
    };

    initializeFirebase();
  }, []);

  if (!loaded) {
    return null;
  }

  if (showAnimatedSplash) {
    return <AnimatedSplashScreen onAnimationFinish={handleSplashFinish} />;
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