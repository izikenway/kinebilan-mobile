import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { patientsAPI } from '../api/api';
import useFormValidation from '../hooks/useFormValidation';
import useApiRequest from '../hooks/useApiRequest';

/**
 * Écran de formulaire pour la création ou modification d'un patient
 */
const PatientFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id } = route.params || {};
  const isEditing = !!id;
  
  // Utilisation du hook de requête API
  const { loading, executeRequest } = useApiRequest();
  
  // Initialisation du formulaire avec le hook de validation
  const initialFormData = {
    nom: '',
    email: '',
    telephone: ''
  };
  
  // Règles de validation pour le formulaire patient
  const validationRules = (data) => {
    const errors = {};
    
    // Validation du nom (obligatoire)
    if (!data.nom.trim()) {
      errors.nom = 'Le nom est obligatoire';
    }
    
    // Validation de l'email (format)
    if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    // Validation du téléphone (format français)
    if (data.telephone.trim() && !/^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$/.test(data.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }
    
    return errors;
  };
  
  const { 
    formData, 
    errors, 
    handleChange, 
    validateForm, 
    setFormValues 
  } = useFormValidation(initialFormData, validationRules);
  
  // État pour le chargement initial en mode édition
  const [initialLoading, setInitialLoading] = React.useState(isEditing);
  
  // Chargement des données du patient si en mode édition
  useEffect(() => {
    if (isEditing) {
      loadPatientData();
    }
  }, [id]);
  
  // Fonction pour charger les données du patient
  const loadPatientData = async () => {
    setInitialLoading(true);
    
    await executeRequest(
      () => patientsAPI.getById(id),
      {
        showErrors: true,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du patient. Veuillez réessayer.',
        onSuccess: (response) => {
          const patient = response.data;
          
          setFormValues({
            nom: patient.nom || '',
            email: patient.email || '',
            telephone: patient.telephone || '',
          });
        },
        onError: () => {
          navigation.goBack();
        }
      }
    );
    
    setInitialLoading(false);
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    // Validation du formulaire
    if (!validateForm()) {
      return;
    }
    
    if (isEditing) {
      // Mise à jour du patient existant
      await executeRequest(
        () => patientsAPI.update(id, formData),
        {
          errorTitle: 'Erreur',
          errorMessage: 'Une erreur est survenue lors de la mise à jour du patient.',
          onSuccess: () => {
            Alert.alert(
              'Succès',
              'Le patient a été mis à jour avec succès.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      );
    } else {
      // Création d'un nouveau patient
      await executeRequest(
        () => patientsAPI.create(formData),
        {
          errorTitle: 'Erreur',
          errorMessage: 'Une erreur est survenue lors de la création du patient.',
          onSuccess: (response) => {
            Alert.alert(
              'Succès',
              'Le patient a été créé avec succès.',
              [{ text: 'OK', onPress: () => navigation.navigate('PatientDetails', { id: response.data.patient_id }) }]
            );
          }
        }
      );
    }
  };
  
  // Annulation du formulaire
  const handleCancel = () => {
    navigation.goBack();
  };
  
  // Affichage d'un chargement initial en mode édition
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des données du patient...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isEditing ? 'Modifier le patient' : 'Nouveau patient'}
            </Title>
            
            {/* Champ Nom */}
            <TextInput
              label="Nom *"
              value={formData.nom}
              onChangeText={(value) => handleChange('nom', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.nom}
              disabled={loading}
            />
            {errors.nom && (
              <Text style={styles.errorText}>{errors.nom}</Text>
            )}
            
            {/* Champ Email */}
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              disabled={loading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            
            {/* Champ Téléphone */}
            <TextInput
              label="Téléphone"
              value={formData.telephone}
              onChangeText={(value) => handleChange('telephone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.telephone}
              disabled={loading}
            />
            {errors.telephone && (
              <Text style={styles.errorText}>{errors.telephone}</Text>
            )}
            
            {/* Légende obligatoire */}
            <Text style={styles.requiredLegend}>* Champs obligatoires</Text>
            
            {/* Boutons d'action */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.button}
                disabled={loading}
              >
                Annuler
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                {isEditing ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8,
  },
  requiredLegend: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default PatientFormScreen;