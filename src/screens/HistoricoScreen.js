// src/screens/HistoricoScreen.js
import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  TouchableOpacity, StyleSheet
} from 'react-native';
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

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.carregandoTexto}>Carregando seus registros...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Cabeçalho explicativo */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>📍 Meus locais visitados</Text>
        <Text style={styles.headerSubtitulo}>
          Cada vez que você toca em "Salvar minha localização" dentro de um prédio público,
          o registro aparece aqui com a data e suas coordenadas naquele momento.
        </Text>
      </View>

      {/* Contador de visitas */}
      {registros.length > 0 && (
        <View style={styles.contadorContainer}>
          <Text style={styles.contadorTexto}>
            🏛️  {registros.length} {registros.length === 1 ? 'visita registrada' : 'visitas registradas'}
          </Text>
          <TouchableOpacity onPress={carregar}>
            <Text style={styles.atualizarTexto}>↻ Atualizar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={registros}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}

        // Tela vazia — explica o que o usuário precisa fazer
        ListEmptyComponent={
          <View style={styles.vazioContainer}>
            <Text style={styles.vazioIcone}>🗺️</Text>
            <Text style={styles.vazioTitulo}>Nenhuma visita registrada ainda</Text>
            <Text style={styles.vazioDescricao}>
              Abra um prédio público na lista, toque em{' '}
              <Text style={styles.vazioDestaque}>"Salvar minha localização aqui"</Text>
              {' '}e ele vai aparecer nessa tela com a data e suas coordenadas.
            </Text>
          </View>
        }

        renderItem={({ item, index }) => {
          // Formata a data vinda do banco (ex: "2026-06-22 14:30:00")
          const dataFormatada = item.criado_em
            ? new Date(item.criado_em.replace(' ', 'T')).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Data não disponível';

          return (
            <View style={styles.card}>
              {/* Número da visita */}
              <View style={styles.cardNumero}>
                <Text style={styles.cardNumeroTexto}>
                  {registros.length - index}
                </Text>
              </View>

              <View style={styles.cardConteudo}>
                {/* Nome do equipamento */}
                <Text style={styles.cardNome} numberOfLines={2}>
                  {item.nome_equipamento}
                </Text>

                {/* Data e hora */}
                <View style={styles.cardLinha}>
                  <Text style={styles.cardIconeInfo}>🕐</Text>
                  <Text style={styles.cardInfo}>{dataFormatada}</Text>
                </View>

                {/* Localização do usuário */}
                <View style={styles.cardLinha}>
                  <Text style={styles.cardIconeInfo}>📡</Text>
                  <Text style={styles.cardInfo}>
                    Você estava em: {Number(item.latitude_usuario).toFixed(5)},{' '}
                    {Number(item.longitude_usuario).toFixed(5)}
                  </Text>
                </View>

                {/* Localização do equipamento */}
                {item.latitude_equipamento && (
                  <View style={styles.cardLinha}>
                    <Text style={styles.cardIconeInfo}>🏛️</Text>
                    <Text style={styles.cardInfo}>
                      Equipamento em: {Number(item.latitude_equipamento).toFixed(5)},{' '}
                      {Number(item.longitude_equipamento).toFixed(5)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  carregandoTexto: { marginTop: 12, color: '#555', fontSize: 14 },

  // Header
  header: {
    backgroundColor: '#2D6A4F',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitulo: {
    fontSize: 13,
    color: '#B7E4C7',
    marginTop: 6,
    lineHeight: 18,
  },

  // Contador
  contadorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contadorTexto: { fontSize: 14, fontWeight: '600', color: '#333' },
  atualizarTexto: { fontSize: 14, color: '#2D6A4F', fontWeight: '600' },

  // Lista
  lista: { padding: 16, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  cardNumeroTexto: { fontSize: 13, fontWeight: 'bold', color: '#2D6A4F' },
  cardConteudo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  cardLinha: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  cardIconeInfo: { fontSize: 12, marginRight: 6, marginTop: 1 },
  cardInfo: { fontSize: 12, color: '#666', flex: 1, lineHeight: 18 },

  // Tela vazia
  vazioContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  vazioIcone: { fontSize: 52, marginBottom: 16 },
  vazioTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  vazioDescricao: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  vazioDestaque: { fontWeight: '700', color: '#2D6A4F' },
});