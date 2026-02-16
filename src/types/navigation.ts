import type { Product } from '../hooks/useProducts';

export type RootStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  EditProduct: { product?: Product };
};
