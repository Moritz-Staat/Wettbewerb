let isZoomed = false;

export function openLightbox(src) {
  const overlay = document.getElementById('lightboxOverlay');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  img.classList.remove('zoomed');
  isZoomed = false;
  overlay.classList.add('open');
}

export function closeLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  overlay.classList.remove('open');
  document.getElementById('lightboxImg').classList.remove('zoomed');
  isZoomed = false;
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

  img.addEventListener('click', (e) => {
    e.stopPropagation();
    isZoomed = !isZoomed;
    img.classList.toggle('zoomed', isZoomed);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeLightbox();
    }
  });
}
