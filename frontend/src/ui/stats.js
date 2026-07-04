import { Chart, registerables } from 'chart.js';
import { getStats } from '../api.js';
import { getAppState } from '../main.js';
import { DISC_LABEL } from '../config.js';

Chart.register(...registerables);

let pointsChartInstance = null;
let discChartInstance = null;

const DISC_COLORS = {
  steps:  '#1DB954',
  run:    '#F15E6C',
  bike:   '#FFB347',
  ebike:  '#4FC3F7',
  gym:    '#CE93D8',
  physio: '#81C784',
  circus: '#FF8A65',
  free:   '#A7A7A7',
};

export async function renderStats() {
  try {
    const data = await getStats(6);
    const state = getAppState();
    const meName = state.me?.displayName || 'Du';
    const rivalName = state.rival?.displayName || 'Rival';

    // Format month labels (e.g. "2026-02" -> "Feb")
    const labels = data.months.map(m => {
      const d = new Date(m + '-01');
      return d.toLocaleDateString('de-DE', { month: 'short' });
    });

    // Destroy previous instances
    if (pointsChartInstance) { pointsChartInstance.destroy(); pointsChartInstance = null; }
    if (discChartInstance) { discChartInstance.destroy(); discChartInstance = null; }

    // Line chart: monthly points
    const pointsCtx = document.getElementById('pointsChart').getContext('2d');
    pointsChartInstance = new Chart(pointsCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: meName,
            data: data.me,
            borderColor: '#1DB954',
            backgroundColor: 'rgba(29, 185, 84, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#1DB954',
          },
          {
            label: rivalName,
            data: data.rival,
            borderColor: '#F15E6C',
            backgroundColor: 'rgba(241, 94, 108, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#F15E6C',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#A7A7A7', font: { family: 'Inter', weight: '600' } },
          },
        },
        scales: {
          x: {
            grid: { color: '#3E3E3E' },
            ticks: { color: '#A7A7A7', font: { family: 'Inter' } },
          },
          y: {
            grid: { color: '#3E3E3E' },
            ticks: { color: '#A7A7A7', font: { family: 'Inter' } },
            beginAtZero: true,
          },
        },
      },
    });

    // Doughnut chart: discipline breakdown
    const discs = Object.keys(data.byDisc);
    if (discs.length > 0) {
      const discLabels = discs.map(d => DISC_LABEL[d] || d);
      const discValues = discs.map(d => data.byDisc[d]);
      const discColors = discs.map(d => DISC_COLORS[d] || '#A7A7A7');

      const discCtx = document.getElementById('discChart').getContext('2d');
      discChartInstance = new Chart(discCtx, {
        type: 'doughnut',
        data: {
          labels: discLabels,
          datasets: [{
            data: discValues,
            backgroundColor: discColors,
            borderColor: '#282828',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#A7A7A7', font: { family: 'Inter', weight: '600' }, padding: 12 },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error('renderStats error:', err);
  }
}
