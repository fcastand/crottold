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

  // Generates custom HTML/SVG Pin matching the visual design (Turquoise CROTTOQ + WC Icon)
  createCustomIcon(toilet) {
    const isEmergency = toilet.reports >= 3;
    const markerColor = isEmergency ? 'var(--danger)' : 'var(--primary-color)';
    const textSymbol = toilet.price === 'gratuit' ? '🧻' : '🪙';
    
    const svgHTML = `
      <div class="marker-pin-svg-wrapper">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.05888 0 0 8.05888 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${markerColor}"/>
          <circle cx="18" cy="18" r="13" fill="var(--white)"/>
        </svg>
        <span class="marker-content-inner">${textSymbol}</span>
        <div class="pin-shadow"></div>
      </div>
    `;

    return L.divIcon({
      html: svgHTML,
      className: 'crottoq-custom-marker',
      iconSize: [36, 44],
      iconAnchor: [18, 44]
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
