# Recife Equipamentos Públicos — App Mobile

Aplicativo mobile desenvolvido em React Native com Expo, como atividade final da disciplina. O app consome dados abertos da Prefeitura do Recife, exibe equipamentos públicos da cidade em lista e mapa, e salva a localização do usuário associada a cada equipamento em um backend próprio.

---

## Justificativa da API escolhida

Foi utilizado o dataset **Equipamentos Públicos (Prédios Públicos)** do [Portal de Dados Abertos da Cidade do Recife](https://dados.recife.pe.gov.br/dataset/equipamentos-publicos).

A escolha se justifica por três motivos principais:

- Os dados incluem **coordenadas geográficas** de cada equipamento (formato GeoJSON), o que permite integração direta com a funcionalidade de geolocalização do app.
- O dataset é relevante para o cidadão do Recife, reunindo teatros, mercados, fóruns, escolas e outros prédios públicos da cidade.
- O acesso é público e sem necessidade de autenticação, facilitando a integração via `fetch`.

---

## Funcionalidades

- Listagem de equipamentos públicos do Recife consumida em tempo real da API
- Tela de detalhe de cada equipamento com suas informações e coordenadas
- Mapa interativo com marcadores de todos os equipamentos e rastreamento contínuo da localização do usuário (GPS em tempo real)
- Botão para salvar a localização atual do usuário associada a um equipamento no backend
- Tela de histórico exibindo todos os registros salvos

---

## Tecnologias utilizadas

- [React Native](https://reactnative.dev/) com [Expo SDK 54](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/) — navegação entre telas (Native Stack)
- [react-native-maps](https://github.com/react-native-maps/react-native-maps) — exibição do mapa
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) — geolocalização do dispositivo

---

## Estrutura do projeto

```
recife-equipamentos-app/
├── App.js                          # Ponto de entrada do app
├── app.json                        # Configurações do Expo (nome, ícone, permissões)
├── package.json                    # Dependências do projeto
└── src/
    ├── navigation/
    │   └── AppNavigator.js         # Configuração das rotas/telas
    ├── screens/
    │   ├── ListaScreen.js          # Tela de lista de equipamentos
    │   ├── DetalheScreen.js        # Tela de detalhe + salvar localização
    │   ├── MapaScreen.js           # Tela do mapa com rastreamento GPS
    │   └── HistoricoScreen.js      # Tela de histórico de localizações salvas
    └── services/
        ├── api.js                  # Comunicação com a API do Dados Recife
        └── backendApi.js           # Comunicação com o backend próprio
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [Expo Go](https://expo.dev/client) instalado no celular (iOS ou Android)
- PC e celular na **mesma rede Wi-Fi**
- Backend rodando (ver repositório do backend)

---

## Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/camilapessoaos/EquipamentosPublicos.git 
cd recife-equipamentos-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o IP do backend

Abra `src/services/backendApi.js` e substitua o IP pelo endereço local da sua máquina na rede Wi-Fi (descubra com `ipconfig` no Windows ou `ifconfig` no Mac/Linux):

```javascript
const BASE_URL = 'http://SEU_IP_LOCAL:3000';
```

### 4. Inicie o app

```bash
npx expo start
```

Escaneie o QR code com o app **Câmera** do iPhone (ou diretamente pelo Expo Go no Android).

---

## Observações

- O dataset da API é um arquivo GeoJSON com polígonos. O app calcula automaticamente o **centro de cada polígono** para exibir os marcadores no mapa no ponto correto.
- O rastreamento de localização é contínuo enquanto o mapa estiver aberto, atualizando a cada 3 segundos ou a cada 5 metros de deslocamento.
- Ao sair da tela do mapa, o rastreamento é encerrado automaticamente para economizar bateria.
- O app solicita permissão de localização ao usuário na primeira vez que acessa o mapa ou tenta salvar uma localização.
