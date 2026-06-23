// src/screens/ListaScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput
} from 'react-native';
import { fetchEquipamentos } from '../services/api';

export default function ListaScreen({ navigation }) {
  const [equipamentos, setEquipamentos] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await fetchEquipamentos();
        setEquipamentos(dados);
        setFiltrados(dados);
      } catch (e) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // Filtra a lista conforme o usuário digita
  function handleBusca(texto) {
    setBusca(texto);
    const resultado = equipamentos.filter((item) => {
      const nome = item.propriedades?.NOME || '';
      const tipo = item.propriedades?.TIPO || '';
      return (
        nome.toLowerCase().includes(texto.toLowerCase()) ||
        tipo.toLowerCase().includes(texto.toLowerCase())
      );
    });
    setFiltrados(resultado);
  }

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.carregandoTexto}>Buscando prédios públicos...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erroIcone}>⚠️</Text>
        <Text style={styles.erroTexto}>Não foi possível carregar os dados.</Text>
        <Text style={styles.erroDetalhe}>{erro}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho explicativo */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>🏛️ Prédios Públicos de Recife</Text>
        <Text style={styles.headerSubtitulo}>
          Aqui você encontra todos os prédios públicos do Recife que estão cadastrados no sistema.
        </Text>
        <Text style={styles.headerSubtitulo}>
          {filtrados.length} locais encontrados no Recife
        </Text>
      </View>

      {/* Campo de busca */}
      <View style={styles.buscaContainer}>
        <TextInput
          style={styles.buscaInput}
          placeholder="🔍  Buscar por nome ou tipo..."
          placeholderTextColor="#999"
          value={busca}
          onChangeText={handleBusca}
        />
      </View>

      {/* Botões de ação */}
      <View style={styles.botoesRow}>
        <TouchableOpacity
          style={styles.botaoAcao}
          onPress={() => navigation.navigate('Mapa', { equipamentos })}
        >
          <Text style={styles.botaoAcaoTexto}>🗺️  Ver no mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoSecundario]}
          onPress={() => navigation.navigate('Historico')}
        >
          <Text style={[styles.botaoAcaoTexto, styles.botaoSecundarioTexto]}>
            📋  Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.centro}>
            <Text style={styles.vazioTexto}>Nenhum prédio encontrado para "{busca}"</Text>
          </View>
        }
        renderItem={({ item }) => {
          const nome = item.propriedades?.NOME || 'Prédio sem nome';
          const tipo = item.propriedades?.TIPO || null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Detalhe', { equipamento: item })}
              activeOpacity={0.85}
            >
              <View style={styles.cardConteudo}>
                <Text style={styles.cardNome} numberOfLines={2}>{nome}</Text>
                {tipo && tipo !== 'null' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTexto}>{tipo}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSeta}>›</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  // Header
  header: {
    backgroundColor: '#2D6A4F',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitulo: { fontSize: 13, color: '#B7E4C7', marginTop: 2 },

  // Busca
  buscaContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  buscaInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: '#333',
  },

  // Botões de ação
  botoesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  botaoAcao: {
    flex: 1,
    backgroundColor: '#2D6A4F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoAcaoTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
  botaoSecundario: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#2D6A4F' },
  botaoSecundarioTexto: { color: '#2D6A4F' },

  // Lista
  lista: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardConteudo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardSeta: { fontSize: 22, color: '#ccc', marginLeft: 8 },
  badge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeTexto: { fontSize: 11, color: '#2D6A4F', fontWeight: '600' },

  // Estados
  carregandoTexto: { marginTop: 12, color: '#555', fontSize: 14 },
  erroIcone: { fontSize: 40, marginBottom: 8 },
  erroTexto: { fontSize: 16, fontWeight: '600', color: '#333' },
  erroDetalhe: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },
  vazioTexto: { color: '#888', fontSize: 15, textAlign: 'center' },
});