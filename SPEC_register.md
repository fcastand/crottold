# Spec : CrÃ©ation de compte simulÃ©e (sans BDD)

> RÃ©digÃ© le 2026-07-15 â€” Ã  implÃ©menter sur la branche `develop`

## Contexte

Le lien "Pas encore de compte ? S'inscrire" affiche actuellement une simple `alert()`. L'objectif est de crÃ©er un vrai formulaire d'inscription simulÃ©, cohÃ©rent avec le systÃ¨me de login existant (localStorage + `AppState.user`).

## Approche

Pas de vraie BDD = on simule en **localStorage**. Les comptes crÃ©Ã©s sont stockÃ©s sous la clÃ© `crottold_accounts` (tableau JSON). Lors d'un login, on vÃ©rifie si le pseudo correspond Ã  un compte. **Le mode de connexion libre (dÃ©mo) est conservÃ©** tant qu'il n'y a pas de BDD.

---

## Vue Inscription (HTML)

Nouvelle vue `#view-register` (app-view) avec :

- Logo + mascotte Bobby
- Formulaire `#form-register` :
  - **Pseudo** `input-reg-username` â€” obligatoire, check doublon en localStorage
  - **Date de naissance** `input-reg-birthdate` â€” obligatoire, vÃ©rification majoritÃ© (18 ans rÃ©volus)
  - **Mot de passe** `input-reg-password` â€” avec indicateur de robustesse en temps rÃ©el
  - **Confirmation mot de passe** `input-reg-confirm`
- Bouton submit "CrÃ©er mon compte ðŸŽ‰"
- Lien "DÃ©jÃ  un compte ? Se connecter" (`btn-go-login`)

> **Important** : Tout compte crÃ©Ã© est un **Utilisateur** par dÃ©faut. Il n'y a pas de sÃ©lecteur de rÃ´le Ã  l'inscription. Seul un **modÃ©rateur** pourra promouvoir un utilisateur via le panel de modÃ©ration (Ã  implÃ©menter plus tard).

---

## RÃ¨gles mot de passe

Indicateur visuel en temps rÃ©el (barre de force) + validation au submit :

| RÃ¨gle | Condition |
|---|---|
| Longueur minimale | â‰¥ 8 caractÃ¨res |
| Majuscule | Au moins 1 lettre majuscule |
| Chiffre | Au moins 1 chiffre |
| CaractÃ¨re spÃ©cial | Au moins 1 parmi `!@#$%^&*_-` |

Feedback visuel : barre colorÃ©e (rouge â†’ orange â†’ vert) + liste de rÃ¨gles avec âœ…/âŒ dynamiques.
Bouton submit **dÃ©sactivÃ©** tant que le score < 3/4.

---

## VÃ©rification majoritÃ©

- L'utilisateur doit avoir **18 ans rÃ©volus** Ã  la date d'inscription
- Si mineur â†’ message d'erreur inline : *"Tu dois Ãªtre majeur(e) pour rejoindre CROTTOLD."*
- La date de naissance est stockÃ©e dans le compte (`birthdate`)

---

## SÃ©curitÃ© du mot de passe

- Stockage via `btoa()` (encodage base64) en attendant â€” pas de clair, pas de vrai chiffrement
- Ã€ remplacer par `bcrypt` cÃ´tÃ© serveur lors de l'intÃ©gration BDD

---

## Modifications fichiers

### `state.js`
- Ajouter `accounts: []` dans `AppState`
- Ajouter `loadAccounts()` / `saveAccounts()` (clÃ© `crottold_accounts`)
- Ajouter `registerAccount({ username, birthdate, password, role })` :
  - VÃ©rifie doublon pseudo (case-insensitive)
  - Retourne `{ success, error }`
- Ajouter `findAccount(username)` â†’ retourne le compte ou null
- Modifier `init()` pour charger les comptes

### `app.js`
- Handler `#btn-go-register` â†’ `RouteSystem.switchView('view-register')`
- Handler `#btn-go-login` (vue register) â†’ `RouteSystem.switchView('view-login')`
- Handler `#form-register` submit â†’ validation + `AppState.registerAccount()` + redirect
- Handler `#input-reg-password` `input` event â†’ barre de force + checklist temps rÃ©el
- **Modifier handler `#form-login`** : si pseudo connu + mot de passe correct â†’ connexion avec rÃ´le du compte ; sinon â†’ mode dÃ©mo libre

### `styles.css`
- `.password-strength-bar` + `.password-strength-fill` (barre de robustesse)
- `.password-rules-list` (checklist âœ…/âŒ)
- `.input-error` (Ã©tat rouge sur un champ invalide)
- `.form-error-msg` (message d'erreur inline)

---

## Comportement simulÃ©

| ScÃ©nario | RÃ©sultat |
|---|---|
| Inscription valide | Compte stockÃ© en localStorage, toast succÃ¨s, redirect login |
| Pseudo dÃ©jÃ  pris | Erreur inline : *"Ce pseudo est dÃ©jÃ  utilisÃ©."* |
| Mineur dÃ©tectÃ© | Erreur inline : *"Tu dois Ãªtre majeur(e) pour rejoindre CROTTOLD."* |
| Passwords diffÃ©rents | Erreur inline : *"Les mots de passe ne correspondent pas."* |
| Password trop faible | Bouton submit dÃ©sactivÃ© jusqu'Ã  score â‰¥ 3/4 |
| Login pseudo connu | VÃ©rifie le mot de passe, applique le rÃ´le du compte |
| Login pseudo inconnu | Mode dÃ©mo â€” connexion libre avec sÃ©lecteur de rÃ´le (comportement actuel) |

---

## Checklist d'implÃ©mentation

- [ ] Vue `#view-register` dans `index.html`
- [ ] Lien `#btn-go-register` sur la vue login
- [ ] `registerAccount()` et `findAccount()` dans `state.js`
- [ ] Handlers formulaire inscription dans `app.js`
- [ ] Barre de robustesse + checklist mot de passe (JS + CSS)
- [ ] VÃ©rification majoritÃ© (JS)
- [ ] Login hybride (compte connu vs mode dÃ©mo)
- [ ] Mise Ã  jour `qa_report.md` pour marquer le point rÃ©solu
