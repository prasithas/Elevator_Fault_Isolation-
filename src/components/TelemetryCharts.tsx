import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, Layers, RefreshCw, Zap } from 'lucide-react';
import { SensorReading } from '../types/elevator';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TelemetryChartsProps {
  history: SensorReading[];
  onClearHistory?: () => void;
}

type ChartView = 'all' | 'thermal' | 'vibration' | 'doors';

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ history, onClearHistory }) => {
  const [view, setView] = useState<ChartView>('all');

  const labels = history.map((h) => h.timestamp);

  // Common chart styling options
  const baseOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 350,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1', // slate-300
          font: {
            family: 'ui-sans-serif, system-ui',
            size: 11,
            weight: 500,
          },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#1e293b', // slate-800
        },
        ticks: {
          color: '#94a3b8', // slate-400
          font: { size: 10 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: '#1e293b',
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
        },
      },
    },
  };

  // Datasets according to view
  const getChartData = () => {
    if (view === 'thermal') {
      return {
        labels,
        datasets: [
          {
            label: 'Motor Temperature (°C)',
            data: history.map((h) => h.motor_temperature),
            borderColor: '#f97316', // orange-500
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2.5,
          },
          {
            label: 'Elevator Load (kg / 10)',
            data: history.map((h) => h.elevator_load / 10),
            borderColor: '#38bdf8', // sky-400
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      };
    }

    if (view === 'vibration') {
      return {
        labels,
        datasets: [
          {
            label: 'Vibration (mm/s RMS)',
            data: history.map((h) => h.vibration),
            borderColor: '#ec4899', // pink-500
            backgroundColor: 'rgba(236, 72, 153, 0.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: 'Motor Current (A)',
            data: history.map((h) => h.motor_current),
            borderColor: '#14b8a6', // teal-500
            backgroundColor: 'rgba(20, 184, 166, 0.08)',
            tension: 0.3,
            pointRadius: 2.5,
          },
        ],
      };
    }

    if (view === 'doors') {
      return {
        labels,
        datasets: [
          {
            label: 'Door Closing Time (s)',
            data: history.map((h) => h.door_closing_time),
            borderColor: '#a855f7', // purple-500
            backgroundColor: 'rgba(168, 85, 247, 0.12)',
            fill: true,
            tension: 0.2,
            pointRadius: 3,
          },
          {
            label: 'Light Curtain Sensor (0/1 x 5)',
            data: history.map((h) => h.door_sensor_status * 5),
            borderColor: '#eab308', // yellow-500
            backgroundColor: 'transparent',
            stepped: true,
            pointRadius: 2,
          },
        ],
      };
    }

    // Default 'all' overview
    return {
      labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: history.map((h) => h.motor_temperature),
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Vibration x 10 (mm/s)',
          data: history.map((h) => h.vibration * 10),
          borderColor: '#ec4899',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Current (A)',
          data: history.map((h) => h.motor_current),
          borderColor: '#14b8a6',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Door Time x 5 (s)',
          data: history.map((h) => h.door_closing_time * 5),
          borderColor: '#a855f7',
          backgroundColor: 'transparent',
          tension: 0.2,
          pointRadius: 2,
        },
      ],
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      {/* Header and view tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Real-Time Sensor Telemetry Trends
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Last {history.length} cycles sampled • Chart.js multi-channel rendering
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 self-start sm:self-auto text-xs">
          <button
            onClick={() => setView('all')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              view === 'all'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-Signal
          </button>
          <button
            onClick={() => setView('vibration')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              view === 'vibration'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vibration & Current
          </button>
          <button
            onClick={() => setView('thermal')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              view === 'thermal'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal & Load
          </button>
          <button
            onClick={() => setView('doors')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              view === 'doors'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Door Cycles
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full relative">
        <Line data={getChartData()} options={baseOptions} />
      </div>

      {/* Metric reference footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span> Current: Nominal 8-18A
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span> Vibration: Safe &lt; 1.8 mm/s
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span> Temp: Safe &lt; 60°C
          </span>
        </div>
        <div className="text-slate-500 font-mono">
          Sampling window: 30 data points
        </div>
      </div>
    </div>
  );
};
