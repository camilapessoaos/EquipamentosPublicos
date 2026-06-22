// src/screens/MapaScreen.js
// Exibe mapa com equipamentos públicos e rastreia a localização do usuário em tempo real.

import { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapaScreen({ route }) {
  const { equipamentos } = route.params;
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [statusGPS, setStatusGPS] = useState('Aguardando GPS...');
  const assinaturaRef = useRef(null); // guarda referência do rastreamento pra parar depois

  useEffect(() => {
    async function iniciarRastreamento() {
      // 1. Pede permissão
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Não foi possível acessar sua localização.');
        setStatusGPS('Permissão negada');
        return;
      }

      setStatusGPS('GPS ativo');

      // 2. Inicia rastreamento contínuo — chama o callback sempre que o usuário se move
      assinaturaRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // alta precisão (usa GPS real)
          timeInterval: 3000,               // atualiza a cada 3 segundos
          distanceInterval: 5,              // ou quando mover 5 metros
        },
        (posicao) => {
          setLocalizacaoUsuario({
            latitude: posicao.coords.latitude,
            longitude: posicao.coords.longitude,
          });
        }
      );
    }

    iniciarRastreamento();

    // 3. Quando sair da tela, para o rastreamento pra não gastar bateria
    return () => {
      if (assinaturaRef.current) {
        assinaturaRef.current.remove();
      }
    };
  }, []);

  const regiaoInicial = {
    latitude: -8.0539,
    longitude: -34.8811,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <View style={styles.container}>
      {/* Barra de status do GPS */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTexto}>📍 {statusGPS}</Text>
        {localizacaoUsuario && (
          <Text style={styles.coordenadas}>
            {localizacaoUsuario.latitude.toFixed(5)}, {localizacaoUsuario.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      <MapView
        style={styles.mapa}
        initialRegion={regiaoInicial}
        // Centraliza no usuário quando a localização chegar pela primeira vez
        region={localizacaoUsuario ? {
          latitude: localizacaoUsuario.latitude,
          longitude: localizacaoUsuario.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : regiaoInicial}
      >
        {/* Marcadores laranja: equipamentos públicos */}
        {equipamentos
          .filter((item) => item.latitude && item.longitude)
          .map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              title={item.propriedades?.NOME || 'Equipamento público'}
              description={item.propriedades?.TIPO || ''}
              pinColor="orange"
            />
          ))}

        {/* Marcador azul: localização atual do usuário */}
        {localizacaoUsuario && (
          <Marker
            coordinate={localizacaoUsuario}
            title="Você está aqui"
            pinColor="blue"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapa: { flex: 1 },
  statusBar: {
    backgroundColor: '#1a73e8',
    padding: 8,
    alignItems: 'center',
  },
  statusTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  coordenadas: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});