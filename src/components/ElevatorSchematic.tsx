import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  Info,
  Layers,
  Shield,
  Wrench,
  Zap
} from 'lucide-react';
import { AnalysisResult, SubsystemType } from '../types/elevator';

interface ElevatorSchematicProps {
  currentAnalysis: AnalysisResult | null;
  onSelectSubsystem?: (subsystem: SubsystemType) => void;
}

export const ElevatorSchematic: React.FC<ElevatorSchematicProps> = ({
  currentAnalysis,
  onSelectSubsystem,
}) => {
  const [selectedComponent, setSelectedComponent] = useState<SubsystemType>(
    currentAnalysis?.isolated_subsystem || 'Motor'
  );

  const isolated = currentAnalysis?.isolated_subsystem || 'None';
  const fault = currentAnalysis?.predicted_fault || 'Normal';

  // Subsystem descriptions for technical drilldown
  const subsystemDetails: Record<
    SubsystemType,
    { title: string; location: string; components: string[]; specs: string; functionDesc: string }
  > = {
    Motor: {
      title: 'Drive & Traction Motor Unit',
      location: 'Machine Room (Penthouse Level 14)',
      components: ['AC Permanent Magnet Synchronous Motor', 'Stator Windings', 'Cooling Blower Fan', 'Inverter Interface'],
      specs: '11 kW, 400V 3-Phase, Class H Insulation, 1450 RPM',
      functionDesc: 'Converts electrical power into rotational torque to drive the hoist sheave and elevate the passenger car.',
    },
    Bearing: {
      title: 'Traction Sheave & Bearing Assembly',
      location: 'Machine Room / Deflector Sheave Bedplate',
      components: ['Spherical Roller Bearings (Drive Shaft)', 'Traction Sheave Grooves', 'Deflector Sheave', 'Lubrication Reservoirs'],
      specs: 'Sheave Diameter 480mm, Bearing Type 22216-E1, Dynamic Load 240 kN',
      functionDesc: 'Transfers traction friction to wire ropes while absorbing heavy radial loads with minimal friction.',
    },
    Door: {
      title: 'Car Entrance & Door Operator Mechanism',
      location: 'Elevator Car Roof & Landing Entrances',
      components: ['DC Door Operator Motor', 'Harmonic Linkage / Toothed Belt', 'Hanger Rollers & Tracks', 'Optical Light Curtain'],
      specs: 'Opening Width 900mm, Max Closing Force < 150N, Cycle Time 3.0s',
      functionDesc: 'Controls precise acceleration and deceleration of cab doors with collision prevention and interlock monitoring.',
    },
    Sensor: {
      title: 'Telemetry Transducer & Sensor Hub',
      location: 'Shaft Junction Box & Machine Frame',
      components: ['PT100 Temperature Probe', 'IEPE Accelerometer (Vibration)', 'Hall Effect Current Sensor', 'Load Weighing Strain Gauges'],
      specs: '4-20mA / Modbus RTU, 24V DC auxiliary, 1 kHz ADC sampling rate',
      functionDesc: 'Continuously measures physical phenomena (thermodynamics, harmonics, amperage) and streams digital telemetry.',
    },
    None: {
      title: 'All Systems Operating Nominally',
      location: 'Full Elevator Plant',
      components: ['Drive Motor', 'Sheave Bearings', 'Entrance Doors', 'Sensors'],
      specs: 'Healthy operating parameters compliant with EN 81-20 / ASME A17.1',
      functionDesc: 'All mechanical, electrical, and telemetry components operating within designated design thresholds.',
    },
  };

  const currentDetails = subsystemDetails[selectedComponent] || subsystemDetails.None;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Automatic Fault Isolation Architecture
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Interactive topological schematic • Real-time component isolation highlight
          </p>
        </div>

        {/* Current Isolation State */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Isolated Subsystem:</span>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
              isolated === 'None'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/60 text-rose-300 animate-pulse'
            }`}
          >
            {isolated === 'None' ? 'None (All Nominal)' : `${isolated} Subsystem`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SVG Elevator Illustration (7 cols on large screens) */}
        <div className="lg:col-span-7 bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full flex justify-between items-center text-[11px] text-slate-400 mb-2 px-2 border-b border-slate-800/60 pb-1.5">
            <span className="font-mono text-teal-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              HOISTWAY CROSS-SECTION
            </span>
            <span className="text-slate-500">MRL Traction Configuration</span>
          </div>

          <svg
            viewBox="0 0 540 540"
            className="w-full max-w-[480px] h-auto drop-shadow-md select-none"
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="carGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="motorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <linearGradient id="glowFault" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
              <linearGradient id="glowBearing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Hoistway Shaft Walls */}
            <rect x="40" y="20" width="460" height="500" rx="8" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
            <line x1="70" y1="20" x2="70" y2="520" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1.5" />
            <line x1="470" y1="20" x2="470" y2="520" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1.5" />

            {/* Guide Rails */}
            <line x1="90" y1="90" x2="90" y2="510" stroke="#334155" strokeWidth="3" />
            <line x1="450" y1="90" x2="450" y2="510" stroke="#334155" strokeWidth="3" />

            {/* 1. MACHINE ROOM SECTION (Top) */}
            <rect x="50" y="25" width="440" height="95" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <text x="65" y="42" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
              MACHINE ROOM LEVEL 14 (OVERHEAD)
            </text>

            {/* --- SUBSYSTEM 1: MOTOR --- */}
            <g
              onClick={() => setSelectedComponent('Motor')}
              className="cursor-pointer transition-all hover:opacity-90"
            >
              <rect
                x="80"
                y="50"
                width="110"
                height="56"
                rx="6"
                fill={isolated === 'Motor' ? '#e11d48' : '#1e293b'}
                stroke={isolated === 'Motor' ? '#fda4af' : '#0d9488'}
                strokeWidth={isolated === 'Motor' ? '3' : '2'}
              />
              {/* Motor Cooling Fins */}
              <line x1="95" y1="56" x2="95" y2="98" stroke="#334155" strokeWidth="2" />
              <line x1="110" y1="56" x2="110" y2="98" stroke="#334155" strokeWidth="2" />
              <line x1="125" y1="56" x2="125" y2="98" stroke="#334155" strokeWidth="2" />
              <line x1="140" y1="56" x2="140" y2="98" stroke="#334155" strokeWidth="2" />
              <text x="100" y="82" fill="#ffffff" fontSize="11" fontWeight="bold">
                TRACTION MOTOR
              </text>
              {isolated === 'Motor' && (
                <circle cx="85" cy="55" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </g>

            {/* Motor Drive Shaft Connection */}
            <rect x="190" y="72" width="30" height="12" fill="#475569" />

            {/* --- SUBSYSTEM 2: BEARING & SHEAVE --- */}
            <g
              onClick={() => setSelectedComponent('Bearing')}
              className="cursor-pointer transition-all hover:opacity-90"
            >
              <circle
                cx="250"
                cy="78"
                r="34"
                fill={isolated === 'Bearing' ? '#d97706' : '#1e293b'}
                stroke={isolated === 'Bearing' ? '#fcd34d' : '#14b8a6'}
                strokeWidth={isolated === 'Bearing' ? '3.5' : '2'}
              />
              <circle cx="250" cy="78" r="24" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              {/* Bearing balls representation */}
              <circle cx="250" cy="58" r="3" fill="#94a3b8" />
              <circle cx="270" cy="78" r="3" fill="#94a3b8" />
              <circle cx="250" cy="98" r="3" fill="#94a3b8" />
              <circle cx="230" cy="78" r="3" fill="#94a3b8" />
              <circle cx="250" cy="78" r="6" fill="#38bdf8" />
              <text x="222" y="125" fill="#f8fafc" fontSize="10" fontWeight="bold">
                BEARING / SHEAVE
              </text>
              {isolated === 'Bearing' && (
                <circle cx="275" cy="55" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </g>

            {/* --- SUBSYSTEM 4: SENSOR JUNCTION BOX --- */}
            <g
              onClick={() => setSelectedComponent('Sensor')}
              className="cursor-pointer transition-all hover:opacity-90"
            >
              <rect
                x="370"
                y="52"
                width="95"
                height="50"
                rx="4"
                fill={isolated === 'Sensor' ? '#0891b2' : '#1e293b'}
                stroke={isolated === 'Sensor' ? '#67e8f9' : '#0284c7'}
                strokeWidth={isolated === 'Sensor' ? '3' : '1.5'}
              />
              <text x="382" y="72" fill="#ffffff" fontSize="9" fontWeight="bold">
                SENSOR HUB
              </text>
              <text x="382" y="88" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                ADC & TELEMETRY
              </text>
              {isolated === 'Sensor' && (
                <circle cx="455" cy="55" r="7" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </g>

            {/* Steel Suspension Cables */}
            <path
              d="M 226 78 L 226 230"
              stroke="#64748b"
              strokeWidth="3.5"
            />
            <path
              d="M 274 78 L 274 230"
              stroke="#64748b"
              strokeWidth="3.5"
            />
            {/* Cable to Counterweight */}
            <path
              d="M 274 78 L 440 78 L 440 340"
              stroke="#64748b"
              strokeWidth="2.5"
            />

            {/* Counterweight */}
            <g>
              <rect x="428" y="340" width="24" height="90" rx="3" fill="#334155" stroke="#475569" strokeWidth="1.5" />
              <line x1="432" y1="360" x2="448" y2="360" stroke="#1e293b" />
              <line x1="432" y1="385" x2="448" y2="385" stroke="#1e293b" />
              <line x1="432" y1="410" x2="448" y2="410" stroke="#1e293b" />
              <text x="415" y="445" fill="#64748b" fontSize="8" fontFamily="monospace">
                CWT (600kg)
              </text>
            </g>

            {/* 2. ELEVATOR CAR (CABIN) */}
            <g>
              {/* Sling frame */}
              <rect x="130" y="215" width="240" height="235" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              
              {/* Crosshead cable hitch */}
              <rect x="220" y="205" width="60" height="15" rx="3" fill="#475569" stroke="#64748b" />
              <text x="230" y="216" fill="#cbd5e1" fontSize="8" fontWeight="bold">
                HITCH
              </text>

              {/* Interior Cab Body */}
              <rect x="145" y="235" width="210" height="195" rx="4" fill="url(#carGrad)" stroke="#334155" />
              {/* Ceiling light */}
              <rect x="195" y="238" width="110" height="6" rx="2" fill="#38bdf8" opacity="0.8" />
              {/* Handrail */}
              <line x1="155" y1="355" x2="345" y2="355" stroke="#64748b" strokeWidth="3" />

              {/* Passengers / Load Silhouette */}
              <circle cx="210" cy="320" r="12" fill="#475569" />
              <path d="M 195 350 C 195 332, 225 332, 225 350 Z" fill="#475569" />
              <circle cx="270" cy="315" r="14" fill="#64748b" />
              <path d="M 250 350 C 250 330, 290 330, 290 350 Z" fill="#64748b" />

              {/* Floor / Load Cell sensor */}
              <rect x="150" y="420" width="200" height="8" fill="#0d9488" opacity="0.6" />
              <text x="200" y="415" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                LOAD CELL (ACTIVE)
              </text>
            </g>

            {/* --- SUBSYSTEM 3: ENTRANCE DOORS & OPERATOR --- */}
            <g
              onClick={() => setSelectedComponent('Door')}
              className="cursor-pointer transition-all hover:opacity-90"
            >
              {/* Header Door Operator */}
              <rect
                x="150"
                y="222"
                width="200"
                height="14"
                rx="3"
                fill={isolated === 'Door' ? '#e11d48' : '#0f766e'}
                stroke={isolated === 'Door' ? '#fda4af' : '#14b8a6'}
                strokeWidth={isolated === 'Door' ? '2.5' : '1'}
              />
              <text x="190" y="233" fill="#ffffff" fontSize="8" fontWeight="bold">
                DOOR OPERATOR & TRACK
              </text>

              {/* Telescoping Door Panels */}
              <rect
                x="152"
                y="240"
                width="42"
                height="180"
                fill={isolated === 'Door' ? '#be123c' : '#334155'}
                stroke="#64748b"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <rect
                x="196"
                y="240"
                width="42"
                height="180"
                fill={isolated === 'Door' ? '#be123c' : '#334155'}
                stroke="#64748b"
                strokeWidth="1.5"
                opacity="0.9"
              />

              {/* Optical Safety Light Curtain (Sensors along door edge) */}
              <line
                x1="240"
                y1="242"
                x2="240"
                y2="418"
                stroke={currentAnalysis?.reading.door_sensor_status === 1 ? '#ef4444' : '#10b981'}
                strokeWidth="3.5"
                strokeDasharray="5 3"
              />
              <text x="246" y="335" fill="#f8fafc" fontSize="8" fontWeight="bold" transform="rotate(90 246 335)">
                LIGHT CURTAIN
              </text>
              {isolated === 'Door' && (
                <circle cx="152" cy="225" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              )}
            </g>

            {/* Buffer Springs at Shaft Pit */}
            <rect x="180" y="495" width="30" height="25" rx="3" fill="#334155" stroke="#475569" />
            <path d="M 195 495 L 195 475" stroke="#94a3b8" strokeWidth="4" />
            <rect x="290" y="495" width="30" height="25" rx="3" fill="#334155" stroke="#475569" />
            <path d="M 305 495 L 305 475" stroke="#94a3b8" strokeWidth="4" />
            <text x="205" y="515" fill="#64748b" fontSize="8" fontFamily="monospace">
              SAFETY BUFFER PIT
            </text>
          </svg>

          {/* Interactive Legend Bar */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400 font-medium">Click component to inspect:</span>
            <button
              onClick={() => setSelectedComponent('Motor')}
              className={`px-2 py-0.5 rounded border ${
                selectedComponent === 'Motor' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Drive Motor {isolated === 'Motor' && '⚠️'}
            </button>
            <button
              onClick={() => setSelectedComponent('Bearing')}
              className={`px-2 py-0.5 rounded border ${
                selectedComponent === 'Bearing' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Sheave Bearing {isolated === 'Bearing' && '⚠️'}
            </button>
            <button
              onClick={() => setSelectedComponent('Door')}
              className={`px-2 py-0.5 rounded border ${
                selectedComponent === 'Door' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Door System {isolated === 'Door' && '⚠️'}
            </button>
            <button
              onClick={() => setSelectedComponent('Sensor')}
              className={`px-2 py-0.5 rounded border ${
                selectedComponent === 'Sensor' ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Sensor Hub {isolated === 'Sensor' && '⚠️'}
            </button>
          </div>
        </div>

        {/* Technical Subsystem Specification & Isolation Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 font-mono">
                Subsystem Diagnostics
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isolated === selectedComponent
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isolated === selectedComponent ? 'FAULT ISOLATED HERE' : 'OPERATIONAL'}
              </span>
            </div>

            <h4 className="text-base font-bold text-white mb-1">
              {currentDetails.title}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {currentDetails.location}
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Functional Description:</span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {currentDetails.functionDesc}
                </p>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Monitored Assembly Components:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                  {currentDetails.components.map((comp, idx) => (
                    <li key={idx}>{comp}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Engineering Ratings & Specs:</span>
                <span className="font-mono text-teal-300 text-xs">{currentDetails.specs}</span>
              </div>
            </div>
          </div>

          {/* Isolation Decision Logic Card */}
          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>How Automatic Isolation Works</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              When the Machine Learning model detects a high anomaly signature, the isolation engine maps multi-parameter telemetry correlations to the physical subsystem boundary. This prevents replacing healthy components and isolates the defect directly to the field field-replaceable unit (FRU).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
