import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Button, Divider, ActivityIndicator, Chip, List, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bilansAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Section d'en-tête du bilan
 */
const BilanHeader = ({ bilan, getStatusColor }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <Title>Bilan {bilan.type || 'standard'}</Title>
        <Text style={styles.patient}>Patient: {bilan.patient_nom}</Text>
      </View>
      
      <Chip
        mode="flat"
        style={[styles.statusChip, { backgroundColor: getStatusColor(bilan.statut) }]}
        textStyle={styles.statusText}
      >
        {bilan.statut}
      </Chip>
    </View>
  );
};

/**
 * Section des informations générales du bilan
 */
const GeneralInfoSection = ({ bilan, formatDate }) => {
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Informations générales</Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date de création:</Text>
          <Text style={styles.infoValue}>{formatDate(bilan.date_creation)}</Text>
        </View>
        
        {bilan.date_modification && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dernière modification:</Text>
            <Text style={styles.infoValue}>{formatDate(bilan.date_modification)}</Text>
          </View>
        )}
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Créé par:</Text>
          <Text style={styles.infoValue}>{bilan.createur || 'Non spécifié'}</Text>
        </View>
        
        {bilan.type && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type de bilan:</Text>
            <Text style={styles.infoValue}>{bilan.type}</Text>
          </View>
        )}
      </View>
    </>
  );
};

/**
 * Section du motif du bilan
 */
const MotifSection = ({ motif }) => {
  if (!motif) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Motif</Text>
      <Card style={styles.contentCard}>
        <Card.Content>
          <Text>{motif}</Text>
        </Card.Content>
      </Card>
    </>
  );
};

/**
 * Section des observations du bilan
 */
const ObservationsSection = ({ observations }) => {
  if (!observations || observations.length === 0) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Observations</Text>
      <Card style={styles.contentCard}>
        <Card.Content>
          {observations.map((observation, index) => (
            <View key={index} style={styles.observationItem}>
              <Text style={styles.observationTitle}>{observation.titre}</Text>
              <Text style={styles.observationValue}>{observation.contenu}</Text>
              {index < observations.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );
};

/**
 * Section des mesures du bilan
 */
const MesuresSection = ({ mesures }) => {
  if (!mesures || mesures.length === 0) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Mesures</Text>
      <Card style={styles.contentCard}>
        <Card.Content>
          <View style={styles.mesuresGrid}>
            {mesures.map((mesure, index) => (
              <View key={index} style={styles.mesureItem}>
                <Text style={styles.mesureLabel}>{mesure.nom}</Text>
                <Text style={styles.mesureValue}>{`${mesure.valeur} ${mesure.unite || ''}`}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </>
  );
};

/**
 * Section des objectifs du bilan
 */
const ObjectifsSection = ({ objectifs }) => {
  if (!objectifs || objectifs.length === 0) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Objectifs</Text>
      <Card style={styles.contentCard}>
        <Card.Content>
          {objectifs.map((objectif, index) => (
            <View key={index} style={styles.objectifItem}>
              <View style={styles.objectifHeader}>
                <Icon 
                  name={objectif.atteint ? "check-circle" : "circle-outline"} 
                  size={20} 
                  color={objectif.atteint ? "#4CAF50" : "#757575"}
                />
                <Text 
                  style={[
                    styles.objectifTitle, 
                    objectif.atteint && styles.objectifAtteint
                  ]}
                >
                  {objectif.description}
                </Text>
              </View>
              {index < objectifs.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );
};

/**
 * Section des commentaires du bilan
 */
const CommentairesSection = ({ commentaires, formatDate }) => {
  if (!commentaires || commentaires.length === 0) return null;
  
  return (
    <>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Commentaires</Text>
      <Card style={styles.contentCard}>
        <Card.Content>
          {commentaires.map((commentaire, index) => (
            <View key={index} style={styles.commentaireItem}>
              <View style={styles.commentaireHeader}>
                <Text style={styles.commentaireAuteur}>{commentaire.auteur}</Text>
                <Text style={styles.commentaireDate}>{formatDate(commentaire.date)}</Text>
              </View>
              <Text style={styles.commentaireContenu}>{commentaire.contenu}</Text>
              {index < commentaires.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </>
  );
};

/**
 * Écran de détail d'un bilan kinésithérapique
 */
const BilanDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id } = route.params;
  
  // Utilisation des hooks personnalisés
  const { loading, refreshing, executeRequest, showConfirmation } = useApiRequest();
  const { formatDate } = useDateFormatter();
  
  // États
  const [bilan, setBilan] = useState(null);
  
  // Chargement initial des données du bilan
  useEffect(() => {
    loadBilanData();
  }, [id]);
  
  // Fonction pour charger les données du bilan
  const loadBilanData = async (refresh = false) => {
    await executeRequest(
      () => bilansAPI.getById(id),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les données du bilan. Veuillez réessayer.',
        onSuccess: (response) => {
          setBilan(response.data);
        }
      }
    );
  };
  
  // Rafraîchissement des données
  const onRefresh = () => {
    loadBilanData(true);
  };
  
  // Navigation vers l'écran de modification du bilan
  const navigateToEditBilan = () => {
    navigation.navigate('BilanForm', { id: id });
  };
  
  // Navigation vers l'écran du patient
  const navigateToPatientDetail = () => {
    if (bilan && bilan.patient_id) {
      navigation.navigate('PatientDetails', { id: bilan.patient_id });
    }
  };
  
  // Fonction pour exporter le bilan (PDF)
  const handleExport = async () => {
    await executeRequest(
      () => bilansAPI.export(id),
      {
        errorTitle: 'Erreur',
        errorMessage: 'Impossible d\'exporter le bilan. Veuillez réessayer.',
        onSuccess: (response) => {
          Alert.alert(
            'Succès',
            'Le bilan a été exporté avec succès. Vous recevrez le document par email.'
          );
        }
      }
    );
  };
  
  // Fonction pour valider le bilan
  const handleValidate = () => {
    showConfirmation({
      title: 'Validation du bilan',
      message: 'Êtes-vous sûr de vouloir valider ce bilan ?',
      onConfirm: async () => {
        await executeRequest(
          () => bilansAPI.updateStatus(id, 'validé'),
          {
            errorTitle: 'Erreur',
            errorMessage: 'Impossible de valider le bilan. Veuillez réessayer.',
            onSuccess: () => {
              loadBilanData();
              Alert.alert('Succès', 'Le bilan a été validé avec succès.');
            }
          }
        );
      }
    });
  };
  
  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'validé':
        return '#4CAF50';
      case 'en cours':
        return '#FF9800';
      case 'rejeté':
        return '#F44336';
      case 'à revoir':
        return '#9C27B0';
      default:
        return theme.colors.disabled;
    }
  };
  
  // Affichage d'un chargement
  if (loading && !refreshing && !bilan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement des données du bilan...</Text>
      </View>
    );
  }
  
  // Affichage d'une erreur
  if (!bilan) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>Le bilan n'a pas pu être chargé.</Text>
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
      {/* Carte principale */}
      <Card style={styles.card}>
        <Card.Content>
          {/* En-tête */}
          <BilanHeader 
            bilan={bilan}
            getStatusColor={getStatusColor}
          />
          
          {/* Patient */}
          <Divider style={styles.divider} />
          <List.Item
            title={bilan.patient_nom}
            description="Voir les détails du patient"
            left={props => <List.Icon {...props} icon="account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={navigateToPatientDetail}
            style={styles.patientItem}
          />
          
          {/* Informations générales */}
          <GeneralInfoSection 
            bilan={bilan}
            formatDate={formatDate}
          />
          
          {/* Motif */}
          <MotifSection motif={bilan.motif} />
          
          {/* Observations */}
          <ObservationsSection observations={bilan.observations} />
          
          {/* Mesures */}
          <MesuresSection mesures={bilan.mesures} />
          
          {/* Objectifs */}
          <ObjectifsSection objectifs={bilan.objectifs} />
          
          {/* Commentaires */}
          <CommentairesSection 
            commentaires={bilan.commentaires}
            formatDate={formatDate}
          />
        </Card.Content>
      </Card>
      
      {/* Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <View style={styles.actionButtons}>
            {bilan.statut !== 'validé' && (
              <>
                <Button
                  mode="contained"
                  icon="pencil"
                  onPress={navigateToEditBilan}
                  style={styles.actionButton}
                  disabled={loading}
                >
                  Modifier
                </Button>
                
                <Button
                  mode="contained"
                  icon="check-circle"
                  onPress={handleValidate}
                  style={[styles.actionButton, styles.validateButton]}
                  disabled={loading}
                >
                  Valider
                </Button>
              </>
            )}
            
            <Button
              mode="contained"
              icon="file-pdf-box"
              onPress={handleExport}
              style={[styles.actionButton, styles.exportButton]}
              disabled={loading}
            >
              Exporter
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
    margin: 16,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  patient: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  patientItem: {
    padding: 0,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentCard: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
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
  observationItem: {
    marginBottom: 8,
  },
  observationTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  observationValue: {
    fontSize: 14,
  },
  itemDivider: {
    marginVertical: 8,
  },
  mesuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mesureItem: {
    width: '50%',
    padding: 8,
  },
  mesureLabel: {
    fontSize: 12,
    color: '#666',
  },
  mesureValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  objectifItem: {
    marginBottom: 8,
  },
  objectifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  objectifTitle: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  objectifAtteint: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  commentaireItem: {
    marginBottom: 8,
  },
  commentaireHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentaireAuteur: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentaireDate: {
    fontSize: 12,
    color: '#666',
  },
  commentaireContenu: {
    fontSize: 14,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  validateButton: {
    backgroundColor: '#4CAF50',
  },
  exportButton: {
    backgroundColor: '#2196F3',
  },
});

export default BilanDetailScreen;