import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { 
  TextInput, Button, Text, Title, Card, ActivityIndicator, Divider, 
  List, Menu, Chip, IconButton, useTheme 
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bilansAPI, patientsAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useFormValidation from '../hooks/useFormValidation';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Sélecteur de patient avec recherche
 */
const PatientSelector = ({ selectedPatient, onSelectPatient, disabled }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const theme = useTheme();

  // Recherche de patients
  const searchPatients = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const response = await patientsAPI.search(query);
      setSearchResults(response.data.results || []);
      setShowResults(true);
    } catch (err) {
      console.error('Erreur lors de la recherche de patients:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  return (
    <View style={styles.patientSelector}>
      {selectedPatient ? (
        <View style={styles.selectedPatientContainer}>
          <Text style={styles.selectedPatientText}>
            {selectedPatient.nom}
          </Text>
          {!disabled && (
            <Button
              mode="text"
              onPress={() => onSelectPatient(null)}
              style={styles.clearButton}
            >
              Changer
            </Button>
          )}
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <TextInput
            label="Rechercher un patient"
            value={searchQuery}
            onChangeText={searchPatients}
            mode="outlined"
            disabled={disabled}
            right={
              searching ? (
                <TextInput.Icon name="loading" />
              ) : (
                <TextInput.Icon
                  icon="magnify"
                  onPress={() => setShowResults(true)}
                />
              )
            }
            style={styles.searchInput}
          />
          
          {showResults && searchResults.length > 0 && (
            <Card style={styles.resultsCard}>
              <Card.Content>
                <ScrollView style={styles.resultsList} nestedScrollEnabled={true}>
                  {searchResults.map((patient) => (
                    <TouchableOpacity
                      key={patient.patient_id}
                      onPress={() => {
                        onSelectPatient(patient);
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      style={styles.resultItem}
                    >
                      <Text>{patient.nom}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card.Content>
            </Card>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * Section d'observations du bilan
 */
const ObservationsSection = ({ observations, onAddObservation, onUpdateObservation, onRemoveObservation, disabled }) => {
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [newObservationTitle, setNewObservationTitle] = useState('');
  const [newObservationContent, setNewObservationContent] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  
  // Ajout d'une observation
  const handleAddObservation = () => {
    if (!newObservationTitle.trim() || !newObservationContent.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs de l\'observation.');
      return;
    }
    
    if (editIndex >= 0) {
      onUpdateObservation(editIndex, {
        titre: newObservationTitle,
        contenu: newObservationContent
      });
    } else {
      onAddObservation({
        titre: newObservationTitle,
        contenu: newObservationContent
      });
    }
    
    setNewObservationTitle('');
    setNewObservationContent('');
    setShowAddObservation(false);
    setEditIndex(-1);
  };
  
  // Modification d'une observation
  const handleEditObservation = (index) => {
    const observation = observations[index];
    setNewObservationTitle(observation.titre);
    setNewObservationContent(observation.contenu);
    setEditIndex(index);
    setShowAddObservation(true);
  };
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Observations</Text>
        {!disabled && (
          <Button 
            mode="text" 
            onPress={() => {
              setShowAddObservation(!showAddObservation);
              setEditIndex(-1);
              setNewObservationTitle('');
              setNewObservationContent('');
            }}
            icon={showAddObservation ? "minus" : "plus"}
          >
            {showAddObservation ? "Annuler" : "Ajouter"}
          </Button>
        )}
      </View>
      
      {observations.length === 0 && !showAddObservation && (
        <Text style={styles.emptyText}>Aucune observation ajoutée</Text>
      )}
      
      {showAddObservation && (
        <Card style={styles.addItemCard}>
          <Card.Content>
            <TextInput
              label="Titre"
              value={newObservationTitle}
              onChangeText={setNewObservationTitle}
              mode="outlined"
              style={styles.input}
            />
            
            <TextInput
              label="Contenu"
              value={newObservationContent}
              onChangeText={setNewObservationContent}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={[styles.input, styles.textArea]}
            />
            
            <Button 
              mode="contained" 
              onPress={handleAddObservation}
              style={styles.addButton}
            >
              {editIndex >= 0 ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Card.Content>
        </Card>
      )}
      
      {observations.map((observation, index) => (
        <Card key={index} style={styles.itemCard}>
          <Card.Content>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{observation.titre}</Text>
              
              {!disabled && (
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={16}
                    onPress={() => handleEditObservation(index)}
                  />
                  <IconButton
                    icon="delete"
                    size={16}
                    color="#F44336"
                    onPress={() => onRemoveObservation(index)}
                  />
                </View>
              )}
            </View>
            
            <Text style={styles.itemContent}>{observation.contenu}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

/**
 * Section des mesures du bilan
 */
const MesuresSection = ({ mesures, onAddMesure, onUpdateMesure, onRemoveMesure, disabled }) => {
  const [showAddMesure, setShowAddMesure] = useState(false);
  const [newMesureName, setNewMesureName] = useState('');
  const [newMesureValue, setNewMesureValue] = useState('');
  const [newMesureUnit, setNewMesureUnit] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  
  // Ajout d'une mesure
  const handleAddMesure = () => {
    if (!newMesureName.trim() || !newMesureValue.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir au moins le nom et la valeur de la mesure.');
      return;
    }
    
    if (editIndex >= 0) {
      onUpdateMesure(editIndex, {
        nom: newMesureName,
        valeur: newMesureValue,
        unite: newMesureUnit
      });
    } else {
      onAddMesure({
        nom: newMesureName,
        valeur: newMesureValue,
        unite: newMesureUnit
      });
    }
    
    setNewMesureName('');
    setNewMesureValue('');
    setNewMesureUnit('');
    setShowAddMesure(false);
    setEditIndex(-1);
  };
  
  // Modification d'une mesure
  const handleEditMesure = (index) => {
    const mesure = mesures[index];
    setNewMesureName(mesure.nom);
    setNewMesureValue(mesure.valeur.toString());
    setNewMesureUnit(mesure.unite || '');
    setEditIndex(index);
    setShowAddMesure(true);
  };
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mesures</Text>
        {!disabled && (
          <Button 
            mode="text" 
            onPress={() => {
              setShowAddMesure(!showAddMesure);
              setEditIndex(-1);
              setNewMesureName('');
              setNewMesureValue('');
              setNewMesureUnit('');
            }}
            icon={showAddMesure ? "minus" : "plus"}
          >
            {showAddMesure ? "Annuler" : "Ajouter"}
          </Button>
        )}
      </View>
      
      {mesures.length === 0 && !showAddMesure && (
        <Text style={styles.emptyText}>Aucune mesure ajoutée</Text>
      )}
      
      {showAddMesure && (
        <Card style={styles.addItemCard}>
          <Card.Content>
            <TextInput
              label="Nom"
              value={newMesureName}
              onChangeText={setNewMesureName}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.inputRow}>
              <TextInput
                label="Valeur"
                value={newMesureValue}
                onChangeText={setNewMesureValue}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 2, marginRight: 8 }]}
              />
              
              <TextInput
                label="Unité"
                value={newMesureUnit}
                onChangeText={setNewMesureUnit}
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
              />
            </View>
            
            <Button 
              mode="contained" 
              onPress={handleAddMesure}
              style={styles.addButton}
            >
              {editIndex >= 0 ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Card.Content>
        </Card>
      )}
      
      <View style={styles.mesuresContainer}>
        {mesures.map((mesure, index) => (
          <Card key={index} style={[styles.itemCard, styles.mesureCard]}>
            <Card.Content>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{mesure.nom}</Text>
                
                {!disabled && (
                  <View style={styles.itemActions}>
                    <IconButton
                      icon="pencil"
                      size={16}
                      onPress={() => handleEditMesure(index)}
                    />
                    <IconButton
                      icon="delete"
                      size={16}
                      color="#F44336"
                      onPress={() => onRemoveMesure(index)}
                    />
                  </View>
                )}
              </View>
              
              <Text style={styles.mesureValue}>{`${mesure.valeur} ${mesure.unite || ''}`}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </View>
  );
};

/**
 * Section des objectifs du bilan
 */
const ObjectifsSection = ({ objectifs, onAddObjectif, onUpdateObjectif, onRemoveObjectif, onToggleObjectif, disabled }) => {
  const [showAddObjectif, setShowAddObjectif] = useState(false);
  const [newObjectifDescription, setNewObjectifDescription] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  
  // Ajout d'un objectif
  const handleAddObjectif = () => {
    if (!newObjectifDescription.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir la description de l\'objectif.');
      return;
    }
    
    if (editIndex >= 0) {
      onUpdateObjectif(editIndex, {
        description: newObjectifDescription,
        atteint: objectifs[editIndex].atteint
      });
    } else {
      onAddObjectif({
        description: newObjectifDescription,
        atteint: false
      });
    }
    
    setNewObjectifDescription('');
    setShowAddObjectif(false);
    setEditIndex(-1);
  };
  
  // Modification d'un objectif
  const handleEditObjectif = (index) => {
    const objectif = objectifs[index];
    setNewObjectifDescription(objectif.description);
    setEditIndex(index);
    setShowAddObjectif(true);
  };
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Objectifs</Text>
        {!disabled && (
          <Button 
            mode="text" 
            onPress={() => {
              setShowAddObjectif(!showAddObjectif);
              setEditIndex(-1);
              setNewObjectifDescription('');
            }}
            icon={showAddObjectif ? "minus" : "plus"}
          >
            {showAddObjectif ? "Annuler" : "Ajouter"}
          </Button>
        )}
      </View>
      
      {objectifs.length === 0 && !showAddObjectif && (
        <Text style={styles.emptyText}>Aucun objectif ajouté</Text>
      )}
      
      {showAddObjectif && (
        <Card style={styles.addItemCard}>
          <Card.Content>
            <TextInput
              label="Description"
              value={newObjectifDescription}
              onChangeText={setNewObjectifDescription}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={[styles.input, styles.textArea]}
            />
            
            <Button 
              mode="contained" 
              onPress={handleAddObjectif}
              style={styles.addButton}
            >
              {editIndex >= 0 ? "Mettre à jour" : "Ajouter"}
            </Button>
          </Card.Content>
        </Card>
      )}
      
      {objectifs.map((objectif, index) => (
        <Card key={index} style={styles.itemCard}>
          <Card.Content>
            <View style={styles.objectifItem}>
              <TouchableOpacity 
                style={styles.objectifCheckbox}
                onPress={() => !disabled && onToggleObjectif(index)}
                disabled={disabled}
              >
                <Icon 
                  name={objectif.atteint ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={24} 
                  color={objectif.atteint ? "#4CAF50" : "#757575"}
                />
              </TouchableOpacity>
              
              <Text 
                style={[
                  styles.objectifText, 
                  objectif.atteint && styles.objectifTextCompleted
                ]}
              >
                {objectif.description}
              </Text>
              
              {!disabled && (
                <View style={styles.itemActions}>
                  <IconButton
                    icon="pencil"
                    size={16}
                    onPress={() => handleEditObjectif(index)}
                  />
                  <IconButton
                    icon="delete"
                    size={16}
                    color="#F44336"
                    onPress={() => onRemoveObjectif(index)}
                  />
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

/**
 * Écran de formulaire pour créer ou modifier un bilan kinésithérapique
 */
const BilanFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id, patientId } = route.params || {};
  const isEditing = !!id;
  
  // Utilisation des hooks personnalisés
  const { loading, executeRequest } = useApiRequest();
  const { formatDate } = useDateFormatter();
  
  // États
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bilanTypes, setBilanTypes] = useState([
    { value: 'initial', label: 'Initial' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'final', label: 'Final' }
  ]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing || !!patientId);
  
  // Sections du bilan
  const [observations, setObservations] = useState([]);
  const [mesures, setMesures] = useState([]);
  const [objectifs, setObjectifs] = useState([]);
  
  // Règles de validation
  const validationRules = (data) => {
    const errors = {};
    
    if (!data.patient_id) {
      errors.patient_id = 'Le patient est obligatoire';
    }
    
    if (!data.type) {
      errors.type = 'Le type de bilan est obligatoire';
    }
    
    return errors;
  };
  
  // Initialisation du formulaire
  const initialFormData = {
    patient_id: patientId || '',
    type: 'initial',
    motif: '',
  };
  
  const { 
    formData, 
    errors, 
    handleChange, 
    validateForm, 
    setFormValues 
  } = useFormValidation(initialFormData, validationRules);
  
  // Chargement des données initiales
  useEffect(() => {
    if (isEditing) {
      loadBilanData();
    } else if (patientId) {
      loadPatientData(patientId);
    }
  }, [id, patientId]);
  
  // Chargement des données du bilan
  const loadBilanData = async () => {
    setInitialLoading(true);
    
    await executeRequest(
      () => bilansAPI.getById(id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du bilan. Veuillez réessayer.',
        onSuccess: (response) => {
          const bilan = response.data;
          
          setFormValues({
            patient_id: bilan.patient_id.toString(),
            type: bilan.type || 'initial',
            motif: bilan.motif || '',
          });
          
          setObservations(bilan.observations || []);
          setMesures(bilan.mesures || []);
          setObjectifs(bilan.objectifs || []);
          
          // Charger les détails du patient
          if (bilan.patient_id) {
            loadPatientData(bilan.patient_id);
          }
        },
        onError: () => {
          navigation.goBack();
        }
      }
    );
    
    setInitialLoading(false);
  };
  
  // Chargement des données du patient
  const loadPatientData = async (id) => {
    await executeRequest(
      () => patientsAPI.getById(id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du patient. Veuillez réessayer.',
        onSuccess: (response) => {
          setSelectedPatient(response.data);
          handleChange('patient_id', response.data.patient_id.toString());
        }
      }
    );
  };
  
  // Gestion de la sélection d'un patient
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    handleChange('patient_id', patient ? patient.patient_id.toString() : '');
  };
  
  // Gestion des observations
  const handleAddObservation = (observation) => {
    setObservations([...observations, observation]);
  };
  
  const handleUpdateObservation = (index, observation) => {
    const newObservations = [...observations];
    newObservations[index] = observation;
    setObservations(newObservations);
  };
  
  const handleRemoveObservation = (index) => {
    const newObservations = [...observations];
    newObservations.splice(index, 1);
    setObservations(newObservations);
  };
  
  // Gestion des mesures
  const handleAddMesure = (mesure) => {
    setMesures([...mesures, mesure]);
  };
  
  const handleUpdateMesure = (index, mesure) => {
    const newMesures = [...mesures];
    newMesures[index] = mesure;
    setMesures(newMesures);
  };
  
  const handleRemoveMesure = (index) => {
    const newMesures = [...mesures];
    newMesures.splice(index, 1);
    setMesures(newMesures);
  };
  
  // Gestion des objectifs
  const handleAddObjectif = (objectif) => {
    setObjectifs([...objectifs, objectif]);
  };
  
  const handleUpdateObjectif = (index, objectif) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = objectif;
    setObjectifs(newObjectifs);
  };
  
  const handleRemoveObjectif = (index) => {
    const newObjectifs = [...objectifs];
    newObjectifs.splice(index, 1);
    setObjectifs(newObjectifs);
  };
  
  const handleToggleObjectif = (index) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = {
      ...newObjectifs[index],
      atteint: !newObjectifs[index].atteint
    };
    setObjectifs(newObjectifs);
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Afficher les erreurs de validation
      if (errors.patient_id) {
        Alert.alert('Erreur', 'Veuillez sélectionner un patient.');
        return;
      }
      
      if (errors.type) {
        Alert.alert('Erreur', 'Veuillez sélectionner un type de bilan.');
        return;
      }
      
      return;
    }
    
    // Préparation des données pour l'API
    const bilanData = {
      ...formData,
      observations,
      mesures,
      objectifs
    };
    
    if (isEditing) {
      // Mise à jour du bilan existant
      await executeRequest(
        () => bilansAPI.update(id, bilanData),
        {
          errorTitle: 'Erreur',
          errorMessage: 'Une erreur est survenue lors de la mise à jour du bilan.',
          onSuccess: () => {
            Alert.alert(
              'Succès',
              'Le bilan a été mis à jour avec succès.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }
        }
      );
    } else {
      // Création d'un nouveau bilan
      await executeRequest(
        () => bilansAPI.create(bilanData),
        {
          errorTitle: 'Erreur',
          errorMessage: 'Une erreur est survenue lors de la création du bilan.',
          onSuccess: (response) => {
            Alert.alert(
              'Succès',
              'Le bilan a été créé avec succès.',
              [{ text: 'OK', onPress: () => navigation.navigate('BilanDetails', { id: response.data.bilan_id }) }]
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
  
  // Affichage d'un chargement initial
  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des données...</Text>
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
              {isEditing ? 'Modifier le bilan' : 'Nouveau bilan'}
            </Title>
            
            {/* Sélection du patient */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Patient *</Text>
              <PatientSelector
                selectedPatient={selectedPatient}
                onSelectPatient={handleSelectPatient}
                disabled={loading || isEditing}
              />
              {errors.patient_id && (
                <Text style={styles.errorText}>{errors.patient_id}</Text>
              )}
            </View>
            
            {/* Type de bilan */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Type de bilan *</Text>
              <View>
                <Button
                  mode="outlined"
                  onPress={() => setShowTypeMenu(!showTypeMenu)}
                  disabled={loading}
                  style={styles.dropdownButton}
                >
                  {bilanTypes.find(t => t.value === formData.type)?.label || 'Sélectionner'}
                </Button>
                
                {showTypeMenu && (
                  <Card style={styles.typeMenu}>
                    {bilanTypes.map((type) => (
                      <React.Fragment key={type.value}>
                        <TouchableOpacity
                          onPress={() => {
                            handleChange('type', type.value);
                            setShowTypeMenu(false);
                          }}
                          style={[
                            styles.typeMenuItem,
                            formData.type === type.value && styles.typeMenuItemSelected
                          ]}
                        >
                          <Text style={
                            formData.type === type.value 
                              ? styles.typeMenuItemTextSelected 
                              : styles.typeMenuItemText
                          }>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </Card>
                )}
              </View>
              {errors.type && (
                <Text style={styles.errorText}>{errors.type}</Text>
              )}
            </View>
            
            {/* Motif */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Motif</Text>
              <TextInput
                value={formData.motif}
                onChangeText={(value) => handleChange('motif', value)}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.textArea}
                disabled={loading}
              />
            </View>
            
            {/* Observations */}
            <ObservationsSection
              observations={observations}
              onAddObservation={handleAddObservation}
              onUpdateObservation={handleUpdateObservation}
              onRemoveObservation={handleRemoveObservation}
              disabled={loading}
            />
            
            {/* Mesures */}
            <MesuresSection
              mesures={mesures}
              onAddMesure={handleAddMesure}
              onUpdateMesure={handleUpdateMesure}
              onRemoveMesure={handleRemoveMesure}
              disabled={loading}
            />
            
            {/* Objectifs */}
            <ObjectifsSection
              objectifs={objectifs}
              onAddObjectif={handleAddObjectif}
              onUpdateObjectif={handleUpdateObjectif}
              onRemoveObjectif={handleRemoveObjectif}
              onToggleObjectif={handleToggleObjectif}
              disabled={loading}
            />
            
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
    paddingBottom: 32,
  },
  card: {
    elevation: 4,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
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
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patientSelector: {
    marginBottom: 8,
  },
  selectedPatientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  selectedPatientText: {
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#fff',
  },
  resultsCard: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 4,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownButton: {
    width: '100%',
    backgroundColor: '#fff',
  },
  typeMenu: {
    marginTop: 4,
    elevation: 4,
  },
  typeMenuItem: {
    padding: 12,
  },
  typeMenuItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  typeMenuItemText: {
    fontSize: 14,
  },
  typeMenuItemTextSelected: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  textArea: {
    backgroundColor: '#fff',
    minHeight: 80,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  addItemCard: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addButton: {
    alignSelf: 'flex-end',
  },
  itemCard: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemContent: {
    fontSize: 14,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
  },
  mesuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  mesureCard: {
    width: '48%',
    marginHorizontal: '1%',
  },
  mesureValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  objectifItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectifCheckbox: {
    marginRight: 8,
  },
  objectifText: {
    flex: 1,
    fontSize: 14,
  },
  objectifTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default BilanFormScreen;