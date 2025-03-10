import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, List } from 'react-native-paper';
import { View } from 'react-native';

// Import des écrans
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RGPDScreen from '../screens/RGPDScreen';
import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import PatientFormScreen from '../screens/PatientFormScreen';
import AppointmentListScreen from '../screens/AppointmentListScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import AppointmentFormScreen from '../screens/AppointmentFormScreen';
import BilanListScreen from '../screens/BilanListScreen';
import BilanDetailScreen from '../screens/BilanDetailScreen';
import BilanFormScreen from '../screens/BilanFormScreen';
// Import des autres écrans (à implémenter plus tard)
// import ReportsScreen from '../screens/ReportsScreen';
// import ProfileScreen from '../screens/ProfileScreen';

// Import du contexte d'authentification
import { useAuth } from '../context/AuthContext';

// Création des navigateurs
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigateur principal pour les écrans d'authentification
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Navigateur pour le tableau de bord
const DashboardNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ 
        title: 'Tableau de bord',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>
);

// Navigateur pour les patients
const PatientsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PatientList" 
      component={PatientListScreen}
      options={{ 
        title: 'Patients',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="PatientDetails" 
      component={PatientDetailScreen}
      options={{ 
        title: 'Détails du patient',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="PatientForm" 
      component={PatientFormScreen}
      options={({ route }) => ({ 
        title: route.params?.id ? 'Modifier le patient' : 'Nouveau patient',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <Stack.Screen 
      name="AppointmentForm" 
      component={AppointmentFormScreen}
      options={({ route }) => ({ 
        title: route.params?.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
  </Stack.Navigator>
);

// Navigateur pour les rendez-vous
const AppointmentsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AppointmentList" 
      component={AppointmentListScreen}
      options={{ 
        title: 'Rendez-vous',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="AppointmentDetails" 
      component={AppointmentDetailScreen}
      options={{ 
        title: 'Détails du rendez-vous',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="AppointmentForm" 
      component={AppointmentFormScreen}
      options={({ route }) => ({ 
        title: route.params?.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <Stack.Screen 
      name="PatientDetails" 
      component={PatientDetailScreen}
      options={{ 
        title: 'Détails du patient',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>
);

// Navigateur pour les bilans
const BilansNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="BilanList" 
      component={BilanListScreen}
      options={{ 
        title: 'Bilans',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="BilanDetails" 
      component={BilanDetailScreen}
      options={{ 
        title: 'Détails du bilan',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen 
      name="BilanForm" 
      component={BilanFormScreen}
      options={({ route }) => ({ 
        title: route.params?.id ? 'Modifier le bilan' : 'Nouveau bilan',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <Stack.Screen 
      name="PatientDetails" 
      component={PatientDetailScreen}
      options={{ 
        title: 'Détails du patient',
        headerStyle: {
          backgroundColor: '#5b9bd5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>
);

// Navigateur pour les écrans de menu "Plus"
const MoreNavigator = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MoreMenu" 
        component={MoreMenuScreen}
        options={{ 
          title: 'Plus d\'options',
          headerStyle: {
            backgroundColor: '#5b9bd5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="RGPD" 
        component={RGPDScreen}
        options={{ 
          title: 'Protection des données (RGPD)',
          headerStyle: {
            backgroundColor: '#5b9bd5',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      {/* Autres écrans du menu "Plus" à ajouter ici */}
    </Stack.Navigator>
  );
};

// Écran de menu "Plus" avec les options disponibles
const MoreMenuScreen = ({ navigation }) => {
  const { logout } = useAuth();
  
  return (
    <View style={{ flex: 1, padding: 15, backgroundColor: '#f5f5f5' }}>
      <List.Section>
        <List.Subheader>Paramètres et outils</List.Subheader>
        <List.Item
          title="Gestion RGPD"
          description="Protection des données et consentements"
          left={props => <List.Icon {...props} icon="shield-account" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('RGPD')}
        />
        <List.Item
          title="Mon profil"
          description="Modifier vos informations"
          left={props => <List.Icon {...props} icon="account-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}  // À implémenter
        />
        <List.Item
          title="Paramètres"
          description="Configuration de l'application"
          left={props => <List.Icon {...props} icon="cog" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}  // À implémenter
        />
      </List.Section>
      
      <List.Section>
        <List.Subheader>Application</List.Subheader>
        <List.Item
          title="À propos"
          description="Informations sur l'application"
          left={props => <List.Icon {...props} icon="information" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {}}  // À implémenter
        />
        <List.Item
          title="Déconnexion"
          description="Se déconnecter de l'application"
          left={props => <List.Icon {...props} icon="logout" color="#d32f2f" />}
          onPress={() => logout()}
        />
      </List.Section>
    </View>
  );
};

// Navigateur avec onglets pour l'application principale
const MainTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'PatientsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AppointmentsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'BilansTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'MoreTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardNavigator} 
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="PatientsTab" 
        component={PatientsNavigator} 
        options={{ title: 'Patients' }}
      />
      <Tab.Screen 
        name="AppointmentsTab" 
        component={AppointmentsNavigator} 
        options={{ title: 'Rendez-vous' }}
      />
      <Tab.Screen 
        name="BilansTab" 
        component={BilansNavigator} 
        options={{ title: 'Bilans' }}
      />
      <Tab.Screen 
        name="MoreTab" 
        component={MoreNavigator} 
        options={{ title: 'Plus' }}
      />
    </Tab.Navigator>
  );
};

// Navigateur principal qui détermine quel navigateur afficher en fonction de l'état d'authentification
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Afficher un écran de chargement si l'état d'authentification est en cours de vérification
  if (loading) {
    return null; // Ou un composant de chargement
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;