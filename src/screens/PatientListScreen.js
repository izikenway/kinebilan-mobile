import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { patientsAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';

/**
 * Écran de liste des patients
 */
const PatientListScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { loading, refreshing, executeRequest } = useApiRequest();
  
  // États
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Chargement initial des patients
  useEffect(() => {
    loadPatients();
  }, []);
  
  // Fonction pour charger les patients
  const loadPatients = useCallback(async (pageNum = 1, search = searchQuery, refresh = false) => {
    await executeRequest(
      () => patientsAPI.getAll({ 
        page: pageNum, 
        search,
        limit: 10
      }),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les patients. Veuillez réessayer.',
        onSuccess: (response) => {
          const { results, pagination } = response.data;
          
          if (refresh || pageNum === 1) {
            setPatients(results);
          } else {
            setPatients(prev => [...prev, ...results]);
          }
          
          setPage(pagination.currentPage);
          setTotalPages(pagination.totalPages);
        }
      }
    );
  }, [searchQuery, executeRequest]);
  
  // Gestion de la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length === 0 || query.length > 2) {
      loadPatients(1, query);
    }
  };
  
  // Rafraîchissement de la liste
  const onRefresh = () => {
    loadPatients(1, searchQuery, true);
  };
  
  // Chargement de la page suivante
  const loadMorePatients = () => {
    if (page < totalPages && !loading && !refreshing) {
      loadPatients(page + 1);
    }
  };
  
  // Navigation vers la page de détail d'un patient
  const navigateToPatientDetail = (patientId) => {
    navigation.navigate('PatientDetails', { id: patientId });
  };
  
  // Navigation vers la création d'un nouveau patient
  const navigateToNewPatient = () => {
    navigation.navigate('PatientForm');
  };
  
  // Rendu d'un élément de la liste
  const renderPatientItem = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigateToPatientDetail(item.patient_id)}
    >
      <Card.Content>
        <Title style={styles.patientName}>{item.nom}</Title>
        
        <View style={styles.infoContainer}>
          {item.email && (
            <View style={styles.infoRow}>
              <Icon name="email" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Paragraph style={styles.infoText}>{item.email}</Paragraph>
            </View>
          )}
          
          {item.telephone && (
            <View style={styles.infoRow}>
              <Icon name="phone" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Paragraph style={styles.infoText}>{item.telephone}</Paragraph>
            </View>
          )}
          
          {item.dernier_bilan && (
            <View style={styles.infoRow}>
              <Icon name="clipboard-text" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Paragraph style={styles.infoText}>
                Dernier bilan: {new Date(item.dernier_bilan).toLocaleDateString('fr-FR')}
              </Paragraph>
            </View>
          )}
          
          {item.prochain_rdv && (
            <View style={styles.infoRow}>
              <Icon name="calendar" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Paragraph style={styles.infoText}>
                Prochain RDV: {new Date(item.prochain_rdv).toLocaleDateString('fr-FR')}
              </Paragraph>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
  
  // Rendu du pied de liste (indicateur de chargement)
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>Chargement des patients...</Text>
      </View>
    );
  };
  
  // Rendu en cas de liste vide
  const renderEmpty = () => {
    if (loading && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-off" size={60} color={theme.colors.disabled} />
        <Text style={styles.emptyText}>
          {searchQuery 
            ? "Aucun patient ne correspond à votre recherche" 
            : "Aucun patient disponible"
          }
        </Text>
        <Button 
          mode="contained" 
          onPress={navigateToNewPatient} 
          style={styles.emptyButton}
        >
          Ajouter un patient
        </Button>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un patient..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      {/* Liste des patients */}
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={item => item.patient_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMorePatients}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
      
      {/* Bouton d'ajout */}
      <Button
        mode="contained"
        icon="plus"
        onPress={navigateToNewPatient}
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
      >
        Nouveau patient
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
  },
  listContainer: {
    padding: 8,
    paddingBottom: 80, // pour laisser de la place au bouton d'ajout
  },
  card: {
    marginVertical: 4,
    marginHorizontal: 4,
    elevation: 2,
  },
  patientName: {
    fontSize: 18,
    marginBottom: 8,
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 28,
    elevation: 4,
  },
  addButtonLabel: {
    fontSize: 14,
  },
});

export default PatientListScreen;