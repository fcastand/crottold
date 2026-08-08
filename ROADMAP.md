# ðŸ—ºï¸ Roadmap & Architecture CROTTOLD

Ce document trace la vision technique et les prochaines Ã©tapes de dÃ©veloppement de l'application CROTTOLD.

## ðŸ—ï¸ Choix Architecturaux

### 1. Stack Technique Actuelle (Frontend)
- **Langages** : HTML5, CSS3 (Vanilla), JavaScript (ES Modules).
- **Cartographie** : Leaflet.js avec des tuiles OpenStreetMap.
- **Design** : Approche "Mobile First" encapsulÃ©e dans un simulateur web pour le dÃ©veloppement.

### 2. StratÃ©gie Backend (Ã€ venir)
*DÃ©cision en attente : Choix entre deux solutions BaaS (Backend as a Service).*

| CritÃ¨re | ðŸ”¥ Firebase (Google) | âš¡ Supabase (Open Source) |
|---------|---------------------|--------------------------|
| **Base de donnÃ©es** | Firestore (**NoSQL**) | PostgreSQL (**SQL**) |
| **Statistiques / Analytics** | ðŸ”´ Difficile. Les agrÃ©gations (COUNT, SUM, GROUP BY, JOIN) nÃ©cessitent des compteurs manuels ou des Cloud Functions. | ðŸŸ¢ Excellent. SQL natif permettant des requÃªtes analytiques complexes et des vues directes. |
| **FacilitÃ© d'intÃ©gration** | ðŸŸ¢ TrÃ¨s simple, Ã©cosystÃ¨me mature. | ðŸŸ¢ TrÃ¨s simple, SDK similaire Ã  Firebase. |
| **ModÃ¨le de donnÃ©es** | Souple (documents sans schÃ©ma strict). | StructurÃ© (tables relationnelles). |
| **Tarification** | Plan Spark gratuit (trÃ¨s gÃ©nÃ©reux pour les petits projets). | Plan gratuit gÃ©nÃ©reux (Auth + DB incluses). |

**FonctionnalitÃ©s ciblÃ©es quel que soit le choix :**
- **Auth** : Pour la crÃ©ation de compte et la connexion.
- **Base de donnÃ©es** : Pour centraliser les toilettes, les avis et les utilisateurs.

**âš ï¸ RÃ¨gle d'Environnement :**
Quel que soit le BaaS choisi (Firebase ou Supabase), nous mettrons en place **deux projets/bases de donnÃ©es strictement sÃ©parÃ©s** :
1. **Environnement DEV** : UtilisÃ© sur la branche `develop` et en local pour nos tests.
2. **Environnement PROD** : UtilisÃ© sur la branche `master` et le site live (GitHub Pages), avec les vraies donnÃ©es des utilisateurs.
Le basculement se fera automatiquement dans le code selon l'URL (localhost vs github.io).

### 3. StratÃ©gie Mobile (DÃ©ploiement)
- **Phase 1 : PWA (Progressive Web App)** : Le site sera rendu totalement responsif. Sur un vrai smartphone, la coque du simulateur disparaÃ®tra pour laisser place Ã  l'application en plein Ã©cran. L'utilisateur pourra "Ajouter Ã  l'Ã©cran d'accueil".
- **Phase 2 : App Stores (Optionnel)** : Utilisation de **Capacitor** pour wrapper notre code HTML/CSS/JS dans une application native (iOS & Android) sans avoir Ã  rÃ©Ã©crire l'application.

---

## ðŸ“‹ Liste des TÃ¢ches (Backlog)

- [ ] **Rendre l'application responsive (PWA)**
  - Cacher la coque iPhone sur les petits Ã©crans (CSS Media Queries).
  - Ajouter un `manifest.json` pour permettre l'installation PWA.
- [ ] **IntÃ©gration BaaS : Base de donnÃ©es (Firebase ou Supabase)**
  - Remplacer le `localStorage` actuel par des appels Ã  la BDD.
  - Migrer les "Toilettes par dÃ©faut" vers la base de donnÃ©es distante.
- [ ] **IntÃ©gration BaaS : Authentification**
  - Connecter le formulaire de Login / CrÃ©ation de compte Ã  l'Auth du BaaS.
  - GÃ©rer l'Ã©tat de session global de l'utilisateur (AppState).
- [ ] **Profil Utilisateur AvancÃ©**
  - Sauvegarder l'XP et les badges dans la base de donnÃ©es (dÃ©finir les paliers de niveau et corriger le bug des dÃ©passements de plafond type 600/500).
  - Afficher l'historique des ajouts/avis de l'utilisateur.
- [ ] **AmÃ©lioration UI/UX & SÃ©curitÃ©**
  - GÃ©rer le style du bouton "ParamÃ¨tres" du profil (actuellement hors charte).
  - GÃ©olocaliser la personne pour Ã©viter la triche (ex: empÃªcher de noter une toilette si l'utilisateur n'est pas Ã  proximitÃ© immÃ©diate ou dans le mÃªme pays).
  - ... (Ã€ dÃ©finir au fil de l'eau)
