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

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
      const message = err instanceof Error ? err.message : 'Error inesperado';
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.infoTitle}>
          <View style={styles.infoContainerID}>
            <Text style={styles.labelID}>ID:</Text>
            <Text style={styles.valueID}>
              {product.id || product._id || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoContainerID}>
            <Text style={styles.labelID}>{'Información extra'}</Text>
          </View>
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
          <Text style={styles.label}>Logo</Text>
        </View>
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
          <Text style={styles.label}>Fecha Liberación</Text>
          <Text style={styles.value}>{formatDate(releaseDate)}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Fecha Revisión</Text>
          <Text style={styles.value}>{formatDate(revisionDate)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
            testID='editbtn'
            onPress={() => navigation.navigate('EditProduct', { product })}
          >
            <Text style={styles.editButtonText}>Editar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            testID='deletebtn'
            onPress={handleOpenDeleteModal}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton}
            testID='closemdl'
            onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.modalMessage}>
              ¿Estás seguro de que deseas eliminar el producto {productName}?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  pressed && styles.confirmDeleteButtonPressed,
                  deleting && styles.confirmDeleteButtonDisabled,
                ]}
                testID='deletebtnmodal'
                onPress={handleConfirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
                testID='cancelbtn'
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#e0ddd8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    color: '#6c6760',
    fontSize: 16,
  },
  infoTitle: {
    paddingVertical: 50,
  },
  infoContainerID: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  labelID: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6c6760',
    transform: 'uppercase',
    marginBottom: 4,
  },
  valueID: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6c6760',
    transform: 'uppercase',
    marginBottom: 4,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c6760',
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
    backgroundColor: '#cac6be',
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  editButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  editButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    alignItems: 'center',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
    width: '100%',
    height: '30%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#6c6760',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1b18',
    marginBottom: 12,
    marginTop: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6c6760',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'column',
    height: 120,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e0ddd8',
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
