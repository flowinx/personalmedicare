import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Member, getAllMembers } from '../../db/members';

export default function SelectMemberReportScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const allMembers = await getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Selecione o Membro</ThemedText>
      {loading ? (
        <ActivityIndicator size="large" color="#b081ee" style={{ marginTop: 40 }} />
      ) : (
        <>
          {members.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Nenhum membro cadastrado.</ThemedText>
              <TouchableOpacity style={styles.addButton} onPress={() => (navigation as any).navigate('addMember')}>
                <ThemedText style={styles.addButtonText} lightColor="#fff" darkColor="#fff">Adicionar Membro</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={members}
              keyExtractor={(item) => item.id?.toString() || ''}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberCard}
                  onPress={() => item.id && (navigation as any).navigate('Dossiê do Membro', { id: item.id })}
                >
                  <Image
                    source={{ uri: item.avatar_uri || 'https://i.pravatar.cc/150?u=' + item.name }}
                    style={styles.avatar}
                  />
                  <View style={styles.memberInfo}>
                    <ThemedText style={styles.memberName} lightColor="#2d1155" darkColor="#2d1155">{item.name}</ThemedText>
                    <ThemedText style={styles.memberRelation} lightColor="#2d1155" darkColor="#2d1155">{item.relation}</ThemedText>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#b081ee',
    padding: 15,
    borderRadius: 10,
  },
  listContainer: {
    padding: 10,
  },
  memberInfo: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
}); 