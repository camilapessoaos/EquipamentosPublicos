// src/screens/MapaScreen.js
import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapaScreen({ route }) {
  const { equipamentos } = route.params;
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [statusGPS, setStatusGPS] = useState('aguardando');
  const [centralizado, setCentralizado] = useState(false);
  const mapRef = useRef(null);
  const assinaturaRef = useRef(null);

  useEffect(() => {
    async function iniciarRastreamento() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative a localização nas configurações do iPhone.');
        setStatusGPS('negado');
        return;
      }

      setStatusGPS('ativo');

      assinaturaRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (posicao) => {
          const novaLocalizacao = {
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
          };
          setLocalizacaoUsuario(novaLocalizacao);
        }
      );
    }

    iniciarRastreamento();

    return () => {
      if (assinaturaRef.current) {
        assinaturaRef.current.remove();
      }
    };
  }, []);

  // Centraliza o mapa na posição do usuário
  function centralizarNoUsuario() {
    if (!localizacaoUsuario) {
      Alert.alert('GPS ainda carregando', 'Aguarde o GPS localizar seu dispositivo.');
      return;
    }
    mapRef.current?.animateToRegion({
      ...localizacaoUsuario,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 800);
    setCentralizado(true);
  }

  const regiaoInicial = {
    latitude: -8.0539,
    longitude: -34.8811,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  const totalEquipamentos = equipamentos.filter(
    (item) => item.latitude && item.longitude
  ).length;

  return (
    <View style={styles.container}>

      {/* Barra de status do GPS */}
      <View style={[
        styles.statusBar,
        statusGPS === 'ativo' && styles.statusAtivo,
        statusGPS === 'negado' && styles.statusNegado,
        statusGPS === 'aguardando' && styles.statusAguardando,
      ]}>
        {statusGPS === 'aguardando' && (
          <View style={styles.statusConteudo}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.statusTexto}>  Obtendo sua localização...</Text>
          </View>
        )}
        {statusGPS === 'ativo' && (
          <View style={styles.statusConteudo}>
            <Text style={styles.statusTexto}>📡  GPS ativo — rastreando em tempo real</Text>
            {localizacaoUsuario && (
              <Text style={styles.statusCoordenadas}>
                {localizacaoUsuario.latitude.toFixed(5)}, {localizacaoUsuario.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        )}
        {statusGPS === 'negado' && (
          <View style={styles.statusConteudo}>
            <Text style={styles.statusTexto}>⚠️  Permissão de localização negada</Text>
          </View>
        )}
      </View>

      {/* Legenda */}
      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.legendaPonto, { backgroundColor: '#F4A261' }]} />
          <Text style={styles.legendaTexto}>{totalEquipamentos} prédios públicos</Text>
        </View>
        <View style={styles.legendaItem}>
          <View style={[styles.legendaPonto, { backgroundColor: '#2D6A4F' }]} />
          <Text style={styles.legendaTexto}>Sua localização</Text>
        </View>
      </View>

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={regiaoInicial}
      >
        {/* Marcadores dos equipamentos */}
        {equipamentos
          .filter((item) => item.latitude && item.longitude)
          .map((item) => (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.propriedades?.NOME || 'Prédio público'}
              description={item.propriedades?.TIPO || 'Prédio público do Recife'}
              pinColor="#F4A261"
            />
          ))}

        {/* Marcador do usuário */}
        {localizacaoUsuario && (
          <Marker
            coordinate={localizacaoUsuario}
            title="Você está aqui"
            description="Sua localização atual (atualiza a cada 3 segundos)"
            pinColor="#2D6A4F"
          />
        )}
      </MapView>

      {/* Botão de centralizar no usuário */}
      <TouchableOpacity
        style={styles.botaoCentralizar}
        onPress={centralizarNoUsuario}
        activeOpacity={0.85}
      >
        <Text style={styles.botaoCentralizarTexto}>
          {localizacaoUsuario ? '📍  Ir para minha localização' : '⏳  Aguardando GPS...'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  mapa: { flex: 1 },

  // Status GPS
  statusBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statusAtivo: { backgroundColor: '#2D6A4F' },
  statusNegado: { backgroundColor: '#c0392b' },
  statusAguardando: { backgroundColor: '#888' },
  statusConteudo: { alignItems: 'center' },
  statusTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCoordenadas: {
    color: '#B7E4C7',
    fontSize: 11,
    marginTop: 2,
  },

  // Legenda
  legenda: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaPonto: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { fontSize: 12, color: '#555' },

  // Botão centralizar
  botaoCentralizar: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  botaoCentralizarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});