export const LOCATIONS = [
  {
    location_id: 'LOC-PALLIK-002',
    name: 'Pallikaranai',
    ward: 'Pallikaranai',
    latitude: 12.9352,
    longitude: 80.2350,
    elevation: 3.0,
    historical_flood_frequency: 0.85,
    population_density: 90,
    road_vulnerability: 0.85,
    critical_infrastructure: { hospitals: 2, schools: 4, fire_stations: 1, police_stations: 1 },
    baseline_vulnerability: 0.8,
    risk_score: 86,
    risk_level: 'CRITICAL',
    confidence: 88,
    vulnerability_score: 91,
    priority_score: 89,
    priority_rank: 1,
    recommended_action: 'Immediate field inspection / rescue readiness',
    contributing_factors: { rainfall: 86, water_level: 91, elevation: 78, historical_flooding: 73, citizen_reports: 84 },
    last_updated: '2 min ago',
    coordinates: [12.9352, 80.2350]
  },
  {
    location_id: 'LOC-VELACH-001',
    name: 'Velachery',
    ward: 'Velachery',
    latitude: 12.9815,
    longitude: 80.2180,
    elevation: 4.5,
    historical_flood_frequency: 0.75,
    population_density: 85,
    road_vulnerability: 0.8,
    critical_infrastructure: { hospitals: 3, schools: 5, fire_stations: 1, police_stations: 2 },
    baseline_vulnerability: 0.7,
    risk_score: 81,
    risk_level: 'HIGH',
    confidence: 91,
    vulnerability_score: 84,
    priority_score: 83,
    priority_rank: 2,
    recommended_action: 'Deploy pump / inspect drainage',
    contributing_factors: { rainfall: 78, water_level: 82, elevation: 65, historical_flooding: 75, citizen_reports: 80 },
    last_updated: '3 min ago',
    coordinates: [12.9815, 80.2180]
  },
  {
    location_id: 'LOC-PERUMB-004',
    name: 'Perumbakkam',
    ward: 'Perumbakkam',
    latitude: 12.9100,
    longitude: 80.2000,
    elevation: 3.5,
    historical_flood_frequency: 0.7,
    population_density: 80,
    road_vulnerability: 0.75,
    critical_infrastructure: { hospitals: 2, schools: 4, fire_stations: 1, police_stations: 1 },
    baseline_vulnerability: 0.65,
    risk_score: 72,
    risk_level: 'HIGH',
    confidence: 85,
    vulnerability_score: 79,
    priority_score: 76,
    priority_rank: 3,
    recommended_action: 'Deploy pump / inspect drainage',
    contributing_factors: { rainfall: 68, water_level: 74, elevation: 70, historical_flooding: 70, citizen_reports: 72 },
    last_updated: '5 min ago',
    coordinates: [12.9100, 80.2000]
  },
  {
    location_id: 'LOC-VYASAR-003',
    name: 'Vyasarpadi',
    ward: 'Vyasarpadi',
    latitude: 13.1100,
    longitude: 80.2350,
    elevation: 5.0,
    historical_flood_frequency: 0.6,
    population_density: 75,
    road_vulnerability: 0.65,
    critical_infrastructure: { hospitals: 1, schools: 3, fire_stations: 0, police_stations: 1 },
    baseline_vulnerability: 0.6,
    risk_score: 52,
    risk_level: 'MODERATE',
    confidence: 78,
    vulnerability_score: 69,
    priority_score: 59,
    priority_rank: 4,
    recommended_action: 'Increase monitoring frequency',
    contributing_factors: { rainfall: 48, water_level: 55, elevation: 45, historical_flooding: 60, citizen_reports: 52 },
    last_updated: '8 min ago',
    coordinates: [13.1100, 80.2350]
  },
  {
    location_id: 'LOC-SEMME-005',
    name: 'Semmenchery',
    ward: 'Semmenchery',
    latitude: 12.8950,
    longitude: 80.2250,
    elevation: 4.0,
    historical_flood_frequency: 0.65,
    population_density: 70,
    road_vulnerability: 0.7,
    critical_infrastructure: { hospitals: 1, schools: 3, fire_stations: 0, police_stations: 1 },
    baseline_vulnerability: 0.55,
    risk_score: 45,
    risk_level: 'MODERATE',
    confidence: 74,
    vulnerability_score: 67,
    priority_score: 55,
    priority_rank: 5,
    recommended_action: 'Increase monitoring frequency',
    contributing_factors: { rainfall: 42, water_level: 48, elevation: 50, historical_flooding: 65, citizen_reports: 45 },
    last_updated: '12 min ago',
    coordinates: [12.8950, 80.2250]
  }
]

export const SENSORS = [
  { sensor_id: 'ESP32-PALLIK-001', location_id: 'LOC-PALLIK-002', location_name: 'Pallikaranai', water_level_cm: 74, battery: 91, connectivity: 'online', last_update: '30 sec ago', status: 'Normal', trend: [62, 65, 68, 71, 74] },
  { sensor_id: 'ESP32-PALLIK-002', location_id: 'LOC-PALLIK-002', location_name: 'Pallikaranai', water_level_cm: 68, battery: 87, connectivity: 'online', last_update: '45 sec ago', status: 'Normal', trend: [55, 58, 62, 65, 68] },
  { sensor_id: 'ESP32-VELACH-001', location_id: 'LOC-VELACH-001', location_name: 'Velachery', water_level_cm: 58, battery: 94, connectivity: 'online', last_update: '1 min ago', status: 'Normal', trend: [45, 48, 52, 55, 58] },
  { sensor_id: 'ESP32-VELACH-002', location_id: 'LOC-VELACH-001', location_name: 'Velachery', water_level_cm: 52, battery: 72, connectivity: 'delayed', last_update: '8 min ago', status: 'Delayed', trend: [40, 43, 47, 50, 52] },
  { sensor_id: 'ESP32-PERUMB-001', location_id: 'LOC-PERUMB-004', location_name: 'Perumbakkam', water_level_cm: 45, battery: 89, connectivity: 'online', last_update: '2 min ago', status: 'Normal', trend: [35, 38, 41, 43, 45] },
  { sensor_id: 'ESP32-VYASAR-001', location_id: 'LOC-VYASAR-003', location_name: 'Vyasarpadi', water_level_cm: 32, battery: 65, connectivity: 'offline', last_update: '25 min ago', status: 'Offline', trend: [28, 30, 31, 32, 32] },
  { sensor_id: 'ESP32-SEMME-001', location_id: 'LOC-SEMME-005', location_name: 'Semmenchery', water_level_cm: 28, battery: 92, connectivity: 'online', last_update: '1 min ago', status: 'Normal', trend: [22, 24, 26, 27, 28] }
]

export const CITIZEN_REPORTS = [
  { report_id: 'CR-1024', location_id: 'LOC-PALLIK-002', location_name: 'Pallikaranai', condition: 'Waterlogging ~30cm', severity: 4, timestamp: '12:41 PM', verified: true, status: 'Verified', reporter: 'Citizen #412', description: 'Major waterlogging near Pallikaranai market. Water entering shops on ground floor.' },
  { report_id: 'CR-1023', location_id: 'LOC-VELACH-001', location_name: 'Velachery', condition: 'Road flooded', severity: 3, timestamp: '12:38 PM', verified: false, status: 'Pending', reporter: 'Citizen #387', description: 'Velachery main road flooded near bus stop. Traffic at standstill.' },
  { report_id: 'CR-1022', location_id: 'LOC-PALLIK-002', location_name: 'Pallikaranai', condition: 'Drainage blocked', severity: 3, timestamp: '12:35 PM', verified: true, status: 'Verified', reporter: 'Citizen #298', description: 'Storm drain completely blocked near bus depot. Water backing up.' },
  { report_id: 'CR-1021', location_id: 'LOC-PERUMB-004', location_name: 'Perumbakkam', condition: 'Standing water', severity: 2, timestamp: '12:30 PM', verified: false, status: 'Pending', reporter: 'Citizen #156', description: 'Standing water in residential area, knee-deep in some places.' },
  { report_id: 'CR-1020', location_id: 'LOC-VELACH-001', location_name: 'Velachery', condition: 'Flooding', severity: 4, timestamp: '12:25 PM', verified: true, status: 'Verified', reporter: 'Citizen #401', description: 'Severe flooding near Velachery lake. Water levels rising fast.' },
  { report_id: 'CR-1019', location_id: 'LOC-VYASAR-003', location_name: 'Vyasarpadi', condition: 'Minor waterlogging', severity: 2, timestamp: '12:20 PM', verified: false, status: 'Pending', reporter: 'Citizen #89', description: 'Minor waterlogging in side streets. Annoying but passable.' },
  { report_id: 'CR-1018', location_id: 'LOC-SEMME-005', location_name: 'Semmenchery', condition: 'Ponding', severity: 1, timestamp: '12:15 PM', verified: false, status: 'Rejected', reporter: 'Citizen #234', description: 'Small ponding near park. Not a serious issue.' },
  { report_id: 'CR-1017', location_id: 'LOC-PALLIK-002', location_name: 'Pallikaranai', condition: 'Severe flooding', severity: 5, timestamp: '12:10 PM', verified: true, status: 'Verified', reporter: 'Citizen #445', description: 'Entire street submerged. Cars floating. People stranded on first floors.' }
]

export const SENSOR_HISTORY = [
  { time: '06:00', pallikaranai: 35, velachery: 28, perumbakkam: 22, vyasarpadi: 18, semmenchery: 15 },
  { time: '07:00', pallikaranai: 38, velachery: 30, perumbakkam: 24, vyasarpadi: 19, semmenchery: 16 },
  { time: '08:00', pallikaranai: 42, velachery: 33, perumbakkam: 26, vyasarpadi: 21, semmenchery: 17 },
  { time: '09:00', pallikaranai: 48, velachery: 38, perumbakkam: 30, vyasarpadi: 24, semmenchery: 20 },
  { time: '10:00', pallikaranai: 55, velachery: 42, perumbakkam: 35, vyasarpadi: 28, semmenchery: 23 },
  { time: '11:00', pallikaranai: 65, velachery: 50, perumbakkam: 42, vyasarpadi: 32, semmenchery: 26 },
  { time: '12:00', pallikaranai: 74, velachery: 58, perumbakkam: 45, vyasarpadi: 32, semmenchery: 28 }
]

export const RAINFALL_HISTORY = [
  { time: '06:00', rainfall: 5, intensity: 2 },
  { time: '07:00', rainfall: 8, intensity: 3 },
  { time: '08:00', rainfall: 12, intensity: 4 },
  { time: '09:00', rainfall: 18, intensity: 6 },
  { time: '10:00', rainfall: 32, intensity: 14 },
  { time: '11:00', rainfall: 48, intensity: 16 },
  { time: '12:00', rainfall: 65, intensity: 17 }
]

export const PRIORITY_QUEUE = [
  { rank: 1, location_id: 'LOC-PALLIK-002', location: 'Pallikaranai', risk: 86, vulnerability: 91, priority: 89, confidence: 88, action: 'Immediate field inspection / rescue readiness', updated: '2m ago', risk_level: 'CRITICAL' },
  { rank: 2, location_id: 'LOC-VELACH-001', location: 'Velachery', risk: 81, vulnerability: 84, priority: 83, confidence: 91, action: 'Deploy pump / inspect drainage', updated: '3m ago', risk_level: 'HIGH' },
  { rank: 3, location_id: 'LOC-PERUMB-004', location: 'Perumbakkam', risk: 72, vulnerability: 79, priority: 76, confidence: 85, action: 'Deploy pump / inspect drainage', updated: '5m ago', risk_level: 'HIGH' },
  { rank: 4, location_id: 'LOC-VYASAR-003', location: 'Vyasarpadi', risk: 52, vulnerability: 69, priority: 59, confidence: 78, action: 'Increase monitoring frequency', updated: '8m ago', risk_level: 'MODERATE' },
  { rank: 5, location_id: 'LOC-SEMME-005', location: 'Semmenchery', risk: 45, vulnerability: 67, priority: 55, confidence: 74, action: 'Increase monitoring frequency', updated: '12m ago', risk_level: 'MODERATE' }
]

export const RISK_TREND = [
  { time: '06:00', pallikaranai: 54, velachery: 48, perumbakkam: 42, vyasarpadi: 35, semmenchery: 30 },
  { time: '07:00', pallikaranai: 58, velachery: 52, perumbakkam: 45, vyasarpadi: 38, semmenchery: 33 },
  { time: '08:00', pallikaranai: 63, velachery: 56, perumbakkam: 49, vyasarpadi: 41, semmenchery: 36 },
  { time: '09:00', pallikaranai: 68, velachery: 61, perumbakkam: 53, vyasarpadi: 44, semmenchery: 39 },
  { time: '10:00', pallikaranai: 74, velachery: 67, perumbakkam: 58, vyasarpadi: 47, semmenchery: 42 },
  { time: '11:00', pallikaranai: 80, velachery: 74, perumbakkam: 65, vyasarpadi: 50, semmenchery: 44 },
  { time: '12:00', pallikaranai: 86, velachery: 81, perumbakkam: 72, vyasarpadi: 52, semmenchery: 45 }
]

export const SIMULATION_STAGES = [
  { name: 'Normal', rainfall: 5, water_level: 15, reports: 0, severity: 1, locations: [
    { id: 'LOC-PALLIK-002', risk: 32, level: 'LOW', priority: 28 },
    { id: 'LOC-VELACH-001', risk: 28, level: 'LOW', priority: 25 },
    { id: 'LOC-PERUMB-004', risk: 25, level: 'LOW', priority: 22 },
    { id: 'LOC-VYASAR-003', risk: 20, level: 'LOW', priority: 18 },
    { id: 'LOC-SEMME-005', risk: 18, level: 'LOW', priority: 16 }
  ]},
  { name: 'Light Rain', rainfall: 25, water_level: 25, reports: 2, severity: 2, locations: [
    { id: 'LOC-PALLIK-002', risk: 45, level: 'MODERATE', priority: 42 },
    { id: 'LOC-VELACH-001', risk: 40, level: 'MODERATE', priority: 38 },
    { id: 'LOC-PERUMB-004', risk: 38, level: 'MODERATE', priority: 35 },
    { id: 'LOC-VYASAR-003', risk: 30, level: 'MODERATE', priority: 28 },
    { id: 'LOC-SEMME-005', risk: 28, level: 'LOW', priority: 25 }
  ]},
  { name: 'Moderate Rain', rainfall: 50, water_level: 45, reports: 5, severity: 3, locations: [
    { id: 'LOC-PALLIK-002', risk: 68, level: 'HIGH', priority: 65 },
    { id: 'LOC-VELACH-001', risk: 62, level: 'MODERATE', priority: 58 },
    { id: 'LOC-PERUMB-004', risk: 55, level: 'MODERATE', priority: 52 },
    { id: 'LOC-VYASAR-003', risk: 42, level: 'MODERATE', priority: 40 },
    { id: 'LOC-SEMME-005', risk: 38, level: 'MODERATE', priority: 35 }
  ]},
  { name: 'Heavy Rain', rainfall: 80, water_level: 65, reports: 8, severity: 4, locations: [
    { id: 'LOC-PALLIK-002', risk: 84, level: 'CRITICAL', priority: 82 },
    { id: 'LOC-VELACH-001', risk: 78, level: 'HIGH', priority: 75 },
    { id: 'LOC-PERUMB-004', risk: 68, level: 'HIGH', priority: 65 },
    { id: 'LOC-VYASAR-003', risk: 52, level: 'MODERATE', priority: 50 },
    { id: 'LOC-SEMME-005', risk: 45, level: 'MODERATE', priority: 42 }
  ]},
  { name: 'Extreme Rain', rainfall: 120, water_level: 90, reports: 12, severity: 5, locations: [
    { id: 'LOC-PALLIK-002', risk: 95, level: 'CRITICAL', priority: 93 },
    { id: 'LOC-VELACH-001', risk: 88, level: 'CRITICAL', priority: 86 },
    { id: 'LOC-PERUMB-004', risk: 78, level: 'HIGH', priority: 76 },
    { id: 'LOC-VYASAR-003', risk: 62, level: 'HIGH', priority: 60 },
    { id: 'LOC-SEMME-005', risk: 55, level: 'MODERATE', priority: 52 }
  ]}
]

export const getRiskLevel = (score) => {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MODERATE'
  return 'LOW'
}

export const getRiskColor = (level) => {
  const colors = { LOW: '#059669', MODERATE: '#d97706', HIGH: '#ea580c', CRITICAL: '#dc2626' }
  return colors[level] || '#64748b'
}