# Data Directory

This directory documents the data contract for local development and future provider imports. Do not place secrets or raw personal information here.

## Expected Dataset Groups

- `locations`: coordinates, ward, elevation, population exposure, infrastructure
- `weather`: rainfall, forecast rainfall, temperature, wind, humidity, source timestamp
- `sensors`: water level, battery, connectivity, sensor timestamp
- `reports`: citizen observation, severity, verification, location, timestamp
- `hazards`: hazard type, label, severity, source, confidence, valid interval
- `resources`: routes, shelters, rescue teams, pumps, and medical facilities

## Quality Requirements

Every imported record should retain its original source, collection time, location precision, reliability, and validation status. Historical training data should include a documented target label and a time-based holdout set. Synthetic records are for demos and pipeline testing only.
