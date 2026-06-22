// src/services/api.js
const URL_EQUIPAMENTOS =
  'https://dados.recife.pe.gov.br:443/dataset/10180d04-fcb0-4ae4-995a-b7f27cbaa70f/resource/459378ca-df25-405f-8f34-4945322dc29f/download/predios-publicos.geojson';

// Calcula o centro de um polígono tirando a média de todas as coordenadas.
// O GeoJSON de polígono tem formato: [ [ [lng,lat], [lng,lat], ... ] ]
function calcularCentro(coordinates) {
  try {
    // Pega o primeiro anel do polígono (ou primeiro polígono se for MultiPolygon)
    let anel = coordinates;
    while (Array.isArray(anel[0][0])) {
      anel = anel[0]; // desce um nível até chegar nos pares [lng, lat]
    }

    const total = anel.length;
    const somatorio = anel.reduce(
      (acc, ponto) => ({ lng: acc.lng + ponto[0], lat: acc.lat + ponto[1] }),
      { lng: 0, lat: 0 }
    );

    return {
      longitude: somatorio.lng / total,
      latitude: somatorio.lat / total,
    };
  } catch (e) {
    return { longitude: null, latitude: null };
  }
}

export async function fetchEquipamentos() {
  const resposta = await fetch(URL_EQUIPAMENTOS);

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar dados: ${resposta.status}`);
  }

  const geojson = await resposta.json();

  const lista = geojson.features.map((feature, index) => {
    const { longitude, latitude } = calcularCentro(
      feature.geometry?.coordinates || []
    );

    return {
      id: String(index),
      propriedades: feature.properties,
      longitude,
      latitude,
    };
  });

  return lista;
}