import {
  AnalysisResult,
  FaultCategory,
  SensorEvidence,
  SensorReading,
  SubsystemType,
  AlertSeverity
} from '../types/elevator';
import { analyzeTelemetry, generateSyntheticReading } from './elevatorLogic';

export interface BackendConfig {
  mode: 'standalone' | 'flask';
  flaskUrl: string;
  autoReconnect: boolean;
}

const STORAGE_KEY = 'elevator_backend_config';
export const DEFAULT_FLASK_URL = 'https://backlash-trimness-impolite.ngrok-free.dev';

export function getBackendConfig(): BackendConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure the URL defaults to the user's Colab ngrok backend if it was set to localhost
      if (!parsed.flaskUrl || parsed.flaskUrl === 'http://localhost:5000') {
        parsed.flaskUrl = DEFAULT_FLASK_URL;
      }
      return parsed;
    }
  } catch {
    // fallback
  }
  return {
    mode: 'flask', // Default to flask now that the user has a live Colab backend running
    flaskUrl: DEFAULT_FLASK_URL,
    autoReconnect: true,
  };
}

export function saveBackendConfig(config: BackendConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save backend config', e);
  }
}

/**
 * Standard ngrok bypass headers to prevent ngrok from serving the HTML warning interstitial
 */
function getNgrokHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
    ...extra,
  };
}

/**
 * Checks if the external Flask / Colab API is reachable via GET /api/health
 */
export async function testFlaskConnection(url: string): Promise<{ success: boolean; message: string }> {
  const cleanUrl = url.trim().replace(/\/$/, '');
  if (!cleanUrl) {
    return { success: false, message: 'Please provide a valid backend URL.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${cleanUrl}/api/health`, {
      method: 'GET',
      headers: getNgrokHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        return {
          success: true,
          message: data.message || `Connected to Colab Flask backend (${res.status} OK)`,
        };
      } else {
        // Returned HTML (likely ngrok interstitial or web server error page)
        return {
          success: false,
          message: 'Received HTML instead of JSON. Ensure ngrok-skip-browser-warning is active.',
        };
      }
    }

    if (res.status === 502 || res.status === 503) {
      return {
        success: false,
        message: `HTTP ${res.status} Bad Gateway: Colab notebook may be stopped or disconnected from ngrok.`,
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: 'HTTP 404: Endpoint /api/health not found on this server.',
      };
    }

    return { success: false, message: `Server returned HTTP status ${res.status}` };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out after 6 seconds. Check if Colab is running.' };
    }
    const errorMsg = err instanceof Error ? err.message : 'Connection failed';
    return {
      success: false,
      message: `Could not reach ${cleanUrl}: ${errorMsg}. (Check if ngrok tunnel is still active and CORS is enabled)`,
    };
  }
}

/**
 * Predicts and analyzes telemetry, either using the connected Flask server
 * or using the local decision engine.
 */
export async function sendTelemetryForAnalysis(
  reading: SensorReading,
  config: BackendConfig = getBackendConfig()
): Promise<{ result: AnalysisResult; source: 'flask' | 'standalone'; error?: string }> {
  if (config.mode === 'flask' && config.flaskUrl) {
    const cleanUrl = config.flaskUrl.trim().replace(/\/$/, '');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(`${cleanUrl}/api/predict`, {
        method: 'POST',
        headers: getNgrokHeaders({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          motor_temperature: reading.motor_temperature,
          vibration: reading.vibration,
          motor_current: reading.motor_current,
          elevator_load: reading.elevator_load,
          door_closing_time: reading.door_closing_time,
          door_sensor_status: reading.door_sensor_status,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();

          // Normalization of Colab Flask response schema
          const fallback = analyzeTelemetry(reading);

          // 1. Fault category
          const predicted_fault: FaultCategory =
            data.fault_category || data.predicted_fault || data.prediction || fallback.predicted_fault;

          // 2. Confidence (handles both 0-1 and 0-100 formats)
          let confidence = fallback.confidence;
          if (typeof data.confidence === 'number') {
            confidence = data.confidence > 1 ? Number((data.confidence / 100).toFixed(3)) : Number(data.confidence.toFixed(3));
          }

          // 3. Subsystem
          let isolated_subsystem: SubsystemType = fallback.isolated_subsystem;
          const rawSubsystem = data.subsystem || data.isolated_subsystem;
          if (rawSubsystem === 'No fault identified' || rawSubsystem === 'None') {
            isolated_subsystem = 'None';
          } else if (['Motor', 'Bearing', 'Door', 'Sensor'].includes(rawSubsystem)) {
            isolated_subsystem = rawSubsystem as SubsystemType;
          } else if (predicted_fault === 'Normal') {
            isolated_subsystem = 'None';
          }

          // 4. Class probabilities
          const probabilities: Record<FaultCategory, number> = { ...fallback.probabilities };
          if (data.class_probabilities && typeof data.class_probabilities === 'object') {
            const rawProbs = data.class_probabilities;
            (['Normal', 'Motor fault', 'Bearing fault', 'Door fault', 'Sensor fault'] as FaultCategory[]).forEach((cat) => {
              if (rawProbs[cat] !== undefined) {
                const val = Number(rawProbs[cat]);
                probabilities[cat] = val > 1 ? Number((val / 100).toFixed(3)) : Number(val.toFixed(3));
              }
            });
          }

          // 5. Root cause & explanation
          const possible_root_cause =
            data.possible_root_cause || data.root_cause || data.maintenance_alert?.['Possible Cause'] || fallback.possible_root_cause;

          const explanation =
            data.explanation || data.maintenance_alert?.['Possible Cause'] || fallback.explanation;

          // 6. Action & Severity
          let severity: AlertSeverity = fallback.severity;
          const rawSeverity = data.maintenance_alert?.Severity || data.severity;
          if (rawSeverity) {
            const sLower = String(rawSeverity).toLowerCase();
            if (sLower === 'high' || sLower === 'critical') severity = 'Critical';
            else if (sLower === 'medium' || sLower === 'warning') severity = 'Warning';
            else if (sLower === 'low') severity = predicted_fault === 'Normal' ? 'Nominal' : 'Low';
          }

          const recommended_action =
            data.maintenance_alert?.['Maintenance Action'] || data.recommended_action || fallback.recommended_action;

          // 7. Sensor evidence mapping
          let sensor_evidence: SensorEvidence[] = fallback.sensor_evidence;
          if (Array.isArray(data.sensor_evidence) && data.sensor_evidence.length > 0) {
            sensor_evidence = data.sensor_evidence.map((item: any) => {
              const rawSensor = item.Sensor || item.sensor || '';
              const readingVal = Number(item.Reading ?? item.reading ?? 0);
              const refVal = item['Normal Reference'] ?? item.normal_reference;
              const devScore = Number(item['Deviation Score'] ?? item.deviation_score ?? 0);
              const statusText = String(item.Status || item.status || '');
              const isUnusual = statusText.toLowerCase().includes('unusual') || devScore > 1.5;

              let displayName = rawSensor;
              let unit = '';
              if (rawSensor === 'motor_temperature') { displayName = 'Motor Temperature'; unit = '°C'; }
              else if (rawSensor === 'vibration') { displayName = 'Machine Vibration'; unit = 'mm/s'; }
              else if (rawSensor === 'motor_current') { displayName = 'Motor Current'; unit = 'A'; }
              else if (rawSensor === 'elevator_load') { displayName = 'Car Passenger Load'; unit = 'kg'; }
              else if (rawSensor === 'door_closing_time') { displayName = 'Door Closing Duration'; unit = 's'; }
              else if (rawSensor === 'door_sensor_status') { displayName = 'Optical Light Curtain'; unit = ''; }

              return {
                feature: rawSensor,
                displayName,
                value: readingVal,
                unit,
                nominalRange: refVal !== undefined ? `Ref: ~${refVal}` : 'Nominal',
                deviationPercent: Math.round(devScore * 10),
                status: devScore > 3.0 ? 'critical' : (isUnusual ? 'warning' : 'normal'),
                impact: isUnusual ? statusText : 'Within synthetic reference pattern',
              };
            });
          }

          const result: AnalysisResult = {
            reading,
            predicted_fault,
            confidence,
            probabilities,
            isolated_subsystem,
            possible_root_cause,
            sensor_evidence,
            explanation,
            severity,
            recommended_action,
            estimated_spares: fallback.estimated_spares,
          };

          return { result, source: 'flask' };
        } else {
          throw new Error('Server returned HTML instead of JSON. ngrok warning page may have been served.');
        }
      } else {
        throw new Error(`Server returned HTTP ${response.status} (${response.statusText})`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown communication error';
      console.warn('Flask server communication issue; falling back to in-browser engine.', errorMsg);
      const fallbackResult = analyzeTelemetry(reading);
      return {
        result: fallbackResult,
        source: 'standalone',
        error: `Colab Flask error: ${errorMsg}. Switched to in-browser engine.`,
      };
    }
  }

  // Standalone offline inference
  const result = analyzeTelemetry(reading);
  return { result, source: 'standalone' };
}

/**
 * Generates a synthetic reading
 */
export async function fetchNewTelemetry(
  preset: 'Normal' | 'Motor fault' | 'Bearing fault' | 'Door fault' | 'Sensor fault' | 'Random' = 'Random'
): Promise<SensorReading> {
  return generateSyntheticReading(preset);
}
