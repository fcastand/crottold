# Spec : Création de compte simulée (sans BDD)

> Rédigé le 2026-07-15 — à implémenter sur la branche `develop`

## Contexte

Le lien "Pas encore de compte ? S'inscrire" affiche actuellement une simple `alert()`. L'objectif est de créer un vrai formulaire d'inscription simulé, cohérent avec le système de login existant (localStorage + `AppState.user`).

## Approche

Pas de vraie BDD = on simule en **localStorage**. Les comptes créés sont stockés sous la clé `crottoq_accounts` (tableau JSON). Lors d'un login, on vérifie si le pseudo correspond à un compte. **Le mode de connexion libre (démo) est conservé** tant qu'il n'y a pas de BDD.

---

## Vue Inscription (HTML)

Nouvelle vue `#view-register` (app-view) avec :

- Logo + mascotte Bobby
- Formulaire `#form-register` :
  - **Pseudo** `input-reg-username` — obligatoire, check doublon en localStorage
  - **Date de naissance** `input-reg-birthdate` — obligatoire, vérification majorité (18 ans révolus)
  - **Mot de passe** `input-reg-password` — avec indicateur de robustesse en temps réel
  - **Confirmation mot de passe** `input-reg-confirm`
- Bouton submit "Créer mon compte 🎉"
- Lien "Déjà un compte ? Se connecter" (`btn-go-login`)

> **Important** : Tout compte créé est un **Utilisateur** par défaut. Il n'y a pas de sélecteur de rôle à l'inscription. Seul un **modérateur** pourra promouvoir un utilisateur via le panel de modération (à implémenter plus tard).

---

## Règles mot de passe

Indicateur visuel en temps réel (barre de force) + validation au submit :

| Règle | Condition |
|---|---|
| Longueur minimale | ≥ 8 caractères |
| Majuscule | Au moins 1 lettre majuscule |
| Chiffre | Au moins 1 chiffre |
| Caractère spécial | Au moins 1 parmi `!@#$%^&*_-` |

Feedback visuel : barre colorée (rouge → orange → vert) + liste de règles avec ✅/❌ dynamiques.
Bouton submit **désactivé** tant que le score < 3/4.

---

## Vérification majorité

- L'utilisateur doit avoir **18 ans révolus** à la date d'inscription
- Si mineur → message d'erreur inline : *"Tu dois être majeur(e) pour rejoindre CROTTOQ."*
- La date de naissance est stockée dans le compte (`birthdate`)

---

## Sécurité du mot de passe

- Stockage via `btoa()` (encodage base64) en attendant — pas de clair, pas de vrai chiffrement
- À remplacer par `bcrypt` côté serveur lors de l'intégration BDD

---

## Modifications fichiers

### `state.js`
- Ajouter `accounts: []` dans `AppState`
- Ajouter `loadAccounts()` / `saveAccounts()` (clé `crottoq_accounts`)
- Ajouter `registerAccount({ username, birthdate, password, role })` :
  - Vérifie doublon pseudo (case-insensitive)
  - Retourne `{ success, error }`
- Ajouter `findAccount(username)` → retourne le compte ou null
- Modifier `init()` pour charger les comptes

### `app.js`
- Handler `#btn-go-register` → `RouteSystem.switchView('view-register')`
- Handler `#btn-go-login` (vue register) → `RouteSystem.switchView('view-login')`
- Handler `#form-register` submit → validation + `AppState.registerAccount()` + redirect
- Handler `#input-reg-password` `input` event → barre de force + checklist temps réel
- **Modifier handler `#form-login`** : si pseudo connu + mot de passe correct → connexion avec rôle du compte ; sinon → mode démo libre

### `styles.css`
- `.password-strength-bar` + `.password-strength-fill` (barre de robustesse)
- `.password-rules-list` (checklist ✅/❌)
- `.input-error` (état rouge sur un champ invalide)
- `.form-error-msg` (message d'erreur inline)

---

## Comportement simulé

| Scénario | Résultat |
|---|---|
| Inscription valide | Compte stocké en localStorage, toast succès, redirect login |
| Pseudo déjà pris | Erreur inline : *"Ce pseudo est déjà utilisé."* |
| Mineur détecté | Erreur inline : *"Tu dois être majeur(e) pour rejoindre CROTTOQ."* |
| Passwords différents | Erreur inline : *"Les mots de passe ne correspondent pas."* |
| Password trop faible | Bouton submit désactivé jusqu'à score ≥ 3/4 |
| Login pseudo connu | Vérifie le mot de passe, applique le rôle du compte |
| Login pseudo inconnu | Mode démo — connexion libre avec sélecteur de rôle (comportement actuel) |

---

## Checklist d'implémentation

- [ ] Vue `#view-register` dans `index.html`
- [ ] Lien `#btn-go-register` sur la vue login
- [ ] `registerAccount()` et `findAccount()` dans `state.js`
- [ ] Handlers formulaire inscription dans `app.js`
- [ ] Barre de robustesse + checklist mot de passe (JS + CSS)
- [ ] Vérification majorité (JS)
- [ ] Login hybride (compte connu vs mode démo)
- [ ] Mise à jour `qa_report.md` pour marquer le point résolu
