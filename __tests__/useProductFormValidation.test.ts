import { renderHook, act } from '@testing-library/react-native';
import { useProductFormValidation } from '../src/hooks/useProductFormValidation';
import useProducts from '../src/hooks/useProducts';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://mock-api.com',
}));

// Mock the useProducts hook
jest.mock('../src/hooks/useProducts');

const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;

describe('useProductFormValidation', () => {
  let mockVerifyProductId: jest.Mock;

  beforeEach(() => {
    mockVerifyProductId = jest.fn();
    mockUseProducts.mockReturnValue({
      verifyProductId: mockVerifyProductId,
      getProducts: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns initial state with empty values when no initial product', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      expect(result.current.id).toBe('');
      expect(result.current.name).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.logo).toBe('');
      expect(result.current.releaseDate).toBe('');
      expect(result.current.revisionDate).toBe('');
      expect(result.current.idError).toBe('');
      expect(result.current.nameError).toBe('');
      expect(result.current.descriptionError).toBe('');
      expect(result.current.logoError).toBe('');
      expect(result.current.releaseDateError).toBe('');
      expect(result.current.revisionDateError).toBe('');
      expect(result.current.idValidating).toBe(false);
    });

    it('returns initial state with provided values', () => {
      const initialProduct = {
        id: '123',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'http://example.com/logo.png',
        date_release: '2027-01-01',
        date_revision: '2028-01-01',
      };

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true, initialProduct })
      );

      expect(result.current.id).toBe('123');
      expect(result.current.name).toBe('Test Product');
      expect(result.current.description).toBe('Test Description');
      expect(result.current.logo).toBe('http://example.com/logo.png');
      expect(result.current.releaseDate).toBe('2027-01-01');
      expect(result.current.revisionDate).toBe('2028-01-01');
    });
  });

  describe('handleIdChange', () => {
    it('updates id and clears error', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setIdError('Some error');
        result.current.handleIdChange('new-id');
      });

      expect(result.current.id).toBe('new-id');
      expect(result.current.idError).toBe('');
    });
  });

  describe('handleIdBlur', () => {
    it('does not verify ID when editing', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      act(() => {
        result.current.setId('test-id');
        result.current.handleIdBlur();
      });

      expect(mockVerifyProductId).not.toHaveBeenCalled();
    });

    it('verifies ID when not editing and ID is not empty', () => {
      mockVerifyProductId.mockResolvedValue({ exists: false });

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setId('test-id');
      });

      act(() => {
        result.current.handleIdBlur();
      });

      expect(mockVerifyProductId).toHaveBeenCalledWith('test-id');
    });

    it('does not verify ID when ID is empty', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.handleIdBlur();
      });

      expect(mockVerifyProductId).not.toHaveBeenCalled();
    });
  });

  describe('field change handlers', () => {
    it('handleNameChange updates name and clears error', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setNameError('Some error');
        result.current.handleNameChange('New Name');
      });

      expect(result.current.name).toBe('New Name');
      expect(result.current.nameError).toBe('');
    });

    it('handleDescriptionChange updates description and clears error', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setDescriptionError('Some error');
        result.current.handleDescriptionChange('New Description');
      });

      expect(result.current.description).toBe('New Description');
      expect(result.current.descriptionError).toBe('');
    });

    it('handleLogoChange updates logo and clears error', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setLogoError('Some error');
        result.current.handleLogoChange('http://new-logo.com');
      });

      expect(result.current.logo).toBe('http://new-logo.com');
      expect(result.current.logoError).toBe('');
    });
  });

  describe('handleReleaseDateChange', () => {
    it('updates release date and clears error', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setReleaseDateError('Some error');
        result.current.handleReleaseDateChange('2028-01-01');
      });

      expect(result.current.releaseDate).toBe('2028-01-01');
      expect(result.current.releaseDateError).toBe('');
    });

    it('automatically sets revision date to one year later', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.handleReleaseDateChange('2028-01-01');
      });

      expect(result.current.revisionDate).toBe('2028-01-01');
    });

    it('clears revision date when release date is empty', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      act(() => {
        result.current.setRevisionDate('2028-01-01');
        result.current.handleReleaseDateChange('');
      });

      expect(result.current.revisionDate).toBe('');
    });
  });

  describe('validateForm', () => {
    it('returns true for valid form data when editing', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'existing-id',
        name: 'Valid Name',
        description: 'This is a valid description with enough characters.',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(true);
    });

    it('returns false and sets errors for empty name', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: '',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.nameError).toBe('El nombre es requerido');
    });

    it('returns false and sets errors for empty description', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: '',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.descriptionError).toBe('La descripción es requerida');
    });

    it('returns false and sets errors for description too short', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Short',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.descriptionError).toBe('La descripción debe tener al menos 10 caracteres');
    });

    it('returns false and sets errors for description too long', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'a'.repeat(201),
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.descriptionError).toBe('La descripción debe tener máximo 200 caracteres');
    });

    it('returns false and sets errors for empty logo', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Valid description',
        logo: '',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.logoError).toBe('El logo es requerido');
    });

    it('returns false and sets errors for empty release date', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.releaseDateError).toBe('La fecha de lanzamiento es requerida');
    });

    it('returns false and sets errors for past release date', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '2020-01-01', // Past date
        revisionDate: '2021-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.releaseDateError).toBe('La fecha de lanzamiento debe ser igual o mayor a la fecha actual');
    });

    it('returns false and sets errors for empty revision date', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.revisionDateError).toBe('La fecha de revisión es requerida');
    });

    it('returns false and sets errors for incorrect revision date', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true })
      );

      const formData = {
        id: 'test-id',
        name: 'Valid Name',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2027-03-02', // Not exactly one year later
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.revisionDateError).toBe('La fecha de revisión debe ser exactamente un año posterior a la fecha de lanzamiento');
    });

    it('returns false when ID validation fails', async () => {
      mockVerifyProductId.mockResolvedValue({ exists: true });

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      const formData = {
        id: 'existing-id',
        name: 'Valid Name',
        description: 'Valid description with enough characters.',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.idError).toBe('El ID ya existe');
    });

    it('returns false and sets error for empty ID when not editing', async () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      const formData = {
        id: '',
        name: 'Valid Name',
        description: 'Valid description',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(false);
      expect(result.current.idError).toBe('El ID es requerido para crear un producto');
    });

    it('validates ID when not editing', async () => {
      mockVerifyProductId.mockResolvedValue({ exists: false });

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      const formData = {
        id: 'new-id',
        name: 'Valid Name',
        description: 'Valid description with enough characters.',
        logo: 'http://example.com/logo.png',
        releaseDate: '2028-01-01',
        revisionDate: '2029-01-01',
      };

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm(formData);
      });

      expect(isValid).toBe(true);
      expect(mockVerifyProductId).toHaveBeenCalledWith('new-id');
    });
  });

  describe('resetForm', () => {
    it('resets all form fields and errors to initial values', () => {
      const initialProduct = {
        id: '123',
        name: 'Initial Name',
        description: 'Initial Description',
        logo: 'http://initial.com/logo.png',
        date_release: '2028-01-01',
        date_revision: '2028-01-01',
      };

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true, initialProduct })
      );

      act(() => {
        result.current.setId('changed-id');
        result.current.setName('Changed Name');
        result.current.setDescription('Changed Description');
        result.current.setLogo('http://changed.com/logo.png');
        result.current.setReleaseDate('2026-02-01');
        result.current.setRevisionDate('2027-02-01');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.id).toBe('123');
      expect(result.current.name).toBe('Initial Name');
      expect(result.current.description).toBe('Initial Description');
      expect(result.current.logo).toBe('http://initial.com/logo.png');
      expect(result.current.releaseDate).toBe('2027-01-01');
      expect(result.current.revisionDate).toBe('2028-01-01');
      expect(result.current.idError).toBe('');
      expect(result.current.nameError).toBe('');
      expect(result.current.descriptionError).toBe('');
      expect(result.current.logoError).toBe('');
      expect(result.current.releaseDateError).toBe('');
      expect(result.current.revisionDateError).toBe('');
    });

    it('recalculates revision date when resetting', () => {
      const initialProduct = {
        id: '123',
        name: 'Initial Name',
        description: 'Initial Description',
        logo: 'http://initial.com/logo.png',
        date_release: '2028-01-01',
        date_revision: '2028-01-01',
      };

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true, initialProduct })
      );

      act(() => {
        result.current.setRevisionDate('2027-02-01'); // Change it
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.revisionDate).toBe('2028-01-01'); // Should be recalculated
    });

    it('clears revision date when release date is empty', () => {
      const initialProduct = {
        id: '123',
        name: 'Initial Name',
        description: 'Initial Description',
        logo: 'http://initial.com/logo.png',
        date_release: '',
        date_revision: '2028-01-01',
      };

      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: true, initialProduct })
      );

      act(() => {
        result.current.setRevisionDate('2027-02-01'); // Change it
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.revisionDate).toBe(''); // Should be cleared
    });
  });

  describe('returned functions and setters', () => {
    it('returns all expected functions and setters', () => {
      const { result } = renderHook(() =>
        useProductFormValidation({ isEditing: false })
      );

      expect(result.current).toHaveProperty('id');
      expect(result.current).toHaveProperty('name');
      expect(result.current).toHaveProperty('description');
      expect(result.current).toHaveProperty('logo');
      expect(result.current).toHaveProperty('releaseDate');
      expect(result.current).toHaveProperty('revisionDate');
      expect(result.current).toHaveProperty('idError');
      expect(result.current).toHaveProperty('idValidating');
      expect(result.current).toHaveProperty('nameError');
      expect(result.current).toHaveProperty('descriptionError');
      expect(result.current).toHaveProperty('logoError');
      expect(result.current).toHaveProperty('releaseDateError');
      expect(result.current).toHaveProperty('revisionDateError');
      expect(result.current).toHaveProperty('setId');
      expect(result.current).toHaveProperty('setName');
      expect(result.current).toHaveProperty('setDescription');
      expect(result.current).toHaveProperty('setLogo');
      expect(result.current).toHaveProperty('setReleaseDate');
      expect(result.current).toHaveProperty('setRevisionDate');
      expect(result.current).toHaveProperty('handleIdChange');
      expect(result.current).toHaveProperty('handleIdBlur');
      expect(result.current).toHaveProperty('handleNameChange');
      expect(result.current).toHaveProperty('handleDescriptionChange');
      expect(result.current).toHaveProperty('handleLogoChange');
      expect(result.current).toHaveProperty('handleReleaseDateChange');
      expect(result.current).toHaveProperty('validateForm');
      expect(result.current).toHaveProperty('resetForm');
    });
  });
});