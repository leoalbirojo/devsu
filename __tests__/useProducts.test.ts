/**
 * @format
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import useProducts from '../src/hooks/useProducts';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:3000',
  PRODUCTS_PATH: '/api/products',
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useProducts', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'http://example.com/logo.png',
    date_release: '2024-01-15',
    date_revision: '2025-01-15',
  };

  const mockProducts = [mockProduct];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('initial state', () => {
    it('returns initial state before useEffect runs', () => {
      // Mock useEffect to prevent it from running
      const originalUseEffect = React.useEffect;
      React.useEffect = jest.fn();

      const { result } = renderHook(() => useProducts());

      expect(result.current.products).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.refreshing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
      expect(typeof result.current.deleteProduct).toBe('function');
      expect(typeof result.current.verifyProductId).toBe('function');
      expect(typeof result.current.saveProduct).toBe('function');

      // Restore useEffect
      React.useEffect = originalUseEffect;
    });
  });

  describe('fetchProducts', () => {
    it('fetches products successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      // Wait for the initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.error).toBe(null);
    });

    it('handles fetch error', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('handles non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe('Request failed (500)');
    });

    it('handles malformed response data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'data' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('handles array response data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual(mockProducts);
    });

    it('handles object with data array response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: mockProducts }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.products).toEqual(mockProducts);
    });
  });

  describe('refresh', () => {
    it('sets refreshing to true and calls fetchProducts', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger refresh
      act(() => {
        result.current.refresh();
      });

      expect(result.current.refreshing).toBe(true);

      // Wait for refresh to complete
      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + refresh
    });
  });

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await act(async () => {
        const response = await result.current.deleteProduct('1');
        expect(response).toBe(mockResponse);
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products/1', {
        method: 'DELETE',
      });
    });

    it('handles delete error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await expect(act(async () => {
        await result.current.deleteProduct('1');
      })).rejects.toThrow('Error al eliminar (404)');
    });
  });

  describe('verifyProductId', () => {
    it('verifies product ID successfully - exists', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(true),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const verificationResult = await result.current.verifyProductId('test-id');

      expect(verificationResult).toEqual({ exists: true });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products/verification/test-id');
    });

    it('verifies product ID successfully - does not exist', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(false),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const verificationResult = await result.current.verifyProductId('test-id');

      expect(verificationResult).toEqual({ exists: false });
    });

    it('handles verification error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await expect(result.current.verifyProductId('test-id')).rejects.toThrow('Error al verificar ID (500)');
    });

    it('handles network error during verification', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      const { result } = renderHook(() => useProducts());

      await expect(result.current.verifyProductId('test-id')).rejects.toThrow('Network error');
    });
  });

  describe('saveProduct', () => {
    it('creates new product successfully', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const newProduct = {
        name: 'New Product',
        description: 'New Description',
        logo: 'http://example.com/new-logo.png',
        date_release: '2024-02-15',
        date_revision: '2025-02-15',
      };

      await act(async () => {
        const response = await result.current.saveProduct(newProduct, false);
        expect(response).toBe(mockResponse);
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
    });

    it('updates existing product successfully', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const updatedProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Updated Description',
        logo: 'http://example.com/updated-logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15',
      };

      await act(async () => {
        const response = await result.current.saveProduct(updatedProduct, true);
        expect(response).toBe(mockResponse);
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
    });

    it('uses _id when id is not available for update', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const updatedProduct = {
        _id: '1',
        name: 'Updated Product',
      };

      await act(async () => {
        await result.current.saveProduct(updatedProduct, true);
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
    });

    it('handles save error', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      const newProduct = {
        name: 'New Product',
      };

      await expect(act(async () => {
        await result.current.saveProduct(newProduct, false);
      })).rejects.toThrow('Error al guardar (400)');
    });
  });

  describe('useEffect', () => {
    it('calls fetchProducts on mount', () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts),
      };
      mockFetch.mockResolvedValue(mockResponse);

      renderHook(() => useProducts());

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('refetch', () => {
    it('is an alias for fetchProducts', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProducts),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      mockFetch.mockClear();

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/products', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});