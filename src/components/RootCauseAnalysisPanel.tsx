import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileSearch,
  HelpCircle,
  Package,
  ShieldAlert,
  Sparkles,
  Wrench
} from 'lucide-react';
import { AnalysisResult, SensorEvidence } from '../types/elevator';

interface RootCauseAnalysisPanelProps {
  analysis: AnalysisResult | null;
}

export const RootCauseAnalysisPanel: React.FC<RootCauseAnalysisPanelProps> = ({ analysis }) => {
  if (!analysis) return null;

  const {
    predicted_fault,
    confidence,
    isolated_subsystem,
    possible_root_cause,
    sensor_evidence,
    explanation,
    recommended_action,
    estimated_spares,
    severity,
  } = analysis;

  const isNormal = predicted_fault === 'Normal';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Evidence-Based Root Cause Analysis (RCA)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Multi-sensor corroboration • Quantitative feature deviation audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              severity === 'Critical'
                ? 'bg-rose-950 text-rose-300 border-rose-600/50'
                : severity === 'Warning'
                ? 'bg-amber-950 text-amber-300 border-amber-600/50'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600/50'
            }`}
          >
            {severity}
          </span>
        </div>
      </div>

      {/* Primary Root Cause Card */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isNormal
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {isNormal ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase font-bold text-teal-400 tracking-wider">
              Diagnosed Root Cause Hypothesis
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white">
              {possible_root_cause}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Evidence Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Multi-Sensor Telemetry Evidence Matrix
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Deviation = [(Value - Baseline) / Baseline] × 100
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Telemetry Parameter</th>
                <th className="py-2.5 px-3">Observed Reading</th>
                <th className="py-2.5 px-3">Nominal Baseline</th>
                <th className="py-2.5 px-3">Deviation (%)</th>
                <th className="py-2.5 px-3">Signal Health</th>
                <th className="py-2.5 px-3">Diagnostic Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {sensor_evidence.map((ev, idx) => {
                const isAbnormal = ev.status !== 'normal';
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 transition ${
                      ev.status === 'critical'
                        ? 'bg-rose-950/20'
                        : ev.status === 'warning'
                        ? 'bg-amber-950/20'
                        : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                      {ev.displayName}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {ev.feature === 'door_sensor_status'
                        ? ev.value === 1
                          ? '1 (Tripped)'
                          : '0 (Clear)'
                        : `${ev.value} ${ev.unit}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {ev.nominalRange}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          Math.abs(ev.deviationPercent) > 30
                            ? 'text-rose-400 font-bold'
                            : Math.abs(ev.deviationPercent) > 10
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {ev.deviationPercent > 0 ? `+${ev.deviationPercent}%` : `${ev.deviationPercent}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          ev.status === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : ev.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {ev.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">
                      {ev.impact}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actionable Maintenance Recommendation & Spares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Prescribed Maintenance Action</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {recommended_action}
          </p>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>Recommended Spare Parts / Kit</span>
          </div>
          {estimated_spares && estimated_spares.length > 0 ? (
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {estimated_spares.map((spare, idx) => (
                <li key={idx} className="font-mono text-[11px] text-slate-200">
                  {spare}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-slate-400 italic font-sans">
              No spare parts currently required (Routine inspection interval).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
