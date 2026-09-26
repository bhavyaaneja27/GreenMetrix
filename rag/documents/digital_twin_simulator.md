# GreenMetriX Digital Twin Simulator

## Purpose of the Digital Twin
The GreenMetriX Digital Twin is a physics-informed scenario simulation engine that creates a virtual replica of each factory's energy and production profile using live telemetry. It allows plant managers to model 'what-if' scenarios before committing real capital expenditure.

## Key Capabilities
- **Energy Change Simulation**: Model the impact of reducing or increasing energy consumption by a specified percentage
- **Production Change Modelling**: Assess the effect of scaling production up or down on emission intensity
- **Renewable Share Scenarios**: Simulate adding rooftop solar or wind capacity and its effect on Scope 2 emissions
- **Rating Prediction**: Preview how sustainability rating (A/B/C/D) would change under each scenario

## How It Works
The Digital Twin uses the factory's latest telemetry reading as the baseline state:
1. Baseline energy (kWh) and production (units) are taken from the most recent shift reading
2. Scenario parameters (% change in energy, production, renewable share) are applied
3. Scenario CO₂ = Scenario Energy × CEA 0.716 kg CO₂/kWh × (1 - Renewable Share × 0.85)
4. New emission intensity (kg CO₂/unit) is computed and a new rating assigned

## Use Cases
- Evaluate rooftop solar PPA sizing before signing a 10-year contract
- Test whether shifting high-load batch processes to off-peak hours would improve the rating
- Model the impact of adding a second production shift on overall carbon footprint
- Stress-test renewable procurement options under different grid tariff scenarios

## Disclaimer
Digital Twin outputs are scenario estimates based on current telemetry and CEA emission factors. They are not guaranteed real-world outcomes and should be validated with a certified on-site energy audit before procurement decisions.
