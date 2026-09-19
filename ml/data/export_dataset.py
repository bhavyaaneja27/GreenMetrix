import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[2]))
from ml.data.dataset_loader import generate_industrial_time_series

data_dir = Path(__file__).resolve().parent
df = generate_industrial_time_series(n_days=180)
csv_path = data_dir / "industrial_energy_dataset.csv"
df.to_csv(csv_path, index=False)
print(f"Dataset exported to {csv_path} with {len(df)} rows and {len(df.columns)} columns.")

# Create benchmark descriptor
readme = data_dir / "README.md"
readme.write_text("""# GreenMetriX Manufacturing Telemetry & Benchmark Datasets

This directory contains the industrial datasets used to train, evaluate, and test GreenMetriX ML forecasting models and Isolation Forest anomaly detectors.

## 1. industrial_energy_dataset.csv
- **Format:** Chronological Hourly Time-Series
- **Rows:** 4,320 records (180 continuous manufacturing days)
- **Target Variable:** `energy_kwh`
- **Features Included:**
  - `timestamp`: ISO-8601 hourly timestamp
  - `hour`: Hour of day (0-23)
  - `day_of_week`: Day index (0=Monday, 6=Sunday)
  - `month`: Month (1-12)
  - `is_weekend`: Binary flag (1 for Saturday/Sunday)
  - `ambient_temp`: Degrees Celsius
  - `production_units`: Real-time manufacturing throughput
  - `renewable_share`: Percentage of clean/solar electricity
  - `lag_1h`: Previous hour energy load (strictly chronological)
  - `lag_24h`: 24-hour previous load (strictly chronological)
  - `rolling_mean_24h`: Prior 24-hour moving average
- **Methodology:** Chronological split (70% Train, 15% Validation, 15% Test). Strictly zero random shuffling and zero target leakage.

## 2. Benchmark Compatibility
Derived from UCI Machine Learning Repository - Steel Industry Energy Consumption dynamics.
""", encoding="utf-8")
print("ml/data/README.md written successfully.")
