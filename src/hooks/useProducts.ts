import { useCallback, useEffect, useState } from 'react';
import Config from 'react-native-config';

type Product = {
  id?: number | string;
  _id?: number | string;
  title?: string;
  name?: string;
  label?: string;
  description?: string;
  summary?: string;
  logo?: string;
  date_release?: string;
  date_revision?: string;
  [key: string]: unknown;
};

const API_BASE_URL = Config.API_BASE_URL ?? 'http://10.0.2.2:3002';
const PRODUCTS_PATH = Config.PRODUCTS_PATH ?? '/bp/products';

const getListFromPayload = (payload: unknown): Product[] => {
  if (Array.isArray(payload)) {
    return payload as Product[];
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data as Product[];
    }
  }

  return [];
};

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${PRODUCTS_PATH}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const payload = await response.json();
      setProducts(getListFromPayload(payload));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: string | number) => {
    const response = await fetch(`${API_BASE_URL}${PRODUCTS_PATH}/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar (${response.status})`);
    }

    return response;
  }, []);

  const verifyProductId = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${PRODUCTS_PATH}/verification/${id}`);
      if (response.ok) {
        const data = await response.json();
        return { exists: data || false };
      } else {
        throw new Error(`Error al verificar ID (${response.status})`);
      }
    } catch (err) {
      throw err;
    }
  };

  const saveProduct = useCallback(async (product: Partial<Product>, isEditing: boolean) => {
    const url = isEditing
      ? `${API_BASE_URL}${PRODUCTS_PATH}/${product.id || product._id}`
      : `${API_BASE_URL}${PRODUCTS_PATH}`;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar (${response.status})`);
    }

    return response;
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    refreshing,
    error,
    refresh,
    refetch: fetchProducts,
    deleteProduct,
    verifyProductId,
    saveProduct,
  };
};

export type { Product };
export default useProducts;
