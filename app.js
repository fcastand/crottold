import { AudioSystem } from './audio.js';
import { AppState } from './state.js';
import { MapSystem } from './map.js';
import { DrawerSystem } from './drawer.js';
import { RouteSystem } from './router.js';

// 7. IN-APP INTERACTIONS & FLOW HANDLERS
export const FlowHandlers = {
  init() {
    // A. SPLASH SCREEN AUTO LOADING SIMULATION
    setTimeout(() => {
      // Auto trigger skip after 2.8s if user hasn't clicked
      const splash = document.getElementById('view-splash');
      if (splash.classList.contains('active')) {
        this.startExploring();
      }
    }, 2800);

    document.getElementById('btn-splash-skip').addEventListener('click', () => {
      this.startExploring();
    });

    // A0. LOGIN & LOGOUT HANDLERS
    document.getElementById('form-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username').value.trim();
      const roleInput = document.getElementById('login-role').value;
      if (usernameInput) {
        this.performLoadingSequence(usernameInput, false, roleInput);
      }
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      // Reset username, role and show login screen
      AppState.user.username = "Explorateur Anonyme";
      AppState.user.role = "user";
      AppState.saveUser();
      AppState.updateProfileUI();
      
      // Apply default role state to hide mod panels
      this.applyUserRole("user");
      
      // Reset inputs
      const usernameEl = document.getElementById('login-username');
      if (usernameEl) usernameEl.value = "";
      const roleEl = document.getElementById('login-role');
      if (roleEl) roleEl.value = "user";
      
      AudioSystem.play('warning');
      RouteSystem.switchView('view-login');
      AppState.showToast("🔒", "Vous vous êtes déconnecté.");
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm("Voulez-vous vraiment réinitialiser toutes les toilettes et les données de l'application ?")) {
        localStorage.clear();
        location.reload();
      }
    });

    // A1. MODERATOR DIRECT DELETE HANDLER
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

    // B. NAVIGATION EVENTS
    document.getElementById('nav-btn-map').addEventListener('click', (e) => {
      RouteSystem.switchView('view-map', e.currentTarget);
      DrawerSystem.closeAll();
    });

    document.getElementById('nav-btn-profile').addEventListener('click', (e) => {
      RouteSystem.switchView('view-profile', e.currentTarget);
      DrawerSystem.closeAll();
    });

    document.getElementById('nav-btn-moderation').addEventListener('click', (e) => {
      RouteSystem.switchView('view-moderation', e.currentTarget);
      DrawerSystem.closeAll();
      this.renderModerationPanel();
    });

    // C. TOP BAR BUTTONS
    document.getElementById('sound-toggle-btn').addEventListener('click', (e) => {
      AudioSystem.toggle(e.currentTarget);
    });

    document.getElementById('moderator-toggle-btn').addEventListener('click', (e) => {
      this.toggleModeratorMode(e.currentTarget);
    });

    // D. DRAWER ACTIONS
    document.getElementById('btn-close-details').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.close('drawer-toilet-details');
    });

    document.getElementById('btn-close-add-drawer').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.close('drawer-add-toilet');
    });

    document.getElementById('btn-cancel-add').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.close('drawer-add-toilet');
    });

    document.getElementById('btn-close-review-drawer').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.close('drawer-add-review');
    });

    document.getElementById('btn-cancel-review').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.close('drawer-add-review');
    });

    // E. TRIGGER FORMS
    document.getElementById('btn-add-toilet-trigger').addEventListener('click', () => {
      AudioSystem.play('click');
      this.openAddToiletFlow();
    });

    document.getElementById('btn-add-review-trigger').addEventListener('click', () => {
      AudioSystem.play('click');
      DrawerSystem.open('drawer-add-review');
    });

    // F. SUBMIT REVIEW FORM
    document.getElementById('form-add-review').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitReview();
    });

    // G. SUBMIT ADD TOILET FORM
    document.getElementById('form-add-toilet').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitNewToilet();
    });

    // H. REPORT ACTION
    document.getElementById('btn-report-toilet').addEventListener('click', () => {
      this.reportSelectedToilet();
    });

    // I. SOS EMERGENCY BUTTON
    document.getElementById('btn-sos-emergency').addEventListener('click', () => {
      this.triggerEmergencySOS();
    });

    // J. RANGE SLIDERS REAL-TIME UPDATES
    const bindRangeValue = (sliderId, badgeId) => {
      const slider = document.getElementById(sliderId);
      const badge = document.getElementById(badgeId);
      if (slider && badge) {
        badge.textContent = `${slider.value}%`;
        slider.addEventListener('input', (e) => {
          badge.textContent = `${e.target.value}%`;
        });
      }
    };
    bindRangeValue('range-add-cleanliness', 'val-add-cleanliness');
    bindRangeValue('range-add-comfort', 'val-add-comfort');
    bindRangeValue('range-add-access', 'val-add-access');
    bindRangeValue('range-rev-cleanliness', 'val-rev-cleanliness');
    bindRangeValue('range-rev-comfort', 'val-rev-comfort');
    bindRangeValue('range-rev-access', 'val-rev-access');
  },

  startExploring() {
    AudioSystem.play('click');
    RouteSystem.switchView('view-map');
    AppState.showToast("🧭", "Bienvenue sur CROTTOQ ! Bobby vous surveille de près.");
  },

  performLoadingSequence(username, isGuest, role = 'user') {
    // Switch to loader view
    RouteSystem.switchView('app-loading-overlay');

    const progressFill = document.querySelector('.loader-progress-fill');
    const statusTextEl = document.getElementById('loader-status-text');
    
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
        AppState.user.username = username;
        AppState.user.role = role;
        AppState.saveUser();
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

  applyUserRole(role) {
    const modBadgeBtn = document.getElementById('moderator-toggle-btn');
    const modNavBtn = document.getElementById('nav-btn-moderation');
    const modBadgeText = document.getElementById('mod-badge-text');

    if (role === 'moderator') {
      AppState.isModeratorMode = true;
      if (modBadgeBtn) {
        modBadgeBtn.style.display = 'flex';
        modBadgeBtn.classList.add('active');
      }
      if (modBadgeText) modBadgeText.textContent = "Modérateur";
      if (modNavBtn) {
        modNavBtn.classList.add('show-moderator');
      }
    } else {
      AppState.isModeratorMode = false;
      if (modBadgeBtn) {
        modBadgeBtn.style.display = 'none';
        modBadgeBtn.classList.remove('active');
      }
      if (modBadgeText) modBadgeText.textContent = "Visiteur";
      if (modNavBtn) {
        modNavBtn.classList.remove('show-moderator');
      }
      
      // If we are currently on moderation view, route back to map
      if (AppState.activeView === 'view-moderation') {
        RouteSystem.switchView('view-map');
      }
    }
    
    // Rerender markers to respect reported visibility filter
    MapSystem.renderMarkers();
  },

  toggleModeratorMode(btnElement) {
    AppState.isModeratorMode = !AppState.isModeratorMode;
    const badgeText = document.getElementById('mod-badge-text');
    const modNavBtn = document.getElementById('nav-btn-moderation');

    if (AppState.isModeratorMode) {
      AudioSystem.play('chime');
      btnElement.classList.add('active');
      badgeText.textContent = "Modérateur";
      modNavBtn.classList.add('show-moderator');
      AppState.showToast("🛡️", "Console de modération activée ! Bienvenue au conseil des sages.");
      
      // Auto route to mod panel to show it off
      RouteSystem.switchView('view-moderation');
      this.renderModerationPanel();
    } else {
      AudioSystem.play('click');
      btnElement.classList.remove('active');
      badgeText.textContent = "Visiteur";
      modNavBtn.classList.remove('show-moderator');
      
      // Route back to map if we were in mod view
      if (AppState.activeView === 'view-moderation') {
        RouteSystem.switchView('view-map');
      }
    }
    
    // Re-render markers (to hide/show reported ones based on view permission)
    MapSystem.renderMarkers();
  },

  openAddToiletFlow() {
    DrawerSystem.closeAll();
    
    // Simulate automatic GPS coordinates finding in Paris map center
    const center = AppState.map.getCenter();
    // Offset slightly for demo mark visualization
    const mockLat = center.lat + (Math.random() - 0.5) * 0.002;
    const mockLng = center.lng + (Math.random() - 0.5) * 0.002;
    
    // Save these temp coordinates on the form element dataset
    const form = document.getElementById('form-add-toilet');
    form.dataset.tempLat = mockLat;
    form.dataset.tempLng = mockLng;

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
      reports: 0,
      reviews: [
        {
          author: AppState.user.username || "Vous (Explorateur)",
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

    // Close form drawer
    DrawerSystem.close('drawer-add-toilet');

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

    const cleanliness = parseInt(document.getElementById('range-rev-cleanliness').value);
    const comfort = parseInt(document.getElementById('range-rev-comfort').value);
    const accessibility = parseInt(document.getElementById('range-rev-access').value);
    const comment = document.getElementById('input-review-comment').value;

    const avg = Math.round((cleanliness + comfort + accessibility) / 3);
    const grade = DrawerSystem.getHumorGrade(avg);

    const newReview = {
      author: AppState.user.username || "Vous (Explorateur)",
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
    AppState.user.ratedCount++;
    AppState.addXP(25, "Avis enregistré ! Bobby adore vos retours.");
    
    // Play flush or success sound
    AudioSystem.play('click');
  },

  reportSelectedToilet() {
    if (!AppState.selectedToilet) return;

    AppState.selectedToilet.reports = (AppState.selectedToilet.reports || 0) + 1;
    AppState.saveToilets();
    AudioSystem.play('warning');

    if (AppState.selectedToilet.reports >= 3) {
      AppState.showToast("⚠️", "Toilette masquée aux visiteurs en raison de signalements excessifs !");
      DrawerSystem.close('drawer-toilet-details');
      MapSystem.renderMarkers();
    } else {
      AppState.showToast("🚨", `Signalement enregistré ! (${AppState.selectedToilet.reports}/3 signalements)`);
      DrawerSystem.openToiletDetails(AppState.selectedToilet); // Refresh view
    }
  },

  triggerEmergencySOS() {
    AudioSystem.play('fart');

    // Find closest toilet to map center
    const center = AppState.map.getCenter();
    let closest = null;
    let minDistance = Infinity;

    AppState.toilets.forEach(toilet => {
      // Exclude heavily reported ones
      if (toilet.reports >= 3) return;

      const dx = toilet.lat - center.lat;
      const dy = toilet.lng - center.lng;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        minDistance = dist;
        closest = toilet;
      }
    });

    if (closest) {
      // Zoom and center map to coordinates
      AppState.map.setView([closest.lat, closest.lng], 17);
      
      // Highlight toilet marker and open details sheet
      setTimeout(() => {
        DrawerSystem.openToiletDetails(closest);
        AppState.showToast("🏃💨", "Bobby a localisé le trône le plus proche ! Filez !");
      }, 500);
    }
  },

  // MODERATION ACTIONS
  renderModerationPanel() {
    const list = document.getElementById('moderation-reports-list');
    list.innerHTML = '';

    const reportedToilets = AppState.toilets.filter(t => t.reports > 0);
    document.getElementById('mod-reported-count').textContent = reportedToilets.length;

    if (reportedToilets.length === 0) {
      list.innerHTML = '<div style="background:var(--white); border-radius:var(--radius-sm); border:1px solid var(--light-border); padding:2rem 1rem; text-align:center; color:var(--grey-text); font-size:0.8rem;"><i class="fa-regular fa-face-smile" style="font-size:2rem; display:block; margin-bottom:0.5rem; color:var(--primary-color);"></i>Tout est propre ! Aucun signalement actif.</div>';
      return;
    }

    reportedToilets.forEach(toilet => {
      const card = document.createElement('div');
      card.className = 'mod-report-card';
      card.innerHTML = `
        <div class="mod-report-header">
          <span class="mod-toilet-title">${toilet.name}</span>
          <span class="mod-report-count">${toilet.reports} signalements</span>
        </div>
        <p class="mod-report-reason">Dernier avis : "${toilet.comment}"</p>
        <div class="mod-actions-row">
          <button class="mod-btn-keep" data-id="${toilet.id}">Rejeter l'alerte</button>
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
  const initialRole = AppState.user && AppState.user.role ? AppState.user.role : "user";
  FlowHandlers.applyUserRole(initialRole);

  // Pre-fill username and role if exists
  if (AppState.user && AppState.user.username && AppState.user.username !== "Explorateur Anonyme" && AppState.user.username !== "Grand Explorateur") {
    const loginUserEl = document.getElementById('login-username');
    if (loginUserEl) {
      loginUserEl.value = AppState.user.username;
    }
    const loginRoleEl = document.getElementById('login-role');
    if (loginRoleEl && AppState.user.role) {
      loginRoleEl.value = AppState.user.role;
    }
  }
});
