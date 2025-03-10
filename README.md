# KinéBilan Mobile

Application mobile pour les kinésithérapeutes permettant de gérer leurs patients, rendez-vous et bilans kinésithérapiques.

![Bannière KinéBilan Mobile](https://via.placeholder.com/800x200?text=KineBilan+Mobile)

## Fonctionnalités

- **Gestion des patients**
  - Liste des patients avec recherche et filtrage
  - Fiches détaillées des patients
  - Formulaires d'ajout et de modification
  - Gestion des consentements RGPD

- **Gestion des rendez-vous**
  - Calendrier des rendez-vous
  - Planification et modification des rendez-vous
  - Notifications et rappels
  - Gestion des annulations

- **Bilans kinésithérapiques**
  - Création et suivi des bilans
  - Observations, mesures et objectifs
  - Statuts de validation des bilans
  - Export au format PDF

- **Tableau de bord**
  - Aperçu des rendez-vous du jour
  - Patients nécessitant un bilan
  - Statistiques mensuelles
  - Actions rapides

## Captures d'écran

*À venir*

## Stack technique

- **React Native** - Framework mobile
- **Expo** - Outils et services pour React Native
- **React Navigation** - Navigation entre les écrans
- **React Native Paper** - Composants UI Material Design
- **Axios** - Client HTTP pour les appels API
- **AsyncStorage** - Stockage local
- **Date-fns** - Manipulation des dates
- **Jest** - Tests unitaires

## Architecture

L'application est structurée selon les principes de modularité et de séparation des préoccupations :

- **Hooks personnalisés** pour la logique réutilisable
  - `useFormValidation` - Validation des formulaires
  - `useDateFormatter` - Formatage des dates
  - `useApiRequest` - Gestion des appels API

- **Contextes** pour l'état global
  - `AuthContext` - Gestion de l'authentification

- **API Services** pour la communication avec le backend
  - Services pour patients, rendez-vous, bilans, etc.

- **Composants réutilisables** pour l'interface utilisateur

## Installation

### Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm (v6.0.0 ou supérieur) ou Yarn (v1.22.0 ou supérieur)
- Expo CLI (`npm install -g expo-cli`)

### Installation des dépendances

```bash
# Cloner le dépôt
git clone https://github.com/izikenway/kinebilan-mobile.git
cd kinebilan-mobile

# Installer les dépendances
npm install
# ou
yarn install
```

### Configuration

1. Créez un fichier `.env` à la racine du projet (voir `.env.example` pour les variables nécessaires)
2. Configurez l'URL de l'API backend dans le fichier `.env`

### Démarrage de l'application

```bash
# Démarrer l'application en mode développement
npm start
# ou
yarn start
```

## Tests

```bash
# Exécuter les tests unitaires
npm test
# ou
yarn test

# Exécuter les tests avec couverture
npm test -- --coverage
# ou
yarn test --coverage
```

## Déploiement

### Android

```bash
# Construire l'APK pour Android
expo build:android

# Ou utiliser EAS Build
eas build -p android
```

### iOS

```bash
# Construire pour iOS
expo build:ios

# Ou utiliser EAS Build
eas build -p ios
```

## Contribution

Nous accueillons favorablement les contributions à ce projet. Veuillez consulter notre [guide de contribution](CONTRIBUTING.md) pour en savoir plus sur le processus de développement et comment vous pouvez contribuer.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact

Pour toute question ou assistance, veuillez contacter :

- Email : contact@kinebilan.fr
- Site web : [www.kinebilan.fr](https://www.kinebilan.fr)

---

© 2025 KinéBilan. Tous droits réservés.