import { AppState } from './state.js';
import { AudioSystem } from './audio.js';
import { DrawerSystem } from './drawer.js';

// 4. MAP & MARKER SYSTEM (Leaflet JS Implementation)
export const MapSystem = {
  init() {
    // Coordinates centered on Paris (Louvre / Châtelet zone)
    AppState.map = L.map('leaflet-map-container', {
      zoomControl: false, // Custom position or styled in CSS
      attributionControl: false // Cleaner for mockup
    }).setView([48.8584, 2.345], 15);

    // Beautiful, clean and premium Light tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(AppState.map);

    AppState.markersGroup = L.layerGroup().addTo(AppState.map);

    this.renderMarkers();
    this.initGeolocation();
  },

  // Real GPS geolocation — centers map and places a "you are here" marker
  initGeolocation() {
    if (!navigator.geolocation) {
      AppState.showToast('📍', 'Géolocalisation non supportée par ce navigateur.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        AppState.userPosition = { lat: latitude, lng: longitude };

        // Center map on user
        AppState.map.setView([latitude, longitude], 16);

        // Remove old user marker if exists
        if (AppState.userMarker) {
          AppState.map.removeLayer(AppState.userMarker);
        }

        // Create a cute Bobby-style poop "you are here" marker
        const userIcon = L.divIcon({
          html: `
            <div class="user-bobby-marker">
              <div class="user-bobby-pulse"></div>
              <svg class="user-bobby-svg" width="36" height="40" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Shadow -->
                <ellipse cx="18" cy="38" rx="9" ry="2.5" fill="rgba(0,0,0,0.15)"/>
                <!-- Swirl top -->
                <ellipse cx="18" cy="8" rx="5" ry="5.5" fill="#6B3F1E"/>
                <ellipse cx="20" cy="5" rx="3.5" ry="4" fill="#7D4E24"/>
                <ellipse cx="22" cy="3" rx="2.5" ry="3" fill="#8B5E3C"/>
                <ellipse cx="23" cy="1.5" rx="1.5" ry="2" fill="#A0714F"/>
                <!-- Body main -->
                <ellipse cx="18" cy="22" rx="13" ry="12" fill="#7D4E24"/>
                <!-- Body highlight -->
                <ellipse cx="14" cy="17" rx="4" ry="3" fill="#9B6438" opacity="0.5"/>
                <!-- Left eye -->
                <circle cx="13" cy="20" r="3" fill="white"/>
                <circle cx="13.8" cy="20.5" r="1.5" fill="#1A202C"/>
                <circle cx="14.3" cy="19.8" r="0.5" fill="white"/>
                <!-- Right eye -->
                <circle cx="23" cy="20" r="3" fill="white"/>
                <circle cx="23.8" cy="20.5" r="1.5" fill="#1A202C"/>
                <circle cx="24.3" cy="19.8" r="0.5" fill="white"/>
                <!-- Smile -->
                <path d="M13.5 25.5 Q18 29.5 22.5 25.5" stroke="#3D2000" stroke-width="1.5" stroke-linecap="round" fill="none"/>
                <!-- Cheek blush left -->
                <ellipse cx="10.5" cy="23.5" rx="2" ry="1.2" fill="#E87070" opacity="0.4"/>
                <!-- Cheek blush right -->
                <ellipse cx="25.5" cy="23.5" rx="2" ry="1.2" fill="#E87070" opacity="0.4"/>
              </svg>
            </div>
          `,
          className: '',
          iconSize: [36, 40],
          iconAnchor: [18, 40]
        });

        AppState.userMarker = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(AppState.map);

        AppState.showToast('📍', `Position trouvée ! (précision ~${Math.round(accuracy)}m)`);
      },
      (error) => {
        // Fallback: keep Paris center, show gentle message
        const messages = {
          1: 'Accès à la position refusé. Carte centrée sur Paris.',
          2: 'Position indisponible. Carte centrée sur Paris.',
          3: 'Délai de géolocalisation dépassé. Carte centrée sur Paris.',
        };
        AppState.showToast('📍', messages[error.code] || 'Géolocalisation indisponible.');
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
    );
  },

  // Haversine formula — real-world distance in km between two lat/lng points
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // Generates a custom toilet bowl SVG marker with animated lid on hover
  createCustomIcon(toilet) {
    const isEmergency = toilet.reports >= 3;

    // Color palette based on state
    const strokeColor  = isEmergency ? '#C53030' : '#0A9E94';
    const bodyColor    = isEmergency ? '#FFF5F5' : '#F0FFFE';
    const seatColor    = isEmergency ? '#FC8181' : '#0DCDC0';
    const waterColor   = isEmergency ? '#FEB2B2' : '#B8F0EC';
    const lidColor     = isEmergency ? '#FED7D7' : '#E7FAF9';
    const shadowColor  = isEmergency ? 'rgba(197,48,48,0.25)' : 'rgba(13,205,192,0.25)';

    const svgHTML = `
      <div class="toilet-bowl-marker">
        <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">

          <!-- Drop shadow -->
          <ellipse cx="22" cy="51" rx="10" ry="3" fill="${shadowColor}"/>

          <!-- Cistern / tank -->
          <rect x="9" y="2" width="26" height="13" rx="5" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1.5"/>
          <!-- Flush button on tank -->
          <ellipse cx="22" cy="8.5" rx="4" ry="2.5" fill="${seatColor}" opacity="0.6"/>

          <!-- Bowl outer body (round) -->
          <ellipse cx="22" cy="36" rx="14" ry="13" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1.5"/>

          <!-- Seat ring (round) -->
          <ellipse cx="22" cy="36" rx="11" ry="10" fill="none" stroke="${seatColor}" stroke-width="3"/>

          <!-- Water in bowl -->
          <ellipse cx="22" cy="37" rx="7" ry="6.5" fill="${waterColor}" opacity="0.9"/>

          <!-- LID GROUP — rotates open on hover via CSS -->
          <g class="toilet-lid-group">
            <!-- Lid body (round, same as bowl) -->
            <ellipse cx="22" cy="36" rx="14" ry="13" fill="${lidColor}" stroke="${strokeColor}" stroke-width="1.5"/>
            <!-- Lid top hinge bar -->
            <rect x="9" y="11" width="26" height="6" rx="3" fill="${lidColor}" stroke="${strokeColor}" stroke-width="1.5"/>
          </g>

        </svg>
      </div>
    `;


    return L.divIcon({
      html: svgHTML,
      className: 'crottoq-custom-marker',
      iconSize: [44, 54],
      iconAnchor: [22, 54]
    });
  },


  renderMarkers() {
    AppState.markersGroup.clearLayers();
    
    // If toilet has 3 or more reports and we are NOT in mod mode, hide it
    AppState.toilets.forEach(toilet => {
      if (toilet.reports >= 3 && !AppState.isModeratorMode) {
        return; // Skip drawing reported toilet for visitors
      }

      const marker = L.marker([toilet.lat, toilet.lng], {
        icon: this.createCustomIcon(toilet)
      });

      marker.on('click', () => {
        AudioSystem.play('click');
        DrawerSystem.openToiletDetails(toilet);
      });

      AppState.markersGroup.addLayer(marker);
    });
  }
};
