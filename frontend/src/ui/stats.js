import { Chart, registerables } from 'chart.js';
import { getStats } from '../api.js';
import { getAppState } from '../main.js';
import { DISC_LABEL } from '../config.js';

Chart.register(...registerables);

let pointsChartInstance = null;
let discChartInstance = null;

const DISC_COLORS = {
  steps:  '#7C3AED',
  run:    '#F0047F',
  bike:   '#FFB347',
  ebike:  '#4FC3F7',
  gym:    '#8B5CF6',
  physio: '#00FF85',
  circus: '#FF8A65',
  free:   '#A1A1AA',
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
            borderColor: '#00FF85',
            backgroundColor: 'rgba(0, 255, 133, 0.08)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#00FF85',
          },
          {
            label: rivalName,
            data: data.rival,
            borderColor: '#F0047F',
            backgroundColor: 'rgba(240, 4, 127, 0.08)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#F0047F',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#A1A1AA', font: { family: 'Inter', weight: '600' } },
          },
        },
        scales: {
          x: {
            grid: { color: '#3A3A5C' },
            ticks: { color: '#A1A1AA', font: { family: 'Inter' } },
          },
          y: {
            grid: { color: '#3A3A5C' },
            ticks: { color: '#A1A1AA', font: { family: 'Inter' } },
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
      const discColors = discs.map(d => DISC_COLORS[d] || '#A1A1AA');

      const discCtx = document.getElementById('discChart').getContext('2d');
      discChartInstance = new Chart(discCtx, {
        type: 'doughnut',
        data: {
          labels: discLabels,
          datasets: [{
            data: discValues,
            backgroundColor: discColors,
            borderColor: '#252547',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#A1A1AA', font: { family: 'Inter', weight: '600' }, padding: 12 },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error('renderStats error:', err);
  }
}
