import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { MedicamentoLocal } from '../types';
import { formatDate, isExpired, isNearExpiry } from '../utils/dateUtils';

const { width, height } = Dimensions.get('window');

interface DetailsModalProps {
  visible: boolean;
  medicamento: MedicamentoLocal | null;
  onClose: () => void;
}

export default function DetailsModal({ visible, medicamento, onClose }: DetailsModalProps) {
  if (!medicamento) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>{medicamento.nome}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <View style={styles.frameContainer}>
                <View style={styles.frameHeader}>
                  <Ionicons name="information-circle-outline" size={18} color="#b081ee" />
                  <Text style={styles.frameTitle}>Informações do Medicamento</Text>
                </View>

                <View style={styles.frameContent}>
                  <View style={styles.detailRowPair}>
                    <DetailField
                      icon="medical-outline"
                      label="Categoria"
                      value={medicamento.categoria}
                    />
                    <DetailField
                      icon="cube-outline"
                      label="Quantidade"
                      value={`${medicamento.quantidade} ${medicamento.unidade}`}
                    />
                  </View>

                  <View style={styles.detailRowPair}>
                    <DetailField
                      icon="calendar-outline"
                      label="Vencimento"
                      value={formatDate(medicamento.dataVencimento)}
                      iconColor={
                        isExpired(medicamento.dataVencimento) 
                          ? "#ef4444" 
                          : isNearExpiry(medicamento.dataVencimento) 
                            ? "#f59e0b" 
                            : "#b081ee"
                      }
                      valueStyle={[
                        isExpired(medicamento.dataVencimento) && styles.expiredText,
                        isNearExpiry(medicamento.dataVencimento) && !isExpired(medicamento.dataVencimento) && styles.nearExpiryText
                      ]}
                    />
                    <DetailField
                      icon="location-outline"
                      label="Localização"
                      value={medicamento.localizacao}
                    />
                  </View>

                  {medicamento.principioAtivo && (
                    <View style={styles.detailRowSingle}>
                      <DetailField
                        icon="flask-outline"
                        label="Princípio Ativo"
                        value={medicamento.principioAtivo}
                        fullWidth
                      />
                    </View>
                  )}
                </View>
              </View>

              {medicamento.observacoes && (
                <View style={styles.observationsContainer}>
                  <Text style={styles.observationsTitle}>Informações Detalhadas:</Text>
                  <Text style={styles.observationsText}>{medicamento.observacoes}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

interface DetailFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
  valueStyle?: any;
  fullWidth?: boolean;
}

function DetailField({ icon, label, value, iconColor = "#b081ee", valueStyle, fullWidth }: DetailFieldProps) {
  return (
    <View style={[styles.detailField, fullWidth && styles.detailFieldFull]}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  body: {
    gap: 16,
  },
  frameContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  frameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  frameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  frameContent: {
    padding: 12,
  },
  detailRowPair: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  detailRowSingle: {
    marginBottom: 12,
  },
  detailField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailFieldFull: {
    flex: 'none',
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 18,
  },
  expiredText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  nearExpiryText: {
    color: '#FF9500',
    fontWeight: '500',
  },
  observationsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAFF',
  },
  observationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  observationsText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
});