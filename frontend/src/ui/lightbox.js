let isZoomed = false;
let panX = 0, panY = 0;
let startPanX = 0, startPanY = 0;
let isDragging = false;

function applyTransform(img) {
  if (isZoomed) {
    img.style.transform = `scale(2) translate(${panX}px, ${panY}px)`;
  } else {
    img.style.transform = '';
  }
}

export function openLightbox(src) {
  const overlay = document.getElementById('lightboxOverlay');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  img.classList.remove('zoomed');
  img.style.transform = '';
  isZoomed = false;
  panX = 0; panY = 0;
  overlay.classList.add('open');
}

export function closeLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  overlay.classList.remove('open');
  const img = document.getElementById('lightboxImg');
  img.classList.remove('zoomed');
  img.style.transform = '';
  isZoomed = false;
  panX = 0; panY = 0;
}

export function initLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  const img = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeLightbox();
    }
  });

  // Double-tap to zoom on touch
  let lastTap = 0;
  img.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      e.preventDefault();
      isZoomed = !isZoomed;
      panX = 0; panY = 0;
      img.classList.toggle('zoomed', isZoomed);
      applyTransform(img);
    }
    lastTap = now;
  });

  // Click to zoom on desktop
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    isZoomed = !isZoomed;
    panX = 0; panY = 0;
    img.classList.toggle('zoomed', isZoomed);
    applyTransform(img);
  });

  // Touch pan when zoomed
  let touchStartX = 0, touchStartY = 0;
  img.addEventListener('touchstart', (e) => {
    if (!isZoomed || e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    startPanX = panX;
    startPanY = panY;
    isDragging = true;
  }, { passive: true });

  img.addEventListener('touchmove', (e) => {
    if (!isZoomed || !isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = (e.touches[0].clientX - touchStartX) / 2;
    const dy = (e.touches[0].clientY - touchStartY) / 2;
    panX = Math.max(-100, Math.min(100, startPanX + dx));
    panY = Math.max(-100, Math.min(100, startPanY + dy));
    applyTransform(img);
  }, { passive: false });

  img.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeLightbox();
    }
  });
}
