import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Perbandingan Expected Value Antar Opsi',
      font: { size: 14, family: 'Inter' },
    },
  },
  scales: {
    x: { beginAtZero: true, grid: { color: '#F1F5F9' } },
    y: { grid: { display: false } },
  },
}

/**
 * Bar chart horizontal perbandingan EV. Opsi dengan EV tertinggi diwarnai
 * gelap agar sejalan dengan baris ter-highlight di tabel EV.
 */
export default function EVComparisonChart({ results }) {
  const maxEv = Math.max(...results.map((r) => r.ev))

  const data = {
    labels: results.map((r, idx) => r.name.trim() || `Opsi ${idx + 1}`),
    datasets: [
      {
        label: 'Expected Value',
        data: results.map((r) => r.ev),
        backgroundColor: results.map((r) =>
          r.ev === maxEv && r.ev > 0 ? '#1B2A4A' : '#94A3B8',
        ),
        borderRadius: 6,
        barThickness: 48,
      },
    ],
  }

  return <Bar data={data} options={chartOptions} />
}
