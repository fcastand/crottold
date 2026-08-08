# ðŸ§» CROTTOLD â€” L'explorateur mondial des toilettes

[![Live Demo](https://img.shields.io/badge/ðŸš½%20Live%20Demo-GitHub%20Pages-0DCDC0?style=for-the-badge)](https://fcastand.github.io/crottold/)

> La premiÃ¨re application communautaire qui cartographie les toilettes publiques et privÃ©es accessibles. Trouvez, notez et ajoutez des WC rapidement dans une ambiance cartoon et ludique !

![CROTTOLD App](mascot_bobby.png)

## âœ¨ FonctionnalitÃ©s

- ðŸ—ºï¸ **Carte interactive** â€” Visualisez toutes les toilettes autour de vous (propulsÃ© par Leaflet & OpenStreetMap)
- ðŸ” **DÃ©tails complets** â€” PropretÃ©, confort, accessibilitÃ© PMR, papier, prix, accÃ¨s
- â­ **SystÃ¨me d'avis** â€” Notez et commentez chaque toilette
- ðŸš¨ **Bouton SOS** â€” Trouvez instantanÃ©ment la toilette la plus proche
- ðŸ›¡ï¸ **ModÃ©ration intÃ©grÃ©e** â€” Signalez les mauvaises toilettes, les modÃ©rateurs peuvent supprimer
- ðŸ‘¤ **Profil & XP** â€” Gagnez de l'expÃ©rience en ajoutant et notant des toilettes
- ðŸŽµ **Effets sonores** â€” Une ambiance sonore immersive et humoristique
- ðŸ“± **Design mobile-first** â€” Interface responsive avec simulateur smartphone sur desktop

## ðŸš€ Lancer l'application

### PrÃ©requis
Aucune dÃ©pendance externe requise ! L'app tourne avec un simple serveur PowerShell.

### DÃ©marrage

```powershell
# Lancer le serveur local
powershell -ExecutionPolicy Bypass -File server.ps1
```

Puis ouvrir dans le navigateur : **http://127.0.0.1:8085/**

### Comptes de dÃ©monstration

| RÃ´le | Nom d'utilisateur | RÃ´le Ã  sÃ©lectionner |
|------|-------------------|---------------------|
| Utilisateur normal | N'importe quel nom | `Visiteur` |
| ModÃ©rateur | N'importe quel nom | `ModÃ©rateur` |

## ðŸ—‚ï¸ Structure du projet

```
crottold/
â”œâ”€â”€ index.html          # Interface principale (toutes les vues)
â”œâ”€â”€ styles.css          # Design system complet
â”œâ”€â”€ app.js              # Handlers & logique applicative
â”œâ”€â”€ state.js            # Ã‰tat global & donnÃ©es (localStorage)
â”œâ”€â”€ map.js              # SystÃ¨me de carte Leaflet
â”œâ”€â”€ drawer.js           # Panneaux & fiches dÃ©tail
â”œâ”€â”€ router.js           # Routeur de vues
â”œâ”€â”€ audio.js            # SystÃ¨me audio
â”œâ”€â”€ mascot_bobby.png    # Mascotte officielle Bobby ðŸ¾
â””â”€â”€ server.ps1          # Serveur HTTP PowerShell (sans Node.js)
```

## ðŸ› ï¸ Stack technique

| Technologie | Usage |
|-------------|-------|
| **HTML5 / CSS3 / JS ES6** | Core de l'application |
| **Leaflet.js** | Carte interactive |
| **OpenStreetMap / CartoDB** | Tuiles cartographiques |
| **Font Awesome 6** | IcÃ´nes |
| **Google Fonts (Outfit)** | Typographie |
| **LocalStorage** | Persistance des donnÃ©es en local |
| **PowerShell HttpListener** | Serveur de dÃ©veloppement |

## ðŸŽ® Fonctionnement de l'app

1. **Splash screen** â†’ s'efface automatiquement aprÃ¨s 2.8s
2. **Login** â†’ entrez un pseudo et choisissez votre rÃ´le
3. **Carte** â†’ explorez les toilettes, cliquez sur les marqueurs
4. **Profil** â†’ suivez votre XP, vos badges et statistiques
5. **ModÃ©ration** (rÃ´le modÃ©rateur uniquement) â†’ gÃ©rez les signalements

## ðŸ“‹ DonnÃ©es de dÃ©mo

L'application inclut 5 toilettes de dÃ©monstration centrÃ©es sur Paris (Louvre / ChÃ¢telet) avec diffÃ©rents niveaux de propretÃ© et de signalement pour tester toutes les fonctionnalitÃ©s.

## ðŸ”® Ã‰volutions prÃ©vues

- [ ] Backend MySQL pour donnÃ©es persistantes multi-utilisateurs
- [ ] GÃ©olocalisation GPS rÃ©elle
- [ ] Filtres de recherche avancÃ©s (prix, PMR, distance)
- [ ] Classement mondial des explorateurs
- [ ] PWA / App mobile native

## ðŸ“„ Licence

MIT License â€” Fait avec ðŸ’© passion par Bobby & l'Ã©quipe CROTTOLD Â© 2026
