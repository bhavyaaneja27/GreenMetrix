-- GreenMetriX Production Initial Seed Data
-- 8 Delhi NCR Facilities, Users, CEA Factor Baselines, and Thresholds

-- Default Admin User (Password: GreenMetriX@2026)
INSERT INTO users (email, hashed_password, full_name, role, organization)
VALUES (
    'admin@greenmetrix.ai',
    '$2b$12$e61c7hL9fR/TfqQ95X1j8eUq/06cWcsqzIiq4f494k600/q35e0.C',
    'Enterprise Sustainability Lead',
    'admin',
    'GreenMetriX Global Decarbonization'
) ON CONFLICT (email) DO NOTHING;

-- Emission Factors
INSERT INTO emission_factors (key, name, category, factor_value, unit, source, description)
VALUES 
    ('CEA_GRID_NORTH_2026', 'CEA National Grid Emission Factor', 'SCOPE_2', 0.716, 'kg CO2/kWh', 'Central Electricity Authority (CEA) Ver 20.0', 'Official CO2 baseline database for Indian regional power system'),
    ('NATURAL_GAS_INDUSTRIAL', 'Natural Gas Stationary Combustion', 'SCOPE_1', 2.02, 'kg CO2/m3', 'IPCC Guidelines 2006 for Industrial Boilers', 'Scope 1 direct combustion factor for process heat'),
    ('DIESEL_GENERATOR_BACKUP', 'Diesel Stationary Generator', 'SCOPE_1', 2.68, 'kg CO2/L', 'GHG Protocol Stationary Combustion Tool', 'Scope 1 on-site backup diesel generator sets'),
    ('ROAD_FREIGHT_LOGISTICS', 'Heavy Duty Road Freight Transport', 'SCOPE_3', 0.082, 'kg CO2/tonne-km', 'DEFRA / GLEC Framework Freight Emissions', 'Scope 3 Category 4 upstream road freight transportation')
ON CONFLICT (key) DO UPDATE SET factor_value = EXCLUDED.factor_value;

-- Rating Thresholds
INSERT INTO rating_thresholds (industry_type, low_upper_limit, medium_upper_limit, unit, source, description)
VALUES
    ('Automotive', 1.2, 3.0, 'kg CO2/unit', 'BEE & SIAM Energy Norms', 'Vehicle assembly and stamping benchmarks'),
    ('Electronics', 0.6, 1.8, 'kg CO2/unit', 'SEMI E175 Energy Standard', 'Semiconductor assembly and testing lines'),
    ('Heavy Engineering', 2.5, 6.0, 'kg CO2/unit', 'Ministry of Heavy Industries', 'Forging and fabrication benchmarks'),
    ('Plastics', 1.0, 2.8, 'kg CO2/unit', 'PlastIndia Environmental Metric', 'Injection moulding and extrusion benchmarks'),
    ('Aerospace', 1.5, 4.0, 'kg CO2/unit', 'Aero-Engine Decarbonization Norms', 'Precision machining and autoclaves'),
    ('Energy Storage', 0.8, 2.2, 'kg CO2/unit', 'Gigafactory Sustainability Charter', 'Lithium cell battery cell manufacturing');

-- 8 Delhi NCR Facilities
INSERT INTO factories (name, industry, industry_type, city, latitude, longitude, grid_zone, peak_capacity_mw, annual_target_co2)
VALUES
    ('Okhla Smart Auto Assembly', 'Automotive', 'Automotive', 'Okhla, New Delhi', 28.5355, 77.2732, 'NORTHERN_GRID_DELHI', 4.5, 1200.0),
    ('Noida Advanced Electronics', 'Electronics', 'Electronics', 'Sector 62, Noida', 28.6279, 77.3749, 'NORTHERN_GRID_UP', 3.2, 850.0),
    ('Bawana Precision Plastics', 'Plastics', 'Plastics', 'Bawana, Delhi', 28.7963, 77.0392, 'NORTHERN_GRID_DELHI', 2.8, 1400.0),
    ('Faridabad Heavy Engineering', 'Heavy Engineering', 'Heavy Engineering', 'Sector 24, Faridabad', 28.3846, 77.3075, 'NORTHERN_GRID_HARYANA', 5.0, 2600.0),
    ('Mayapuri Industrial Area', 'Metals', 'Heavy Engineering', 'Mayapuri, Delhi', 28.6366, 77.1265, 'NORTHERN_GRID_DELHI', 2.0, 950.0),
    ('Patparganj Electronic Cluster', 'Electronics', 'Electronics', 'Patparganj, Delhi', 28.6288, 77.3114, 'NORTHERN_GRID_DELHI', 1.8, 620.0),
    ('Gurugram Aero-Component Fab', 'Aerospace', 'Aerospace', 'Udyog Vihar, Gurugram', 28.5023, 77.0864, 'NORTHERN_GRID_HARYANA', 3.5, 1100.0),
    ('Manesar Lithium Cell Facility', 'Energy Storage', 'Energy Storage', 'IMT Manesar, Gurugram', 28.3588, 76.9408, 'NORTHERN_GRID_HARYANA', 4.0, 1300.0);
