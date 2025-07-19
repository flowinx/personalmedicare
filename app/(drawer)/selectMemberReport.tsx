import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCard } from '../../components/AnimatedCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { Member, getAllMembers } from '../../db/members';
import { initMembersDB } from '../../services/firebase';
import { useEntranceAnimation } from '../../utils/animations';

export default function SelectMemberReportScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { startAnimation } = useEntranceAnimation();

  useEffect(() => {
    startAnimation();
    loadMembers();
  }, [startAnimation]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de membros...');
      // Garantir que o banco de dados está inicializado
      await initMembersDB();
      const allMembers = await getAllMembers();
      console.log('Membros carregados:', allMembers.length);
      console.log('Lista de membros:', allMembers);
      setMembers(allMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const renderMemberCard = ({ item, index }: { item: Member; index: number }) => (
    <AnimatedCard delay={index * 100} style={styles.memberCard}>
      <TouchableOpacity
        style={styles.memberCardContent}
        onPress={() => item.id && (navigation as any).navigate('Dossiê do Membro', { id: item.id })}
      >
        <View style={styles.avatarContainer}>
          {item.avatar_uri ? (
            <Image source={{ uri: item.avatar_uri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={24} color="#b081ee" />
            </View>
          )}
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRelation}>{item.relation}</Text>
          {item.dob && (
            <Text style={styles.memberDob}>{t('birthDate')}: {item.dob}</Text>
          )}
        </View>
        
        <View style={styles.arrowContainer}>
          <FontAwesome name="chevron-right" size={16} color="#8A8A8A" />
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const renderEmptyState = () => (
    <AnimatedCard delay={200} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <FontAwesome name="folder-open" size={60} color="#b081ee" />
      </View>
      <Text style={styles.emptyTitle}>{t('noMembersFound')}</Text>
      <Text style={styles.emptyText}>
        {t('addFamilyMembers')}
      </Text>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => (navigation as any).navigate('addMember')}
      >
        <FontAwesome name="plus" size={16} color="#fff" style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>{t('addMember')}</Text>
      </TouchableOpacity>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('medicalDossier')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('selectMemberDossier')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#b081ee" />
          <Text style={styles.loadingText}>{t('loadingMembers')}</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id?.toString() || ''}
          renderItem={renderMemberCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#b081ee']}
              tintColor="#b081ee"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d1155',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#8A8A8A',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  memberCard: {
    marginBottom: 15,
    padding: 0,
  },
  memberCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#b081ee',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0eaff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b081ee',
    borderStyle: 'dashed',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d1155',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
    color: '#b081ee',
    fontWeight: '600',
    marginBottom: 2,
  },
  memberDob: {
    fontSize: 12,
    color: '#8A8A8A',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  emptyContainer: {
    marginTop: 60,
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d1155',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#b081ee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#b081ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 