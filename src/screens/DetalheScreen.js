// src/screens/DetalheScreen.js
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, StyleSheet, ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import { salvarLocalizacao } from '../services/backendApi';

export default function DetalheScreen({ route }) {
  const { equipamento } = route.params;
  const { propriedades, latitude, longitude } = equipamento;
  const [salvando, setSalvando] = useState(false);

  const nome = propriedades?.NOME || 'Prédio sem nome';
  const tipo = propriedades?.TIPO;

  async function handleSalvarLocalizacao() {
    setSalvando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização nas configurações do iPhone.');
        return;
      }

      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await salvarLocalizacao({
        nome_equipamento: nome,
        latitude_usuario: posicao.coords.latitude,
        longitude_usuario: posicao.coords.longitude,
        latitude_equipamento: latitude,
        longitude_equipamento: longitude,
      });

      Alert.alert(
        '✅ Localização salva!',
        `Você marcou presença em:\n${nome}\n\nPosição registrada:\n${posicao.coords.latitude.toFixed(5)}, ${posicao.coords.longitude.toFixed(5)}`
      );
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>

      {/* Cabeçalho do prédio */}
      <View style={styles.cabecalho}>
        <Text style={styles.icone}>🏛️</Text>
        <Text style={styles.nome}>{nome}</Text>
        {tipo && tipo !== 'null' && (
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>{tipo}</Text>
          </View>
        )}
      </View>

      {/* Informações vindas da API */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>📋 Informações do local</Text>

        {Object.entries(propriedades || {})
          .filter(([chave, valor]) =>
            valor !== null &&
            valor !== undefined &&
            String(valor).length < 200 &&
            String(valor) !== 'null'
          )
          .map(([chave, valor]) => (
            <View key={chave} style={styles.linhaInfo}>
              <Text style={styles.infoChave}>{chave}</Text>
              <Text style={styles.infoValor}>{String(valor)}</Text>
            </View>
          ))}
      </View>

      {/* Coordenadas */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>📍 Coordenadas geográficas</Text>
        <View style={styles.coordenadasRow}>
          <View style={styles.coordBox}>
            <Text style={styles.coordLabel}>Latitude</Text>
            <Text style={styles.coordValor}>{latitude?.toFixed(6)}</Text>
          </View>
          <View style={styles.coordBox}>
            <Text style={styles.coordLabel}>Longitude</Text>
            <Text style={styles.coordValor}>{longitude?.toFixed(6)}</Text>
          </View>
        </View>
      </View>

      {/* Botão de salvar localização */}
      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>📡 Rastreamento</Text>
        <Text style={styles.rastreamentoDescricao}>
          Toque no botão abaixo para registrar que você está próximo deste prédio.
          Sua localização atual será salva no servidor.
        </Text>

        <TouchableOpacity
          style={[styles.botao, salvando && styles.botaoDesabilitado]}
          onPress={handleSalvarLocalizacao}
          disabled={salvando}
          activeOpacity={0.85}
        >
          {salvando ? (
            <View style={styles.botaoConteudo}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.botaoTexto}>  Obtendo GPS...</Text>
            </View>
          ) : (
            <Text style={styles.botaoTexto}>📍  Salvar minha localização aqui</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  conteudo: { padding: 16, paddingBottom: 40 },

  // Cabeçalho
  cabecalho: {
    backgroundColor: '#2D6A4F',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  icone: { fontSize: 36, marginBottom: 8 },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  badge: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Seções
  secao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Linhas de info
  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoChave: { fontSize: 14, color: '#888', flex: 1 },
  infoValor: { fontSize: 14, color: '#222', fontWeight: '500', flex: 2, textAlign: 'right' },

  // Coordenadas
  coordenadasRow: { flexDirection: 'row', gap: 10 },
  coordBox: {
    flex: 1,
    backgroundColor: '#F0F7F4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  coordLabel: { fontSize: 11, color: '#2D6A4F', fontWeight: '600', marginBottom: 4 },
  coordValor: { fontSize: 13, color: '#333', fontWeight: '500' },

  // Botão
  rastreamentoDescricao: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 14,
  },
  botao: {
    backgroundColor: '#2D6A4F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoDesabilitado: { backgroundColor: '#aaa' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  botaoConteudo: { flexDirection: 'row', alignItems: 'center' },
});