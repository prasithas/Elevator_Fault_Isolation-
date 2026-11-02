import React from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { AnalysisResult, FaultCategory } from '../types/elevator';

interface FaultDetectionPanelProps {
  analysis: AnalysisResult | null;
}

export const FaultDetectionPanel: React.FC<FaultDetectionPanelProps> = ({ analysis }) => {
  const fault = analysis?.predicted_fault || 'Normal';
  const confidence = analysis?.confidence ? Math.round(analysis.confidence * 100) : 98;
  const probabilities = analysis?.probabilities || {
    'Normal': 0.98,
    'Motor fault': 0.005,
    'Bearing fault': 0.005,
    'Door fault': 0.005,
    'Sensor fault': 0.005,
  };

  const getFaultStyle = (cat: FaultCategory) => {
    switch (cat) {
      case 'Normal':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
          badge: 'bg-emerald-500 text-slate-950',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          title: 'Nominal Operational State',
          desc: 'All 6 parameters conform to standard baseline kinematics and electrical tolerances.',
        };
      case 'Motor fault':
        return {
          bg: 'bg-rose-950/70 border-rose-500/60 text-rose-300',
          badge: 'bg-rose-500 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
          title: 'Motor Thermal / Electrical Degradation',
          desc: 'Severe stator heating or abnormal current draw exceeding maximum continuous duty rating.',
        };
      case 'Bearing fault':
        return {
          bg: 'bg-amber-950/70 border-amber-500/60 text-amber-300',
          badge: 'bg-amber-500 text-slate-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: 'Mechanical Bearing Raceway Wear',
          desc: 'High-frequency vibration harmonic detected in drive sheave or deflector pulley bearings.',
        };
      case 'Door fault':
        return {
          bg: 'bg-orange-950/70 border-orange-500/60 text-orange-300',
          badge: 'bg-orange-500 text-slate-950',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
          title: 'Entrance Door Cycle Obstruction',
          desc: 'Closing velocity restricted or safety optical light curtain triggered repeatedly beyond standard threshold.',
        };
      case 'Sensor fault':
        return {
          bg: 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300',
          badge: 'bg-cyan-500 text-slate-950',
          icon: <AlertOctagon className="w-5 h-5 text-cyan-400" />,
          title: 'Telemetry Transducer / Signal Glitch',
          desc: 'Physically impossible measurement received, indicating an analog sensor wire fault or ADC saturation.',
        };
    }
  };

  const currentStyle = getFaultStyle(fault);

  const categories: FaultCategory[] = [
    'Normal',
    'Motor fault',
    'Bearing fault',
    'Door fault',
    'Sensor fault',
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            AI-Based Fault Detection (Random Forest)
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
          Ensemble Trees: 100
        </span>
      </div>

      {/* Main Detection Result Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${currentStyle.bg} mb-4`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-900/60 shrink-0">
            {currentStyle.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-bold opacity-80">
                Predicted Operational State:
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${currentStyle.badge}`}>
                {fault}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              {currentStyle.title}
            </h4>
            <p className="text-xs opacity-90 mt-0.5 max-w-xl">
              {currentStyle.desc}
            </p>
          </div>
        </div>

        {/* Model Confidence Meter */}
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 min-w-[130px] text-center self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold block">
            Model Confidence
          </span>
          <span className="text-2xl font-extrabold text-white font-mono">
            {confidence}%
          </span>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full ${fault === 'Normal' ? 'bg-emerald-400' : 'bg-rose-500'}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Class Probabilities Distribution */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
          <span>Random Forest Classification Probability Distribution</span>
          <span className="text-[11px] font-mono text-teal-400">Softmax / Tree Vote</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const prob = probabilities[cat] || 0.0;
            const probPercent = Math.round(prob * 100);
            const isSelected = fault === cat;

            return (
              <div
                key={cat}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500/70 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {cat}
                  </span>
                  <span className="font-mono text-[11px] text-teal-300">
                    {probPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isSelected ? 'bg-teal-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${probPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
