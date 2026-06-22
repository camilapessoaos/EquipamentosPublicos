// src/screens/DetalheScreen.js
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { salvarLocalizacao } from '../services/backendApi';

export default function DetalheScreen({ route }) {
  const { equipamento } = route.params;
  const { propriedades, latitude, longitude } = equipamento;
  const [salvando, setSalvando] = useState(false);

  const nome = propriedades?.NOME || 'Equipamento sem nome';

  async function handleSalvarLocalizacao() {
    setSalvando(true);
    try {
      // 1. Verifica permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização nas configurações do iPhone.');
        return;
      }

      // 2. Pega localização atual com alta precisão
      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const dadosParaSalvar = {
        nome_equipamento: nome,
        latitude_usuario: posicao.coords.latitude,
        longitude_usuario: posicao.coords.longitude,
        latitude_equipamento: latitude,
        longitude_equipamento: longitude,
      };

      // 3. Envia pro backend
      await salvarLocalizacao(dadosParaSalvar);

      Alert.alert(
        'Localização salva!',
        `Você estava próximo de:\n${nome}\n\nSua posição: ${posicao.coords.latitude.toFixed(5)}, ${posicao.coords.longitude.toFixed(5)}`
      );
    } catch (e) {
      // Mostra o erro exato pra facilitar o diagnóstico
      Alert.alert('Erro ao salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{nome}</Text>

      {Object.entries(propriedades || {})
        .filter(([chave, valor]) =>
          valor !== null &&
          valor !== undefined &&
          String(valor).length < 200
        )
        .map(([chave, valor]) => (
          <View key={chave} style={styles.linha}>
            <Text style={styles.chave}>{chave}:</Text>
            <Text style={styles.valor}>{String(valor)}</Text>
          </View>
        ))}

      <View style={styles.linha}>
        <Text style={styles.chave}>Latitude:</Text>
        <Text style={styles.valor}>{latitude?.toFixed(6)}</Text>
      </View>
      <View style={styles.linha}>
        <Text style={styles.chave}>Longitude:</Text>
        <Text style={styles.valor}>{longitude?.toFixed(6)}</Text>
      </View>

      <TouchableOpacity
        style={[styles.botao, salvando && styles.botaoDesabilitado]}
        onPress={handleSalvarLocalizacao}
        disabled={salvando}
      >
        <Text style={styles.botaoTexto}>
          {salvando ? '⏳ Obtendo localização...' : '📍 Salvar minha localização aqui'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  linha: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  chave: { fontWeight: 'bold', marginRight: 6 },
  valor: { flexShrink: 1 },
  botao: {
    backgroundColor: '#1a73e8',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  botaoDesabilitado: { backgroundColor: '#aaa' },
  botaoTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});