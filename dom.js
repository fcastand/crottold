// dom.js — Sélecteurs DOM centralisés
// ─────────────────────────────────────────────────────────────────────────────
// Bénéfice : si un ID change dans index.html, il suffit de le corriger ici.
// Tous les accès au DOM passent par des getters qui appellent getElementById
// (rapide, pas de cache périmé, pas de dépendance à l'ordre de chargement).
// ─────────────────────────────────────────────────────────────────────────────

export const DOM = {

  // ── Authentification ───────────────────────────────────────────────────────
  get formLogin()        { return document.getElementById('form-login'); },
  get loginUsername()    { return document.getElementById('login-username'); },
  get loginPassword()    { return document.getElementById('login-password'); },
  get loginRole()        { return document.getElementById('login-role'); },
  get btnGoRegister()    { return document.getElementById('btn-go-register'); },
  get btnGoLogin()       { return document.getElementById('btn-go-login'); },
  get formRegister()     { return document.getElementById('form-register'); },
  get btnLogout()        { return document.getElementById('btn-logout'); },
  get inputRegPassword() { return document.getElementById('input-reg-password'); },
  get btnRegSubmit()     { return document.getElementById('btn-register-submit'); },

  // ── Navigation ─────────────────────────────────────────────────────────────
  get navBtnMap()        { return document.getElementById('nav-btn-map'); },
  get navBtnProfile()    { return document.getElementById('nav-btn-profile'); },
  get navBtnModeration() { return document.getElementById('nav-btn-moderation'); },
  get bottomNavBar()     { return document.getElementById('bottom-nav-bar'); },

  // ── Barre supérieure ───────────────────────────────────────────────────────
  get soundToggleBtn()     { return document.getElementById('sound-toggle-btn'); },
  get moderatorToggleBtn() { return document.getElementById('moderator-toggle-btn'); },
  get modBadgeText()       { return document.getElementById('mod-badge-text'); },

  // ── Drawers ────────────────────────────────────────────────────────────────
  get btnCloseDetails()       { return document.getElementById('btn-close-details'); },
  get btnCloseAddDrawer()     { return document.getElementById('btn-close-add-drawer'); },
  get btnCancelAdd()          { return document.getElementById('btn-cancel-add'); },
  get btnCloseReviewDrawer()  { return document.getElementById('btn-close-review-drawer'); },
  get btnCancelReview()       { return document.getElementById('btn-cancel-review'); },
  get btnAddReviewTrigger()   { return document.getElementById('btn-add-review-trigger'); },
  get btnDeleteToiletDirect() { return document.getElementById('btn-delete-toilet-direct'); },
  get btnShareToilet()        { return document.getElementById('btn-share-toilet'); },

  // ── Formulaires ────────────────────────────────────────────────────────────
  get formAddReview()  { return document.getElementById('form-add-review'); },
  get formAddToilet()  { return document.getElementById('form-add-toilet'); },
  get btnReportToilet(){ return document.getElementById('btn-report-toilet'); },
  get btnSosEmergency(){ return document.getElementById('btn-sos-emergency'); },

  // ── Profil utilisateur ─────────────────────────────────────────────────────
  get profileUsername()  { return document.getElementById('profile-username'); },
  get profileGrade()     { return document.getElementById('profile-grade'); },
  get profileLevel()     { return document.getElementById('profile-level'); },
  get profileXpCurrent() { return document.getElementById('profile-xp-current'); },
  get profileXpBar()     { return document.getElementById('profile-xp-bar'); },
  get leaderboardXp()    { return document.getElementById('leaderboard-current-xp'); },
  get leaderboardSection(){ return document.getElementById('leaderboard-section'); },
  get statAdded()        { return document.getElementById('stat-added'); },
  get statRated()        { return document.getElementById('stat-rated'); },
  get btnProfileSettings() { return document.getElementById('btn-profile-settings'); },

  // ── Badges ─────────────────────────────────────────────────────────────────
  get badgeFirstAdd()     { return document.getElementById('badge-first-add'); },
  get badgeThreeRatings() { return document.getElementById('badge-three-ratings'); },
  get badgeRareToilet()   { return document.getElementById('badge-rare-toilet'); },

  // ── Toast ──────────────────────────────────────────────────────────────────
  get appToast()      { return document.getElementById('app-toast'); },
  get btnCloseToast() { return document.getElementById('btn-close-toast'); },

  // ── Modération ─────────────────────────────────────────────────────────────
  get modReportedCount()     { return document.getElementById('mod-reported-count'); },
  get moderationReportsList(){ return document.getElementById('moderation-reports-list'); },

  // ── Splash / chargement / animations ──────────────────────────────────────
  get viewSplash()           { return document.getElementById('view-splash'); },
  get btnSplashSkip()        { return document.getElementById('btn-splash-skip'); },
  get toiletSuccessOverlay() { return document.getElementById('toilet-success-overlay'); },
  get loaderStatusText()     { return document.getElementById('loader-status-text'); },
  get loaderProgressFill()   { return document.querySelector('.loader-progress-fill'); },
};
