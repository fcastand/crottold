# 🗺️ Roadmap & Architecture CROTTOQ

Ce document trace la vision technique et les prochaines étapes de développement de l'application CROTTOQ.

## 🏗️ Choix Architecturaux

### 1. Stack Technique Actuelle (Frontend)
- **Langages** : HTML5, CSS3 (Vanilla), JavaScript (ES Modules).
- **Cartographie** : Leaflet.js avec des tuiles OpenStreetMap.
- **Design** : Approche "Mobile First" encapsulée dans un simulateur web pour le développement.

### 2. Stratégie Backend (À venir)
Nous utiliserons **Firebase** en tant que BaaS (Backend as a Service).
- **Pourquoi ?** Évite de coder un serveur Node.js de zéro. Parfait pour une PWA.
- **Coût** : Plan "Spark" (100% gratuit).
- **Fonctionnalités ciblées** :
  - **Firebase Auth** : Pour la création de compte et la connexion.
  - **Firestore (NoSQL)** : Pour centraliser la base de données des toilettes, des avis et des utilisateurs.

### 3. Stratégie Mobile (Déploiement)
- **Phase 1 : PWA (Progressive Web App)** : Le site sera rendu totalement responsif. Sur un vrai smartphone, la coque du simulateur disparaîtra pour laisser place à l'application en plein écran. L'utilisateur pourra "Ajouter à l'écran d'accueil".
- **Phase 2 : App Stores (Optionnel)** : Utilisation de **Capacitor** pour wrapper notre code HTML/CSS/JS dans une application native (iOS & Android) sans avoir à réécrire l'application.

---

## 📋 Liste des Tâches (Backlog)

- [ ] **Rendre l'application responsive (PWA)**
  - Cacher la coque iPhone sur les petits écrans (CSS Media Queries).
  - Ajouter un `manifest.json` pour permettre l'installation PWA.
- [ ] **Intégration Firebase : Base de données**
  - Remplacer le `localStorage` actuel par des appels à Firestore.
  - Migrer les "Toilettes par défaut" vers la base de données distante.
- [ ] **Intégration Firebase : Authentification**
  - Connecter le formulaire de Login / Création de compte à Firebase Auth.
  - Gérer l'état de session global de l'utilisateur (AppState).
- [ ] **Profil Utilisateur Avancé**
  - Sauvegarder l'XP et les badges dans Firestore.
  - Afficher l'historique des ajouts/avis de l'utilisateur.
- [ ] **Amélioration UI/UX**
  - ... (À définir au fil de l'eau)
