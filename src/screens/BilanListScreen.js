import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, Text, Chip, ActivityIndicator, Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { bilansAPI } from '../api/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useApiRequest from '../hooks/useApiRequest';
import useDateFormatter from '../hooks/useDateFormatter';

/**
 * Écran de liste des bilans kinésithérapiques
 */
const BilanListScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { formatDate } = useDateFormatter();
  const { loading, refreshing, executeRequest } = useApiRequest();
  
  // États
  const [bilans, setBilans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Chargement initial des bilans
  useEffect(() => {
    loadBilans();
  }, [statusFilter]);
  
  // Fonction pour charger les bilans
  const loadBilans = useCallback(async (pageNum = 1, search = searchQuery, refresh = false) => {
    await executeRequest(
      () => bilansAPI.getAll({ 
        page: pageNum, 
        search, 
        status: statusFilter,
        limit: 10
      }),
      {
        refresh,
        errorTitle: 'Erreur',
        errorMessage: 'Impossible de charger les bilans. Veuillez réessayer.',
        onSuccess: (response) => {
          const { results, pagination } = response.data;
          
          if (refresh || pageNum === 1) {
            setBilans(results);
          } else {
            setBilans(prev => [...prev, ...results]);
          }
          
          setPage(pagination.currentPage);
          setTotalPages(pagination.totalPages);
        }
      }
    );
  }, [searchQuery, statusFilter, executeRequest]);
  
  // Gestion de la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length === 0 || query.length > 2) {
      loadBilans(1, query);
    }
  };
  
  // Rafraîchissement de la liste
  const onRefresh = () => {
    loadBilans(1, searchQuery, true);
  };
  
  // Chargement de la page suivante
  const loadMoreBilans = () => {
    if (page < totalPages && !loading && !refreshing) {
      loadBilans(page + 1);
    }
  };
  
  // Filtrage par statut
  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
  };
  
  // Navigation vers la page de détail d'un bilan
  const navigateToBilanDetail = (bilanId) => {
    navigation.navigate('BilanDetails', { id: bilanId });
  };
  
  // Navigation vers la création d'un nouveau bilan
  const navigateToNewBilan = () => {
    navigation.navigate('BilanForm');
  };
  
  // Rendu d'un élément de la liste
  const renderBilanItem = ({ item }) => (
    <Card 
      style={styles.card}
      onPress={() => navigateToBilanDetail(item.bilan_id)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Title style={styles.cardTitle}>{item.patient_nom}</Title>
            <Paragraph style={styles.cardSubtitle}>
              {`Bilan ${item.type || 'standard'}`}
            </Paragraph>
          </View>
          
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip, 
              { borderColor: getStatusColor(item.statut) }
            ]}
            textStyle={{ color: getStatusColor(item.statut) }}
          >
            {item.statut}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color={theme.colors.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>Date: {formatDate(item.date_creation)}</Text>
          </View>
          
          {item.date_modification && (
            <View style={styles.infoRow}>
              <Icon name="update" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>Mis à jour: {formatDate(item.date_modification)}</Text>
            </View>
          )}
          
          {item.motif && (
            <View style={styles.infoRow}>
              <Icon name="information" size={16} color={theme.colors.primary} style={styles.infoIcon} />
              <Text 
                style={styles.infoText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.motif}
              </Text>
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
        <Text style={styles.footerText}>Chargement des bilans...</Text>
      </View>
    );
  };
  
  // Rendu en cas de liste vide
  const renderEmpty = () => {
    if (loading && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="clipboard-text-outline" size={60} color={theme.colors.disabled} />
        <Text style={styles.emptyText}>
          {searchQuery 
            ? "Aucun bilan ne correspond à votre recherche" 
            : "Aucun bilan disponible"
          }
        </Text>
        <Button 
          mode="contained" 
          onPress={navigateToNewBilan} 
          style={styles.emptyButton}
        >
          Créer un bilan
        </Button>
      </View>
    );
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
  
  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Rechercher un bilan..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Button 
          mode="text" 
          onPress={() => setShowFilters(!showFilters)}
          icon={showFilters ? "filter-remove" : "filter"}
        >
          Filtres
        </Button>
      </View>
      
      {/* Filtres */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Statut:</Text>
          <View style={styles.filterChips}>
            <Chip
              mode={statusFilter === 'validé' ? 'flat' : 'outlined'}
              onPress={() => handleStatusFilter('validé')}
              style={[styles.filterChip, statusFilter === 'validé' && { backgroundColor: '#E8F5E9' }]}
              textStyle={{ color: '#4CAF50' }}
              selected={statusFilter === 'validé'}
            >
              Validé
            </Chip>
            
            <Chip
              mode={statusFilter === 'en cours' ? 'flat' : 'outlined'}
              onPress={() => handleStatusFilter('en cours')}
              style={[styles.filterChip, statusFilter === 'en cours' && { backgroundColor: '#FFF3E0' }]}
              textStyle={{ color: '#FF9800' }}
              selected={statusFilter === 'en cours'}
            >
              En cours
            </Chip>
            
            <Chip
              mode={statusFilter === 'rejeté' ? 'flat' : 'outlined'}
              onPress={() => handleStatusFilter('rejeté')}
              style={[styles.filterChip, statusFilter === 'rejeté' && { backgroundColor: '#FFEBEE' }]}
              textStyle={{ color: '#F44336' }}
              selected={statusFilter === 'rejeté'}
            >
              Rejeté
            </Chip>
            
            <Chip
              mode={statusFilter === 'à revoir' ? 'flat' : 'outlined'}
              onPress={() => handleStatusFilter('à revoir')}
              style={[styles.filterChip, statusFilter === 'à revoir' && { backgroundColor: '#F3E5F5' }]}
              textStyle={{ color: '#9C27B0' }}
              selected={statusFilter === 'à revoir'}
            >
              À revoir
            </Chip>
          </View>
        </View>
      )}
      
      {/* Liste des bilans */}
      <FlatList
        data={bilans}
        renderItem={renderBilanItem}
        keyExtractor={item => item.bilan_id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMoreBilans}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
      
      {/* Bouton d'ajout */}
      <Button
        mode="contained"
        icon="plus"
        onPress={navigateToNewBilan}
        style={styles.addButton}
        labelStyle={styles.addButtonLabel}
      >
        Nouveau bilan
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
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 8,
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
    flex: 1,
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

export default BilanListScreen;