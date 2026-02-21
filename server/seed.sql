-- ============================================================
-- FleetFlow Seed Data — 30-40 logical, connected records per table
-- Run this file against your PostgreSQL database.
-- WARNING: This will DELETE all existing data first!
-- ============================================================

-- 1) Ensure all required columns exist
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS completion_rate INTEGER DEFAULT 80;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS complaints INTEGER DEFAULT 0;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS safety_score INTEGER DEFAULT 80;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS trips INTEGER DEFAULT 0;

ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'In Progress';
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2) Clear all tables (order matters for foreign keys)
TRUNCATE trips, expenses, maintenance, drivers, vehicles RESTART IDENTITY CASCADE;

-- ============================================================
-- VEHICLES (30 records)
-- ============================================================
INSERT INTO vehicles (name, license_plate, type, max_capacity, odometer, status) VALUES
('TATA Ace Gold',       'GJ-01-AB-1001', 'Mini',  750,   12450, 'Available'),
('TATA Ace Mega',       'GJ-01-CD-1002', 'Mini',  1000,  8700,  'Available'),
('Mahindra Bolero Pikup','GJ-05-EF-1003', 'Mini',  1250,  23100, 'Available'),
('TATA 407',            'GJ-05-GH-1004', 'Truck', 3500,  45200, 'On Trip'),
('TATA 709',            'GJ-01-IJ-1005', 'Truck', 5000,  67800, 'Available'),
('Ashok Leyland Dost',  'GJ-03-KL-1006', 'Mini',  1500,  15600, 'Available'),
('Eicher Pro 2049',     'GJ-03-MN-1007', 'Truck', 5000,  89200, 'On Trip'),
('BharatBenz 1617',     'GJ-01-OP-1008', 'Truck', 9000,  112000,'Available'),
('Mahindra Furio 7',    'GJ-05-QR-1009', 'Truck', 7000,  34500, 'In Shop'),
('TATA Ultra T.7',      'GJ-01-ST-1010', 'Truck', 7000,  56700, 'Available'),
('Ashok Leyland BOSS',  'GJ-03-UV-1011', 'Truck', 12000, 145000,'Available'),
('TATA Prima 4028',     'GJ-01-WX-1012', 'Truck', 28000, 210000,'Available'),
('Volvo FH 460',        'GJ-05-YZ-1013', 'Truck', 35000, 310000,'On Trip'),
('Scania R500',         'GJ-01-AA-1014', 'Truck', 40000, 280000,'Available'),
('TATA Ace EV',         'GJ-03-BB-1015', 'Mini',  600,   4200,  'Available'),
('Mahindra Treo Zor',   'GJ-01-CC-1016', 'Mini',  500,   3100,  'Available'),
('Eicher Pro 3015',     'GJ-05-DD-1017', 'Truck', 10000, 95000, 'Available'),
('TATA Signa 2823',     'GJ-01-EE-1018', 'Truck', 23000, 175000,'In Shop'),
('Ashok Leyland U3718', 'GJ-03-FF-1019', 'Truck', 18000, 132000,'Available'),
('TATA Intra V30',      'GJ-01-GG-1020', 'Mini',  1100,  18900, 'Available'),
('Mahindra Blazo X35',  'GJ-05-HH-1021', 'Truck', 25000, 198000,'Available'),
('BharatBenz 3723',     'GJ-01-II-1022', 'Truck', 23000, 165000,'Available'),
('Eicher Pro 6031',     'GJ-03-JJ-1023', 'Truck', 16000, 123000,'On Trip'),
('TATA LPT 3518',       'GJ-01-KK-1024', 'Truck', 18000, 87000, 'Available'),
('Volvo VNL 860',       'GJ-05-LL-1025', 'Truck', 30000, 245000,'Available'),
('Scania G410',         'GJ-01-MM-1026', 'Truck', 22000, 178000,'Available'),
('TATA Ace Gold Diesel', 'GJ-03-NN-1027', 'Mini', 750,   21500, 'Available'),
('Mahindra Jayo',       'GJ-01-OO-1028', 'Mini',  1500,  11200, 'Available'),
('Ashok Leyland ecomet', 'GJ-05-PP-1029', 'Truck', 8000,  62000, 'Available'),
('TATA Winger',         'GJ-01-QQ-1030', 'Van',   1200,  28900, 'Available');

-- ============================================================
-- DRIVERS (35 records)
-- Realistic Indian names, varied safety stats
-- ============================================================
INSERT INTO drivers (name, phone, license_no, expiry_date, status, completion_rate, complaints, trips, safety_score) VALUES
('Rajesh Kumar',      '9876543210', 'GJ-DL-2020-001', '2027-06-15', 'On Duty',  95, 0, 28, 95),
('Amit Sharma',       '9876543211', 'GJ-DL-2021-002', '2027-03-20', 'On Duty',  88, 1, 22, 83),
('Suresh Patel',      '9876543212', 'GJ-DL-2019-003', '2026-08-10', 'On Trip',  92, 0, 25, 92),
('Vikram Singh',      '9876543213', 'GJ-DL-2022-004', '2028-01-05', 'On Duty',  78, 2, 18, 68),
('Deepak Verma',      '9876543214', 'GJ-DL-2020-005', '2026-04-30', 'On Duty',  85, 1, 20, 80),
('Manoj Yadav',       '9876543215', 'GJ-DL-2021-006', '2027-09-25', 'Off Duty', 70, 3, 15, 55),
('Rahul Joshi',       '9876543216', 'GJ-DL-2018-007', '2025-12-15', 'On Duty',  98, 0, 30, 98),
('Karan Mehta',       '9876543217', 'GJ-DL-2023-008', '2028-05-20', 'On Trip',  82, 1, 16, 77),
('Prashant Gupta',    '9876543218', 'GJ-DL-2020-009', '2026-11-10', 'On Duty',  90, 0, 24, 90),
('Sanjay Thakur',     '9876543219', 'GJ-DL-2019-010', '2026-03-01', 'On Duty',  65, 4, 12, 45),
('Nitin Chauhan',     '9876543220', 'GJ-DL-2022-011', '2028-07-15', 'On Duty',  91, 0, 26, 91),
('Arjun Reddy',       '9876543221', 'GJ-DL-2021-012', '2027-02-28', 'On Trip',  87, 1, 19, 82),
('Ravi Shankar',      '9876543222', 'GJ-DL-2020-013', '2026-06-20', 'On Duty',  93, 0, 27, 93),
('Prakash Nair',      '9876543223', 'GJ-DL-2023-014', '2028-10-10', 'On Duty',  80, 2, 14, 70),
('Ajay Deshmukh',     '9876543224', 'GJ-DL-2019-015', '2025-09-05', 'Off Duty', 60, 5, 10, 35),
('Mohan Das',         '9876543225', 'GJ-DL-2022-016', '2028-03-15', 'On Duty',  96, 0, 29, 96),
('Sachin Tendulkar B','9876543226', 'GJ-DL-2021-017', '2027-08-22', 'On Duty',  84, 1, 17, 79),
('Vijay Malhotra',    '9876543227', 'GJ-DL-2020-018', '2026-05-18', 'On Duty',  89, 0, 23, 89),
('Ashish Rawat',      '9876543228', 'GJ-DL-2023-019', '2028-12-01', 'On Trip',  75, 2, 13, 65),
('Dilip Pandey',      '9876543229', 'GJ-DL-2018-020', '2025-06-30', 'On Duty',  72, 3, 11, 57),
('Gaurav Saxena',     '9876543230', 'GJ-DL-2022-021', '2028-04-25', 'On Duty',  97, 0, 31, 97),
('Harish Chandra',    '9876543231', 'GJ-DL-2021-022', '2027-11-14', 'On Duty',  83, 1, 21, 78),
('Jitendra Tiwari',   '9876543232', 'GJ-DL-2020-023', '2026-09-08', 'On Duty',  86, 1, 18, 81),
('Lalit Mohan',       '9876543233', 'GJ-DL-2023-024', '2028-06-30', 'On Duty',  94, 0, 26, 94),
('Naveen Kumar',      '9876543234', 'GJ-DL-2019-025', '2026-02-14', 'Off Duty', 68, 3, 9,  53),
('Omprakash Mishra',  '9876543235', 'GJ-DL-2022-026', '2028-08-20', 'On Duty',  90, 0, 22, 90),
('Pawan Agarwal',     '9876543236', 'GJ-DL-2021-027', '2027-04-10', 'On Duty',  81, 2, 15, 71),
('Rohit Sharma B',    '9876543237', 'GJ-DL-2020-028', '2026-07-25', 'On Duty',  92, 0, 24, 92),
('Tarun Bhatia',      '9876543238', 'GJ-DL-2023-029', '2028-11-30', 'On Duty',  88, 1, 20, 83),
('Umesh Rao',         '9876543239', 'GJ-DL-2019-030', '2025-11-20', 'On Duty',  77, 2, 16, 67),
('Waseem Khan',       '9876543240', 'GJ-DL-2022-031', '2028-02-14', 'On Duty',  99, 0, 32, 99),
('Yogesh Patil',      '9876543241', 'GJ-DL-2021-032', '2027-07-08', 'On Duty',  85, 1, 19, 80),
('Zakir Hussain',     '9876543242', 'GJ-DL-2020-033', '2026-10-22', 'On Duty',  91, 0, 25, 91),
('Anil Kapoor B',     '9876543243', 'GJ-DL-2023-034', '2028-09-15', 'On Duty',  76, 2, 12, 66),
('Bharat Singh',      '9876543244', 'GJ-DL-2018-035', '2025-08-01', 'Off Duty', 63, 4, 8,  43);

-- ============================================================
-- TRIPS (40 records)
-- Linked to vehicles 1-30 and drivers 1-35
-- Dates spread over last 2 years
-- ============================================================
INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_weight, status, created_at) VALUES
(1,  1,  'Ahmedabad',  'Surat',       620,   'Completed',  NOW() - INTERVAL '23 months'),
(2,  2,  'Rajkot',     'Ahmedabad',   800,   'Completed',  NOW() - INTERVAL '22 months'),
(3,  3,  'Surat',      'Mumbai',      1100,  'Completed',  NOW() - INTERVAL '21 months'),
(5,  5,  'Ahmedabad',  'Vadodara',    4200,  'Completed',  NOW() - INTERVAL '20 months'),
(6,  7,  'Gandhinagar','Rajkot',      1300,  'Completed',  NOW() - INTERVAL '19 months'),
(7,  8,  'Vadodara',   'Surat',       4500,  'Completed',  NOW() - INTERVAL '18 months'),
(8,  9,  'Mumbai',     'Pune',        8500,  'Completed',  NOW() - INTERVAL '17 months'),
(10, 11, 'Ahmedabad',  'Jaipur',      6200,  'Completed',  NOW() - INTERVAL '16 months'),
(11, 12, 'Delhi',      'Ahmedabad',   11000, 'Completed',  NOW() - INTERVAL '15 months'),
(12, 13, 'Ahmedabad',  'Hyderabad',   25000, 'Completed',  NOW() - INTERVAL '14 months'),
(13, 16, 'Mumbai',     'Bangalore',   32000, 'Completed',  NOW() - INTERVAL '13 months'),
(14, 17, 'Surat',      'Delhi',       38000, 'Completed',  NOW() - INTERVAL '12 months'),
(1,  1,  'Surat',      'Ahmedabad',   700,   'Completed',  NOW() - INTERVAL '11 months'),
(2,  2,  'Ahmedabad',  'Gandhinagar', 900,   'Completed',  NOW() - INTERVAL '10 months'),
(5,  5,  'Vadodara',   'Mumbai',      4800,  'Completed',  NOW() - INTERVAL '9 months'),
(15, 18, 'Rajkot',     'Dwarka',      500,   'Completed',  NOW() - INTERVAL '9 months'),
(16, 19, 'Ahmedabad',  'Bhuj',        400,   'Completed',  NOW() - INTERVAL '8 months'),
(17, 21, 'Surat',      'Nagpur',      9500,  'Completed',  NOW() - INTERVAL '7 months'),
(19, 22, 'Delhi',      'Lucknow',     16000, 'Completed',  NOW() - INTERVAL '7 months'),
(20, 23, 'Ahmedabad',  'Udaipur',     1000,  'Completed',  NOW() - INTERVAL '6 months'),
(21, 24, 'Mumbai',     'Chennai',     22000, 'Completed',  NOW() - INTERVAL '5 months'),
(22, 26, 'Pune',       'Ahmedabad',   20000, 'Completed',  NOW() - INTERVAL '5 months'),
(24, 27, 'Ahmedabad',  'Indore',      17000, 'Completed',  NOW() - INTERVAL '4 months'),
(25, 28, 'Delhi',      'Kolkata',     28000, 'Completed',  NOW() - INTERVAL '4 months'),
(26, 29, 'Surat',      'Pune',        20000, 'Completed',  NOW() - INTERVAL '3 months'),
(27, 30, 'Rajkot',     'Ahmedabad',   650,   'Completed',  NOW() - INTERVAL '3 months'),
(28, 31, 'Gandhinagar','Vadodara',    1400,  'Completed',  NOW() - INTERVAL '2 months'),
(29, 32, 'Ahmedabad',  'Surat',       7500,  'Completed',  NOW() - INTERVAL '2 months'),
(30, 33, 'Vadodara',   'Rajkot',      1100,  'Completed',  NOW() - INTERVAL '45 days'),
(1,  1,  'Ahmedabad',  'Bhavnagar',   680,   'Completed',  NOW() - INTERVAL '30 days'),
(2,  9,  'Surat',      'Vadodara',    950,   'Completed',  NOW() - INTERVAL '25 days'),
(5,  13, 'Mumbai',     'Ahmedabad',   4600,  'Completed',  NOW() - INTERVAL '20 days'),
(6,  16, 'Rajkot',     'Jamnagar',    1200,  'Completed',  NOW() - INTERVAL '15 days'),
(8,  21, 'Ahmedabad',  'Surat',       8200,  'Completed',  NOW() - INTERVAL '10 days'),
(10, 24, 'Vadodara',   'Ahmedabad',   6800,  'Completed',  NOW() - INTERVAL '7 days'),
(4,  3,  'Ahmedabad',  'Mumbai',      3200,  'On Trip',    NOW() - INTERVAL '2 days'),
(7,  8,  'Surat',      'Pune',        4700,  'On Trip',    NOW() - INTERVAL '1 day'),
(13, 12, 'Mumbai',     'Delhi',       33000, 'On Trip',    NOW() - INTERVAL '3 days'),
(23, 19, 'Vadodara',   'Bangalore',   15000, 'On Trip',    NOW() - INTERVAL '2 days'),
(3,  34, 'Ahmedabad',  'Rajkot',      1050,  'Draft',      NOW());

-- ============================================================
-- EXPENSES (35 records)
-- Connected to vehicles, spread over 2 years
-- ============================================================
INSERT INTO expenses (vehicle_id, fuel_cost, misc_expense, notes, created_at) VALUES
(1,  3500,  500,   'City delivery fuel',            NOW() - INTERVAL '23 months'),
(2,  4200,  0,     'Regular route fuel',             NOW() - INTERVAL '22 months'),
(3,  6800,  1200,  'Highway run + tolls',            NOW() - INTERVAL '21 months'),
(5,  5100,  800,   'Interstate delivery',            NOW() - INTERVAL '20 months'),
(6,  2800,  0,     'Short haul fuel',                NOW() - INTERVAL '19 months'),
(7,  7500,  1500,  'Long distance + driver allowance',NOW() - INTERVAL '18 months'),
(8,  9200,  2000,  'Mumbai-Pune heavy load',         NOW() - INTERVAL '17 months'),
(10, 8400,  1800,  'Ahmedabad-Jaipur express',       NOW() - INTERVAL '16 months'),
(11, 11500, 2500,  'Delhi-Ahmedabad route',          NOW() - INTERVAL '15 months'),
(12, 14000, 3000,  'Ahmedabad-Hyderabad',            NOW() - INTERVAL '14 months'),
(13, 15200, 3500,  'Mumbai-Bangalore heavy',         NOW() - INTERVAL '13 months'),
(14, 13800, 2800,  'Surat-Delhi long haul',          NOW() - INTERVAL '12 months'),
(1,  3200,  400,   'Return trip fuel',               NOW() - INTERVAL '11 months'),
(2,  3800,  600,   'City-to-city run',               NOW() - INTERVAL '10 months'),
(5,  6500,  1100,  'Vadodara-Mumbai express',        NOW() - INTERVAL '9 months'),
(15, 2200,  300,   'EV charging + parking',          NOW() - INTERVAL '9 months'),
(16, 1800,  200,   'EV charging cost',               NOW() - INTERVAL '8 months'),
(17, 8900,  1600,  'Surat-Nagpur logistics',         NOW() - INTERVAL '7 months'),
(19, 10200, 2200,  'Delhi-Lucknow freight',          NOW() - INTERVAL '7 months'),
(20, 3400,  500,   'Short distance run',             NOW() - INTERVAL '6 months'),
(21, 12500, 2800,  'Mumbai-Chennai express',         NOW() - INTERVAL '5 months'),
(22, 11800, 2400,  'Pune-Ahmedabad return',          NOW() - INTERVAL '5 months'),
(24, 9800,  2100,  'Ahmedabad-Indore logistics',     NOW() - INTERVAL '4 months'),
(25, 13200, 3200,  'Delhi-Kolkata freight',          NOW() - INTERVAL '4 months'),
(26, 10500, 2300,  'Surat-Pune delivery',            NOW() - INTERVAL '3 months'),
(27, 2600,  350,   'Mini truck run',                 NOW() - INTERVAL '3 months'),
(28, 3100,  450,   'Local delivery',                 NOW() - INTERVAL '2 months'),
(29, 7200,  1400,  'Medium distance haul',           NOW() - INTERVAL '2 months'),
(30, 3800,  600,   'Van delivery route',             NOW() - INTERVAL '45 days'),
(1,  3600,  500,   'Regular city delivery',          NOW() - INTERVAL '30 days'),
(2,  4000,  700,   'Express delivery fuel',          NOW() - INTERVAL '25 days'),
(5,  5800,  900,   'Mumbai return trip',             NOW() - INTERVAL '20 days'),
(6,  2500,  300,   'Short haul fuel',                NOW() - INTERVAL '15 days'),
(8,  8800,  1700,  'Heavy load delivery',            NOW() - INTERVAL '10 days'),
(10, 7600,  1500,  'Express freight fuel',           NOW() - INTERVAL '7 days');

-- ============================================================
-- MAINTENANCE (30 records)
-- Connected to vehicles, various service types
-- ============================================================
INSERT INTO maintenance (vehicle_id, service_type, cost, notes, status, created_at) VALUES
(1,  'Oil Change',        1500,  'Regular 5000km service',            'Completed', NOW() - INTERVAL '22 months'),
(3,  'Tire Replacement',  12000, 'Front tires replaced',              'Completed', NOW() - INTERVAL '21 months'),
(5,  'Brake Inspection',  3500,  'Brake pads replaced',               'Completed', NOW() - INTERVAL '20 months'),
(7,  'Oil Change',        2200,  'Synthetic oil upgrade',             'Completed', NOW() - INTERVAL '18 months'),
(8,  'Engine Tune-up',    8500,  'Full engine service',               'Completed', NOW() - INTERVAL '17 months'),
(10, 'Coolant Flush',     2800,  'Cooling system maintenance',        'Completed', NOW() - INTERVAL '16 months'),
(11, 'Transmission Service', 15000, 'Gearbox overhaul',              'Completed', NOW() - INTERVAL '15 months'),
(12, 'Oil Change',        2500,  'Regular maintenance',               'Completed', NOW() - INTERVAL '14 months'),
(13, 'Tire Rotation',     1800,  'All 6 tires rotated',               'Completed', NOW() - INTERVAL '13 months'),
(14, 'Air Filter',        1200,  'Cabin + engine filters',            'Completed', NOW() - INTERVAL '12 months'),
(1,  'Oil Change',        1500,  'Scheduled service',                 'Completed', NOW() - INTERVAL '11 months'),
(2,  'Battery Replacement', 6500, 'New heavy-duty battery',           'Completed', NOW() - INTERVAL '10 months'),
(5,  'Wheel Alignment',   2000,  'Front wheel alignment',             'Completed', NOW() - INTERVAL '9 months'),
(6,  'Oil Change',        1800,  'Regular service',                   'Completed', NOW() - INTERVAL '8 months'),
(15, 'EV Battery Check',  5000,  'Battery health diagnostic',         'Completed', NOW() - INTERVAL '8 months'),
(17, 'Brake Replacement', 9500,  'Rear brake system overhaul',        'Completed', NOW() - INTERVAL '7 months'),
(19, 'Suspension Repair', 18000, 'Leaf spring replacement',           'Completed', NOW() - INTERVAL '6 months'),
(20, 'Oil Change',        1500,  'Standard service',                  'Completed', NOW() - INTERVAL '5 months'),
(21, 'Tire Replacement',  22000, 'All 10 tires replaced',             'Completed', NOW() - INTERVAL '5 months'),
(22, 'Clutch Replacement', 12000, 'Complete clutch kit replaced',     'Completed', NOW() - INTERVAL '4 months'),
(24, 'Oil Change',        2200,  'Synthetic oil service',             'Completed', NOW() - INTERVAL '3 months'),
(25, 'Radiator Repair',   7500,  'Radiator leak fixed',               'Completed', NOW() - INTERVAL '3 months'),
(26, 'Wheel Bearing',     4500,  'Front wheel bearings replaced',     'Completed', NOW() - INTERVAL '2 months'),
(27, 'Oil Change',        1500,  'Mini truck service',                'Completed', NOW() - INTERVAL '2 months'),
(28, 'Brake Inspection',  2800,  'Brake fluid flush + pads',          'Completed', NOW() - INTERVAL '45 days'),
(29, 'Oil Change',        2000,  'Regular maintenance',               'Completed', NOW() - INTERVAL '30 days'),
(1,  'Tire Rotation',     1200,  'Quarterly tire rotation',           'Completed', NOW() - INTERVAL '20 days'),
(5,  'Air Filter',        900,   'Engine air filter replacement',     'Completed', NOW() - INTERVAL '10 days'),
(9,  'Engine Overhaul',   25000, 'Major engine rebuild in progress',  'In Progress', NOW() - INTERVAL '5 days'),
(18, 'Transmission Service', 20000, 'Full transmission rebuild',      'In Progress', NOW() - INTERVAL '3 days');

-- ============================================================
-- Update safety_score = completion_rate - (complaints * 5), clamped 0-100
-- ============================================================
UPDATE drivers SET safety_score = GREATEST(0, LEAST(100, COALESCE(completion_rate, 80) - (COALESCE(complaints, 0) * 5)));

-- Done!
SELECT 'Seed complete!' AS message,
  (SELECT COUNT(*) FROM vehicles) AS vehicles,
  (SELECT COUNT(*) FROM drivers) AS drivers,
  (SELECT COUNT(*) FROM trips) AS trips,
  (SELECT COUNT(*) FROM expenses) AS expenses,
  (SELECT COUNT(*) FROM maintenance) AS maintenance;
