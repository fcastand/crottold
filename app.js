import { AudioSystem } from './audio.js';
import { AppState, escapeHTML } from './state.js';
import { DOM } from './dom.js';
import { MapSystem } from './map.js';
import { DrawerSystem } from './drawer.js';
import { RouteSystem } from './router.js';

// 7. IN-APP INTERACTIONS & FLOW HANDLERS
export const FlowHandlers = {
  init() {
    this._initSplash();
    this._initAuthHandlers();
    this._initNavHandlers();
    this._initTopBarHandlers();
    this._initDrawerHandlers();
    this._initFormHandlers();
    this._initRangeHandlers();
    this._initInactiveButtonsHandlers();
  },

  // -----------------------------------------------------------------------
  // INIT — Sous-méthodes privées
  // -----------------------------------------------------------------------
  _initSplash() {
    setTimeout(() => {
      const splash = document.getElementById('view-splash');
      if (splash.classList.contains('active')) this.startExploring();
    }, 2800);
    document.getElementById('btn-splash-skip').addEventListener('click', () => this.startExploring());
    document.addEventListener('map:addToilet', (e) => {
      const { lat, lng } = e.detail;
      this.openAddToiletFlow(lat, lng);
    });
  },

  _initAuthHandlers() {
    // Login hybride
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username').value.trim();
      const passwordInput = document.getElementById('login-password').value;

      if (!usernameInput) return;
      
      const result = await AppState.loginAccount(usernameInput, passwordInput);
      
      if (result.success) {
        this.performLoadingSequence(result.username, false, result.role);
      } else {
        document.getElementById('login-password').parentElement.parentElement.classList.add('input-error');
        AppState.showToast('🔒', result.error === "user_not_found" ? "Ce compte n'existe pas." : result.error);
      }
    });
    // Navigation register ↔ login
    document.getElementById('btn-go-register').addEventListener('click', () => RouteSystem.switchView('view-register'));
    document.getElementById('btn-go-login').addEventListener('click', () => RouteSystem.switchView('view-login'));
    // Inscription
    document.getElementById('input-reg-password').addEventListener('input', () => this.updatePasswordStrength());
    document.getElementById('form-register').addEventListener('submit', (e) => { e.preventDefault(); this.submitRegister(); });
    // Déconnexion
    document.getElementById('btn-logout').addEventListener('click', () => {
      AppState.auth.username = 'Explorateur Anonyme';
      AppState.auth.role = 'user';
      AppState.saveAuth();
      AppState.updateProfileUI();
      this.applyUserRole('user');
      const usernameEl = document.getElementById('login-username');
      if (usernameEl) usernameEl.value = '';

      AudioSystem.play('warning');
      RouteSystem.switchView('view-login');
      AppState.showToast('🔒', 'Vous vous êtes déconnecté.');
    });
  },

  _initNavHandlers() {
    document.getElementById('nav-btn-map').addEventListener('click', (e) => {
      RouteSystem.switchView('view-map', e.currentTarget); DrawerSystem.closeAll();
    });
    document.getElementById('nav-btn-profile').addEventListener('click', (e) => {
      RouteSystem.switchView('view-profile', e.currentTarget); DrawerSystem.closeAll();
    });
    document.getElementById('nav-btn-moderation').addEventListener('click', (e) => {
      RouteSystem.switchView('view-moderation', e.currentTarget);
      DrawerSystem.closeAll();
      this.renderModerationPanel();
    });
    const deleteDirectBtn = document.getElementById('btn-delete-toilet-direct');
    if (deleteDirectBtn) {
      deleteDirectBtn.addEventListener('click', () => {
        if (AppState.selectedToilet) {
          if (confirm(`Voulez-vous vraiment supprimer définitivement "${AppState.selectedToilet.name}" ?`)) {
            this.deleteToilet(AppState.selectedToilet.id);
            DrawerSystem.close('drawer-toilet-details');
          }
        }
      });
    }
  },

  _initTopBarHandlers() {
    document.getElementById('sound-toggle-btn').addEventListener('click', (e) => AudioSystem.toggle(e.currentTarget));
    document.getElementById('moderator-toggle-btn').addEventListener('click', () => this.toggleModeratorMode());
  },

  _initDrawerHandlers() {
    document.getElementById('btn-close-details').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.close('drawer-toilet-details'); });
    document.getElementById('btn-close-add-drawer').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.close('drawer-add-toilet'); MapSystem.removeTempMarker(); });
    document.getElementById('btn-cancel-add').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.close('drawer-add-toilet'); MapSystem.removeTempMarker(); });
    document.getElementById('btn-close-review-drawer').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.close('drawer-add-review'); });
    document.getElementById('btn-cancel-review').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.close('drawer-add-review'); });
    document.getElementById('btn-add-review-trigger').addEventListener('click', () => { AudioSystem.play('click'); DrawerSystem.open('drawer-add-review'); });
  },

  _initFormHandlers() {
    document.getElementById('form-add-review').addEventListener('submit', (e) => { e.preventDefault(); this.submitReview(); });
    document.getElementById('form-add-toilet').addEventListener('submit', (e) => { e.preventDefault(); this.submitNewToilet(); });
    document.getElementById('btn-report-toilet').addEventListener('click', () => this.reportSelectedToilet());
    document.getElementById('btn-sos-emergency').addEventListener('click', () => this.triggerEmergencySOS());
  },

  _initRangeHandlers() {
    const bind = (sliderId, badgeId) => {
      const slider = document.getElementById(sliderId);
      const badge  = document.getElementById(badgeId);
      if (slider && badge) {
        badge.textContent = `${slider.value}%`;
        slider.addEventListener('input', (e) => { badge.textContent = `${e.target.value}%`; });
      }
    };
    bind('range-add-cleanliness', 'val-add-cleanliness');
    bind('range-add-comfort',     'val-add-comfort');
    bind('range-add-access',      'val-add-access');
    bind('range-rev-cleanliness', 'val-rev-cleanliness');
    bind('range-rev-comfort',     'val-rev-comfort');
    bind('range-rev-access',      'val-rev-access');
  },

  _initInactiveButtonsHandlers() {
    const showComingSoonToast = () => {
      AudioSystem.play('click');
      AppState.showToast('🚧', 'Fonctionnalité en cours de développement !');
    };

    if (DOM.btnShareToilet) {
      DOM.btnShareToilet.addEventListener('click', showComingSoonToast);
    }
    if (DOM.btnProfileSettings) {
      DOM.btnProfileSettings.addEventListener('click', showComingSoonToast);
    }
    if (DOM.leaderboardSection) {
      // Pour le leaderboard, on capte le clic sur la section entière
      DOM.leaderboardSection.addEventListener('click', showComingSoonToast);
      DOM.leaderboardSection.style.cursor = 'pointer';
    }
  },

  startExploring() {
    AudioSystem.play('click');
    RouteSystem.switchView('view-map');
    AppState.showToast("🧭", "Bienvenue sur CROTTOQ ! Bobby vous surveille de près.");
  },

  // -----------------------------------------------------------------------
  // REGISTER — Barre de robustesse MDP
  // -----------------------------------------------------------------------
  updatePasswordStrength() {
    const pwd = document.getElementById('input-reg-password').value;
    const fill = document.getElementById('reg-strength-fill');
    const submitBtn = document.getElementById('btn-register-submit');

    const rules = {
      length:  pwd.length >= 8,
      upper:   /[A-Z]/.test(pwd),
      number:  /[0-9]/.test(pwd),
      special: /[!@#$%^&*_\-]/.test(pwd)
    };

    // Mise à jour checklist
    const setRule = (id, ok) => {
      const li = document.getElementById(`rule-${id}`);
      if (!li) return;
      const icon = li.querySelector('i');
      if (ok) {
        li.classList.add('rule-ok');
        icon.className = 'fa-solid fa-circle-check';
      } else {
        li.classList.remove('rule-ok');
        icon.className = 'fa-solid fa-circle-xmark';
      }
    };
    setRule('length',  rules.length);
    setRule('upper',   rules.upper);
    setRule('number',  rules.number);
    setRule('special', rules.special);

    // Score
    const score = Object.values(rules).filter(Boolean).length;

    // Barre de force
    fill.className = 'password-strength-fill';
    if (score > 0) fill.classList.add(`strength-${score}`);

    // Activer le bouton submit si score >= 3
    submitBtn.disabled = score < 3;
  },

  // -----------------------------------------------------------------------
  // REGISTER — Soumission du formulaire
  // -----------------------------------------------------------------------
  async submitRegister() {
    const username  = document.getElementById('input-reg-username').value.trim();
    const birthdate = document.getElementById('input-reg-birthdate').value;
    const password  = document.getElementById('input-reg-password').value;
    const confirm   = document.getElementById('input-reg-confirm').value;

    // Helpers d'erreur
    const setError = (fieldId, errId, msg) => {
      const field = document.getElementById(fieldId);
      const err   = document.getElementById(errId);
      if (msg) {
        field.parentElement.classList.add('input-error');
        err.textContent = msg;
      } else {
        field.parentElement.classList.remove('input-error');
        err.textContent = '';
      }
    };

    // Réinitialise toutes les erreurs
    setError('input-reg-username',  'error-reg-username',  '');
    setError('input-reg-birthdate', 'error-reg-birthdate', '');
    setError('input-reg-password',  'error-reg-password',  '');
    setError('input-reg-confirm',   'error-reg-confirm',   '');

    let valid = true;

    if (!username) {
      setError('input-reg-username', 'error-reg-username', 'Le pseudo est obligatoire.');
      valid = false;
    }
    if (!birthdate) {
      setError('input-reg-birthdate', 'error-reg-birthdate', 'La date de naissance est obligatoire.');
      valid = false;
    }
    if (password !== confirm) {
      setError('input-reg-confirm', 'error-reg-confirm', 'Les mots de passe ne correspondent pas.');
      valid = false;
    }
    if (!valid) return;

    // Appel à AppState (vérifie doublon + API)
    const result = await AppState.registerAccount({ username, birthdate, password, role: 'user' });

    if (!result.success) {
      if (result.error.includes('pseudo')) {
        setError('input-reg-username', 'error-reg-username', result.error);
      } else if (result.error.includes('majeur')) {
        setError('input-reg-birthdate', 'error-reg-birthdate', result.error);
      } else {
        AppState.showToast('⚠️', result.error);
      }
      return;
    }

    // Succès !
    AudioSystem.play('chime');
    AppState.showToast('🎉', `Compte créé pour ${username} ! Connecte-toi maintenant.`);
    RouteSystem.switchView('view-login');

    // Pré-remplir le pseudo dans le formulaire de login
    const loginUsernameEl = document.getElementById('login-username');
    if (loginUsernameEl) loginUsernameEl.value = username;
  },

  performLoadingSequence(username, isGuest, role = 'user') {
    // Switch to loader view
    RouteSystem.switchView('app-loading-overlay');

    const progressFill  = DOM.loaderProgressFill;
    const statusTextEl  = DOM.loaderStatusText;
    
    // Reset progress fill
    if (progressFill) progressFill.style.width = '0%';

    // Funny messages list
    const messages = [
      "Vérification du stock de papier... 🧻",
      "Nettoyage de la lunette... 🧼",
      "Bobby prépare votre trône... 👑",
      "Chargement de la carte des WC... 🗺️"
    ];

    let currentMsgIndex = 0;
    if (statusTextEl) statusTextEl.textContent = messages[0];

    // Change message every 600ms
    const msgInterval = setInterval(() => {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
      if (statusTextEl) statusTextEl.textContent = messages[currentMsgIndex];
    }, 600);

    // Simulate progress bar filling up over 2.4 seconds
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 4;
      if (progressFill) {
        progressFill.style.width = `${Math.min(progress, 100)}%`;
      }

      if (progress >= 100) {
        clearInterval(progressInterval);
        clearInterval(msgInterval);

        // Finalize login user details
        AppState.auth.username = username;
        AppState.auth.role = role;
        AppState.saveAuth();
        AppState.updateProfileUI();

        // Apply visual elements of role
        this.applyUserRole(role);

        if (isGuest) {
          AudioSystem.play('click');
          RouteSystem.switchView('view-map');
          AppState.showToast("👤", "Mode invité activé. Bon voyage !");
        } else {
          AudioSystem.play('chime');
          RouteSystem.switchView('view-map');
          if (role === 'moderator') {
            AppState.showToast("🛡️", `Modérateur connecté ! Bonjour @${username}.`);
          } else {
            AppState.showToast("🔓", `Connexion réussie ! Bonjour @${username}.`);
          }
        }
      }
    }, 96); // 25 steps * 96ms = 2400ms
  },

  // Méthode partagée — applique l'UI modérateur sans duplication
  _setModeratorUI(active) {
    const modBadgeBtn  = DOM.moderatorToggleBtn;
    const modNavBtn    = DOM.navBtnModeration;
    const modBadgeText = DOM.modBadgeText;
    AppState.isModeratorMode = active;
    if (active) {
      if (modBadgeBtn)  { modBadgeBtn.style.display = 'flex'; modBadgeBtn.classList.add('active'); }
      if (modBadgeText) modBadgeText.textContent = 'Modérateur';
      if (modNavBtn)    modNavBtn.classList.add('show-moderator');
    } else {
      if (modBadgeBtn)  { modBadgeBtn.style.display = 'none'; modBadgeBtn.classList.remove('active'); }
      if (modBadgeText) modBadgeText.textContent = 'Visiteur';
      if (modNavBtn)    modNavBtn.classList.remove('show-moderator');
      if (AppState.activeView === 'view-moderation') RouteSystem.switchView('view-map');
    }
    MapSystem.renderMarkers();
  },

  applyUserRole(role) {
    this._setModeratorUI(role === 'moderator');
  },

  toggleModeratorMode() {
    const newActive = !AppState.isModeratorMode;
    this._setModeratorUI(newActive);
    if (newActive) {
      AudioSystem.play('chime');
      AppState.showToast('🛡️', 'Console de modération activée ! Bienvenue au conseil des sages.');
      RouteSystem.switchView('view-moderation');
      this.renderModerationPanel();
    } else {
      AudioSystem.play('click');
    }
  },

  openAddToiletFlow(lat, lng) {
    DrawerSystem.closeAll();

    // Use provided coordinates (from map click) directly
    const form = document.getElementById('form-add-toilet');
    form.dataset.tempLat = lat;
    form.dataset.tempLng = lng;

    // Reset inputs
    form.reset();
    document.getElementById('val-add-cleanliness').textContent = "50%";
    document.getElementById('val-add-comfort').textContent = "50%";
    document.getElementById('val-add-access').textContent = "50%";

    DrawerSystem.open('drawer-add-toilet');
  },

  submitNewToilet() {
    const form = document.getElementById('form-add-toilet');
    const name = document.getElementById('input-toilet-name').value;
    const price = document.getElementById('select-price').value;
    const access = document.getElementById('select-access').value;
    const pmr = document.getElementById('check-pmr').checked;
    const mixed = document.getElementById('check-mixed').checked;
    const paper = document.getElementById('check-paper').checked;
    
    const cleanliness = parseInt(document.getElementById('range-add-cleanliness').value);
    const comfort = parseInt(document.getElementById('range-add-comfort').value);
    const accessibility = parseInt(document.getElementById('range-add-access').value);
    const comment = document.getElementById('input-comment').value || "Aucun commentaire supplémentaire.";
    
    const lat = parseFloat(form.dataset.tempLat);
    const lng = parseFloat(form.dataset.tempLng);

    const avg = Math.round((cleanliness + comfort + accessibility) / 3);
    const grade = DrawerSystem.getHumorGrade(avg);

    const newToilet = {
      id: `toilet_${Date.now()}`,
      name: name,
      lat: lat,
      lng: lng,
      price: price,
      access: access,
      pmr: pmr,
      mixed: mixed,
      paper: paper,
      cleanliness: cleanliness,
      comfort: comfort,
      accessibility: accessibility,
      comment: comment,
      author: AppState.auth.username || "Vous (Explorateur)",
      reports: 0,
      reviews: [
        {
          author: AppState.auth.username || "Vous (Explorateur)",
          grade: grade,
          cleanliness: cleanliness,
          comfort: comfort,
          accessibility: accessibility,
          text: comment
        }
      ]
    };

    AppState.addToilet(newToilet);
    MapSystem.renderMarkers();

    // Close form drawer & remove temp marker
    DrawerSystem.close('drawer-add-toilet');
    MapSystem.removeTempMarker();

    // Pan map to new toilet
    AppState.map.panTo([lat, lng]);

    // Play toilet flush sound effect
    AudioSystem.play('flush');

    // 🎉 Show victory animation
    this.showToiletSuccessAnimation();
  },

  showToiletSuccessAnimation() {
    const overlay = document.getElementById('toilet-success-overlay');
    if (!overlay) return;

    // Reset state before re-triggering
    overlay.classList.remove('active', 'hiding');
    // Force reflow so animations restart cleanly
    void overlay.offsetWidth;

    // Show overlay
    overlay.classList.add('active');

    // Auto-dismiss after 2.2s
    setTimeout(() => {
      overlay.classList.add('hiding');
      overlay.addEventListener('animationend', () => {
        overlay.classList.remove('active', 'hiding');
      }, { once: true });
    }, 2200);
  },

  submitReview() {
    if (!AppState.selectedToilet) return;

    const cleanliness   = parseInt(document.getElementById('range-rev-cleanliness').value);
    const comfort       = parseInt(document.getElementById('range-rev-comfort').value);
    const accessibility = parseInt(document.getElementById('range-rev-access').value);
    const comment       = document.getElementById('input-review-comment').value.trim();

    // Guard — commentaire vide refusé
    if (!comment) {
      AppState.showToast('\u26a0\ufe0f', 'Merci d\'ajouter un commentaire avant de publier.');
      return;
    }

    const avg = Math.round((cleanliness + comfort + accessibility) / 3);
    const grade = DrawerSystem.getHumorGrade(avg);

    const newReview = {
      author: AppState.auth.username || "Vous (Explorateur)",
      grade: grade,
      cleanliness: cleanliness,
      comfort: comfort,
      accessibility: accessibility,
      text: comment
    };

    // Push review and recalculate average rating
    AppState.selectedToilet.reviews = AppState.selectedToilet.reviews || [];
    AppState.selectedToilet.reviews.unshift(newReview);
    
    // Recalculate average values across all reviews
    let totalClean = 0;
    let totalComfort = 0;
    let totalAccess = 0;
    
    AppState.selectedToilet.reviews.forEach(r => {
      totalClean += typeof r.cleanliness === 'number' ? r.cleanliness : AppState.selectedToilet.cleanliness;
      totalComfort += typeof r.comfort === 'number' ? r.comfort : AppState.selectedToilet.comfort;
      totalAccess += typeof r.accessibility === 'number' ? r.accessibility : AppState.selectedToilet.accessibility;
    });

    const count = AppState.selectedToilet.reviews.length;
    AppState.selectedToilet.cleanliness = Math.round(totalClean / count);
    AppState.selectedToilet.comfort = Math.round(totalComfort / count);
    AppState.selectedToilet.accessibility = Math.round(totalAccess / count);

    AppState.saveToilets();

    // Close review drawer and reset sliders
    DrawerSystem.close('drawer-add-review');
    document.getElementById('form-add-review').reset();
    document.getElementById('val-rev-cleanliness').textContent = "50%";
    document.getElementById('val-rev-comfort').textContent = "50%";
    document.getElementById('val-rev-access').textContent = "50%";
    
    // Update active details drawer view
    DrawerSystem.openToiletDetails(AppState.selectedToilet);

    // Add XP
    AppState.profile.ratedCount++;
    AppState.addXP(20, "Avis utile ! 🌟");
    AppState.saveProfile();
    
    // Play flush or success sound
    AudioSystem.play('click');
  },

  reportSelectedToilet() {
    if (!AppState.selectedToilet) return;

    AppState.selectedToilet.reports = (AppState.selectedToilet.reports || 0) + 1;
    AppState.saveToilets();
    AudioSystem.play('warning');

    if (AppState.selectedToilet.reports >= 3) {
      AppState.selectedToilet.hidden = true; // Rendre le signalement persistant
      AppState.saveToilets();
      AppState.showToast("🛑", "Ce trône a reçu trop de signalements et a été masqué pour vérification.");
      DrawerSystem.close('drawer-toilet-details');
      MapSystem.renderMarkers();
    } else {
      AppState.showToast("🚨", `Signalement enregistré ! (${AppState.selectedToilet.reports}/3 signalements)`);
      DrawerSystem.openToiletDetails(AppState.selectedToilet); // Refresh view
    }
  },

  triggerEmergencySOS() {
    AudioSystem.play('fart');

    // Use real GPS position if available, else fall back to map center
    const ref = AppState.userPosition || AppState.map.getCenter();

    let closest = null;
    let minDistance = Infinity;

    AppState.toilets.forEach(toilet => {
      if (toilet.reports >= 3) return; // Skip heavily reported ones

      const dist = MapSystem.haversineDistance(ref.lat, ref.lng, toilet.lat, toilet.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = toilet;
      }
    });

    if (closest) {
      AppState.map.setView([closest.lat, closest.lng], 17);

      const distanceLabel = AppState.userPosition
        ? (minDistance < 1
            ? `à ${Math.round(minDistance * 1000)}m de vous`
            : `à ${minDistance.toFixed(1)}km de vous`)
        : 'le plus proche sur la carte';

      setTimeout(() => {
        DrawerSystem.openToiletDetails(closest);
        AppState.showToast("🏃💨", `Bobby a trouvé \"${closest.name}\" — ${distanceLabel} !`);
      }, 500);
    } else {
      AppState.showToast("😰", "Aucune toilette disponible à proximité !");
    }
  },


  // MODERATION ACTIONS
  renderModerationPanel() {
    const list = document.getElementById('moderation-reports-list');
    list.innerHTML = '';

    const reportedToilets = AppState.toilets.filter(t => t.reports > 0);
    document.getElementById('mod-reported-count').textContent = reportedToilets.length;

    if (reportedToilets.length === 0) {
      list.innerHTML = '<div class="mod-empty-state"><i class="fa-regular fa-face-smile"></i>Tout est propre ! Aucun signalement actif.</div>';
      return;
    }

    reportedToilets.forEach(toilet => {
      const card = document.createElement('div');
      card.className = 'mod-report-card';
      card.innerHTML = `
        <div class="mod-report-header">
          <span class="mod-toilet-title">${escapeHTML(toilet.name)}</span>
          <span class="mod-report-count">${toilet.reports} signalements</span>
        </div>
        <p class="mod-report-reason">Dernier avis : "${escapeHTML(toilet.comment)}"</p>
        <div class="mod-actions-row">
          <button class="mod-btn-keep" data-id="${toilet.id}">Rejeter l'alerte</button>
          <button class="btn-warn-user" onclick="alert('Avertissement envoyé à cet utilisateur !')">Avertir</button>
          <button class="mod-btn-delete" data-id="${toilet.id}">Supprimer le WC</button>
        </div>
      `;

      // Actions bindings
      card.querySelector('.mod-btn-keep').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.keepToilet(id);
      });

      card.querySelector('.mod-btn-delete').addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.deleteToilet(id);
      });

      list.appendChild(card);
    });
  },

  keepToilet(id) {
    const toilet = AppState.toilets.find(t => t.id === id);
    if (toilet) {
      toilet.reports = 0;
      AppState.saveToilets();
      AudioSystem.play('click');
      AppState.showToast("🛡️", `Alertes rejetées pour "${toilet.name}".`);
      this.renderModerationPanel();
      MapSystem.renderMarkers();
    }
  },

  deleteToilet(id) {
    const toiletIdx = AppState.toilets.findIndex(t => t.id === id);
    if (toiletIdx !== -1) {
      const name = AppState.toilets[toiletIdx].name;
      AppState.toilets.splice(toiletIdx, 1);
      AppState.saveToilets();
      AudioSystem.play('flush'); // Toilet flush sound on delete
      AppState.showToast("🧹", `"${name}" a été définitivement supprimé.`);
      this.renderModerationPanel();
      MapSystem.renderMarkers();
    }
  }
};

// 8. STARTUP INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  MapSystem.init();
  FlowHandlers.init();
  AppState.updateProfileUI();

  // Apply saved role or default role on startup
  const loginUserEl = DOM.loginUsername;
  const loginRoleEl = DOM.loginRole;
  const initialRole = AppState.auth && AppState.auth.role ? AppState.auth.role : "user";
  FlowHandlers.applyUserRole(initialRole);

  if (loginUserEl && AppState.auth && AppState.auth.username && AppState.auth.username !== "Explorateur Anonyme" && AppState.auth.username !== "Grand Explorateur") {
    loginUserEl.value = AppState.auth.username;
  }
  if (loginRoleEl && AppState.auth && AppState.auth.role) {
    loginRoleEl.value = AppState.auth.role;
  }

});
