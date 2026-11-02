import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Clock,
  Cpu,
  Flame,
  Layers,
  Menu,
  Shield,
  Sliders,
  Weight,
  Wrench,
  Zap
} from 'lucide-react';
import { Header } from './components/Header';
import { NavTab, Sidebar } from './components/Sidebar';
import { OverviewStats } from './components/OverviewStats';
import { SensorCard } from './components/SensorCard';
import { TelemetryCharts } from './components/TelemetryCharts';
import { ElevatorSchematic } from './components/ElevatorSchematic';
import { FaultDetectionPanel } from './components/FaultDetectionPanel';
import { RootCauseAnalysisPanel } from './components/RootCauseAnalysisPanel';
import { MaintenanceAlertsTable } from './components/MaintenanceAlertsTable';
import { SimulationControls } from './components/SimulationControls';
import { BackendConfigModal } from './components/BackendConfigModal';

import {
  AnalysisResult,
  MaintenanceAlert,
  SensorReading
} from './types/elevator';
import {
  analyzeTelemetry,
  createAlertFromResult,
  generateSyntheticReading,
  getBaselineForLoad
} from './services/elevatorLogic';
import {
  BackendConfig,
  getBackendConfig,
  saveBackendConfig,
  sendTelemetryForAnalysis
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(getBackendConfig());
  const [backendSource, setBackendSource] = useState<'standalone' | 'flask'>('standalone');
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Initialize with a healthy baseline reading
  const [currentReading, setCurrentReading] = useState<SensorReading>(() => generateSyntheticReading('Normal'));
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult>(() => analyzeTelemetry(currentReading));

  // Run initial prediction through backend if configured
  useEffect(() => {
    if (backendConfig.mode === 'flask' && backendConfig.flaskUrl) {
      processNewReading(currentReading);
    }
  }, [backendConfig.flaskUrl, backendConfig.mode]);

  // Historical telemetry stream for Chart.js (seed with 12 points)
  const [history, setHistory] = useState<SensorReading[]>(() => {
    const list: SensorReading[] = [];
    for (let i = 11; i >= 0; i--) {
      const r = generateSyntheticReading('Normal');
      const d = new Date(Date.now() - i * 3000);
      r.timestamp = d.toTimeString().split(' ')[0];
      list.push(r);
    }
    return list;
  });

  // Seed historical maintenance alerts
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([
    {
      id: 'ALT-B942',
      timestamp: '07:22:14',
      fault: 'Bearing fault',
      subsystem: 'Bearing',
      severity: 'Warning',
      confidence: 0.93,
      possibleCause: 'High-frequency raceway harmonic detected; lubrication starvation.',
      action: 'Apply acoustic lubrication check to main drive sheave bearing.',
      acknowledged: true,
      readingId: 'READ-PREV1',
    },
    {
      id: 'ALT-D105',
      timestamp: '06:45:00',
      fault: 'Door fault',
      subsystem: 'Door',
      severity: 'Warning',
      confidence: 0.91,
      possibleCause: 'Door closing cycle exceeded 6.8 seconds with optical curtain bounce.',
      action: 'Inspect landing door sill groove for foreign debris and align sensor curtain.',
      acknowledged: false,
      readingId: 'READ-PREV2',
    },
  ]);

  // Telemetry counts
  const [totalReadingsCount, setTotalReadingsCount] = useState<number>(142);
  const [normalCount, setNormalCount] = useState<number>(136);
  const [faultCount, setFaultCount] = useState<number>(6);

  // Process a new sensor reading
  const processNewReading = async (reading: SensorReading) => {
    setCurrentReading(reading);
    const { result, source, error } = await sendTelemetryForAnalysis(reading, backendConfig);
    setCurrentAnalysis(result);
    setBackendSource(source);
    setBackendError(error || null);

    // Update history for Chart.js
    setHistory((prev) => {
      const next = [...prev, reading];
      return next.slice(-25); // keep last 25 readings
    });

    // Update statistics
    setTotalReadingsCount((prev) => prev + 1);
    if (result.predicted_fault === 'Normal') {
      setNormalCount((prev) => prev + 1);
    } else {
      setFaultCount((prev) => prev + 1);
      const newAlert = createAlertFromResult(result);
      if (newAlert) {
        setAlerts((prev) => [newAlert, ...prev]);
      }
    }
  };

  // Generate random reading
  const handleGenerateRandom = () => {
    const reading = generateSyntheticReading('Random');
    processNewReading(reading);
  };

  // Inject specific fault preset
  const handleInjectPreset = (preset: 'Normal' | 'Motor fault' | 'Bearing fault' | 'Door fault' | 'Sensor fault') => {
    const reading = generateSyntheticReading(preset);
    processNewReading(reading);
  };

  // Custom manual telemetry from sliders
  const handleCustomAnalyze = (reading: SensorReading) => {
    processNewReading(reading);
  };

  // Auto-streaming simulation effect
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // 80% normal, 20% random minor variation while streaming
      const mode = Math.random() < 0.8 ? 'Normal' : 'Random';
      const reading = generateSyntheticReading(mode);
      processNewReading(reading);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, backendConfig]);

  // Acknowledge alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  // Find evidence per sensor for quick card lookup
  const getEvidence = (feature: string) => {
    return currentAnalysis?.sensor_evidence.find((e) => e.feature === feature);
  };

  const baseline = getBaselineForLoad(currentReading.elevator_load);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentAnalysis={currentAnalysis}
        backendConfig={backendConfig}
        backendSource={backendSource}
        backendError={backendError}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSimulator={() => setActiveTab('simulator')}
        onGenerateReading={handleGenerateRandom}
        activeAlertCount={activeAlertCount}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeAlertCount={activeAlertCount}
          currentFault={currentAnalysis.predicted_fault}
          isOpenMobile={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* Flask Backend Error / Fallback Notification Banner */}
          {backendError && backendConfig.mode === 'flask' && (
            <div className="bg-amber-950/70 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3 shadow-md animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Colab Backend Alert:</strong> {backendError}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-md border border-amber-500/40 transition"
                >
                  Configure URL
                </button>
                <button
                  onClick={() => setBackendError(null)}
                  className="text-amber-400 hover:text-white p-1 text-sm font-bold"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Mobile hamburger row */}
          <div className="lg:hidden flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Menu className="w-4 h-4 text-teal-400" />
              <span>Menu Navigation</span>
            </button>
            <span className="text-xs font-mono text-teal-400">
              Active: {activeTab.toUpperCase()}
            </span>
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 1. Overview KPI Cards */}
              <OverviewStats
                totalReadingsCount={totalReadingsCount}
                normalCount={normalCount}
                faultCount={faultCount}
                activeAlertCount={activeAlertCount}
                currentAnalysis={currentAnalysis}
                onNavigateToTab={setActiveTab}
              />

              {/* 2. Sensor Monitoring Cards Grid (The 6 Parameters) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                      Live Sensor Telemetry Streams (6 Parameters)
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Timestamp: {currentReading.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sensor 1: Motor Temperature */}
                  <SensorCard
                    name="Motor Temperature"
                    value={currentReading.motor_temperature}
                    unit="°C"
                    icon={Flame}
                    subsystem="Traction Drive"
                    nominalRange={`${baseline.expectedTempMin.toFixed(0)}-${baseline.expectedTempMax.toFixed(0)} °C`}
                    evidence={getEvidence('motor_temperature')}
                    minScale={20}
                    maxScale={120}
                  />

                  {/* Sensor 2: Vibration */}
                  <SensorCard
                    name="Machine Vibration"
                    value={currentReading.vibration}
                    unit="mm/s"
                    icon={Activity}
                    subsystem="Bearing Housing"
                    nominalRange="0.50-1.80 mm/s"
                    evidence={getEvidence('vibration')}
                    minScale={0.1}
                    maxScale={10.0}
                  />

                  {/* Sensor 3: Motor Current */}
                  <SensorCard
                    name="Motor Current Draw"
                    value={currentReading.motor_current}
                    unit="A"
                    icon={Zap}
                    subsystem="Electrical Inverter"
                    nominalRange={`${baseline.expectedCurrentMin.toFixed(1)}-${baseline.expectedCurrentMax.toFixed(1)} A`}
                    evidence={getEvidence('motor_current')}
                    minScale={5.0}
                    maxScale={45.0}
                  />

                  {/* Sensor 4: Elevator Load */}
                  <SensorCard
                    name="Elevator Load Weight"
                    value={currentReading.elevator_load}
                    unit="kg"
                    icon={Weight}
                    subsystem="Car Floor Strain"
                    nominalRange="0-800 kg"
                    evidence={getEvidence('elevator_load')}
                    minScale={0}
                    maxScale={900}
                  />

                  {/* Sensor 5: Door Closing Time */}
                  <SensorCard
                    name="Door Closing Duration"
                    value={currentReading.door_closing_time}
                    unit="s"
                    icon={Clock}
                    subsystem="Entrance Operator"
                    nominalRange="2.50-4.00 s"
                    evidence={getEvidence('door_closing_time')}
                    minScale={1.0}
                    maxScale={12.0}
                  />

                  {/* Sensor 6: Door Sensor Status */}
                  <SensorCard
                    name="Light Curtain Sensor"
                    value={currentReading.door_sensor_status}
                    unit=""
                    icon={Shield}
                    subsystem="Safety Edge Detector"
                    nominalRange="0 (Clear)"
                    evidence={getEvidence('door_sensor_status')}
                    minScale={0}
                    maxScale={1}
                    isBinary={true}
                  />
                </div>
              </div>

              {/* 3. AI Fault Detection Banner & Confidence */}
              <FaultDetectionPanel analysis={currentAnalysis} />

              {/* 4. Chart.js Multi-Channel Telemetry Graph */}
              <TelemetryCharts history={history} />

              {/* 5. Split Section: Quick Elevator Schematic Preview & RCA Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-teal-400" />
                      Subsystem Isolation Map
                    </h3>
                    <button
                      onClick={() => setActiveTab('isolation')}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                    >
                      <span>Full Schematic</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <ElevatorSchematic currentAnalysis={currentAnalysis} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-teal-400" />
                      Root Cause & Work Order
                    </h3>
                    <button
                      onClick={() => setActiveTab('rca')}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                    >
                      <span>Full RCA Audit</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <RootCauseAnalysisPanel analysis={currentAnalysis} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATIC FAULT ISOLATION SCHEMATIC */}
          {activeTab === 'isolation' && (
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Feature 2: Automatic Fault Isolation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pinpoints the defective component boundary (Drive Motor, Bearing Assembly, Entrance Door, or Transducers)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInjectPreset('Motor fault')}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30"
                  >
                    Test Motor Isolation
                  </button>
                  <button
                    onClick={() => handleInjectPreset('Bearing fault')}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
                  >
                    Test Bearing Isolation
                  </button>
                  <button
                    onClick={() => handleInjectPreset('Door fault')}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-500/30"
                  >
                    Test Door Isolation
                  </button>
                </div>
              </div>

              <ElevatorSchematic currentAnalysis={currentAnalysis} />
            </div>
          )}

          {/* TAB 3: ROOT CAUSE ANALYSIS (RCA) */}
          {activeTab === 'rca' && (
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Feature 3: Evidence-Based Root Cause Analysis
                  </h2>
                  <p className="text-xs text-slate-400">
                    Transparent quantitative audit comparing live signals against nominal physical baselines
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-400 font-semibold px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                  Confidence: {Math.round(currentAnalysis.confidence * 100)}%
                </span>
              </div>

              <RootCauseAnalysisPanel analysis={currentAnalysis} />
            </div>
          )}

          {/* TAB 4: SMART MAINTENANCE ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-5">
              <MaintenanceAlertsTable
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onClearAlerts={handleClearAlerts}
              />
            </div>
          )}

          {/* TAB 5: SENSOR SIMULATOR & ANOMALY INJECTION */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <SimulationControls
                onInjectPreset={handleInjectPreset}
                onCustomAnalyze={handleCustomAnalyze}
                onGenerateRandom={handleGenerateRandom}
                isStreaming={isStreaming}
                onToggleStreaming={() => setIsStreaming(!isStreaming)}
                currentReading={currentReading}
              />

              {/* Telemetry charts right under simulator for instant visual feedback */}
              <TelemetryCharts history={history} />
            </div>
          )}

          {/* TAB 6: PYTHON FLASK & COLAB INTEGRATION GUIDE */}
          {activeTab === 'backend' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-teal-400" />
                    Python Flask & Machine Learning Integration
                  </h2>
                  <p className="text-xs text-slate-400">
                    Architecture for connecting this React dashboard to your Python Scikit-Learn Random Forest model
                  </p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
                >
                  Configure API Endpoint
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-teal-400 uppercase font-mono">1. Module 1: ML Model</span>
                  <p className="text-slate-300">
                    Trained Random Forest model saved as <code className="text-teal-300 bg-slate-900 px-1 py-0.5 rounded">elevator_rf_model.pkl</code> in Google Colab or your Python environment.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-teal-400 uppercase font-mono">2. Module 2 & 3: Flask API</span>
                  <p className="text-slate-300">
                    Flask server with <code className="text-teal-300 bg-slate-900 px-1 py-0.5 rounded">flask_cors</code> exposes endpoints <code className="text-teal-300 bg-slate-900 px-1 py-0.5 rounded">/api/predict</code> and <code className="text-teal-300 bg-slate-900 px-1 py-0.5 rounded">/api/health</code>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-teal-400 uppercase font-mono">3. React Dashboard</span>
                  <p className="text-slate-300">
                    Sends live JSON vectors to the Flask backend and renders real-time Chart.js telemetry, fault isolation, and RCA explanations.
                  </p>
                </div>
              </div>

              {/* Status info */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Current Operating Inference Engine:</span>
                  <span className="text-sm font-bold text-white">
                    {backendSource === 'flask' ? 'External Python Flask Server' : 'In-Browser High-Fidelity Decision Engine'}
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  Manage Connection
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Backend Settings Modal */}
      <BackendConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={backendConfig}
        onSaveConfig={(newConfig) => {
          setBackendConfig(newConfig);
          saveBackendConfig(newConfig);
        }}
      />
    </div>
  );
}
