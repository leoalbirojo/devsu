import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import useProducts from '../hooks/useProducts';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const ProductDetailScreen = ({ route, navigation }: Props) => {
  const { product } = route.params;
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { deleteProduct } = useProducts();

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const productId = product.id || product._id;
      if (!productId) {
        throw new Error('ID del producto no disponible');
      }

      await deleteProduct(productId);
      handleCloseModal();

      Alert.alert('Éxito', 'Producto eliminado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error inesperado';
      Alert.alert('Error', message);
    } finally {
      setDeleting(false);
    }
  };
  
  const productName = 
    product.name || product.title || product.label || 'Sin nombre';
  const productDescription = 
    product.description || product.summary || 'Sin descripción';
  const logo = product.logo as string | undefined;
  const releaseDate = product.date_release as string | undefined;
  const revisionDate = product.date_revision as string | undefined;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          {logo ? (
            <Image
              source={{ uri: logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>Sin Logo</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.value}>{product.id || product._id || 'N/A'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{productName}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.value}>{productDescription}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Fecha de Lanzamiento</Text>
          <Text style={styles.value}>{formatDate(releaseDate)}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Fecha de Revisión</Text>
          <Text style={styles.value}>{formatDate(revisionDate)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
            onPress={() => navigation.navigate('EditProduct', { product })}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={handleOpenDeleteModal}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas eliminar este producto?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  pressed && styles.confirmDeleteButtonPressed,
                  deleting && styles.confirmDeleteButtonDisabled,
                ]}
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f4f1',
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: '#e0ddd8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    color: '#6c6760',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1d1b18',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c6760',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1d1b18',
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#2f80ed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2f80ed',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  editButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  deleteButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1b18',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6c6760',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0ddd8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#1d1b18',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmDeleteButtonPressed: {
    opacity: 0.8,
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: '#8c8c8c',
  },
  confirmDeleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
