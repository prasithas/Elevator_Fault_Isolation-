import {
  AnalysisResult,
  FaultCategory,
  MaintenanceAlert,
  SensorEvidence,
  SensorReading,
  SubsystemType,
  AlertSeverity
} from '../types/elevator';

/**
 * Expected baseline rules for nominal operation given an elevator load (kg)
 */
export function getBaselineForLoad(loadKg: number) {
  const normLoadRatio = Math.max(0, Math.min(1, loadKg / 800));
  return {
    expectedTempMin: 35 + normLoadRatio * 10,
    expectedTempMax: 48 + normLoadRatio * 14,
    expectedCurrentMin: 8 + normLoadRatio * 7,
    expectedCurrentMax: 12 + normLoadRatio * 10,
    expectedVibrationMin: 0.5,
    expectedVibrationMax: 1.8,
    expectedDoorTimeMin: 2.6,
    expectedDoorTimeMax: 3.8,
  };
}

/**
 * Generates a realistic sensor reading based on the requested operational mode
 */
export function generateSyntheticReading(mode: 'Normal' | 'Motor fault' | 'Bearing fault' | 'Door fault' | 'Sensor fault' | 'Random' = 'Random'): SensorReading {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
  const id = 'READ-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  let targetMode = mode;
  if (targetMode === 'Random') {
    const r = Math.random();
    if (r < 0.45) targetMode = 'Normal';
    else if (r < 0.60) targetMode = 'Motor fault';
    else if (r < 0.75) targetMode = 'Bearing fault';
    else if (r < 0.90) targetMode = 'Door fault';
    else targetMode = 'Sensor fault';
  }

  let temp = 42;
  let vibe = 1.1;
  let curr = 12.5;
  let load = Math.round(150 + Math.random() * 550);
  let doorTime = 3.2;
  let doorStatus = 0;

  if (targetMode === 'Normal') {
    const baseline = getBaselineForLoad(load);
    temp = baseline.expectedTempMin + Math.random() * (baseline.expectedTempMax - baseline.expectedTempMin);
    vibe = 0.6 + Math.random() * 1.1;
    curr = baseline.expectedCurrentMin + Math.random() * (baseline.expectedCurrentMax - baseline.expectedCurrentMin);
    doorTime = 2.8 + Math.random() * 1.1;
    doorStatus = 0;
  } else if (targetMode === 'Motor fault') {
    temp = 82 + Math.random() * 26; // 82°C - 108°C
    vibe = 1.9 + Math.random() * 1.2; // 1.9 - 3.1 mm/s
    curr = 26 + Math.random() * 13;   // 26A - 39A
    doorTime = 3.0 + Math.random() * 0.9;
    doorStatus = 0;
  } else if (targetMode === 'Bearing fault') {
    temp = 54 + Math.random() * 14;   // 54°C - 68°C
    vibe = 4.2 + Math.random() * 4.1; // 4.2 - 8.3 mm/s (severe anomaly)
    curr = 16 + Math.random() * 5.5;  // 16A - 21.5A
    doorTime = 2.9 + Math.random() * 0.9;
    doorStatus = 0;
  } else if (targetMode === 'Door fault') {
    temp = 40 + Math.random() * 10;
    vibe = 0.8 + Math.random() * 0.8;
    curr = 11 + Math.random() * 4.5;
    doorTime = 6.2 + Math.random() * 5.4; // 6.2s - 11.6s
    doorStatus = Math.random() > 0.35 ? 1 : 0;
  } else if (targetMode === 'Sensor fault') {
    const glitch = Math.floor(Math.random() * 4);
    if (glitch === 0) temp = -25.0; // Impossible negative temperature
    else if (glitch === 1) vibe = 24.5; // Impossible vibration spike
    else if (glitch === 2) curr = 0.0; // Sudden open-circuit current
    else {
      doorTime = -1.0;
      doorStatus = 1;
    }
  }

  return {
    id,
    timestamp: timeStr,
    motor_temperature: Number(temp.toFixed(1)),
    vibration: Number(vibe.toFixed(2)),
    motor_current: Number(curr.toFixed(1)),
    elevator_load: Math.round(load),
    door_closing_time: Number(doorTime.toFixed(2)),
    door_sensor_status: doorStatus,
  };
}

/**
 * Analyzes telemetry reading: Fault Detection, Fault Isolation, and Root Cause Analysis
 */
export function analyzeTelemetry(reading: SensorReading): AnalysisResult {
  const { motor_temperature, vibration, motor_current, elevator_load, door_closing_time, door_sensor_status } = reading;
  const baseline = getBaselineForLoad(elevator_load);

  // Evidence calculation
  const evidence: SensorEvidence[] = [];

  // 1. Motor Temperature
  const tempMid = (baseline.expectedTempMin + baseline.expectedTempMax) / 2;
  const tempDev = ((motor_temperature - tempMid) / tempMid) * 100;
  let tempStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (motor_temperature > 85 || motor_temperature < 0) tempStatus = 'critical';
  else if (motor_temperature > 68) tempStatus = 'warning';

  evidence.push({
    feature: 'motor_temperature',
    displayName: 'Motor Temperature',
    value: motor_temperature,
    unit: '°C',
    nominalRange: `${baseline.expectedTempMin.toFixed(0)} - ${baseline.expectedTempMax.toFixed(0)} °C`,
    deviationPercent: Math.round(tempDev),
    status: tempStatus,
    impact: motor_temperature > 85 ? 'Severe thermal dissipation failure' : motor_temperature < 0 ? 'Invalid cryogenic sensor artifact' : 'Within operating tolerance'
  });

  // 2. Vibration
  const vibeMid = 1.15;
  const vibeDev = ((vibration - vibeMid) / vibeMid) * 100;
  let vibeStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (vibration > 4.0) vibeStatus = 'critical';
  else if (vibration > 2.2) vibeStatus = 'warning';

  evidence.push({
    feature: 'vibration',
    displayName: 'Machine Vibration',
    value: vibration,
    unit: 'mm/s',
    nominalRange: '0.50 - 1.80 mm/s',
    deviationPercent: Math.round(vibeDev),
    status: vibeStatus,
    impact: vibration > 4.0 ? 'High harmonic resonance / severe mechanical chatter' : vibration > 2.2 ? 'Moderate mechanical stress' : 'Normal smooth run'
  });

  // 3. Motor Current
  const currMid = (baseline.expectedCurrentMin + baseline.expectedCurrentMax) / 2;
  const currDev = ((motor_current - currMid) / currMid) * 100;
  let currStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (motor_current > 25.0 || (motor_current === 0 && elevator_load > 100)) currStatus = 'critical';
  else if (motor_current > 19.0) currStatus = 'warning';

  evidence.push({
    feature: 'motor_current',
    displayName: 'Motor Current',
    value: motor_current,
    unit: 'A',
    nominalRange: `${baseline.expectedCurrentMin.toFixed(1)} - ${baseline.expectedCurrentMax.toFixed(1)} A`,
    deviationPercent: Math.round(currDev),
    status: currStatus,
    impact: motor_current > 25.0 ? 'High winding inrush / electrical overload' : motor_current === 0 ? 'Zero-current reading during transit' : 'Nominal electrical consumption'
  });

  // 4. Elevator Load
  evidence.push({
    feature: 'elevator_load',
    displayName: 'Car Passenger Load',
    value: elevator_load,
    unit: 'kg',
    nominalRange: '0 - 800 kg',
    deviationPercent: Math.round(((elevator_load - 400) / 400) * 100),
    status: elevator_load > 850 ? 'warning' : 'normal',
    impact: elevator_load > 850 ? 'Close to maximum rated traction capacity' : 'Rated operating payload'
  });

  // 5. Door Closing Time
  let doorStatusLevel: 'normal' | 'warning' | 'critical' = 'normal';
  if (door_closing_time > 5.5 || door_closing_time < 0) doorStatusLevel = 'critical';
  else if (door_closing_time > 4.2) doorStatusLevel = 'warning';

  evidence.push({
    feature: 'door_closing_time',
    displayName: 'Door Closing Duration',
    value: door_closing_time,
    unit: 's',
    nominalRange: '2.50 - 4.00 s',
    deviationPercent: Math.round(((door_closing_time - 3.25) / 3.25) * 100),
    status: doorStatusLevel,
    impact: door_closing_time > 5.5 ? 'Excessive cycle delay / track resistance' : door_closing_time < 0 ? 'Corrupted negative timer' : 'Complies with safety standard'
  });

  // 6. Door Sensor Status
  evidence.push({
    feature: 'door_sensor_status',
    displayName: 'Optical Light Curtain',
    value: door_sensor_status,
    unit: '',
    nominalRange: '0 (Clear)',
    deviationPercent: door_sensor_status === 1 ? 100 : 0,
    status: door_sensor_status === 1 ? 'warning' : 'normal',
    impact: door_sensor_status === 1 ? 'Safety barrier active or optical detector blocked' : 'Transceiver path clear'
  });

  // Multi-Class Scoring Logic (Simulating Random Forest ensemble decision)
  let predictedFault: FaultCategory = 'Normal';
  let isolatedSubsystem: SubsystemType = 'None';
  let confidence = 0.96;
  let severity: AlertSeverity = 'Nominal';
  let possibleRootCause = 'All measured telemetry signals align with nominal physics baselines.';
  let explanation = 'Continuous monitoring indicates balanced electrical draw, nominal motor housing temperature, and smooth carriage travel.';
  let recommendedAction = 'No immediate action required. Continue routine preventative service interval.';
  let estimatedSpares: string[] = [];

  // Check Sensor Fault first (Physically impossible telemetry)
  if (motor_temperature < 0 || vibration > 15.0 || (motor_current === 0 && elevator_load > 100) || door_closing_time < 0) {
    predictedFault = 'Sensor fault';
    isolatedSubsystem = 'Sensor';
    confidence = 0.95 + Math.random() * 0.04;
    severity = 'Warning';
    possibleRootCause = 'Transducer harness disconnection, ADC floating input, or ground loop noise.';
    explanation = `Sensor telemetry exhibited physically non-viable parameters (${
      motor_temperature < 0 ? 'Temperature reported below freezing in machine room' :
      vibration > 15.0 ? 'Vibration transducer pegged at saturation limit' :
      motor_current === 0 ? 'Zero current draw registered under load' : 'Negative door timer'
    }).`;
    recommendedAction = 'Inspect transducer wiring loom, verify 24V DC auxiliary power supply, and check signal conditioning module.';
    estimatedSpares = ['PT100 Temperature Probe', 'IEPE Accelerometer Cable Kit', 'Analog Input Channel Card'];
  }
  // Check Bearing Fault (Vibration is king)
  else if (vibration >= 3.8) {
    predictedFault = 'Bearing fault';
    isolatedSubsystem = 'Bearing';
    confidence = 0.91 + Math.random() * 0.07;
    severity = vibration > 5.5 ? 'Critical' : 'Warning';
    possibleRootCause = 'Inner/outer raceway spalling, lubrication starvation, or guide pulley misalignment.';
    explanation = `Vibration level recorded at ${vibration.toFixed(2)} mm/s RMS (+${Math.round(vibeDev)}% above threshold). Motor current showed mild secondary drag (${motor_current.toFixed(1)}A) while temperature remained moderate (${motor_temperature.toFixed(1)}°C), isolating the anomaly to mechanical bearing components.`;
    recommendedAction = 'Perform ultrasonic acoustic lubrication inspection; check hoist sheave bearings for brinelling or runout.';
    estimatedSpares = ['Spherical Roller Bearing 22216-E1', 'Lithium EP2 Grease Cartridge'];
  }
  // Check Motor Fault (High Temp + High Current)
  else if (motor_temperature >= 75.0 || motor_current >= 24.0) {
    predictedFault = 'Motor fault';
    isolatedSubsystem = 'Motor';
    confidence = 0.93 + Math.random() * 0.06;
    severity = motor_temperature > 95 ? 'Critical' : 'Warning';
    possibleRootCause = 'Stator winding insulation breakdown, forced-air cooling blower failure, or VFD inverter harmonic distortion.';
    explanation = `Motor temperature reached ${motor_temperature.toFixed(1)}°C with current draw spiking to ${motor_current.toFixed(1)}A (+${Math.round(currDev)}% above load rating). The thermal-to-current ratio isolates the issue directly to the main traction drive motor.`;
    recommendedAction = 'Perform megohmmeter insulation resistance test on motor windings; verify cooling fan impeller rotation and inverter output.';
    estimatedSpares = ['Motor Cooling Blower Fan (230V)', 'Thermal Overload Relay', 'Class H Stator Rewind Kit'];
  }
  // Check Door Fault (Prolonged time or persistent optical curtain blockage)
  else if (door_closing_time >= 5.0 || (door_sensor_status === 1 && door_closing_time > 4.2)) {
    predictedFault = 'Door fault';
    isolatedSubsystem = 'Door';
    confidence = 0.92 + Math.random() * 0.06;
    severity = door_closing_time > 8.0 ? 'Critical' : 'Warning';
    possibleRootCause = 'Mechanical door track debris, worn door hanger rollers, or misaligned optical detector curtain.';
    explanation = `Door closing cycle required ${door_closing_time.toFixed(2)} seconds (normal is 2.5 - 4.0s) with safety curtain sensor flag at ${door_sensor_status}. Indicates mechanical friction along sill tracks or repeated optical edge false triggers.`;
    recommendedAction = 'Clean and deburr lower entrance sill grooves, lubricate hanger tracks, and inspect infrared emitter lenses for dust.';
    estimatedSpares = ['Door Hanger Roller Set (75mm)', 'Infrared Safety Light Curtain Beam', 'Drive Belt GT2'];
  } else {
    predictedFault = 'Normal';
    isolatedSubsystem = 'None';
    confidence = 0.97 + Math.random() * 0.02;
    severity = 'Nominal';
  }

  // Generate probability distribution for model transparency
  const probs: Record<FaultCategory, number> = {
    'Normal': 0.01,
    'Motor fault': 0.01,
    'Bearing fault': 0.01,
    'Door fault': 0.01,
    'Sensor fault': 0.01,
  };
  probs[predictedFault] = Number(confidence.toFixed(3));
  const remaining = (1 - confidence) / 4;
  (Object.keys(probs) as FaultCategory[]).forEach(k => {
    if (k !== predictedFault) probs[k] = Number(remaining.toFixed(3));
  });

  return {
    reading,
    predicted_fault: predictedFault,
    confidence: Number(confidence.toFixed(2)),
    probabilities: probs,
    isolated_subsystem: isolatedSubsystem,
    possible_root_cause: possibleRootCause,
    sensor_evidence: evidence,
    explanation,
    severity,
    recommended_action: recommendedAction,
    estimated_spares: estimatedSpares,
  };
}

/**
 * Creates a maintenance alert from an analysis result
 */
export function createAlertFromResult(result: AnalysisResult): MaintenanceAlert | null {
  if (result.predicted_fault === 'Normal') return null;

  return {
    id: 'ALT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    timestamp: result.reading.timestamp,
    fault: result.predicted_fault,
    subsystem: result.isolated_subsystem,
    severity: result.severity,
    confidence: result.confidence,
    possibleCause: result.possible_root_cause,
    action: result.recommended_action,
    acknowledged: false,
    readingId: result.reading.id,
  };
}
