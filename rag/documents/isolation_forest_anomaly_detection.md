# Isolation Forest Anomaly Detection in GreenMetriX

## Why Isolation Forest
GreenMetriX uses the Isolation Forest algorithm for energy anomaly detection because it is highly effective for identifying rare, abnormal industrial energy events without requiring labelled training data (unsupervised learning). It is fast, scalable to high-dimensional telemetry, and naturally handles the skewed distribution of energy readings in manufacturing environments.

## How It Works
Isolation Forest builds an ensemble of random decision trees (isolation trees). Each tree randomly selects a feature (e.g., energy_kwh, production_units) and a random split value. Anomalous readings — such as unexpected energy spikes — require far fewer random splits to isolate than normal readings, resulting in a low anomaly score.

## GreenMetriX Implementation
- Each factory has its own Isolation Forest model trained on 90 days of shift-level telemetry
- Anomaly score threshold: readings scoring below -0.1 (on the [-1, +1] scale) are flagged
- Severity levels: HIGH (score < -0.3), MEDIUM (-0.3 to -0.1), LOW (-0.1 boundary cases)
- Features used: energy_kwh, production_units, renewable_kwh, hour_of_day, day_of_week
- Model is retrained weekly using the rolling 90-day window

## Common Anomaly Causes
- Shift-changeover load surges (multiple machines starting simultaneously)
- Cooling system or HVAC failures causing elevated consumption
- Unscheduled overtime or emergency production runs
- Metering sensor drift or data quality issues
- Power factor deterioration from inductive motor faults

## Limitations
- Requires a stable baseline period for training accuracy
- May flag legitimate production surges as anomalies during seasonal demand spikes
- Does not identify the root cause — human investigation is always required after flagging
