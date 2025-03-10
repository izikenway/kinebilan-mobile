import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, Linking } from 'react-native';
import { Card, Title, Text, Button, Divider, ActivityIndicator, List, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { patientsAPI, appointmentsAPI, bilansAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Écran de détail d'un patient
 */
const PatientDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id } = route.params;
  
  // Utilisation des hooks personnalisés
  const { loading, refreshing, executeRequest, showConfirmation } = useApiRequest();
  const { formatDate, formatDateTime } = useDateFormatter();
  
  // États
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bilans, setBilans] = useState([]);
  
  // Chargement initial des données du patient
  useEffect(() => {
    loadPatientData();
  }, [id]);
  
  // Fonction pour charger les données du patient et ses rendez-vous/bilans
  const loadPatientData = async (refresh = false) => {
    // Chargement des données du patient
    await executeRequest(
      () => patientsAPI.getById(id),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du patient. Veuillez réessayer.',
        onSuccess: (response) => {
          setPatient(response.data);
          
          // Une fois le patient chargé, récupérer ses rendez-vous et bilans
          loadPatientAppointments();
          loadPatientBilans();
        }
      }
    );
  };
  
  // Fonction pour charger les rendez-vous du patient
  const loadPatientAppointments = async () => {
    await executeRequest(
      () => appointmentsAPI.getByPatient(id, { limit: 5 }),
      {
        showErrors: false,
        onSuccess: (response) => {
          setAppointments(response.data.results || []);
        }
      }
    );
  };
  
  // Fonction pour charger les bilans du patient
  const loadPatientBilans = async () => {
    await executeRequest(
      () => bilansAPI.getByPatient(id, { limit: 5 }),
      {
        showErrors: false,
        onSuccess: (response) => {
          setBilans(response.data.results || []);
        }
      }
    );
  };
  
  // Rafraîchissement des données
  const onRefresh = () => {
    loadPatientData(true);
  };
  
  // Navigation vers l'écran de modification du patient
  const navigateToEditPatient = () => {
    navigation.navigate('PatientForm', { id: id });
  };
  
  // Navigation vers la création d'un nouveau bilan
  const navigateToNewBilan = () => {
    navigation.navigate('BilanForm', { patientId: id });
  };
  
  // Navigation vers la création d'un nouveau rendez-vous
  const navigateToNewRendezVous = () => {
    navigation.navigate('AppointmentForm', { patientId: id });
  };
  
  // Fonction pour anonymiser le patient
  const handleAnonymize = () => {
    showConfirmation({
      title: 'Anonymiser le patient',
      message: 'Êtes-vous sûr de vouloir anonymiser ce patient ? Cette action est irréversible et remplacera toutes les données personnelles du patient par des valeurs anonymes.',
      confirmLabel: 'Anonymiser',
      onConfirm: async () => {
        await executeRequest(
          () => patientsAPI.anonymize(id),
          {
            errorTitle: 'Erreur',
            errorMessage: 'Impossible d\'anonymiser le patient. Veuillez réessayer.',
            onSuccess: () => {
              Alert.alert(
                'Succès',
                'Le patient a été anonymisé avec succès.',
                [{ text: 'OK', onPress: () => loadPatientData() }]
              );
            }
          }
        );
      }
    });
  };
  
  // Fonction pour exporter les données du patient (RGPD)
  const handleExport = async () => {
    await executeRequest(
      () => patientsAPI.export(id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible d\'exporter les données du patient. Veuillez réessayer.',
        onSuccess: (response) => {
          Alert.alert(
            'Succès',
            'Les données du patient ont été exportées avec succès. Vous recevrez le document par email.'
          );
        }
      }
    );
  };
  
  // Fonction pour supprimer le patient
  const handleDelete = () => {
    showConfirmation({
      title: 'Supprimer le patient',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce patient ? Cette action est irréversible et supprimera également tous les rendez-vous et bilans associés.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        await executeRequest(
          () => patientsAPI.delete(id),
          {
            errorTitle: 'Erreur',
            errorMessage: 'Impossible de supprimer le patient. Veuillez réessayer.',
            onSuccess: () => {
              Alert.alert(
                'Succès',
                'Le patient a été supprimé avec succès.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          }
        );
      }
    });
  };
  
  // Appeler le patient
  const callPatient = () => {
    if (patient && patient.telephone) {
      Linking.openURL(`tel:${patient.telephone}`);
    } else {
      Alert.alert(
        'Information',
        'Aucun numéro de téléphone disponible pour ce patient.'
      );
    }
  };
  
  // Envoyer un email au patient
  const emailPatient = () => {
    if (patient && patient.email) {
      Linking.openURL(`mailto:${patient.email}`);
    } else {
      Alert.alert(
        'Information',
        'Aucune adresse email disponible pour ce patient.'
      );
    }
  };
  
  // Affichage d'un chargement
  if (loading && !refreshing && !patient) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des données du patient...</Text>
      </View>
    );
  }
  
  // Affichage d'une erreur
  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>Le patient n'a pas pu être chargé.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Retour
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Carte d'information du patient */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Title style={styles.patientName}>{patient.nom}</Title>
            <View style={styles.actionIcons}>
              <Button
                icon="phone"
                mode="text"
                onPress={callPatient}
                disabled={!patient.telephone}
                style={styles.actionIcon}
              />
              <Button
                icon="email"
                mode="text"
                onPress={emailPatient}
                disabled={!patient.email}
                style={styles.actionIcon}
              />
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoGrid}>
            {patient.email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{patient.email}</Text>
              </View>
            )}
            
            {patient.telephone && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Téléphone:</Text>
                <Text style={styles.infoValue}>{patient.telephone}</Text>
              </View>
            )}
            
            {patient.date_creation && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Créé le:</Text>
                <Text style={styles.infoValue}>{formatDate(patient.date_creation)}</Text>
              </View>
            )}
            
            {patient.dernier_bilan && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Dernier bilan:</Text>
                <Text style={styles.infoValue}>{formatDate(patient.dernier_bilan)}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
      
      {/* Prochains rendez-vous */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Rendez-vous</Title>
            <Button 
              mode="contained" 
              icon="plus"
              onPress={navigateToNewRendezVous}
              style={styles.addSectionButton}
            >
              Ajouter
            </Button>
          </View>
          
          {appointments.length === 0 ? (
            <Text style={styles.emptyText}>Aucun rendez-vous à venir</Text>
          ) : (
            <>
              {appointments.map((appointment) => (
                <List.Item
                  key={appointment.rdv_id}
                  title={formatDateTime(appointment.date)}
                  description={appointment.type || 'Standard'}
                  left={props => <List.Icon {...props} icon="calendar" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => navigation.navigate('AppointmentDetails', { id: appointment.rdv_id })}
                  style={styles.listItem}
                />
              ))}
              
              {appointments.length > 0 && (
                <Button 
                  mode="text" 
                  onPress={() => {}} // Navigation vers tous les rendez-vous du patient
                  style={styles.viewAllButton}
                >
                  Voir tous les rendez-vous
                </Button>
              )}
            </>
          )}
        </Card.Content>
      </Card>
      
      {/* Bilans du patient */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Bilans</Title>
            <Button 
              mode="contained" 
              icon="plus"
              onPress={navigateToNewBilan}
              style={styles.addSectionButton}
            >
              Ajouter
            </Button>
          </View>
          
          {bilans.length === 0 ? (
            <Text style={styles.emptyText}>Aucun bilan disponible</Text>
          ) : (
            <>
              {bilans.map((bilan) => (
                <List.Item
                  key={bilan.bilan_id}
                  title={`Bilan ${bilan.type || 'standard'}`}
                  description={`${formatDate(bilan.date_creation)} - ${bilan.statut}`}
                  left={props => <List.Icon {...props} icon="clipboard-text" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => navigation.navigate('BilanDetails', { id: bilan.bilan_id })}
                  style={styles.listItem}
                />
              ))}
              
              {bilans.length > 0 && (
                <Button 
                  mode="text" 
                  onPress={() => {}} // Navigation vers tous les bilans du patient
                  style={styles.viewAllButton}
                >
                  Voir tous les bilans
                </Button>
              )}
            </>
          )}
        </Card.Content>
      </Card>
      
      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Actions</Title>
          
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="pencil"
              onPress={navigateToEditPatient}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            >
              Modifier
            </Button>
            
            <Button
              mode="contained"
              icon="file-export"
              onPress={handleExport}
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            >
              Exporter (RGPD)
            </Button>
            
            <Button
              mode="contained"
              icon="incognito"
              onPress={handleAnonymize}
              style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
            >
              Anonymiser
            </Button>
            
            <Button
              mode="contained"
              icon="delete"
              onPress={handleDelete}
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            >
              Supprimer
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 20,
  },
  actionIcons: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginHorizontal: -4,
  },
  divider: {
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  addSectionButton: {
    height: 36,
  },
  listItem: {
    padding: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  viewAllButton: {
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: '48%',
    marginBottom: 8,
  },
});

export default PatientDetailScreen;