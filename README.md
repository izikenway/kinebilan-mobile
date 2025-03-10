# KinéBilan Mobile

Application mobile pour les kinésithérapeutes permettant de gérer leurs patients, rendez-vous et bilans.

## Fonctionnalités

- Gestion des patients
- Gestion des rendez-vous
- Création et suivi des bilans kinésithérapiques
- Conformité RGPD
- Interface intuitive et adaptée aux besoins des kinésithérapeutes

## Stack technique

- React Native
- Expo
- React Navigation
- React Native Paper (UI)
- Hooks personnalisés pour la gestion des formulaires et API
- Authentification JWT

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/izikenway/kinebilan-mobile.git

# Installer les dépendances
cd kinebilan-mobile
npm install

# Lancer l'application
expo start
```

## Structure du projet

- `/src/screens` : Écrans de l'application
- `/src/components` : Composants réutilisables
- `/src/navigation` : Configuration de la navigation
- `/src/hooks` : Hooks personnalisés
- `/src/api` : Services pour les appels API
- `/src/context` : Contextes React (auth, etc.)
- `/src/utils` : Utilitaires divers