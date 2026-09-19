import datetime
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any

def generate_industrial_time_series(n_days: int = 180) -> pd.DataFrame:
    """
    Generates realistic chronological industrial manufacturing telemetry
    mimicking the UCI Steel Industry Energy dynamics with hourly timestamps.
    Features:
    - hour, day_of_week, month, is_weekend
    - lag_1h, lag_24h, rolling_mean_24h
    - production_units (realistic factory shifts)
    - renewable_share_pct
    - target: energy_kwh
    """
    np.random.seed(42)
    start_time = datetime.datetime(2025, 1, 1, 0, 0, 0)
    timestamps = [start_time + datetime.timedelta(hours=i) for i in range(n_days * 24)]

    records = []
    base_load = 1200.0  # base standby load in kWh

    for i, ts in enumerate(timestamps):
        hr = ts.hour
        dow = ts.weekday()
        is_weekend = 1 if dow >= 5 else 0

        # Shift schedules: Day shift (8-17), Evening shift (17-23), Night shift (23-8)
        if 8 <= hr < 17 and not is_weekend:
            shift_factor = 2.4
            prod = np.random.uniform(280, 360)
        elif 17 <= hr < 23 and not is_weekend:
            shift_factor = 1.9
            prod = np.random.uniform(210, 290)
        elif not is_weekend:
            shift_factor = 1.2
            prod = np.random.uniform(110, 180)
        else:  # Weekend maintenance
            shift_factor = 0.6
            prod = np.random.uniform(20, 60)

        # Seasonal/monthly variance
        month_factor = 1.0 + 0.12 * np.sin(2 * np.pi * ts.month / 12)

        # Weather / temperature proxy
        ambient_temp = 20.0 + 12.0 * np.sin(2 * np.pi * (hr - 8) / 24) + np.random.normal(0, 1.5)
        hvac_cooling = max(0.0, (ambient_temp - 24.0) * 18.0)

        energy = (base_load * shift_factor * month_factor) + (prod * 3.8) + hvac_cooling + np.random.normal(0, 45.0)
        renewable = min(80.0, max(5.0, (25.0 + 35.0 * np.sin(np.pi * max(0, min(14, hr - 6)) / 14)) * (0.3 if is_weekend else 1.0)))

        records.append({
            "timestamp": ts,
            "hour": hr,
            "day_of_week": dow,
            "month": ts.month,
            "is_weekend": is_weekend,
            "ambient_temp": round(ambient_temp, 2),
            "production_units": round(prod, 1),
            "renewable_share": round(renewable, 1),
            "energy_kwh": round(energy, 2)
        })

    df = pd.DataFrame(records)

    # Feature Engineering: strictly chronological lag and rolling features (NO future data leakage)
    df["lag_1h"] = df["energy_kwh"].shift(1)
    df["lag_24h"] = df["energy_kwh"].shift(24)
    df["rolling_mean_24h"] = df["energy_kwh"].shift(1).rolling(window=24, min_periods=1).mean()

    # Backfill the initial 24 hours with the earliest available values
    df["lag_1h"] = df["lag_1h"].bfill()
    df["lag_24h"] = df["lag_24h"].bfill()
    df["rolling_mean_24h"] = df["rolling_mean_24h"].bfill()

    return df

def chronological_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits data chronologically:
    - 70% Train
    - 15% Validation
    - 15% Test
    DO NOT shuffle time-series data.
    """
    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    train_df = df.iloc[:train_end].copy()
    val_df = df.iloc[train_end:val_end].copy()
    test_df = df.iloc[val_end:].copy()

    return train_df, val_df, test_df
