import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Play,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import { FaultCategory, SensorReading } from '../types/elevator';

interface SimulationControlsProps {
  onInjectPreset: (preset: 'Normal' | 'Motor fault' | 'Bearing fault' | 'Door fault' | 'Sensor fault') => void;
  onCustomAnalyze: (reading: SensorReading) => void;
  onGenerateRandom: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  currentReading: SensorReading;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  onInjectPreset,
  onCustomAnalyze,
  onGenerateRandom,
  isStreaming,
  onToggleStreaming,
  currentReading,
}) => {
  // Local state for manual sliders
  const [temp, setTemp] = useState<number>(currentReading.motor_temperature);
  const [vibe, setVibe] = useState<number>(currentReading.vibration);
  const [current, setCurrent] = useState<number>(currentReading.motor_current);
  const [load, setLoad] = useState<number>(currentReading.elevator_load);
  const [doorTime, setDoorTime] = useState<number>(currentReading.door_closing_time);
  const [doorStatus, setDoorStatus] = useState<number>(currentReading.door_sensor_status);

  // Sync sliders when reading changes from outside (e.g. preset clicked)
  React.useEffect(() => {
    setTemp(currentReading.motor_temperature);
    setVibe(currentReading.vibration);
    setCurrent(currentReading.motor_current);
    setLoad(currentReading.elevator_load);
    setDoorTime(currentReading.door_closing_time);
    setDoorStatus(currentReading.door_sensor_status);
  }, [currentReading]);

  const handleApplyCustom = () => {
    const customReading: SensorReading = {
      id: 'CUSTOM-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      timestamp: new Date().toTimeString().split(' ')[0],
      motor_temperature: Number(temp),
      vibration: Number(vibe),
      motor_current: Number(current),
      elevator_load: Number(load),
      door_closing_time: Number(doorTime),
      door_sensor_status: Number(doorStatus),
    };
    onCustomAnalyze(customReading);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Sensor Telemetry Simulator & Fault Injector
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Generate synthetic operational scenarios or test custom multi-sensor edge cases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isStreaming
                ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-ping' : ''}`} />
            <span>{isStreaming ? 'Live Auto-Stream: ON' : 'Start Auto-Stream'}</span>
          </button>

          <button
            onClick={onGenerateRandom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Random Reading</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Quick Injectors */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          One-Click Fault Injection Scenarios:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => onInjectPreset('Normal')}
            className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-950/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                1. Normal Run
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Nominal vibration (1.1 mm/s) & temp (42°C)
            </p>
          </button>

          <button
            onClick={() => onInjectPreset('Motor fault')}
            className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200">
                2. Motor Overheat
              </span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Temp 92°C & High Current 34.2A
            </p>
          </button>

          <button
            onClick={() => onInjectPreset('Bearing fault')}
            className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                3. Bearing Defect
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              High vibration 5.8 mm/s with race wear
            </p>
          </button>

          <button
            onClick={() => onInjectPreset('Door fault')}
            className="p-3 rounded-lg border border-orange-500/40 bg-orange-950/30 hover:bg-orange-950/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-orange-300 group-hover:text-orange-200">
                4. Door Track Jam
              </span>
              <Activity className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Closing time 8.4s & light curtain trip
            </p>
          </button>

          <button
            onClick={() => onInjectPreset('Sensor fault')}
            className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                5. Sensor Glitch
              </span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Cryogenic temp drop (-25°C) or spike
            </p>
          </button>
        </div>
      </div>

      {/* Manual Fine-Tuning Parameter Sliders */}
      <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Manual Sensor Calibration Sliders
          </h4>
          <span className="text-[11px] text-teal-400 font-mono">
            Adjust & click 'Analyze Custom Telemetry'
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Motor Temperature */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Motor Temperature</span>
              <span className="font-mono text-teal-300 font-bold">{temp} °C</span>
            </div>
            <input
              type="range"
              min="-30"
              max="125"
              step="0.5"
              value={temp}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-30°C (Glitch)</span>
              <span>Nominal: 35-55°C</span>
              <span>125°C (Burnout)</span>
            </div>
          </div>

          {/* Vibration */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Machine Vibration</span>
              <span className="font-mono text-teal-300 font-bold">{vibe} mm/s</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="12.0"
              step="0.1"
              value={vibe}
              onChange={(e) => setVibe(parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.1 mm/s</span>
              <span>Nominal: 0.5-1.8</span>
              <span>12.0 mm/s (Defect)</span>
            </div>
          </div>

          {/* Motor Current */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Motor Current</span>
              <span className="font-mono text-teal-300 font-bold">{current} A</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="45.0"
              step="0.5"
              value={current}
              onChange={(e) => setCurrent(parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0A (Open Wire)</span>
              <span>Nominal: 8-18A</span>
              <span>45A (Overload)</span>
            </div>
          </div>

          {/* Elevator Load */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Elevator Load</span>
              <span className="font-mono text-teal-300 font-bold">{load} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="950"
              step="10"
              value={load}
              onChange={(e) => setLoad(parseInt(e.target.value, 10))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 kg (Empty)</span>
              <span>Nominal: 0-800 kg</span>
              <span>950 kg (Over)</span>
            </div>
          </div>

          {/* Door Closing Time */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Door Closing Time</span>
              <span className="font-mono text-teal-300 font-bold">{doorTime} s</span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="15.0"
              step="0.2"
              value={doorTime}
              onChange={(e) => setDoorTime(parseFloat(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-1s (Glitch)</span>
              <span>Nominal: 2.5-4.0s</span>
              <span>15s (Obstruction)</span>
            </div>
          </div>

          {/* Door Sensor Status */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-center font-medium">
              <span className="text-slate-300">Optical Light Curtain</span>
              <span className={`font-mono font-bold ${doorStatus === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {doorStatus === 1 ? '1 (TRIPPED)' : '0 (CLEAR)'}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDoorStatus(0)}
                className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                  doorStatus === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                0 (Clear)
              </button>
              <button
                type="button"
                onClick={() => setDoorStatus(1)}
                className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                  doorStatus === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1 (Obstructed)
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Safety edge sensor status
            </div>
          </div>
        </div>

        {/* Apply Custom Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleApplyCustom}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Analyze Custom Telemetry Vector</span>
          </button>
        </div>
      </div>
    </div>
  );
};
