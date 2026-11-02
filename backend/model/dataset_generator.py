"""
Elevator Telemetry Dataset Generator
Simulates synthetic sensor readings for 5 operational states:
- Normal
- Motor fault
- Bearing fault
- Door fault
- Sensor fault

DISCLAIMER: This synthetic dataset is purely illustrative for an algorithmic
hackathon prototype. It must NOT be used for physical elevator safety decisions.
"""

import numpy as np
import pandas as pd


def generate_elevator_dataset(num_samples=1500, random_seed=42):
    np.random.seed(random_seed)

    # 5 classes with roughly balanced distribution
    classes = [
        'Normal',
        'Motor fault',
        'Bearing fault',
        'Door fault',
        'Sensor fault',
    ]
    samples_per_class = num_samples // len(classes)

    records = []

    for label in classes:
        for _ in range(samples_per_class):
            if label == 'Normal':
                # Normal operating conditions
                load = np.random.uniform(50, 750)  # kg (nominal passenger load)
                # Temperature depends moderately on load (35°C to 55°C)
                motor_temp = 35 + (load / 750.0) * 15 + np.random.normal(0, 2)
                # Normal low vibration (0.5 to 1.8 mm/s)
                vibration = np.random.uniform(0.5, 1.8)
                # Motor current proportional to load (8A to 18A)
                motor_current = 8 + (load / 750.0) * 10 + np.random.normal(0, 0.8)
                # Door closes smoothly in 2.5 to 4.0 seconds
                door_closing_time = np.random.uniform(2.5, 4.0)
                # Sensor status 0 = normal / unobstructed
                door_sensor_status = 0

            elif label == 'Motor fault':
                # Motor electrical/thermal degradation: excessive temperature & current spikes
                load = np.random.uniform(200, 800)
                # High motor temperature (75°C to 110°C)
                motor_temp = np.random.uniform(75, 110)
                # Slight vibration increase due to motor stress
                vibration = np.random.uniform(1.8, 3.2)
                # Abnormally high current draw (24A to 40A)
                motor_current = np.random.uniform(24, 40)
                # Door operates normally
                door_closing_time = np.random.uniform(2.8, 4.2)
                door_sensor_status = 0

            elif label == 'Bearing fault':
                # Mechanical wear in bearings/pulleys: severe high-frequency vibration
                load = np.random.uniform(100, 750)
                # Mild heating from bearing friction (50°C to 70°C)
                motor_temp = np.random.uniform(50, 70)
                # Prominent vibration anomaly (3.8 to 8.5 mm/s)
                vibration = np.random.uniform(3.8, 8.5)
                # Slight current increase due to mechanical resistance
                motor_current = np.random.uniform(14, 22)
                door_closing_time = np.random.uniform(2.6, 4.0)
                door_sensor_status = 0

            elif label == 'Door fault':
                # Door obstruction, misaligned tracks, or slow closing
                load = np.random.uniform(50, 600)
                motor_temp = np.random.uniform(38, 52)
                vibration = np.random.uniform(0.6, 1.6)
                motor_current = np.random.uniform(9, 16)
                # Abnormally prolonged door closing time (5.5s to 12.0s)
                door_closing_time = np.random.uniform(5.5, 12.0)
                # Sensor often triggered (1 = obstruction or safety light curtain active)
                door_sensor_status = np.random.choice([0, 1], p=[0.25, 0.75])

            elif label == 'Sensor fault':
                # Telemetry anomaly: broken wire, ADC glitch, erratic readings
                # Randomly inject impossible physical values (extreme spikes or negative drops)
                fault_mode = np.random.choice(['temp_drop', 'vibe_spike', 'current_zero', 'erratic_door'])
                load = np.random.uniform(0, 800)
                motor_temp = -25.0 if fault_mode == 'temp_drop' else np.random.uniform(40, 60)
                vibration = 25.0 if fault_mode == 'vibe_spike' else np.random.uniform(0.8, 1.8)
                motor_current = 0.0 if fault_mode == 'current_zero' else np.random.uniform(10, 18)
                door_closing_time = -1.0 if fault_mode == 'erratic_door' else np.random.uniform(2.8, 4.0)
                door_sensor_status = np.random.choice([0, 1])

            records.append({
                'motor_temperature': round(float(motor_temp), 2),
                'vibration': round(float(vibration), 2),
                'motor_current': round(float(motor_current), 2),
                'elevator_load': round(float(load), 2),
                'door_closing_time': round(float(door_closing_time), 2),
                'door_sensor_status': int(door_sensor_status),
                'fault_category': label
            })

    df = pd.DataFrame(records)
    # Shuffle dataset rows
    df = df.sample(frac=1, random_state=random_seed).reset_index(drop=True)
    return df


if __name__ == '__main__':
    df = generate_elevator_dataset(num_samples=1500)
    df.to_csv('elevator_sensor_data.csv', index=False)
    print(f"Dataset generated successfully with {len(df)} records!")
    print("\nClass distribution:")
    print(df['fault_category'].value_counts())
    print("\nFirst 5 records:")
    print(df.head())
