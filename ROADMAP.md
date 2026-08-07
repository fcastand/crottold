# 🗺️ Roadmap & Architecture CROTTOQ

Ce document trace la vision technique et les prochaines étapes de développement de l'application CROTTOQ.

## 🏗️ Choix Architecturaux

### 1. Stack Technique Actuelle (Frontend)
- **Langages** : HTML5, CSS3 (Vanilla), JavaScript (ES Modules).
- **Cartographie** : Leaflet.js avec des tuiles OpenStreetMap.
- **Design** : Approche "Mobile First" encapsulée dans un simulateur web pour le développement.

### 2. Stratégie Backend (À venir)
*Décision en attente : Choix entre deux solutions BaaS (Backend as a Service).*

| Critère | 🔥 Firebase (Google) | ⚡ Supabase (Open Source) |
|---------|---------------------|--------------------------|
| **Base de données** | Firestore (**NoSQL**) | PostgreSQL (**SQL**) |
| **Statistiques / Analytics** | 🔴 Difficile. Les agrégations (COUNT, SUM, GROUP BY, JOIN) nécessitent des compteurs manuels ou des Cloud Functions. | 🟢 Excellent. SQL natif permettant des requêtes analytiques complexes et des vues directes. |
| **Facilité d'intégration** | 🟢 Très simple, écosystème mature. | 🟢 Très simple, SDK similaire à Firebase. |
| **Modèle de données** | Souple (documents sans schéma strict). | Structuré (tables relationnelles). |
| **Tarification** | Plan Spark gratuit (très généreux pour les petits projets). | Plan gratuit généreux (Auth + DB incluses). |

**Fonctionnalités ciblées quel que soit le choix :**
- **Auth** : Pour la création de compte et la connexion.
- **Base de données** : Pour centraliser les toilettes, les avis et les utilisateurs.

**⚠️ Règle d'Environnement :**
Quel que soit le BaaS choisi (Firebase ou Supabase), nous mettrons en place **deux projets/bases de données strictement séparés** :
1. **Environnement DEV** : Utilisé sur la branche `develop` et en local pour nos tests.
2. **Environnement PROD** : Utilisé sur la branche `master` et le site live (GitHub Pages), avec les vraies données des utilisateurs.
Le basculement se fera automatiquement dans le code selon l'URL (localhost vs github.io).

### 3. Stratégie Mobile (Déploiement)
- **Phase 1 : PWA (Progressive Web App)** : Le site sera rendu totalement responsif. Sur un vrai smartphone, la coque du simulateur disparaîtra pour laisser place à l'application en plein écran. L'utilisateur pourra "Ajouter à l'écran d'accueil".
- **Phase 2 : App Stores (Optionnel)** : Utilisation de **Capacitor** pour wrapper notre code HTML/CSS/JS dans une application native (iOS & Android) sans avoir à réécrire l'application.

---

## 📋 Liste des Tâches (Backlog)

- [ ] **Rendre l'application responsive (PWA)**
  - Cacher la coque iPhone sur les petits écrans (CSS Media Queries).
  - Ajouter un `manifest.json` pour permettre l'installation PWA.
- [ ] **Intégration BaaS : Base de données (Firebase ou Supabase)**
  - Remplacer le `localStorage` actuel par des appels à la BDD.
  - Migrer les "Toilettes par défaut" vers la base de données distante.
- [ ] **Intégration BaaS : Authentification**
  - Connecter le formulaire de Login / Création de compte à l'Auth du BaaS.
  - Gérer l'état de session global de l'utilisateur (AppState).
- [ ] **Profil Utilisateur Avancé**
  - Sauvegarder l'XP et les badges dans la base de données (définir les paliers de niveau et corriger le bug des dépassements de plafond type 600/500).
  - Afficher l'historique des ajouts/avis de l'utilisateur.
- [ ] **Amélioration UI/UX & Sécurité**
  - Gérer le style du bouton "Paramètres" du profil (actuellement hors charte).
  - Géolocaliser la personne pour éviter la triche (ex: empêcher de noter une toilette si l'utilisateur n'est pas à proximité immédiate ou dans le même pays).
  - ... (À définir au fil de l'eau)
