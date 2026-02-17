/**
 * @format
 */

import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import EditProductScreen from '../src/screens/EditProductScreen';
import useProducts from '../src/hooks/useProducts';
import { useProductFormValidation } from '../src/hooks/useProductFormValidation';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  default: {
    API_BASE_URL: 'http://localhost:3000',
  },
}));

// Mock the hooks
jest.mock('../src/hooks/useProducts');
jest.mock('../src/hooks/useProductFormValidation');

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert = {
    alert: mockAlert,
  };
  return RN;
});

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
const mockUseProductFormValidation = useProductFormValidation as jest.MockedFunction<typeof useProductFormValidation>;

describe('EditProductScreen', () => {
  const mockFormValidationReturn = {
    id: '',
    name: '',
    description: '',
    logo: '',
    releaseDate: '',
    revisionDate: '',
    idError: null,
    idValidating: false,
    nameError: null,
    descriptionError: null,
    logoError: null,
    releaseDateError: null,
    revisionDateError: null,
    handleIdChange: jest.fn(),
    handleIdBlur: jest.fn(),
    handleNameChange: jest.fn(),
    handleDescriptionChange: jest.fn(),
    handleLogoChange: jest.fn(),
    handleReleaseDateChange: jest.fn(),
    validateForm: jest.fn(),
    resetForm: jest.fn(),
  };

  const mockProduct = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'https://example.com/logo.png',
    date_release: '2024-01-15',
    date_revision: '2025-01-15',
  };

  const mockRoute = {
    params: {
      product: mockProduct,
    },
  };

  const mockEmptyRoute = {
    params: {},
  };



  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseProducts as jest.Mock).mockReturnValue({
      saveProduct: jest.fn().mockResolvedValue(undefined),
      verifyProductId: jest.fn(),
    });
    (mockUseProductFormValidation as jest.Mock).mockReturnValue(mockFormValidationReturn);
  });

  describe('rendering', () => {
    it('renders correctly in edit mode', () => {
      const filledMock = {
        ...mockFormValidationReturn,
        id: 'test-id',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'https://example.com/logo.png',
        releaseDate: '2024-01-15',
        revisionDate: '2025-01-15',
      };
      mockUseProductFormValidation.mockReturnValue(filledMock);

      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      expect(component).toBeTruthy();
      const root = component.root;

      // Check title
      const title = root.findByProps({ children: 'Editar Producto' });
      expect(title).toBeTruthy();

      // Check that ID input is disabled in edit mode
      const idInput = root.findByProps({ placeholder: 'ID del producto' });
      expect(idInput.props.editable).toBe(false);
    });

    it('renders correctly in create mode', () => {
      mockUseProductFormValidation.mockReturnValue({
        ...mockFormValidationReturn,
        id: '',
        name: '',
        description: '',
        logo: '',
        releaseDate: '',
        revisionDate: '',
      });

      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockEmptyRoute} />,
        );
      });

      expect(component).toBeTruthy();
      const root = component.root;

      // Check title
      const title = root.findByProps({ children: 'Formulario de Registro' });
      expect(title).toBeTruthy();

      // Check that ID input is enabled in create mode
      const idInput = root.findByProps({ placeholder: 'ID del producto' });
      expect(idInput.props.editable).toBe(true);
    });

    it('renders all form inputs', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;

      // Check all input placeholders exist
      expect(root.findByProps({ placeholder: 'ID del producto' })).toBeTruthy();
      expect(root.findByProps({ placeholder: 'Nombre del producto' })).toBeTruthy();
      expect(root.findByProps({ placeholder: 'Descripción del producto' })).toBeTruthy();
      expect(root.findByProps({ placeholder: 'https://ejemplo.com/logo.png' })).toBeTruthy();
      expect(root.findByProps({ placeholder: 'YYYY-MM-DD' })).toBeTruthy();
    });

    it('renders buttons', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;

      // Check buttons exist
      const saveButton = root.findByProps({ children: 'Enviar' });
      expect(saveButton).toBeTruthy();

      const resetButton = root.findByProps({ children: 'Reiniciar' });
      expect(resetButton).toBeTruthy();
    });
  });

  describe('form interactions', () => {
    it('calls handleIdChange when ID input changes', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockEmptyRoute} />,
        );
      });

      const root = component.root;
      const idInput = root.findByProps({ placeholder: 'ID del producto' });

      ReactTestRenderer.act(() => {
        idInput.props.onChangeText('new-id');
      });

      expect(mockFormValidationReturn.handleIdChange).toHaveBeenCalledWith('new-id');
    });

    it('calls handleIdBlur when ID input loses focus', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockEmptyRoute} />,
        );
      });

      const root = component.root;
      const idInput = root.findByProps({ placeholder: 'ID del producto' });

      ReactTestRenderer.act(() => {
        idInput.props.onBlur();
      });

      expect(mockFormValidationReturn.handleIdBlur).toHaveBeenCalled();
    });

    it('calls handleNameChange when name input changes', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const nameInput = root.findByProps({ placeholder: 'Nombre del producto' });

      ReactTestRenderer.act(() => {
        nameInput.props.onChangeText('New Product Name');
      });

      expect(mockFormValidationReturn.handleNameChange).toHaveBeenCalledWith('New Product Name');
    });

    it('calls handleDescriptionChange when description input changes', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const descriptionInput = root.findByProps({ placeholder: 'Descripción del producto' });

      ReactTestRenderer.act(() => {
        descriptionInput.props.onChangeText('New description');
      });

      expect(mockFormValidationReturn.handleDescriptionChange).toHaveBeenCalledWith('New description');
    });

    it('calls handleLogoChange when logo input changes', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const logoInput = root.findByProps({ placeholder: 'https://ejemplo.com/logo.png' });

      ReactTestRenderer.act(() => {
        logoInput.props.onChangeText('https://new-logo.com/image.png');
      });

      expect(mockFormValidationReturn.handleLogoChange).toHaveBeenCalledWith('https://new-logo.com/image.png');
    });

    it('calls handleReleaseDateChange when release date input changes', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const releaseDateInput = root.findByProps({ placeholder: 'YYYY-MM-DD' });

      ReactTestRenderer.act(() => {
        releaseDateInput.props.onChangeText('2024-02-15');
      });

      expect(mockFormValidationReturn.handleReleaseDateChange).toHaveBeenCalledWith('2024-02-15');
    });
  });

  describe('button interactions', () => {
    it('calls resetForm when reset button is pressed', () => {
      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const resetButton = root.findByProps({ testID: 'resetbtn' });

      ReactTestRenderer.act(() => {
        resetButton.props.onPress();
      });

      expect(mockFormValidationReturn.resetForm).toHaveBeenCalled();
    });

    it('handles validation failure', async () => {
      mockUseProductFormValidation.mockReturnValue({
        ...mockFormValidationReturn,
        validateForm: jest.fn().mockResolvedValue(false),
      });

      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;
      const saveButton = root.findByProps({ testID: 'savebtn' });

      ReactTestRenderer.act(() => {
        saveButton.props.onPress();
      });

      // Wait for async operation
      await ReactTestRenderer.act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Expect validateForm to be called
      // Should not call saveProduct or show success alert
      expect(mockUseProducts().saveProduct).not.toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

  });

  describe('error display', () => {
    it('displays validation errors', () => {
      mockUseProductFormValidation.mockReturnValue({
        ...mockFormValidationReturn,
        idError: 'ID is required',
        nameError: 'Name is required',
        descriptionError: 'Description is required',
        logoError: 'Logo is required',
        releaseDateError: 'Release date is required',
        revisionDateError: 'Revision date is required',
      });

      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockRoute} />,
        );
      });

      const root = component.root;

      // Check error messages are displayed
      expect(root.findByProps({ children: 'ID is required' })).toBeTruthy();
      expect(root.findByProps({ children: 'Name is required' })).toBeTruthy();
      expect(root.findByProps({ children: 'Description is required' })).toBeTruthy();
      expect(root.findByProps({ children: 'Logo is required' })).toBeTruthy();
      expect(root.findByProps({ children: 'Release date is required' })).toBeTruthy();
      expect(root.findByProps({ children: 'Revision date is required' })).toBeTruthy();
    });

    it('displays validating message for ID', () => {
      mockUseProductFormValidation.mockReturnValue({
        ...mockFormValidationReturn,
        idValidating: true,
      });

      let component;
      ReactTestRenderer.act(() => {
        component = ReactTestRenderer.create(
          <EditProductScreen navigation={mockNavigation} route={mockEmptyRoute} />,
        );
      });

      const root = component.root;

      expect(root.findByProps({ children: 'Verificando ID...' })).toBeTruthy();
    });
  });
});