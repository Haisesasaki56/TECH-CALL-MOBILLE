import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, ALUNO_ID } from '../firebase/config';

type Chamado = {
  description: string;
  photoUri?: string | null;
  address?: string | null;
  status: string;
};

export default function CallDetailScreen({ route }: any) {
  const { chamadoId } = route.params;
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function carregarChamado() {
      setLoading(true);
      try {
        const docRef = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setChamado(docSnap.data() as Chamado);
        } else {
          Alert.alert('Erro', 'Chamado não encontrado.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar o chamado.');
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    carregarChamado();
  }, [chamadoId]);

  async function mudarStatus(novoStatus: string) {
    setUpdating(true);
    try {
      const docRef = doc(db, 'alunos', ALUNO_ID, 'chamados', chamadoId);
      await updateDoc(docRef, { status: novoStatus });

      if (chamado) {
        setChamado({ ...chamado, status: novoStatus });
      }

      Alert.alert('Sucesso', `Status alterado para ${novoStatus}!`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status do chamado.');
      console.log(error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  if (!chamado) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chamado não localizado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Status atual:</Text>
      <Text style={styles.statusBadge}>{chamado.status}</Text>

      <Text style={styles.label}>Descrição do problema:</Text>
      <Text style={styles.valueText}>{chamado.description}</Text>

      <Text style={styles.label}>Localização:</Text>
      <Text style={styles.valueText}>
        {chamado.address || 'Nenhuma localização informada'}
      </Text>

      <Text style={styles.label}>Foto do equipamento:</Text>
      {chamado.photoUri ? (
        <Image source={{ uri: chamado.photoUri }} style={styles.photo} />
      ) : (
        <Text style={styles.placeholderText}>Nenhuma foto anexada</Text>
      )}

      {/* Ações disponíveis de acordo com o status atual */}
      <View style={styles.actionsContainer}>
        {updating && <ActivityIndicator size="small" color="#1565c0" style={{ marginBottom: 12 }} />}

        {chamado.status === 'aberto' && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, updating && styles.disabledButton]}
              disabled={updating}
              onPress={() => mudarStatus('atendendo')}
            >
              <Text style={styles.buttonText}>Iniciar Atendimento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton, updating && styles.disabledButton]}
              disabled={updating}
              onPress={() => mudarStatus('cancelado')}
            >
              <Text style={styles.buttonText}>Cancelar Chamado</Text>
            </TouchableOpacity>
          </>
        )}

        {chamado.status === 'atendendo' && (
          <TouchableOpacity
            style={[styles.button, styles.successButton, updating && styles.disabledButton]}
            disabled={updating}
            onPress={() => mudarStatus('concluido')}
          >
            <Text style={styles.buttonText}>Concluir Atendimento</Text>
          </TouchableOpacity>
        )}

        {(chamado.status === 'concluido' || chamado.status === 'cancelado') && (
          <Text style={styles.finalStatusNote}>
            Este chamado está encerrado e não permite novas alterações.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#666', fontSize: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginTop: 16, marginBottom: 4 },
  valueText: { fontSize: 16, color: '#222', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  statusBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00695c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  photo: { width: '100%', height: 200, borderRadius: 8, marginTop: 4 },
  placeholderText: { color: '#999', fontStyle: 'italic', marginTop: 4 },
  actionsContainer: { marginTop: 30, gap: 12 },
  button: { borderRadius: 8, padding: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: '#1565c0' },
  successButton: { backgroundColor: '#2e7d32' },
  dangerButton: { backgroundColor: '#c62828' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  finalStatusNote: { textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: 12 },
});