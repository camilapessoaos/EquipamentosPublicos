import { useEffect, useState } from 'react';
import {
    View,
    Button,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { fetchEquipamentos } from '../services/api';

export default function ListaScreen({ navigation }) {
    const [equipamentos, setEquipamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
        async function carregarDados() {
            try {
                const dados = await fetchEquipamentos();
                setEquipamentos(dados);
            } catch (e) {
                setErro(e.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" />
                <Text>Carregando equipamentos...</Text>
            </View>
        );
    }

    if (erro) {
        return (
            <View style={styles.centro}>
                <Text>Erro ao carregar dados: {erro}</Text>
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Button
                title="Ver todos no mapa"
                onPress={() => navigation.navigate('Mapa', { equipamentos })}
            />

            <Button
                title="Ver histórico salvo"
                onPress={() => navigation.navigate('Historico')}
            />

            <FlatList
                data={equipamentos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                const nome =
                        item.propriedades?.NOME ||
                        item.propriedades?.nome ||
                        'Equipamento sem nome';

                    return (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => navigation.navigate('Detalhe', { equipamento: item })}
                        >
                            <Text style={styles.titulo}>{nome}</Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    lista: { padding: 16 },
    item: {
        backgroundColor: '#f2f2f2',
        padding: 14,
        borderRadius: 8,
        marginBottom: 10,
    },
    nomeItem: { fontSize: 16, fontWeight: '600' },
});


