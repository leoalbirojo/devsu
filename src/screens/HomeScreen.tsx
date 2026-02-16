import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import useProducts, { Product } from '../hooks/useProducts';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const getItemLabel = (item: Product): string => {
  if (typeof item.title === 'string' && item.title.trim()) {
    return item.title;
  }
  if (typeof item.name === 'string' && item.name.trim()) {
    return item.name;
  }
  if (typeof item.label === 'string' && item.label.trim()) {
    return item.label;
  }
  if (item.id !== undefined) {
    return String(item.id);
  }
  if (item._id !== undefined) {
    return String(item._id);
  }
  return 'Untitled item';
};

export const getItemDescription = (item: Product): string | null => {
  if (typeof item.description === 'string' && item.description.trim()) {
    return item.description;
  }
  if (typeof item.summary === 'string' && item.summary.trim()) {
    return item.summary;
  }
  return null;
};

const HomeScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const { products, loading, refreshing, error, refresh } = useProducts();

  const filteredItems = useMemo(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return products;
    }

    const lowerQuery = trimmedQuery.toLowerCase();
    return products.filter(item =>
      getItemLabel(item).toLowerCase().includes(lowerQuery),
    );
  }, [products, query]);

  const renderItem = ({ item }: ListRenderItemInfo<Product>) => {
    const description = getItemDescription(item);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Text style={styles.cardTitle}>{getItemLabel(item)}</Text>
        {description ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Search"
        placeholder="Search"
        placeholderTextColor="#8c8c8c"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2f80ed" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) =>
          String(item.id ?? item._id ?? item.name ?? item.title ?? index)
        }
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={
          filteredItems.length === 0 ? styles.emptyState : undefined
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No results found.</Text>
          ) : null
        }
      />

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
          onPress={() => navigation.navigate('EditProduct', {})}
        >
          <Text style={styles.createButtonText}>Crear Producto</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1cfc9',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1d1b18',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#4f4c48',
  },
  errorText: {
    color: '#b42318',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1d1b18',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1b18',
  },
  cardSubtitle: {
    marginTop: 6,
    color: '#6c6760',
  },
  emptyState: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c6760',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  createButton: {
    backgroundColor: '#ffdd00',
    paddingVertical: 16,
    alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  createButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
