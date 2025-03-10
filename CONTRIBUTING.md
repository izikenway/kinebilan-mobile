# Guide de contribution à KinéBilan Mobile

Nous sommes ravis que vous envisagiez de contribuer à KinéBilan Mobile ! Voici quelques directives pour vous aider à commencer.

## Processus de développement

1. **Forker** le dépôt sur GitHub
2. **Cloner** votre fork localement
3. Créer une nouvelle **branche** pour votre fonctionnalité ou correction
4. **Développer** vos modifications
5. **Tester** vos modifications
6. **Commiter** vos changements avec des messages clairs
7. **Pousser** votre branche sur votre fork
8. Soumettre une **Pull Request** vers la branche principale

## Configuration de l'environnement de développement

### Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm (v6.0.0 ou supérieur) ou Yarn (v1.22.0 ou supérieur)
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/kinebilan-mobile.git
cd kinebilan-mobile

# Installer les dépendances
npm install
# ou
yarn install

# Démarrer l'application
npm start
# ou
yarn start
```

## Structure du projet

```
kinebilan-mobile/
├── assets/                # Images, polices et autres ressources
├── src/
│   ├── api/               # Services pour les appels API
│   ├── components/        # Composants réutilisables
│   ├── context/           # Contextes React (auth, etc.)
│   ├── hooks/             # Hooks personnalisés
│   ├── navigation/        # Configuration de la navigation
│   ├── screens/           # Écrans de l'application
│   └── utils/             # Utilitaires divers
├── app.json               # Configuration Expo
├── App.js                 # Point d'entrée de l'application
├── babel.config.js        # Configuration Babel
├── jest.setup.js          # Configuration Jest pour les tests
└── package.json           # Dépendances et scripts
```

## Directives de code

### Style de code

- Utilisez des noms de variables descriptifs et en camelCase
- Commentez votre code lorsque nécessaire
- Utilisez les hooks personnalisés pour la logique réutilisable
- Préférez les composants fonctionnels avec hooks aux composants de classe
- Utilisez les composants de React Native Paper pour l'interface utilisateur

### Tests

- Écrivez des tests pour toutes les nouvelles fonctionnalités
- Exécutez les tests existants avant de soumettre une PR

```bash
# Exécuter les tests
npm test
# ou
yarn test
```

### Documentation

- Documentez les fonctions, hooks et composants avec JSDoc
- Mettez à jour la documentation existante si vous modifiez des fonctionnalités

## Soumettre une Pull Request

1. Assurez-vous que votre code est propre et bien testé
2. Créez une Pull Request vers la branche principale du dépôt original
3. Décrivez clairement vos modifications dans la description de la PR
4. Référencez les issues associées, le cas échéant
5. Attendez la revue de code et le feedback

## Signaler des bugs

Si vous trouvez un bug, veuillez créer une issue sur GitHub avec les informations suivantes :

- Description du bug
- Étapes pour reproduire
- Comportement attendu
- Captures d'écran si applicable
- Environnement (version de l'application, appareil, OS)

## Proposer des fonctionnalités

Les propositions de nouvelles fonctionnalités sont les bienvenues. Veuillez créer une issue avec :

- Une description claire de la fonctionnalité
- La motivation derrière cette fonctionnalité
- Comment elle pourrait être implémentée
- Éventuellement des maquettes ou wireframes

## Questions

Si vous avez des questions, n'hésitez pas à créer une issue avec le tag "question".

Merci de contribuer à KinéBilan Mobile !