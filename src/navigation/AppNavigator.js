import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapaScreen from '../screens/MapaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';

import ListaScreen from '../screens/ListaScreen';
import DetalheScreen from '../screens/DetalheScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Lista">
                <Stack.Screen name="Lista" component={ListaScreen} options={{ title: 'Equipamentos Públicos' }} />
                <Stack.Screen name="Detalhe" component={DetalheScreen} options={{ title: 'Detalhes do Equipamento' }} />
                <Stack.Screen name="Mapa" component={MapaScreen} options={{ title: 'Mapa dos Equipamentos' }} />
                <Stack.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Histórico de Localizações' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}   