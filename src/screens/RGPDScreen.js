import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Switch, Text, Button, Divider, ActivityIndicator, List, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { rgpdAPI } from '../api/api';
import useApiRequest from '../hooks/useApiRequest';

/**
 * Écran de gestion des consentements RGPD
 */
const RGPDScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { loading, executeRequest } = useApiRequest();
  
  // États
  const [deletionPolicy, setDeletionPolicy] = useState(null);
  const [consentements, setConsentements] = useState({
    donnees_personnelles: true,
    communications: false,
    analyses_statistiques: false,
  });
  
  // Chargement initial des données RGPD
  useEffect(() => {
    loadDeletionPolicy();
  }, []);
  
  // Fonction pour charger la politique de suppression
  const loadDeletionPolicy = async () => {
    await executeRequest(
      () => rgpdAPI.getDeletion(),
      {
        showErrors: true,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger la politique de suppression des données. Veuillez réessayer.',
        onSuccess: (response) => {
          setDeletionPolicy(response.data);
        }
      }
    );
  };
  
  // Fonction pour mettre à jour un consentement
  const updateConsent = async (type, value) => {
    // Mise à jour de l'état local immédiatement pour une meilleure réactivité
    setConsentements(prev => ({
      ...prev,
      [type]: value
    }));
    
    // Si l'utilisateur a un patient actif (pas dans le contexte global ici)
    // On peut implémenter la mise à jour du consentement via l'API
    
    // Note: Dans un cas réel, cette fonction devrait être appelée avec l'ID d'un patient spécifique
  };
  
  // Rendu d'un indicateur de chargement si nécessaire
  if (loading && !deletionPolicy) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des informations RGPD...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Introduction */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Protection des données personnelles (RGPD)</Title>
          <Paragraph style={styles.paragraph}>
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            nous vous informons de la manière dont nous traitons vos données personnelles
            et des droits dont vous disposez.
          </Paragraph>
        </Card.Content>
      </Card>
      
      {/* Consentements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Vos consentements</Title>
          
          <List.Item
            title="Données personnelles"
            description="Nous autorisez-vous à traiter vos données personnelles pour assurer le fonctionnement de l'application ?"
            left={props => <List.Icon {...props} icon="account-check" />}
            right={() => (
              <Switch
                value={consentements.donnees_personnelles}
                onValueChange={(value) => updateConsent('donnees_personnelles', value)}
                disabled={loading}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Communications"
            description="Nous autorisez-vous à vous envoyer des rappels de rendez-vous et autres communications importantes ?"
            left={props => <List.Icon {...props} icon="email" />}
            right={() => (
              <Switch
                value={consentements.communications}
                onValueChange={(value) => updateConsent('communications', value)}
                disabled={loading}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Analyses statistiques"
            description="Nous autorisez-vous à utiliser vos données de manière anonymisée à des fins d'analyse statistique ?"
            left={props => <List.Icon {...props} icon="chart-bar" />}
            right={() => (
              <Switch
                value={consentements.analyses_statistiques}
                onValueChange={(value) => updateConsent('analyses_statistiques', value)}
                disabled={loading}
                color={theme.colors.primary}
              />
            )}
          />
        </Card.Content>
      </Card>
      
      {/* Politique de conservation */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Politique de conservation des données</Title>
          
          <Paragraph style={styles.paragraph}>
            Nous conservons vos données pendant la durée nécessaire au suivi de vos soins
            et selon les obligations légales applicables aux professionnels de santé.
          </Paragraph>
          
          {deletionPolicy && (
            <View style={styles.policyDetails}>
              <Text style={styles.policyTitle}>Délais de conservation :</Text>
              
              <View style={styles.policyItem}>
                <Text style={styles.policyLabel}>• Dossier patient :</Text>
                <Text style={styles.policyValue}>{deletionPolicy.patient} mois après la dernière consultation</Text>
              </View>
              
              <View style={styles.policyItem}>
                <Text style={styles.policyLabel}>• Rendez-vous :</Text>
                <Text style={styles.policyValue}>{deletionPolicy.rendez_vous} mois après la date du rendez-vous</Text>
              </View>
              
              <View style={styles.policyItem}>
                <Text style={styles.policyLabel}>• Bilans :</Text>
                <Text style={styles.policyValue}>{deletionPolicy.bilans} mois après la création du bilan</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
      
      {/* Vos droits */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Vos droits</Title>
          
          <Text style={styles.rightsText}>Conformément au RGPD, vous disposez des droits suivants :</Text>
          
          <View style={styles.rightsList}>
            <View style={styles.rightsItem}>
              <Text style={styles.rightsLabel}>• Droit d'accès</Text>
              <Text style={styles.rightsDescription}>Vous pouvez demander une copie de vos données personnelles.</Text>
            </View>
            
            <View style={styles.rightsItem}>
              <Text style={styles.rightsLabel}>• Droit de rectification</Text>
              <Text style={styles.rightsDescription}>Vous pouvez corriger vos données inexactes ou incomplètes.</Text>
            </View>
            
            <View style={styles.rightsItem}>
              <Text style={styles.rightsLabel}>• Droit à l'effacement</Text>
              <Text style={styles.rightsDescription}>Vous pouvez demander la suppression de vos données.</Text>
            </View>
            
            <View style={styles.rightsItem}>
              <Text style={styles.rightsLabel}>• Droit à la limitation</Text>
              <Text style={styles.rightsDescription}>Vous pouvez demander la limitation du traitement de vos données.</Text>
            </View>
            
            <View style={styles.rightsItem}>
              <Text style={styles.rightsLabel}>• Droit à la portabilité</Text>
              <Text style={styles.rightsDescription}>Vous pouvez récupérer vos données dans un format structuré.</Text>
            </View>
          </View>
          
          <Text style={styles.contactText}>
            Pour exercer ces droits, veuillez contacter notre Délégué à la Protection des Données :
            dpo@kinebilan.fr
          </Text>
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
  card: {
    margin: 8,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  paragraph: {
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  policyDetails: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  policyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  policyItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  policyLabel: {
    width: '40%',
    fontWeight: 'bold',
  },
  policyValue: {
    flex: 1,
  },
  rightsText: {
    marginBottom: 12,
  },
  rightsList: {
    marginVertical: 8,
  },
  rightsItem: {
    marginBottom: 8,
  },
  rightsLabel: {
    fontWeight: 'bold',
  },
  rightsDescription: {
    marginLeft: 16,
    color: '#555',
  },
  contactText: {
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default RGPDScreen;