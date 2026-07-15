# 🧪 Rapport de Tests QA (Assurance Qualité) - CROTTOQ

J'ai effectué une passe complète sur l'application (en tant que sous-agent navigateur et via analyse de code). Voici le bilan de tout ce qui fonctionne, ce qui ne fonctionne pas ou ce qui est manquant.

> [!NOTE]
> Globalement, l'application est très stable pour un prototype. L'UI est fluide et les transitions de vues (RouteSystem) fonctionnent parfaitement. La majorité des actions "sans effet" proviennent des limitations du mode "hors-ligne" (sans vraie base de données).

## 🐛 Bugs et Comportements Étranges


### 1. Formulaire de Login (Fausse sécurité)
- **Problème** : Le formulaire ne vérifie aucun mot de passe. Taper "test" en identifiant et n'importe quel mot de passe permet de se connecter. *(Normal pour l'instant vu qu'on n'a pas Firebase).*

### 2. Bouton "Signaler un Problème" (Modération)
- **Problème partiel** : Quand on signale une toilette 3 fois, un message indique qu'elle est "masquée". Cependant, elle n'est masquée que *visuellement* dans l'instant T. Au prochain rafraîchissement, elle réapparaît.

### 3. Ajout de Toilette sans Nom
- **Problème** : Lors d'un clic sur la carte, on peut ouvrir le tiroir d'ajout et cliquer sur "Enregistrer le trône" sans même remplir le nom. Le formulaire l'accepte et crée un marqueur vide sur la carte. (Il manque un attribut `required` sur l'input).

### 4. Badges du Profil non liés
- **Problème** : Dans la vue Profil, quatre badges sont affichés. Les deux premiers ("Premier Explorateur" et "Aventurier Sanitaire") se basent sur des compteurs locaux, mais le badge "Chasseur de Trésors" cherche une variable `toilets` dans l'utilisateur qui n'existe pas dans le code, et le badge "Globe-Trotteur" n'a aucune logique qui lui est rattachée. Ils sont donc soit inatteignables, soit ignorés, et cliquer dessus ne fait rien.

---

## 🚫 Boutons "Morts" ou Inactifs

### 1. Bouton "S'inscrire" (Création de compte)
- **Oubli de ma part !** Sur la page de connexion, le lien "Pas encore de compte ? S'inscrire" affiche simplement une alerte navigateur `Inscription bientôt disponible !`. Il n'y a pas encore de vue ou de formulaire dédié pour créer un compte.

### 2. Bouton "Paramètres" (Roue crantée Profil)
- L'icône de paramètres dans la vue Profil n'a pas encore été codée dans le HTML. On ne peut donc rien configurer.

### 3. Encart "Classement Hebdo" (Profil)
- Dans la vue Profil, la section "Classement Hebdo" affiche des données statiques codées en dur dans le HTML (ex: "Top 5% de votre ville"). Cet encart n'est lié à aucune logique JavaScript et ne sert à rien à date.

### 4. Partage de Toilette (Share)
- Si tu avais prévu un bouton pour "Partager cette toilette à un ami" dans la fiche détails, il n'existe pas encore.

---

## ✅ Ce qui fonctionne parfaitement

- **Navigation (Bottom Bar)** : Les onglets Carte, Profil et Modération réagissent instantanément.
- **Ajout de Toilette (Flux principal)** : Clic sur carte -> Animation marqueur -> Tiroir -> Formulaire -> Validation -> Son de chasse d'eau -> Apparition du vrai marqueur. C'est parfait.
- **Ajout d'Avis** : Les sliders mettent bien à jour la moyenne et l'avis s'ajoute bien à la liste locale.
- **Mode Modérateur** : Le badge modérateur ("Activer le mode") affiche bien le panel d'alerte et la vue cachée.
- **Bouton SOS 💩** : Centre bien la carte sur la toilette la plus proche avec une petite animation.
- **Notifications (Toasts)** : Depuis notre dernière correction CSS, ils s'affichent et disparaissent correctement, et on peut les fermer avec la croix.

---

> [!IMPORTANT]
> Conclusion : Les seuls "vrais" bugs à corriger rapidement avant l'intégration de la vraie base de données sont la validation du formulaire (empêcher l'ajout sans nom) et potentiellement revoir la logique du bouton "Réinitialiser" pour qu'il soit moins confus.
