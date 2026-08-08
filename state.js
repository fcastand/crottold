import { AudioSystem } from './audio.js';
import { DOM } from './dom.js';

// Module-level timer so it's never lost regardless of `this` context
let _toastTimer = null;

export const DEFAULT_TOILETS = [
  {
    id: "toilet_1",
    name: "Les TrÃ´nes du Louvre",
    lat: 48.8606,
    lng: 2.3376,
    price: "gratuit",
    access: "limite",
    pmr: true,
    mixed: true,
    paper: true,
    cleanliness: 90,
    comfort: 80,
    accessibility: 100,
    comment: "AccÃ¨s propre via la galerie marchande du Louvre. TrÃ¨s chic !",
    reports: 0,
    reviews: [
      { author: "Chasseur_de_WC", grade: "TrÃ´ne royal ðŸ‘‘", cleanliness: 100, comfort: 80, accessibility: 100, text: "Papier triple Ã©paisseur. Un vrai rÃ©gal !" },
      { author: "Marie_Coincoin", grade: "Pause parfaite âœ¨", cleanliness: 80, comfort: 80, accessibility: 100, text: "Propre, savon disponible, pas d'attente." }
    ]
  },
  {
    id: "toilet_2",
    name: "WC Publics Square Saint-Jacques",
    lat: 48.8572,
    lng: 2.3488,
    price: "gratuit",
    access: "public",
    pmr: true,
    mixed: false,
    paper: false,
    cleanliness: 60,
    comfort: 60,
    accessibility: 80,
    comment: "Toilettes publiques municipales gratuites. PropretÃ© moyenne.",
    reports: 0,
    reviews: [
      { author: "Marc_Le_Rapide", grade: "Correct ðŸ†—", cleanliness: 60, comfort: 60, accessibility: 80, text: "Fait le job mais pas de papier. PrÃ©voyez vos mouchoirs." }
    ]
  },
  {
    id: "toilet_3",
    name: "Urgence Rue de Rivoli",
    lat: 48.8588,
    lng: 2.3422,
    price: "payant",
    access: "public",
    pmr: false,
    mixed: true,
    paper: true,
    cleanliness: 40,
    comfort: 40,
    accessibility: 40,
    comment: "Accessible mais l'odeur laisse Ã  dÃ©sirer. Utile la nuit.",
    reports: 2, // Mocked reports to showcase moderation immediately
    reviews: [
      { author: "Bobby_Fan", grade: "Survie nÃ©cessaire âš ï¸", cleanliness: 40, comfort: 40, accessibility: 40, text: "Une odeur tenace, mais c'est le seul ouvert Ã  cette heure." }
    ]
  },
  {
    id: "toilet_4",
    name: "Les Chiottes MystÃ¨res de ChÃ¢telet",
    lat: 48.8595,
    lng: 2.3475,
    price: "gratuit",
    access: "public",
    pmr: false,
    mixed: true,
    paper: false,
    cleanliness: 20,
    comfort: 20,
    accessibility: 40,
    comment: "L'eau n'Ã©vacue plus et le distributeur de papier est dÃ©truit !",
    reports: 3,
    reviews: [
      { author: "Chasseur_FÃ¢chÃ©", grade: "Zone Ã  Ã©viter ðŸ¤¢", cleanliness: 20, comfort: 20, accessibility: 40, text: "InondÃ©, fuyez !" }
    ]
  },
  {
    id: "toilet_5",
    name: "WC Tuileries MutilÃ©s",
    lat: 48.8635,
    lng: 2.3275,
    price: "payant",
    access: "public",
    pmr: true,
    mixed: true,
    paper: true,
    cleanliness: 40,
    comfort: 40,
    accessibility: 80,
    comment: "Toilettes payantes mais fermÃ©es pour travaux sans indications.",
    reports: 1,
    reviews: [
      { author: "Marie_Coincoin", grade: "Survie nÃ©cessaire âš ï¸", cleanliness: 40, comfort: 40, accessibility: 80, text: "FermÃ© par une grille mÃ©tallique aujourd'hui." }
    ]
  }
];

// Utilitaire XSS â€” Ã©chappe les caractÃ¨res HTML dangereux avant insertion dans innerHTML
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 3. APPLICATION STATE
export const AppState = {
  toilets: [],
  auth: {
    username: "Explorateur Anonyme",
    role: "user"
  },
  profile: {
    level: 2,
    xp: 350,
    addedCount: 1,
    ratedCount: 1
  },
  selectedToilet: null,
  tempMarker: null,
  map: null,
  markersGroup: null,
  userMarker: null,
  userPosition: null,
  isModeratorMode: false,
  activeView: 'view-map',

  init() {
    // Load from localStorage or initialize defaults
    const savedToilets = localStorage.getItem('crottold_toilets');
    if (savedToilets) {
      this.toilets = JSON.parse(savedToilets);
      // Force refresh if the test toilets are missing or if legacy 1-5 rating format is found
      const hasToilet4 = this.toilets.some(t => t.id === 'toilet_4');
      const isLegacy = this.toilets.some(t => t.cleanliness <= 5);
      if (!hasToilet4 || isLegacy) {
        this.toilets = [...DEFAULT_TOILETS];
        this.saveToilets();
      }
    } else {
      this.toilets = [...DEFAULT_TOILETS];
      this.saveToilets();
    }

    // Migration from old 'crottold_user' to separated 'crottold_auth' and 'crottold_profile'
    const savedLegacyUser = localStorage.getItem('crottold_user');
    if (savedLegacyUser) {
      const parsedLegacy = JSON.parse(savedLegacyUser);
      this.auth = { username: parsedLegacy.username || "Explorateur Anonyme", role: parsedLegacy.role || "user" };
      this.profile = { 
        level: parsedLegacy.level || 2, 
        xp: parsedLegacy.xp || 350, 
        addedCount: parsedLegacy.addedCount || 0, 
        ratedCount: parsedLegacy.ratedCount || 0 
      };
      this.saveAuth();
      this.saveProfile();
      localStorage.removeItem('crottold_user');
    } else {
      const savedAuth = localStorage.getItem('crottold_auth');
      if (savedAuth) this.auth = JSON.parse(savedAuth);
      
      const savedProfile = localStorage.getItem('crottold_profile');
      if (savedProfile) this.profile = JSON.parse(savedProfile);
    }
  },

  /**
   * CrÃ©e un nouveau compte (via API locale).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async registerAccount({ username, birthdate, password, role }) {
    // VÃ©rification majoritÃ© cÃ´tÃ© client (18 ans rÃ©volus)
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (age < 18) {
      return { success: false, error: 'Tu dois Ãªtre majeur(e) pour rejoindre CROTTOLD.' };
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, birthdate, password, role })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Erreur rÃ©seau avec le serveur local.' };
    }
  },

  /**
   * VÃ©rifie le compte (via API locale).
   * @returns {Promise<{ success: boolean, username?: string, role?: string, error?: string }>}
   */
  async loginAccount(username, password) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: 'Erreur rÃ©seau avec le serveur local.' };
    }
  },

  saveToilets() {
    localStorage.setItem('crottold_toilets', JSON.stringify(this.toilets));
  },

  saveAuth() {
    localStorage.setItem('crottold_auth', JSON.stringify(this.auth));
  },

  saveProfile() {
    localStorage.setItem('crottold_profile', JSON.stringify(this.profile));
    this.updateProfileUI();
  },

  addToilet(toilet) {
    this.toilets.push(toilet);
    this.saveToilets();
    this.profile.addedCount++;
    this.addXP(50, "Nouveau trÃ´ne enregistrÃ© ! ðŸ§»");
    this.saveProfile();
  },

  addXP(amount, reason) {
    this.profile.xp += amount;
    let leveledUp = false;
    
    // Simple level calculation (e.g. 500 XP per level)
    const newLevel = Math.floor(this.profile.xp / 500) + 1;
    if (newLevel > this.profile.level) {
      this.profile.level = newLevel;
      leveledUp = true;
    }

    this.saveProfile();
    
    if (leveledUp) {
      setTimeout(() => {
        AudioSystem.play('chime');
        this.showToast("ðŸ‘‘", `NIVEAU SUPÃ‰RIEUR ! Vous Ãªtes Niveau ${this.profile.level} ! Bobby s'incline devant votre expertise.`);
      }, 1000);
    } else {
      this.showToast("âœ¨", `+${amount} XP: ${reason}`);
    }
  },

  showToast(icon, text) {
    const toast = DOM.appToast;
    if (!toast) return;

    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('.toast-text').textContent = text;
    toast.classList.add('active');

    // Cancel any previous auto-dismiss
    if (_toastTimer) clearTimeout(_toastTimer);

    // Auto-dismiss after 5s
    _toastTimer = setTimeout(() => {
      toast.classList.remove('active');
      _toastTimer = null;
    }, 5000);

    // Wire the close button (Ã—) every time the toast shows
    const closeBtn = DOM.btnCloseToast;
    if (closeBtn) {
      // Replace to avoid stacking duplicate listeners
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', () => {
        toast.classList.remove('active');
        if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }
      });
    }
  },

  getGradeLabel(level) {
    if (level >= 20) return 'LÃ©gende des TrÃ´nes';
    if (level >= 15) return 'MaÃ®tre des W.C.';
    if (level >= 10) return 'Grand Explorateur';
    if (level >= 7)  return 'Aventurier Sanitaire';
    if (level >= 5)  return 'Chasseur de TrÃ´nes';
    if (level >= 3)  return 'Apprenti Explorateur';
    return 'Novice';
  },

  updateProfileUI() {
    // Always scroll profile to top when UI is refreshed
    const scrollEl = document.querySelector('.profile-scroll-content');
    if (scrollEl) scrollEl.scrollTop = 0;

    const username = this.auth.username || 'Explorateur Anonyme';
    if (DOM.profileUsername) DOM.profileUsername.textContent = username;
    if (DOM.profileGrade)    DOM.profileGrade.textContent    = this.getGradeLabel(this.profile.level);

    if (DOM.profileLevel)    DOM.profileLevel.textContent    = this.profile.level;
    if (DOM.profileXpCurrent)DOM.profileXpCurrent.textContent = this.profile.xp;

    // Barre de progression XP
    const xpInCurrentLevel = this.profile.xp % 500;
    const progressPercent  = (xpInCurrentLevel / 500) * 100;
    if (DOM.profileXpBar)  DOM.profileXpBar.style.width     = `${progressPercent}%`;
    if (DOM.leaderboardXp) DOM.leaderboardXp.textContent    = this.profile.xp.toLocaleString();

    if (DOM.statAdded) DOM.statAdded.textContent = this.profile.addedCount;
    if (DOM.statRated) DOM.statRated.textContent = this.profile.ratedCount;

    // Badges
    const setBadge = (el, active) => {
      if (!el) return;
      el.classList.toggle('unlocked', active);
      el.classList.toggle('locked',   !active);
    };
    setBadge(DOM.badgeFirstAdd,     this.profile.addedCount >= 1);
    setBadge(DOM.badgeThreeRatings, this.profile.ratedCount >= 3);
    
    // Badge "Chasseur de TrÃ©sors" : l'utilisateur a crÃ©Ã© une toilette gratuite et trÃ¨s propre (cleanliness >= 80%)
    const hasRareToilet = this.toilets.some(t => 
      t.author === username && 
      t.price === 'gratuit' && 
      t.cleanliness >= 80
    );
    setBadge(DOM.badgeRareToilet, hasRareToilet);
  }
};
