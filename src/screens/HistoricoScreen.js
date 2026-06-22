// src/screens/HistoricoScreen.js
// Exibe a lista de localizações salvas no backend (consome o GET).

import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarLocalizacoes } from '../services/backendApi';

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await buscarLocalizacoes();
      setRegistros(dados);
    } catch (e) {
      console.log('Erro ao buscar histórico:', e.message);
    } finally {
      setCarregando(false);
    }
  }

  // useFocusEffect recarrega a lista toda vez que essa tela ganha foco
  // (assim, se você salvou um novo registro, ele já aparece ao voltar pra cá)
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Button title="Atualizar" onPress={carregar} />
      <FlatList
        data={registros}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma localização salva ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nome}>{item.nome_equipamento}</Text>
            <Text>Sua posição: {item.latitude_usuario.toFixed(4)}, {item.longitude_usuario.toFixed(4)}</Text>
            <Text style={styles.data}>{item.criado_em}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { padding: 16 },
  vazio: { textAlign: 'center', marginTop: 20, color: '#888' },
  item: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  nome: { fontSize: 16, fontWeight: '600' },
  data: { fontSize: 12, color: '#888', marginTop: 4 },
});