import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import useProducts from '../hooks/useProducts';
import { useProductFormValidation } from '../hooks/useProductFormValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProduct'>;

const EditProductScreen = ({ route, navigation }: Props) => {
  const { product } = route.params;
  const isEditing = !!product;

  const { saveProduct } = useProducts();
  const {
    id,
    name,
    description,
    logo,
    releaseDate,
    revisionDate,
    idError,
    idValidating,
    nameError,
    descriptionError,
    logoError,
    releaseDateError,
    revisionDateError,
    handleIdChange,
    handleIdBlur,
    handleNameChange,
    handleDescriptionChange,
    handleLogoChange,
    handleReleaseDateChange,
    validateForm,
    resetForm,
  } = useProductFormValidation({ isEditing, initialProduct: product });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const isValid = await validateForm({
      id,
      name,
      description,
      logo,
      releaseDate,
      revisionDate,
    });

    if (!isValid) {
      return;
    }

    setSaving(true);

    try {
      await saveProduct({
        id: id.trim(),
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        date_release: releaseDate,
        date_revision: revisionDate,
      }, isEditing);

      const successMessage = isEditing
        ? 'Producto actualizado correctamente'
        : 'Producto creado correctamente';

      Alert.alert('Éxito', successMessage, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isEditing ? 'Editar Producto' : 'Formulario de Registro'}
      </Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID *</Text>
        <TextInput
          style={[styles.input, isEditing && styles.inputDisabled, idError && styles.inputError]}
          value={id}
          onChangeText={handleIdChange}
          onBlur={handleIdBlur}
          placeholder="ID del producto"
          placeholderTextColor="#8c8c8c"
          editable={!isEditing}
          autoCapitalize="none"
        />
        {idError ? <Text style={styles.errorText}>{idError}</Text> : null}
        {idValidating ? <Text style={styles.validatingText}>Verificando ID...</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={[styles.input, nameError && styles.inputError]}
          value={name}
          onChangeText={handleNameChange}
          placeholder="Nombre del producto"
          placeholderTextColor="#8c8c8c"
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline, descriptionError && styles.inputError]}
          value={description}
          onChangeText={handleDescriptionChange}
          placeholder="Descripción del producto"
          placeholderTextColor="#8c8c8c"
          multiline
          numberOfLines={4}
        />
        {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Logo (URL) *</Text>
        <TextInput
          style={[styles.input, logoError && styles.inputError]}
          value={logo}
          onChangeText={handleLogoChange}
          placeholder="https://ejemplo.com/logo.png"
          placeholderTextColor="#8c8c8c"
          autoCapitalize="none"
          keyboardType="url"
        />
        {logoError ? <Text style={styles.errorText}>{logoError}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha de Lanzamiento *</Text>
        <TextInput
          style={[styles.input, releaseDateError && styles.inputError]}
          value={releaseDate}
          onChangeText={handleReleaseDateChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8c8c8c"
        />
        {releaseDateError ? <Text style={styles.errorText}>{releaseDateError}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fecha de Revisión *</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled, revisionDateError && styles.inputError]}
          value={revisionDate}
          placeholder="Se calcula automáticamente (1 año después del lanzamiento)"
          placeholderTextColor="#8c8c8c"
          editable={false}
        />
        {revisionDateError ? <Text style={styles.errorText}>{revisionDateError}</Text> : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          saving && styles.saveButtonDisabled,
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Guardando...' : 'Enviar'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
        onPress={handleReset}
      >
        <Text style={styles.resetButtonText}>Reiniciar</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1b18',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c6760',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1cfc9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1d1b18',
  },
  inputDisabled: {
    backgroundColor: '#e0ddd8',
    color: '#6c6760',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#ffdd00',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#ffdd00',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    backgroundColor: '#8c8c8c',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6b7280',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  resetButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  validatingText: {
    color: '#f59e0b',
    fontSize: 14,
    marginTop: 4,
  },
});

export default EditProductScreen;
