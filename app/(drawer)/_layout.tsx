import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getProfile, UserProfile } from '../../db/profile';
import AddMemberScreen from './addMember';
import AddTreatmentScreen from './addTreatment';
import AllTreatmentsScreen from './allTreatments';
import ChatInteligenteScreen from './chatInteligente';
import DocumentAnalysisScreen from './documentAnalysis';
import EditMemberScreen from './editMember';
import HomeScreen from './index';
import MemberDetailScreen from './memberDetail';
import MemberReportScreen from './memberReport';
import ProfileScreen from './profile';
import SelectMemberReportScreen from './selectMemberReport';
import SettingsScreen from './settings';

const Drawer = createDrawerNavigator();

function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        const profile = await getProfile();
        setUser(profile);
      }
      loadProfile();
    }, [])
  );

  return (
    <LinearGradient colors={['#b081ee', '#7f53ac']} style={{ flex: 1 }} start={{x:0, y:0}} end={{x:1, y:1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 0, backgroundColor: 'transparent' }}>
        <View style={styles.drawerHeader}>
          <Image 
            source={{ uri: user?.avatar_uri || 'https://i.pravatar.cc/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user?.name || 'Carregando...'}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <DrawerItemList {...props} />
        </View>
        <View style={{ flex: 1 }} />
        <DrawerItem
          label="Sair"
          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16, fontFamily: 'Inter' }}
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color="#fff" />}
          style={{ backgroundColor: 'rgba(176,129,238,0.7)', borderRadius: 16, marginHorizontal: 16, marginBottom: 16 }}
          onPress={() => router.replace('/(auth)/login')}
        />
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        drawerLabelStyle: { fontWeight: 'normal', fontFamily: 'Inter', fontSize: 16, color: '#fff' },
        headerTitle: '',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />, headerTitle: 'Home' }} />
      <Drawer.Screen name="Cadastrar Membro" component={AddMemberScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Novo Tratamento" component={AddTreatmentScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="medkit-outline" size={size} color={color} />, headerTitle: '' }} />
      <Drawer.Screen name="Análise de Documentos" component={DocumentAnalysisScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Dossiê" component={SelectMemberReportScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="folder-open-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Detalhes do Membro" component={MemberDetailScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Editar Membro" component={EditMemberScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Dossiê do Membro" component={MemberReportScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="Tratamentos" component={AllTreatmentsScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Configurações" component={SettingsScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Chat Inteligente" component={ChatInteligenteScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />, headerShown: true }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: 'center',
    paddingVertical: 40,
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
