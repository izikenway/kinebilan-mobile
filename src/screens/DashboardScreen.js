import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Text, Paragraph, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { statsAPI, appointmentsAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Carte de statistique pour le dashboard
 */
const StatCard = ({ title, value, icon, color, onPress }) => {
  return (
    <Card style={styles.statCard} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <View style={styles.statCardIcon}>
          <Icon name={icon} size={32} color={color} />
        </View>
        <View style={styles.statCardInfo}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Title style={[styles.statCardValue, { color }]}>{value}</Title>
        </View>
      </Card.Content>
    </Card>
  );
};

/**
 * Carte de rendez-vous pour le dashboard
 */
const AppointmentCard = ({ appointment, onPress, formatDateTime }) => {
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
    <Card style={styles.appointmentCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.appointmentHeader}>
          <Title style={styles.appointmentPatient}>{appointment.patient_nom}</Title>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.statut) }]} />
        </View>
        <Paragraph style={styles.appointmentDate}>
          {formatDateTime(appointment.date)}
        </Paragraph>
        <Text style={styles.appointmentType}>
          {appointment.type || 'Standard'}
        </Text>
      </Card.Content>
    </Card>
  );
};

/**
 * Écran d'accueil affichant un tableau de bord
 */
const DashboardScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { formatDateTime } = useDateFormatter();
  const { loading, refreshing, executeRequest } = useApiRequest();
  
  // États des données
  const [stats, setStats] = useState({
    todayAppointments: 0,
    patientsNeedingBilan: 0,
    monthlyBilans: 0,
    activeAlerts: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  
  // Chargement initial des données
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  // Fonction pour charger les données du tableau de bord
  const loadDashboardData = async (refresh = false) => {
    // Chargement des statistiques
    await executeRequest(
      () => statsAPI.getDashboard(),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les statistiques. Veuillez réessayer.',
        onSuccess: (response) => {
          setStats(response.data);
        }
      }
    );
    
    // Chargement des rendez-vous à venir
    await executeRequest(
      () => appointmentsAPI.getUpcoming({ limit: 5 }),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les rendez-vous. Veuillez réessayer.',
        onSuccess: (response) => {
          setUpcomingAppointments(response.data.results || []);
        }
      }
    );
  };
  
  // Fonction de rafraîchissement
  const onRefresh = () => {
    loadDashboardData(true);
  };
  
  // Navigation vers la liste des patients
  const navigateToPatients = () => {
    navigation.navigate('PatientsTab');
  };
  
  // Navigation vers la liste des rendez-vous
  const navigateToAppointments = () => {
    navigation.navigate('AppointmentsTab');
  };
  
  // Navigation vers les détails d'un rendez-vous
  const navigateToAppointmentDetail = (appointmentId) => {
    navigation.navigate('AppointmentsTab', { 
      screen: 'AppointmentDetails', 
      params: { id: appointmentId }
    });
  };
  
  // Navigation vers la liste des bilans
  const navigateToBilans = () => {
    navigation.navigate('BilansTab');
  };
  
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
      {/* En-tête */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Tableau de bord</Title>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
      
      {/* Cartes de statistiques */}
      {loading && !refreshing && !stats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatCard 
            title="Rendez-vous aujourd'hui" 
            value={stats.todayAppointments} 
            icon="calendar-today" 
            color="#5b9bd5"
            onPress={navigateToAppointments}
          />
          <StatCard 
            title="Patients sans bilan" 
            value={stats.patientsNeedingBilan} 
            icon="account-alert" 
            color="#F44336"
            onPress={navigateToPatients}
          />
          <StatCard 
            title="Bilans ce mois" 
            value={stats.monthlyBilans} 
            icon="clipboard-text" 
            color="#4CAF50"
            onPress={navigateToBilans}
          />
          <StatCard 
            title="Alertes actives" 
            value={stats.activeAlerts} 
            icon="bell" 
            color="#FF9800"
            onPress={() => {}}
          />
        </View>
      )}
      
      {/* Section des rendez-vous à venir */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Rendez-vous à venir</Title>
          <Button 
            mode="text" 
            onPress={navigateToAppointments}
            icon="chevron-right"
            contentStyle={styles.viewAllButton}
          >
            Voir tous
          </Button>
        </View>
        
        {loading && !refreshing && upcomingAppointments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : upcomingAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank" size={48} color={theme.colors.disabled} />
            <Text style={styles.emptyText}>Aucun rendez-vous à venir</Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AppointmentsTab', { 
                screen: 'AppointmentForm' 
              })}
              style={styles.emptyButton}
            >
              Créer un rendez-vous
            </Button>
          </View>
        ) : (
          <View style={styles.appointmentsContainer}>
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.rdv_id}
                appointment={appointment}
                onPress={() => navigateToAppointmentDetail(appointment.rdv_id)}
                formatDateTime={formatDateTime}
              />
            ))}
          </View>
        )}
      </View>
      
      {/* Actions rapides */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Actions rapides</Title>
        <View style={styles.quickActionsContainer}>
          <Button 
            mode="contained" 
            icon="account-plus" 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('PatientsTab', { 
              screen: 'PatientForm' 
            })}
          >
            Nouveau patient
          </Button>
          <Button 
            mode="contained" 
            icon="calendar-plus" 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AppointmentsTab', { 
              screen: 'AppointmentForm' 
            })}
          >
            Nouveau rendez-vous
          </Button>
          <Button 
            mode="contained" 
            icon="clipboard-plus" 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('BilansTab', { 
              screen: 'BilanForm' 
            })}
          >
            Nouveau bilan
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardIcon: {
    marginRight: 16,
  },
  statCardInfo: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#666',
  },
  statCardValue: {
    fontSize: 24,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  viewAllButton: {
    flexDirection: 'row-reverse',
  },
  appointmentsContainer: {
    marginBottom: 8,
  },
  appointmentCard: {
    marginBottom: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentPatient: {
    fontSize: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appointmentDate: {
    fontSize: 14,
    marginTop: 4,
  },
  appointmentType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 4,
  },
  quickActionsContainer: {
    marginTop: 8,
  },
  quickActionButton: {
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default DashboardScreen;