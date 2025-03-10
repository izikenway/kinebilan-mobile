import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Text, Card, List, Switch, Divider, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { rgpdAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import { useAuth } from '../context/AuthContext';

/**
 * Écran de gestion RGPD
 */
const RGPDScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { loading, executeRequest, showConfirmation } = useApiRequest();
  
  // États
  const [consentItems, setConsentItems] = useState([
    {
      id: 'contact_email',
      title: 'Communication par email',
      description: 'Autorise l\'envoi d\'emails concernant vos rendez-vous, bilans et autres informations importantes.',
      accepted: false
    },
    {
      id: 'contact_sms',
      title: 'Communication par SMS',
      description: 'Autorise l\'envoi de SMS pour les rappels de rendez-vous et notifications.',
      accepted: false
    },
    {
      id: 'data_storage',
      title: 'Stockage des données',
      description: 'Autorise le stockage de vos données personnelles et médicales selon notre politique de confidentialité.',
      accepted: false
    },
    {
      id: 'data_processing',
      title: 'Traitement des données',
      description: 'Autorise le traitement de vos données dans le cadre de votre suivi thérapeutique.',
      accepted: false
    },
    {
      id: 'data_sharing',
      title: 'Partage des données',
      description: 'Autorise le partage de vos données avec d\'autres professionnels de santé impliqués dans votre traitement.',
      accepted: false
    }
  ]);
  
  // Chargement initial des consentements
  useEffect(() => {
    if (user && user.id) {
      loadConsents();
    }
  }, [user]);
  
  // Fonction pour charger les consentements du patient
  const loadConsents = async () => {
    await executeRequest(
      () => rgpdAPI.getConsents(user.id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger vos préférences RGPD. Veuillez réessayer.',
        onSuccess: (response) => {
          const consents = response.data || {};
          
          // Mise à jour des consentements
          setConsentItems(prevItems => 
            prevItems.map(item => ({
              ...item,
              accepted: consents[item.id] === true
            }))
          );
        }
      }
    );
  };
  
  // Fonction pour modifier un consentement
  const handleConsentChange = async (id, value) => {
    // Mise à jour locale immédiate pour l'interface
    setConsentItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, accepted: value } : item
      )
    );
    
    // Envoi de la mise à jour au serveur
    await executeRequest(
      () => rgpdAPI.setConsent(user.id, id, value),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de mettre à jour votre consentement. Veuillez réessayer.',
        onError: () => {
          // En cas d'erreur, rétablir l'état précédent
          setConsentItems(prevItems =>
            prevItems.map(item =>
              item.id === id ? { ...item, accepted: !value } : item
            )
          );
        }
      }
    );
  };
  
  // Fonction pour exporter les données
  const handleExportData = async () => {
    await executeRequest(
      () => rgpdAPI.exportData(user.id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible d\'exporter vos données. Veuillez réessayer.',
        onSuccess: () => {
          Alert.alert(
            'Demande d\'exportation envoyée',
            'Votre demande d\'exportation a été enregistrée. Vous recevrez un email contenant vos données personnelles prochainement.'
          );
        }
      }
    );
  };
  
  // Fonction pour demander la suppression des données
  const handleDeleteRequest = () => {
    showConfirmation({
      title: 'Demande de suppression',
      message: 'Êtes-vous sûr de vouloir demander la suppression de vos données personnelles ? Cette action ne peut pas être annulée. Veuillez noter que certaines données peuvent être conservées conformément à la législation applicable.',
      confirmLabel: 'Confirmer la demande',
      cancelLabel: 'Annuler',
      onConfirm: async () => {
        await executeRequest(
          () => rgpdAPI.deleteData(user.id),
          {
            errorTitle: 'Erreur',
            errorMessage: 'Impossible de traiter votre demande de suppression. Veuillez réessayer.',
            onSuccess: () => {
              Alert.alert(
                'Demande de suppression envoyée',
                'Votre demande de suppression a été enregistrée. Vous recevrez une confirmation par email. Veuillez noter que le traitement peut prendre jusqu\'à 30 jours.'
              );
            }
          }
        );
      }
    });
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Protection des données (RGPD)</Title>
        <Text style={styles.headerText}>
          Gérez vos consentements et vos droits concernant la protection de vos données personnelles.
        </Text>
      </View>
      
      {/* Consentements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Vos consentements</Title>
          <Text style={styles.cardDescription}>
            Vous pouvez modifier vos préférences à tout moment. Les modifications prennent effet immédiatement.
          </Text>
          
          {loading && consentItems.every(item => !item.accepted) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement de vos préférences...</Text>
            </View>
          ) : (
            <View style={styles.consentsList}>
              {consentItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={props => (
                      <List.Icon 
                        {...props} 
                        icon={item.accepted ? "check-circle" : "circle-outline"} 
                        color={item.accepted ? theme.colors.primary : "#757575"}
                      />
                    )}
                    right={props => (
                      <Switch
                        value={item.accepted}
                        onValueChange={value => handleConsentChange(item.id, value)}
                        color={theme.colors.primary}
                        disabled={loading}
                      />
                    )}
                  />
                  {index < consentItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Vos droits */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Vos droits</Title>
          <Text style={styles.cardDescription}>
            Conformément au RGPD, vous disposez de droits sur vos données personnelles.
          </Text>
          
          <View style={styles.rightsList}>
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="eye" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.rightTitle}>Droit d'accès</Text>
                <Text style={styles.rightDescription}>
                  Vous pouvez obtenir une copie de toutes les données personnelles que nous détenons à votre sujet.
                </Text>
              </View>
            </View>
            
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="pencil" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.rightTitle}>Droit de rectification</Text>
                <Text style={styles.rightDescription}>
                  Vous pouvez demander la correction de vos données personnelles si elles sont inexactes.
                </Text>
              </View>
            </View>
            
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="delete" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.rightTitle}>Droit à l'effacement</Text>
                <Text style={styles.rightDescription}>
                  Vous pouvez demander la suppression de vos données personnelles dans certains cas.
                </Text>
              </View>
            </View>
            
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="lock" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.rightContent}>
                <Text style={styles.rightTitle}>Droit à la limitation</Text>
                <Text style={styles.rightDescription}>
                  Vous pouvez demander que nous limitions le traitement de vos données.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <Button 
              mode="contained" 
              icon="download" 
              onPress={handleExportData}
              style={styles.actionButton}
              disabled={loading}
            >
              Exporter mes données
            </Button>
            
            <Button 
              mode="outlined" 
              icon="delete-outline" 
              onPress={handleDeleteRequest}
              style={[styles.actionButton, styles.deleteButton]}
              color="#F44336"
              disabled={loading}
            >
              Demander la suppression
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {/* Politique de confidentialité */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Politique de confidentialité</Title>
          <Text style={styles.cardDescription}>
            Pour plus d'informations sur la façon dont nous traitons vos données personnelles, veuillez consulter notre politique de confidentialité.
          </Text>
          
          <Button 
            mode="text" 
            icon="open-in-new" 
            onPress={() => {}}
            style={styles.policyButton}
          >
            Consulter la politique de confidentialité
          </Button>
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
  header: {
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  consentsList: {
    marginTop: 8,
  },
  rightsList: {
    marginTop: 8,
  },
  rightItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  rightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rightContent: {
    flex: 1,
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 4,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
  policyButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default RGPDScreen;