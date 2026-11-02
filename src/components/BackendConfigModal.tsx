import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  Info,
  Radio,
  RefreshCw,
  Server,
  X
} from 'lucide-react';
import { BackendConfig, DEFAULT_FLASK_URL, saveBackendConfig, testFlaskConnection } from '../services/api';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onSaveConfig: (newConfig: BackendConfig) => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [mode, setMode] = useState<'standalone' | 'flask'>(config.mode);
  const [url, setUrl] = useState<string>(config.flaskUrl || DEFAULT_FLASK_URL);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testFlaskConnection(url);
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    const updated: BackendConfig = {
      mode,
      flaskUrl: url.trim(),
      autoReconnect: true,
    };
    saveBackendConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const flaskSnippet = `# Flask Backend Endpoint Code for Google Colab / ngrok:
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
# Enable CORS for React frontend (allows all origins & headers like ngrok-skip-browser-warning)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*"}})

# Load the trained model bundle from Module 1
bundle = joblib.load('elevator_rf_model.pkl')
model = bundle['model']
classes = bundle['class_names']

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "message": "Elevator ML Flask API is active"})

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    vector = [[
        float(data['motor_temperature']),
        float(data['vibration']),
        float(data['motor_current']),
        float(data['elevator_load']),
        float(data['door_closing_time']),
        float(data['door_sensor_status'])
    ]]
    pred_idx = model.predict(vector)[0]
    fault = classes[pred_idx]
    probs = model.predict_proba(vector)[0].tolist()
    
    return jsonify({
        "status": "success",
        "fault_category": fault,
        "confidence": round(float(max(probs)) * 100, 2),
        "subsystem": "Motor" if "Motor" in fault else ("Bearing" if "Bearing" in fault else ("Door" if "Door" in fault else ("Sensor" if "Sensor" in fault else "None"))),
        "possible_root_cause": f"Model identified signature of {fault}."
    })

if __name__ == '__main__':
    app.run(port=5000)`;
  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(flaskSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Python Flask & Machine Learning API Setup
              </h3>
              <p className="text-xs text-slate-400">
                Connect your React UI directly to a local Python script or Google Colab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
              Inference Engine Source:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('standalone')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  mode === 'standalone'
                    ? 'border-teal-500 bg-teal-950/30 shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Standalone In-Browser AI</span>
                  {mode === 'standalone' && <span className="w-2 h-2 rounded-full bg-teal-400"></span>}
                </div>
                <p className="text-[11px] text-slate-400">
                  Runs calibrated decision boundaries locally in the browser with 0ms latency. No backend required.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('flask')}
                className={`p-3.5 rounded-xl border text-left transition ${
                  mode === 'flask'
                    ? 'border-teal-500 bg-teal-950/30 shadow-sm'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">External Python Flask API</span>
                  {mode === 'flask' && <span className="w-2 h-2 rounded-full bg-teal-400"></span>}
                </div>
                <p className="text-[11px] text-slate-400">
                  Dispatches JSON sensor vectors to your Python Flask server or Google Colab ngrok tunnel.
                </p>
              </button>
            </div>
          </div>

          {/* Flask Endpoint Config (Visible if flask mode is chosen) */}
          {mode === 'flask' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Flask Backend Base URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://localhost:5000 or https://xxxx.ngrok-free.app"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-teal-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition disabled:opacity-50"
                  >
                    {testing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Test Ping</span>
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-teal-300/90 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>ngrok bypass active: <code>ngrok-skip-browser-warning: true</code> included in all requests</span>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs border flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Python Code Snippet Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Flask Backend Code Template (Module 3)</span>
              </span>
              <button
                onClick={copyCodeToClipboard}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
              {flaskSnippet}
            </pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-sm"
          >
            Save & Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
