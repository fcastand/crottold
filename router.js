import { AudioSystem } from './audio.js';
import { AppState } from './state.js';

// 6. ROUTING VIEW CONTROLLER
export const RouteSystem = {
  switchView(viewId, triggerBtn = null) {
    AudioSystem.play('click');
    
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      AppState.activeView = viewId;
    }

    // Show/hide bottom nav — only visible when logged in
    const bottomNav = document.getElementById('bottom-nav-bar');
    const loggedInViews = ['view-map', 'view-profile', 'view-moderation'];
    if (bottomNav) {
      if (loggedInViews.includes(viewId)) {
        bottomNav.classList.remove('hidden');
      } else {
        bottomNav.classList.add('hidden');
      }
    }

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-bar .nav-item').forEach(btn => {
      btn.classList.remove('active');
    });

    if (triggerBtn) {
      triggerBtn.classList.add('active');
    } else {
      // Mapping vue → bouton de navigation
      const viewToNav = {
        'view-map':        'nav-btn-map',
        'view-profile':    'nav-btn-profile',
        'view-moderation': 'nav-btn-moderation',
      };
      const navBtnId = viewToNav[viewId] || 'nav-btn-map';
      const navBtn = document.getElementById(navBtnId);
      if (navBtn) navBtn.classList.add('active');
    }

    // Leaflet map refresh hack if switching to map
    if (viewId === 'view-map' && AppState.map) {
      setTimeout(() => {
        AppState.map.invalidateSize();
      }, 200);
    }

    // Reset scroll position for scrollable views
    if (target) {
      const scrollContainer = target.querySelector('.profile-scroll-content, .moderation-scroll-content, [data-scroll]');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }
};
