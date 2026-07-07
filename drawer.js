import { AppState } from './state.js';

// 5. DRAWER / SHEET PANELS SYSTEM
export const DrawerSystem = {
  open(id) {
    document.getElementById(id).classList.add('active');
  },

  close(id) {
    document.getElementById(id).classList.remove('active');
  },

  closeAll() {
    document.querySelectorAll('.app-drawer').forEach(drawer => {
      drawer.classList.remove('active');
    });
  },

  openToiletDetails(toilet) {
    this.closeAll();
    AppState.selectedToilet = toilet;

    // Fill UI
    document.getElementById('detail-toilet-name').textContent = toilet.name;
    
    // Rating notes & Humor categories based on dynamic average of the three stats
    const cleanlinessVal = typeof toilet.cleanliness === 'number' ? toilet.cleanliness : 50;
    const comfortVal = typeof toilet.comfort === 'number' ? toilet.comfort : cleanlinessVal;
    const accessibilityVal = typeof toilet.accessibility === 'number' ? toilet.accessibility : 50;
    
    const overallRating = Math.round((cleanlinessVal + comfortVal + accessibilityVal) / 3);
    const noteWord = this.getHumorGrade(overallRating);
    
    // Set badge next to name in header
    const badgeEl = document.getElementById('detail-toilet-badge');
    if (badgeEl) {
      badgeEl.textContent = noteWord;
      
      // Dynamic colors matching classification
      if (overallRating < 20) {
        badgeEl.style.backgroundColor = 'var(--danger-light)';
        badgeEl.style.color = 'var(--danger)';
      } else if (overallRating < 40) {
        badgeEl.style.backgroundColor = '#fff3cd';
        badgeEl.style.color = '#856404';
      } else if (overallRating < 60) {
        badgeEl.style.backgroundColor = '#e2e3e5';
        badgeEl.style.color = '#383d41';
      } else if (overallRating < 80) {
        badgeEl.style.backgroundColor = 'var(--primary-light)';
        badgeEl.style.color = 'var(--primary-dark)';
      } else {
        badgeEl.style.backgroundColor = 'var(--success-light)';
        badgeEl.style.color = 'var(--success)';
      }
    }

    // Dynamic Tags
    const tagsContainer = document.getElementById('detail-tags-container');
    tagsContainer.innerHTML = '';
    
    const addTag = (text, iconClass, active = true) => {
      const span = document.createElement('span');
      span.className = `toilet-tag ${active ? 'active-tag' : ''}`;
      span.innerHTML = `<i class="${iconClass}"></i> ${text}`;
      tagsContainer.appendChild(span);
    };

    addTag(toilet.price === 'gratuit' ? 'Gratuit' : 'Payant', 'fa-solid fa-tag');
    addTag(toilet.access === 'public' ? 'Ouvert au public' : 'Accès limité', 'fa-solid fa-door-open');
    if (toilet.pmr) addTag('Accès PMR', 'fa-solid fa-wheelchair');
    if (toilet.mixed) addTag('Mixte', 'fa-solid fa-venus-mars');
    if (toilet.paper) addTag('Papier fourni', 'fa-solid fa-toilet-paper');

    // Fill details stats progress bars (passed directly as percentages 0-100)
    this.animateStatBar('bar-cleanliness', cleanlinessVal);
    this.animateStatBar('bar-comfort', comfortVal);
    this.animateStatBar('bar-access', accessibilityVal);

    // Reviews list
    const reviewsContainer = document.getElementById('detail-reviews-list');
    reviewsContainer.innerHTML = '';

    if (toilet.reviews && toilet.reviews.length > 0) {
      toilet.reviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-comment-card';
        div.innerHTML = `
          <div class="review-card-header">
            <span class="review-card-author">@${review.author}</span>
            <span class="review-card-grade">${review.grade}</span>
          </div>
          <p class="review-card-text">"${review.text}"</p>
        `;
        reviewsContainer.appendChild(div);
      });
    } else {
      reviewsContainer.innerHTML = '<p style="font-size: 0.75rem; color: var(--grey-text); text-align: center; padding: 1rem 0;">Aucun avis pour le moment. Soyez le premier !</p>';
    }

    // Toggle report button text and functionality
    const reportBtn = document.getElementById('btn-report-toilet');
    if (toilet.reports >= 3) {
      reportBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Déjà signalé (${toilet.reports})`;
      reportBtn.disabled = true;
    } else {
      reportBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Signaler cette toilette`;
      reportBtn.disabled = false;
    }

    // Direct delete button for moderators
    const deleteDirectBtn = document.getElementById('btn-delete-toilet-direct');
    if (deleteDirectBtn) {
      if (AppState.user && AppState.user.role === 'moderator') {
        deleteDirectBtn.style.display = 'inline-flex';
      } else {
        deleteDirectBtn.style.display = 'none';
      }
    }

    this.open('drawer-toilet-details');
  },

  animateStatBar(id, percent) {
    const bar = document.getElementById(id);
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = `${percent}%`;
    }, 100);
  },

  getHumorGrade(rating) {
    const r = (typeof rating === 'number') ? rating : 50;
    if (r < 20) return "Zone à éviter 🤢";
    if (r < 40) return "Survie nécessaire ⚠️";
    if (r < 60) return "Correct 🆗";
    if (r < 80) return "Pause parfaite ✨";
    return "Trône royal 👑";
  }
};
