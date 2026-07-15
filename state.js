import { AudioSystem } from './audio.js';

// Module-level timer so it's never lost regardless of `this` context
let _toastTimer = null;

export const DEFAULT_TOILETS = [
  {
    id: "toilet_1",
    name: "Les Trônes du Louvre",
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
    comment: "Accès propre via la galerie marchande du Louvre. Très chic !",
    reports: 0,
    reviews: [
      { author: "Chasseur_de_WC", grade: "Trône royal 👑", cleanliness: 100, comfort: 80, accessibility: 100, text: "Papier triple épaisseur. Un vrai régal !" },
      { author: "Marie_Coincoin", grade: "Pause parfaite ✨", cleanliness: 80, comfort: 80, accessibility: 100, text: "Propre, savon disponible, pas d'attente." }
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
    comment: "Toilettes publiques municipales gratuites. Propreté moyenne.",
    reports: 0,
    reviews: [
      { author: "Marc_Le_Rapide", grade: "Correct 🆗", cleanliness: 60, comfort: 60, accessibility: 80, text: "Fait le job mais pas de papier. Prévoyez vos mouchoirs." }
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
    comment: "Accessible mais l'odeur laisse à désirer. Utile la nuit.",
    reports: 2, // Mocked reports to showcase moderation immediately
    reviews: [
      { author: "Bobby_Fan", grade: "Survie nécessaire ⚠️", cleanliness: 40, comfort: 40, accessibility: 40, text: "Une odeur tenace, mais c'est le seul ouvert à cette heure." }
    ]
  },
  {
    id: "toilet_4",
    name: "Les Chiottes Mystères de Châtelet",
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
    comment: "L'eau n'évacue plus et le distributeur de papier est détruit !",
    reports: 3,
    reviews: [
      { author: "Chasseur_Fâché", grade: "Zone à éviter 🤢", cleanliness: 20, comfort: 20, accessibility: 40, text: "Inondé, fuyez !" }
    ]
  },
  {
    id: "toilet_5",
    name: "WC Tuileries Mutilés",
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
    comment: "Toilettes payantes mais fermées pour travaux sans indications.",
    reports: 1,
    reviews: [
      { author: "Marie_Coincoin", grade: "Survie nécessaire ⚠️", cleanliness: 40, comfort: 40, accessibility: 80, text: "Fermé par une grille métallique aujourd'hui." }
    ]
  }
];

// 3. APPLICATION STATE
export const AppState = {
  toilets: [],
  user: {
    username: "Explorateur Anonyme",
    role: "user",
    level: 2,
    xp: 350,
    addedCount: 1,
    ratedCount: 1
  },
  selectedToilet: null,
  map: null,
  markersGroup: null,
  userMarker: null,
  userPosition: null,
  isModeratorMode: false,
  activeView: 'view-map',

  init() {
    // Load from localStorage or initialize defaults
    const savedToilets = localStorage.getItem('crottoq_toilets');
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

    const savedUser = localStorage.getItem('crottoq_user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  },

  saveToilets() {
    localStorage.setItem('crottoq_toilets', JSON.stringify(this.toilets));
  },

  saveUser() {
    localStorage.setItem('crottoq_user', JSON.stringify(this.user));
    this.updateProfileUI();
  },

  addToilet(toilet) {
    this.toilets.push(toilet);
    this.saveToilets();
    this.user.addedCount++;
    this.addXP(50, "Nouveau trône enregistré ! 🧻");
    this.saveUser();
  },

  addXP(amount, reason) {
    this.user.xp += amount;
    let leveledUp = false;
    
    // Simple level calculation (e.g. 500 XP per level)
    const newLevel = Math.floor(this.user.xp / 500) + 1;
    if (newLevel > this.user.level) {
      this.user.level = newLevel;
      leveledUp = true;
    }

    this.saveUser();
    
    if (leveledUp) {
      setTimeout(() => {
        AudioSystem.play('chime');
        this.showToast("👑", `NIVEAU SUPÉRIEUR ! Vous êtes Niveau ${this.user.level} ! Bobby s'incline devant votre expertise.`);
      }, 1000);
    } else {
      this.showToast("✨", `+${amount} XP: ${reason}`);
    }
  },

  showToast(icon, text) {
    const toast = document.getElementById('app-toast');
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

    // Wire the close button (× ) every time the toast shows
    const closeBtn = document.getElementById('btn-close-toast');
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
    if (level >= 20) return 'Légende des Trônes';
    if (level >= 15) return 'Maître des W.C.';
    if (level >= 10) return 'Grand Explorateur';
    if (level >= 7)  return 'Aventurier Sanitaire';
    if (level >= 5)  return 'Chasseur de Trônes';
    if (level >= 3)  return 'Apprenti Explorateur';
    return 'Novice';
  },

  updateProfileUI() {
    const username = this.user.username || 'Explorateur Anonyme';
    const usernameEl = document.getElementById('profile-username');
    if (usernameEl) usernameEl.textContent = username;

    const gradeEl = document.getElementById('profile-grade');
    if (gradeEl) gradeEl.textContent = this.getGradeLabel(this.user.level);

    document.getElementById('profile-level').textContent = this.user.level;
    document.getElementById('profile-xp-current').textContent = this.user.xp;
    
    // Progress bar calculation
    const xpInCurrentLevel = this.user.xp % 500;
    const progressPercent = (xpInCurrentLevel / 500) * 100;
    document.getElementById('profile-xp-bar').style.width = `${progressPercent}%`;
    document.getElementById('leaderboard-current-xp').textContent = this.user.xp.toLocaleString();
    
    document.getElementById('stat-added').textContent = this.user.addedCount;
    document.getElementById('stat-rated').textContent = this.user.ratedCount;

    // Badges active state
    if (this.user.addedCount >= 1) {
      document.getElementById('badge-first-add').classList.add('unlocked');
      document.getElementById('badge-first-add').classList.remove('locked');
    }
    if (this.user.ratedCount >= 3) {
      document.getElementById('badge-three-ratings').classList.add('unlocked');
      document.getElementById('badge-three-ratings').classList.remove('locked');
    }
    if (this.user.toilets && this.user.toilets.some(t => t.price === 'gratuit' && t.cleanliness >= 4)) {
      document.getElementById('badge-rare-toilet').classList.add('unlocked');
      document.getElementById('badge-rare-toilet').classList.remove('locked');
    }
  }
};
