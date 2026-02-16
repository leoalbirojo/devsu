import { useState } from 'react';
import useProducts from './useProducts';

interface UseProductFormValidationProps {
  isEditing: boolean;
  initialProduct?: {
    id?: string;
    name?: string;
    description?: string;
    logo?: string;
    date_release?: string;
    date_revision?: string;
  };
}

export const useProductFormValidation = ({
  isEditing,
  initialProduct,
}: UseProductFormValidationProps) => {
  const [id, setId] = useState(String(initialProduct?.id || ''));
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(
    initialProduct?.description || '',
  );
  const [logo, setLogo] = useState(initialProduct?.logo || '');
  const [releaseDate, setReleaseDate] = useState(
    initialProduct?.date_release || '',
  );
  const [revisionDate, setRevisionDate] = useState(
    initialProduct?.date_revision || '',
  );
  const [idError, setIdError] = useState('');
  const [idValidating, setIdValidating] = useState(false);
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [logoError, setLogoError] = useState('');
  const [releaseDateError, setReleaseDateError] = useState('');
  const [revisionDateError, setRevisionDateError] = useState('');
  const { verifyProductId } = useProducts();

  const verifyId = async (idToCheck: string) => {
    if (!idToCheck.trim()) {
      setIdError('El ID es requerido');
      return false;
    }

    if (idToCheck.length < 3) {
      setIdError('El ID debe tener al menos 3 caracteres');
      return false;
    }

    if (idToCheck.length > 10) {
      setIdError('El ID debe tener máximo 10 caracteres');
      return false;
    }

    setIdValidating(true);
    setIdError('');

    try {
      const result = await verifyProductId(idToCheck);
      if (result.exists) {
        setIdError('El ID ya existe');
        return false;
      } else {
        setIdError('');
        return true;
      }
    } catch {
      setIdError('Error de conexión al verificar el ID');
      return false;
    } finally {
      setIdValidating(false);
    }
  };

  const handleIdChange = (newId: string) => {
    setId(newId);
    if (idError) {
      setIdError('');
    }
  };

  const handleIdBlur = () => {
    if (!isEditing && id.trim()) {
      verifyId(id);
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (nameError) {
      setNameError('');
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    if (descriptionError) {
      setDescriptionError('');
    }
  };

  const handleLogoChange = (newLogo: string) => {
    setLogo(newLogo);
    if (logoError) {
      setLogoError('');
    }
  };

  const handleReleaseDateChange = (newDate: string) => {
    setReleaseDate(newDate);
    if (releaseDateError) {
      setReleaseDateError('');
    }
  };

  const handleRevisionDateChange = (newDate: string) => {
    setRevisionDate(newDate);
    if (revisionDateError) {
      setRevisionDateError('');
    }
  };

  const validateForm = async (formData: {
    id: string;
    name: string;
    description: string;
    logo: string;
    releaseDate: string;
    revisionDate: string;
  }) => {
    const { id, name, description, logo, releaseDate, revisionDate } = formData;
    let hasErrors = false;

    if (!name.trim()) {
      setNameError('El nombre es requerido');
      hasErrors = true;
    } else {
      setNameError('');
    }

    if (!description.trim()) {
      setDescriptionError('La descripción es requerida');
      hasErrors = true;
    } else if (description.length < 10) {
      setDescriptionError('La descripción debe tener al menos 10 caracteres');
      hasErrors = true;
    } else if (description.length > 200) {
      setDescriptionError('La descripción debe tener máximo 200 caracteres');
      hasErrors = true;
    } else {
      setDescriptionError('');
    }

    if (!logo.trim()) {
      setLogoError('El logo es requerido');
      hasErrors = true;
    } else {
      setLogoError('');
    }

    if (!releaseDate.trim()) {
      setReleaseDateError('La fecha de lanzamiento es requerida');
      hasErrors = true;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const relDate = new Date(releaseDate);
      if (relDate < today) {
        setReleaseDateError(
          'La fecha de lanzamiento debe ser igual o mayor a la fecha actual',
        );
        hasErrors = true;
      } else {
        setReleaseDateError('');
      }
    }

    if (!revisionDate.trim()) {
      setRevisionDateError('La fecha de revisión es requerida');
      hasErrors = true;
    } else if (!releaseDate.trim()) {
      // If release date is empty, we already have error, skip this
      setRevisionDateError('');
    } else {
      const relDate = new Date(releaseDate);
      const expectedRevDate = new Date(relDate);
      expectedRevDate.setFullYear(relDate.getFullYear() + 1);
      const revDate = new Date(revisionDate);
      if (revDate.getTime() !== expectedRevDate.getTime()) {
        setRevisionDateError(
          'La fecha de revisión debe ser exactamente un año posterior a la fecha de lanzamiento',
        );
        hasErrors = true;
      } else {
        setRevisionDateError('');
      }
    }

    if (!isEditing) {
      if (!id.trim()) {
        setIdError('El ID es requerido para crear un producto');
        hasErrors = true;
      } else {
        // Validate ID format and existence
        const isIdValid = await verifyId(id);
        if (!isIdValid) {
          hasErrors = true;
        }
      }
    }

    return !hasErrors;
  };

  return {
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
    setId,
    setName,
    setDescription,
    setLogo,
    setReleaseDate,
    setRevisionDate,
    handleIdChange,
    handleIdBlur,
    handleNameChange,
    handleDescriptionChange,
    handleLogoChange,
    handleReleaseDateChange,
    handleRevisionDateChange,
    validateForm,
  };
};
