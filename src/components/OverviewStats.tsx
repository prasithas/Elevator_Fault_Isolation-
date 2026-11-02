import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { AnalysisResult, FaultCategory } from '../types/elevator';

interface OverviewStatsProps {
  totalReadingsCount: number;
  normalCount: number;
  faultCount: number;
  activeAlertCount: number;
  currentAnalysis: AnalysisResult | null;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  totalReadingsCount,
  normalCount,
  faultCount,
  activeAlertCount,
  currentAnalysis,
  onNavigateToTab,
}) => {
  const normalPercentage = totalReadingsCount > 0 ? ((normalCount / totalReadingsCount) * 100).toFixed(1) : '100.0';
  const currentFault = currentAnalysis?.predicted_fault || 'Normal';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Sensor Readings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Telemetry Logs
          </span>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {totalReadingsCount.toLocaleString()}
          </span>
          <span className="text-xs text-teal-400 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Live Buffer
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          6 sensor streams sampled at 1.0 Hz
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 opacity-80" />
      </div>

      {/* 2. Normal Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Normal Operations
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {normalPercentage}%
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            ({normalCount.toLocaleString()} cycles)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Within ISO 18738 mechanical standards
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-80" />
      </div>

      {/* 3. Detected Faults */}
      <div
        onClick={() => onNavigateToTab('isolation')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-rose-500/50 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Detected Faults
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${faultCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${faultCount > 0 ? 'text-rose-400' : 'text-white'}`}>
            {faultCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            {currentFault !== 'Normal' ? `Current: ${currentFault}` : 'All nominal'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
          <span>Click to view isolated schematic</span>
          <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition" />
        </p>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${faultCount > 0 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-slate-700'}`} />
      </div>

      {/* 4. Active Maintenance Alerts */}
      <div
        onClick={() => onNavigateToTab('alerts')}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-500/50 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Alerts & Work Orders
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeAlertCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <Bell className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${activeAlertCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {activeAlertCount}
          </span>
          <span className="text-xs text-amber-400/90 font-medium">
            {activeAlertCount > 0 ? 'Action Recommended' : 'No Open Tickets'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
          <span>Review technician checklist</span>
          <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition" />
        </p>
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${activeAlertCount > 0 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-slate-700'}`} />
      </div>
    </div>
  );
};
