import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Flame,
  HelpCircle,
  LucideIcon,
  Shield,
  Weight,
  Zap
} from 'lucide-react';
import { SensorEvidence } from '../types/elevator';

interface SensorCardProps {
  name: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  subsystem: string;
  nominalRange: string;
  evidence?: SensorEvidence;
  minScale: number;
  maxScale: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  isBinary?: boolean;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  name,
  value,
  unit,
  icon: Icon,
  subsystem,
  nominalRange,
  evidence,
  minScale,
  maxScale,
  warningThreshold,
  criticalThreshold,
  isBinary,
}) => {
  const status = evidence?.status || 'normal';

  // Calculate percentage fill for the bar gauge
  let percent = 0;
  if (!isBinary) {
    percent = Math.min(100, Math.max(0, ((value - minScale) / (maxScale - minScale)) * 100));
  } else {
    percent = value === 1 ? 100 : 0;
  }

  const getStatusBadge = () => {
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/70 text-rose-300 border border-rose-600/50">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          Critical Anomaly
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-600/50">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Deviation Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-600/40">
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        Nominal
      </span>
    );
  };

  const getBarColor = () => {
    if (status === 'critical') return 'bg-rose-500';
    if (status === 'warning') return 'bg-amber-400';
    return 'bg-teal-500';
  };

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-4 shadow-sm transition relative overflow-hidden ${
        status === 'critical'
          ? 'border-rose-500/60 shadow-rose-950/30'
          : status === 'warning'
          ? 'border-amber-500/50 shadow-amber-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              status === 'critical'
                ? 'bg-rose-500/20 text-rose-400'
                : status === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-teal-500/10 text-teal-400'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-200">{name}</h3>
            <span className="text-[10px] text-slate-400 font-mono">{subsystem}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Value display */}
      <div className="my-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-bold tracking-tight font-mono ${
              status === 'critical'
                ? 'text-rose-400'
                : status === 'warning'
                ? 'text-amber-300'
                : 'text-white'
            }`}
          >
            {isBinary ? (value === 1 ? 'OBSTRUCTED' : 'CLEAR') : value.toFixed(unit === 's' || unit === 'mm/s' ? 2 : 1)}
          </span>
          {!isBinary && <span className="text-xs text-slate-400 font-medium">{unit}</span>}
        </div>

        {evidence?.deviationPercent !== undefined && evidence.deviationPercent !== 0 && (
          <span
            className={`text-[11px] font-mono font-medium ${
              evidence.deviationPercent > 0 ? 'text-amber-400' : 'text-cyan-400'
            }`}
          >
            {evidence.deviationPercent > 0 ? `+${evidence.deviationPercent}%` : `${evidence.deviationPercent}%`}
          </span>
        )}
      </div>

      {/* Visual Level Gauge Bar */}
      <div className="mt-2 space-y-1">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Min: {isBinary ? '0 (Clear)' : `${minScale} ${unit}`}</span>
          <span className="text-slate-400">Nominal: {nominalRange}</span>
          <span>Max: {isBinary ? '1 (Trip)' : `${maxScale} ${unit}`}</span>
        </div>
      </div>

      {/* Impact footnote if abnormal */}
      {status !== 'normal' && evidence?.impact && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5">
          <span className="text-amber-400 font-bold shrink-0">Impact:</span>
          <span className="line-clamp-1">{evidence.impact}</span>
        </div>
      )}
    </div>
  );
};
