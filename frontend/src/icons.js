// Minimal SVG line icons (Lucide-inspired, 24x24, stroke 1.5)
const s = (d, vb = '0 0 24 24') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const ICON = {
  // Nav
  trophy:   s('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
  plus:     s('<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>'),
  clock:    s('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  list:     s('<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>'),
  chart:    s('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),

  // Disciplines
  steps:    s('<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5 10 7.11 9 8 9 8H4.5"/><path d="M20 8v2.38c0 2.12 1.03 3.12 1 5.62-.03 2.72-1.49 6-4.5 6-1.87 0-2.5-1.8-2.5-3.5 0-1.61 1-2.5 1-2.5H20"/>'),
  run:      s('<circle cx="13" cy="4" r="2"/><path d="m5.2 16.8 3.5-4.2L12 14l3-4.5 3 6"/><path d="M7 21 9.5 15"/><path d="m17 21-2-6"/>'),
  bike:     s('<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'),
  zap:      s('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  dumbbell: s('<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>'),
  stretch:  s('<circle cx="12" cy="4" r="2"/><path d="M12 6v4"/><path d="m8 14 4-4 4 4"/><path d="M8 18h8"/><path d="M10 22v-4"/><path d="M14 22v-4"/>'),
  flame:    s('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  target:   s('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),

  // UI
  camera:   s('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
  check:    s('<polyline points="20 6 9 17 4 12"/>'),
  x:        s('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  users:    s('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  medal:    s('<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>'),
  alertTri: s('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
};

// Disc icon map (used in config)
export const DISC_SVG = {
  steps:  ICON.steps,
  run:    ICON.run,
  bike:   ICON.bike,
  ebike:  ICON.zap,
  gym:    ICON.dumbbell,
  physio: ICON.stretch,
  circus: ICON.flame,
  free:   ICON.target,
};
