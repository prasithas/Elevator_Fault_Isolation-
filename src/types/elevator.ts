/**
 * Elevator Fault Isolation & RCA Data Types
 */

export type FaultCategory =
  | 'Normal'
  | 'Motor fault'
  | 'Bearing fault'
  | 'Door fault'
  | 'Sensor fault';

export type SubsystemType =
  | 'Motor'
  | 'Bearing'
  | 'Door'
  | 'Sensor'
  | 'None';

export type AlertSeverity = 'Critical' | 'Warning' | 'Low' | 'Nominal';

export interface SensorReading {
  id: string;
  timestamp: string;
  motor_temperature: number; // °C
  vibration: number;         // mm/s RMS
  motor_current: number;     // Amperes
  elevator_load: number;     // kg
  door_closing_time: number; // seconds
  door_sensor_status: number;// 0 = normal, 1 = obstructed
}

export interface SensorThreshold {
  nominalMin: number;
  nominalMax: number;
  criticalMax?: number;
  criticalMin?: number;
  unit: string;
}

export interface SensorEvidence {
  feature: string;
  displayName: string;
  value: number;
  unit: string;
  nominalRange: string;
  deviationPercent: number;
  status: 'normal' | 'warning' | 'critical';
  impact: string;
}

export interface AnalysisResult {
  reading: SensorReading;
  predicted_fault: FaultCategory;
  confidence: number; // 0 to 1
  probabilities: Record<FaultCategory, number>;
  isolated_subsystem: SubsystemType;
  possible_root_cause: string;
  sensor_evidence: SensorEvidence[];
  explanation: string;
  severity: AlertSeverity;
  recommended_action: string;
  estimated_spares?: string[];
}

export interface MaintenanceAlert {
  id: string;
  timestamp: string;
  fault: FaultCategory;
  subsystem: SubsystemType;
  severity: AlertSeverity;
  confidence: number;
  possibleCause: string;
  action: string;
  acknowledged: boolean;
  readingId: string;
}
