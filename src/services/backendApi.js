const BASE_URL = 'http://10.0.0.167:3000';

export async function salvarLocalizacao(dados) {
  const resposta = await fetch(`${BASE_URL}/localizacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    throw new Error('Erro ao salvar localização no backend.');
  }

  return resposta.json();
}

export async function buscarLocalizacoes() {
  const resposta = await fetch(`${BASE_URL}/localizacoes`);

  if (!resposta.ok) {
    throw new Error('Erro ao buscar histórico do backend.');
  }

  return resposta.json();
}