import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Linking, Alert } from 'react-native';
import { Card, Title, Text, Button, Divider, ActivityIndicator, List, Chip, FAB, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { patientsAPI, appointmentsAPI, bilansAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Section d'en-tête du patient
 */
const PatientHeader = ({ patient }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Title style={styles.patientName}>{patient.nom}</Title>
      </View>
      <View style={styles.headerRight}>
        <Chip mode="outlined" style={styles.patientIdChip}>
          ID: {patient.patient_id}
        </Chip>
      </View>
    </View>
  );
};

/**
 * Section d'informations de contact
 */
const ContactSection = ({ patient, handleCall, handleEmail }) => {
  if (!patient.telephone && !patient.email) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact</Text>
        
        <View style={styles.contactButtons}>
          {patient.telephone && (
            <Button 
              mode="outlined" 
              icon="phone" 
              onPress={handleCall}
              style={styles.contactButton}
            >
              Appeler
            </Button>
          )}
          
          {patient.email && (
            <Button 
              mode="outlined" 
              icon="email" 
              onPress={handleEmail}
              style={styles.contactButton}
            >
              Email
            </Button>
          )}
        </View>
        
        <View style={styles.contactDetails}>
          {patient.telephone && (
            <View style={styles.contactItem}>
              <Icon name="phone" size={20} color="#5b9bd5" style={styles.contactIcon} />
              <Text style={styles.contactText}>{patient.telephone}</Text>
            </View>
          )}
          
          {patient.email && (
            <View style={styles.contactItem}>
              <Icon name="email" size={20} color="#5b9bd5" style={styles.contactIcon} />
              <Text style={styles.contactText}>{patient.email}</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

/**
 * Section des rendez-vous
 */
const AppointmentsSection = ({ 
  appointments, 
  loading, 
  onPressAppointment,
  formatDateTime,
  navigateToNewAppointment
}) => {
  const theme = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmé': return '#4CAF50';
      case 'annulé': return '#F44336';
      case 'en attente': return '#FF9800';
      default: return theme.colors.disabled;
    }
  };
  
  return (
    <>
      <Divider style={styles.divider} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rendez-vous</Text>
          <Button 
            mode="text"
            icon="plus"
            onPress={navigateToNewAppointment}
          >
            Ajouter
          </Button>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun rendez-vous pour ce patient</Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <Card 
              key={appointment.rdv_id} 
              style={styles.itemCard}
              onPress={() => onPressAppointment(appointment.rdv_id)}
            >
              <Card.Content>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentDate}>
                    {formatDateTime(appointment.date)}
                  </Text>
                  <Chip 
                    mode="outlined"
                    style={[
                      styles.statusChip, 
                      { borderColor: getStatusColor(appointment.statut) }
                    ]}
                    textStyle={{ color: getStatusColor(appointment.statut) }}
                  >
                    {appointment.statut}
                  </Chip>
                </View>
                
                <Text style={styles.appointmentType}>
                  Type: {appointment.type || 'Standard'}
                </Text>
                
                {appointment.notes && (
                  <Text 
                    style={styles.appointmentNotes}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {appointment.notes}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </>
  );
};

/**
 * Section des bilans
 */
const BilansSection = ({ 
  bilans, 
  loading, 
  onPressBilan,
  formatDate,
  navigateToNewBilan
}) => {
  const theme = useTheme();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'validé': return '#4CAF50';
      case 'en cours': return '#FF9800';
      case 'rejeté': return '#F44336';
      case 'à revoir': return '#9C27B0';
      default: return theme.colors.disabled;
    }
  };
  
  return (
    <>
      <Divider style={styles.divider} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bilans</Text>
          <Button 
            mode="text"
            icon="plus"
            onPress={navigateToNewBilan}
          >
            Ajouter
          </Button>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : bilans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun bilan pour ce patient</Text>
          </View>
        ) : (
          bilans.map((bilan) => (
            <Card 
              key={bilan.bilan_id} 
              style={styles.itemCard}
              onPress={() => onPressBilan(bilan.bilan_id)}
            >
              <Card.Content>
                <View style={styles.bilanHeader}>
                  <View>
                    <Text style={styles.bilanType}>
                      Bilan {bilan.type || 'standard'}
                    </Text>
                    <Text style={styles.bilanDate}>
                      {formatDate(bilan.date_creation)}
                    </Text>
                  </View>
                  <Chip 
                    mode="outlined"
                    style={[
                      styles.statusChip, 
                      { borderColor: getStatusColor(bilan.statut) }
                    ]}
                    textStyle={{ color: getStatusColor(bilan.statut) }}
                  >
                    {bilan.statut}
                  </Chip>
                </View>
                
                {bilan.motif && (
                  <Text 
                    style={styles.bilanMotif}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {bilan.motif}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </>
  );
};

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
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingBilans, setLoadingBilans] = useState(false);
  
  // Chargement initial des données
  useEffect(() => {
    loadPatientData();
  }, [id]);
  
  // Fonction pour charger les données du patient
  const loadPatientData = async (refresh = false) => {
    await executeRequest(
      () => patientsAPI.getById(id),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du patient. Veuillez réessayer.',
        onSuccess: (response) => {
          setPatient(response.data);
          
          // Charger les rendez-vous et bilans
          loadAppointments();
          loadBilans();
        }
      }
    );
  };
  
  // Fonction pour charger les rendez-vous du patient
  const loadAppointments = async () => {
    setLoadingAppointments(true);
    
    try {
      const response = await appointmentsAPI.getByPatient(id, { limit: 5 });
      setAppointments(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  // Fonction pour charger les bilans du patient
  const loadBilans = async () => {
    setLoadingBilans(true);
    
    try {
      const response = await bilansAPI.getByPatient(id, { limit: 5 });
      setBilans(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des bilans:', error);
    } finally {
      setLoadingBilans(false);
    }
  };
  
  // Fonction de rafraîchissement
  const onRefresh = () => {
    loadPatientData(true);
  };
  
  // Fonction pour appeler le patient
  const handleCall = () => {
    if (patient && patient.telephone) {
      Linking.openURL(`tel:${patient.telephone}`);
    }
  };
  
  // Fonction pour envoyer un email au patient
  const handleEmail = () => {
    if (patient && patient.email) {
      Linking.openURL(`mailto:${patient.email}`);
    }
  };
  
  // Navigation vers la modification du patient
  const navigateToEditPatient = () => {
    navigation.navigate('PatientForm', { id: id });
  };
  
  // Navigation vers un nouveau rendez-vous pour ce patient
  const navigateToNewAppointment = () => {
    navigation.navigate('AppointmentForm', { patientId: id });
  };
  
  // Navigation vers un nouveau bilan pour ce patient
  const navigateToNewBilan = () => {
    navigation.navigate('BilanForm', { patientId: id });
  };
  
  // Navigation vers les détails d'un rendez-vous
  const navigateToAppointmentDetail = (appointmentId) => {
    navigation.navigate('AppointmentDetails', { id: appointmentId });
  };
  
  // Navigation vers les détails d'un bilan
  const navigateToBilanDetail = (bilanId) => {
    navigation.navigate('BilanDetails', { id: bilanId });
  };
  
  // Fonction pour anonymiser le patient
  const handleAnonymize = () => {
    showConfirmation({
      title: 'Anonymiser le patient',
      message: 'Êtes-vous sûr de vouloir anonymiser ce patient ? Cette action ne peut pas être annulée. Les données personnelles du patient seront remplacées par des valeurs anonymes.',
      confirmLabel: 'Anonymiser',
      cancelLabel: 'Annuler',
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
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            }
          }
        );
      }
    });
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
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Carte principale */}
        <Card style={styles.card}>
          <Card.Content>
            {/* En-tête */}
            <PatientHeader patient={patient} />
            
            {/* Informations de contact */}
            <ContactSection 
              patient={patient}
              handleCall={handleCall}
              handleEmail={handleEmail}
            />
            
            {/* Rendez-vous */}
            <AppointmentsSection 
              appointments={appointments}
              loading={loadingAppointments}
              onPressAppointment={navigateToAppointmentDetail}
              formatDateTime={formatDateTime}
              navigateToNewAppointment={navigateToNewAppointment}
            />
            
            {/* Bilans */}
            <BilansSection 
              bilans={bilans}
              loading={loadingBilans}
              onPressBilan={navigateToBilanDetail}
              formatDate={formatDate}
              navigateToNewBilan={navigateToNewBilan}
            />
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Bouton d'édition */}
      <FAB
        style={styles.fab}
        icon="pencil"
        onPress={navigateToEditPatient}
        color="#fff"
      />
      
      {/* Bouton d'anonymisation */}
      <Button
        mode="text"
        icon="incognito"
        onPress={handleAnonymize}
        style={styles.anonymizeButton}
        color="#F44336"
      >
        Anonymiser
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
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
    margin: 16,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  patientName: {
    fontSize: 24,
  },
  headerRight: {
    marginLeft: 16,
  },
  patientIdChip: {
    height: 24,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactSection: {
    marginBottom: 8,
  },
  contactButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  contactButton: {
    marginRight: 8,
  },
  contactDetails: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  itemCard: {
    marginBottom: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  appointmentType: {
    fontSize: 14,
    marginBottom: 4,
  },
  appointmentNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bilanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bilanType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bilanDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bilanMotif: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#5b9bd5',
  },
  anonymizeButton: {
    position: 'absolute',
    left: 16,
    bottom: 16,
  },
});

export default PatientDetailScreen;