// Configuration de Jest pour les tests dans le projet KinéBilan Mobile

// Mock pour React Native Paper
jest.mock('react-native-paper', () => {
  const ActualReactNativePaper = jest.requireActual('react-native-paper');
  
  return {
    ...ActualReactNativePaper,
    useTheme: () => ({
      colors: {
        primary: '#5b9bd5',
        accent: '#fa9d44',
        background: '#f5f5f5',
        surface: '#ffffff',
        error: '#f44336',
        text: '#333333',
        onSurface: '#333333',
        disabled: '#9e9e9e',
        placeholder: '#9e9e9e',
        backdrop: 'rgba(0, 0, 0, 0.5)',
        notification: '#5b9bd5',
      },
      roundness: 8,
    }),
  };
});

// Mock pour AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  
  return {
    getItem: jest.fn((key) => {
      return Promise.resolve(store[key] || null);
    }),
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(store));
    }),
    __INTERNAL_MOCK_STORAGE__: store,
  };
});

// Mock pour la navigation React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock pour les icônes React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock pour date-fns
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  
  return {
    ...actual,
    format: jest.fn().mockImplementation((date, formatStr, options) => {
      if (formatStr === 'dd MMMM yyyy') {
        return '01 janvier 2023';
      } else if (formatStr === 'dd MMMM yyyy à HH:mm') {
        return '01 janvier 2023 à 14:30';
      } else if (formatStr === 'HH:mm') {
        return '14:30';
      } else if (formatStr === "yyyy-MM-dd'T'HH:mm:ss") {
        return '2023-01-01T14:30:00';
      }
      return actual.format(date, formatStr, options);
    }),
  };
});

// Mock pour le module Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

// Désactiver les logs durant les tests pour éviter le bruit
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Configuration globale pour éviter les avertissements
jest.setTimeout(10000); // Augmenter le timeout par défaut

// Nettoyage global après chaque test
afterEach(() => {
  jest.clearAllMocks();
});