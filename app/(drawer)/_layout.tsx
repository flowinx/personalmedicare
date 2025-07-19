import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AuthGuard } from '../../components/AuthGuard';
import { ProfileImage } from '../../components/ProfileImage';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProfile } from '../../contexts/ProfileContext';
import AddMemberScreen from './addMember';
import AddTreatmentScreen from './addTreatment';
import AllTreatmentsScreen from './allTreatments';
import ChatInteligenteScreen from './chatInteligente';
import DocumentAnalysisScreen from './documentAnalysis';
import EditMemberScreen from './editMember';
import HomeScreen from './index';
import MedicationDetailsScreen from './medicationDetails';
import MemberDetailScreen from './memberDetail';
import MemberReportScreen from './memberReport';
import ProfileScreen from './profile';
import SelectMemberReportScreen from './selectMemberReport';
import SettingsScreen from './settings';
import TreatmentDetailScreen from './treatmentDetail';

const Drawer = createDrawerNavigator();

function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const avatarUri = profile?.avatar_uri;

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <LinearGradient colors={['#b081ee', '#7f53ac']} style={{ flex: 1 }} start={{x:0, y:0}} end={{x:1, y:1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 0, backgroundColor: 'transparent' }}>
        <View style={styles.drawerHeader}>
          <ProfileImage 
            uri={avatarUri}
            size={80}
            fallbackIcon="person"
          />
          <Text style={styles.name}>
            {loading ? t('loading') : (profile?.name || t('defaultUserName'))}
          </Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <DrawerItemList {...props} />
        </View>
        <View style={{ flex: 1 }} />
        <DrawerItem
          label={t('logout')}
          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16, fontFamily: 'Inter' }}
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color="#fff" />}
          style={{ backgroundColor: 'rgba(176,129,238,0.7)', borderRadius: 16, marginHorizontal: 16, marginBottom: 16 }}
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

export default function DrawerLayout() {
  const { t, language } = useLanguage();
  
  return (
    <AuthGuard>
      <Drawer.Navigator
        key={language}
        initialRouteName="Home"
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: '#fff',
          drawerLabelStyle: { fontWeight: 'normal', fontFamily: 'Inter', fontSize: 16, color: '#fff' },
          headerTitle: '',
          headerTintColor: '#2d1155',
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />, 
          drawerLabel: t('home'),
          headerTitle: t('home'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Cadastrar Membro" component={AddMemberScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} />, 
          drawerLabel: t('addMember'),
          headerTitle: t('addMember'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Novo Tratamento" component={AddTreatmentScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="medkit-outline" size={size} color={color} />, 
          drawerLabel: t('newTreatment'),
          headerTitle: t('newTreatment'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Análise de Documentos" component={DocumentAnalysisScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />, 
          drawerLabel: t('documentAnalysis'),
          headerTitle: t('documentAnalysis'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Dossiê" component={SelectMemberReportScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={size} color={color} />, 
          drawerLabel: t('dossier'),
          headerTitle: t('dossier'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Detalhes do Membro" component={MemberDetailScreen} options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: t('memberDetails'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Editar Membro" component={EditMemberScreen} options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: t('editMember'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Dossiê do Membro" component={MemberReportScreen} options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: t('memberDossier'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Tratamentos" component={AllTreatmentsScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />, 
          drawerLabel: t('treatments'),
          headerTitle: t('treatments'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Detalhes do Tratamento" component={TreatmentDetailScreen} options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: t('treatmentDetails'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Detalhes do Medicamento" component={MedicationDetailsScreen} options={{ 
          drawerItemStyle: { display: 'none' }, 
          headerTitle: 'Detalhes do Medicamento',
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Perfil" component={ProfileScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />, 
          drawerLabel: t('profile'),
          headerTitle: t('profile'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Configurações" component={SettingsScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />, 
          drawerLabel: t('settings'),
          headerTitle: t('settings'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
        <Drawer.Screen name="Chat Inteligente" component={ChatInteligenteScreen} options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />, 
          headerShown: true, 
          drawerLabel: t('intelligentChat'),
          headerTitle: t('intelligentChat'),
          headerTintColor: '#2d1155',
          headerStyle: { backgroundColor: '#fff' },
        }} />
      </Drawer.Navigator>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'transparent',
    marginBottom: 10,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    fontFamily: 'Inter',
  },
});
