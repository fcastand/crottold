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

    // Update bottom nav state
    document.querySelectorAll('.bottom-nav-bar .nav-item').forEach(btn => {
      btn.classList.remove('active');
    });

    if (triggerBtn) {
      triggerBtn.classList.add('active');
    } else {
      // Find matching navigation button
      let navBtnId = 'nav-btn-map';
      if (viewId === 'view-profile') navBtnId = 'nav-btn-profile';
      if (viewId === 'view-moderation') navBtnId = 'nav-btn-moderation';
      const navBtn = document.getElementById(navBtnId);
      if (navBtn) navBtn.classList.add('active');
    }

    // Leaflet map refresh hack if switching to map
    if (viewId === 'view-map' && AppState.map) {
      setTimeout(() => {
        AppState.map.invalidateSize();
      }, 200);
    }
  }
};
