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
          <rect x="9" y="2" width="26" height="14" rx="5" fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1.5"/>
          <!-- Flush button on tank -->
          <ellipse cx="22" cy="9" rx="4" ry="2.5" fill="${seatColor}" opacity="0.6"/>

          <!-- Bowl outer body -->
          <path d="M9,15 L9,36 Q9,50 22,50 Q35,50 35,36 L35,15 Z"
                fill="${bodyColor}" stroke="${strokeColor}" stroke-width="1.5"/>

          <!-- Seat ring -->
          <path d="M11,17 L11,35 Q11,46 22,46 Q33,46 33,35 L33,17 Z"
                fill="none" stroke="${seatColor}" stroke-width="3.5" stroke-linecap="round"/>

          <!-- Water in bowl -->
          <ellipse cx="22" cy="37" rx="8" ry="6" fill="${waterColor}" opacity="0.9"/>

          <!-- LID GROUP — rotates open on hover via CSS -->
          <g class="toilet-lid-group">
            <!-- Lid body (mirrors bowl) -->
            <path d="M9,15 L9,36 Q9,50 22,50 Q35,50 35,36 L35,15 Z"
                  fill="${lidColor}" stroke="${strokeColor}" stroke-width="1.5"/>
            <!-- Lid top hinge bar -->
            <rect x="9" y="12" width="26" height="6" rx="3"
                  fill="${lidColor}" stroke="${strokeColor}" stroke-width="1.5"/>
            <!-- Lid center detail line -->
            <line x1="22" y1="20" x2="22" y2="44" stroke="${strokeColor}" stroke-width="0.8" opacity="0.4"/>
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
