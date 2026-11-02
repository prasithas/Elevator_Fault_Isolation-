import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Cpu,
  Info,
  Layers,
  Radio,
  Server,
  Settings,
  ShieldAlert,
  Sliders,
  Wrench
} from 'lucide-react';
import { AnalysisResult, MaintenanceAlert } from '../types/elevator';
import { BackendConfig } from '../services/api';

interface HeaderProps {
  currentAnalysis: AnalysisResult | null;
  backendConfig: BackendConfig;
  backendSource: 'standalone' | 'flask';
  backendError?: string | null;
  onOpenSettings: () => void;
  onOpenSimulator: () => void;
  onGenerateReading: () => void;
  activeAlertCount: number;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentAnalysis,
  backendConfig,
  backendSource,
  backendError,
  onOpenSettings,
  onOpenSimulator,
  onGenerateReading,
  activeAlertCount,
  isStreaming,
  onToggleStreaming,
}) => {
  const fault = currentAnalysis?.predicted_fault || 'Normal';
  const isHealthy = fault === 'Normal';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-3.5 sticky top-0 z-30 shadow-md">
      {/* Top Banner: Disclaimer */}
      <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-md mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Decision-Support Prototype:</strong> For predictive maintenance & fault diagnosis. This software never controls elevator brakes, doors, or physical motion circuits.
          </span>
        </div>
        <span className="hidden md:inline text-amber-400/80 text-[11px]">Synthetic Telemetry Engine</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Project Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white">
                Elevator Fault Isolation & Root Cause Analysis
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-teal-900/60 text-teal-300 border border-teal-700/50 rounded-full">
                AI Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Car ID: <strong className="text-slate-200">ELEV-04 (Traction MRL)</strong> • Machine Room Level 14 • Decision Support
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Status Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isHealthy
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
            }`}
          >
            {isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{isHealthy ? 'Normal Operation' : `${fault}`}</span>
          </div>

          {/* Backend Engine Indicator */}
          <button
            onClick={onOpenSettings}
            title={backendError || (backendSource === 'flask' ? 'Connected to Colab Flask Backend via ngrok' : 'Running in-browser standalone engine')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition ${
              backendError
                ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
                : backendSource === 'flask'
                ? 'border-teal-500/50 bg-teal-950/40 text-teal-300 hover:bg-teal-900/40'
                : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Server
              className={`w-3.5 h-3.5 ${
                backendError ? 'text-amber-400' : backendSource === 'flask' ? 'text-teal-400' : 'text-cyan-400'
              }`}
            />
            <span className="hidden md:inline font-medium">
              {backendError ? 'Flask Error (Fallback Active)' : backendSource === 'flask' ? 'Colab Flask: Online' : 'In-Browser AI'}
            </span>
            <Settings className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
          </button>

          {/* Live Auto-Stream Toggle */}
          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              isStreaming
                ? 'bg-teal-600 border-teal-500 text-white shadow-sm shadow-teal-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-ping' : ''}`} />
            <span>{isStreaming ? 'Streaming (Active)' : 'Live Feed: Off'}</span>
          </button>

          {/* Generate / Simulate Button */}
          <button
            onClick={onGenerateReading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulate Sensor Reading</span>
          </button>
        </div>
      </div>
    </header>
  );
};
