CREATE DATABASE IF NOT EXISTS the_marlow_db;
USE the_marlow_db;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    property_name VARCHAR(120) NOT NULL DEFAULT 'Marlow - Mayfair',
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Manager', 'Head Chef', 'Sous Chef', 'Receptionist', 'Room Attendant', 'Supervisor') DEFAULT 'Manager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(10) PRIMARY KEY,
    floor INT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    guest_name VARCHAR(100) DEFAULT NULL,
    notes VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    booking_id VARCHAR(20) PRIMARY KEY,
    guest_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(10),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    channel ENUM('Direct website', 'Booking partners', 'Corporate accounts', 'Phone & walk-in') DEFAULT 'Direct website',
    status ENUM('Confirmed', 'Checked in', 'Checked out', 'Cancelled') DEFAULT 'Confirmed',
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category ENUM('Starters', 'Main courses', 'Light bites', 'Breakfast', 'Desserts', 'Drinks') NOT NULL,
    dietary_tag VARCHAR(80),
    price DECIMAL(8, 2) NOT NULL,
    portions_left INT DEFAULT 20,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS meal_orders (
    order_id VARCHAR(20) PRIMARY KEY,
    room_or_table VARCHAR(30) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    items_summary TEXT NOT NULL,
    allergy_alert VARCHAR(150) DEFAULT 'None',
    station ENUM('Hot kitchen', 'Cold kitchen', 'Pastry & beverages') DEFAULT 'Hot kitchen',
    status ENUM('New', 'Preparing', 'Ready', 'Delayed', 'Completed') DEFAULT 'New',
    total_amount DECIMAL(8, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    sku VARCHAR(20) PRIMARY KEY,
    barcode VARCHAR(64) UNIQUE,
    ingredient_name VARCHAR(120) NOT NULL,
    category_storage VARCHAR(80) NOT NULL,
    quantity_on_hand DECIMAL(8, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reorder_level DECIMAL(8, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    supplier VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    task_type VARCHAR(80) NOT NULL,
    assigned_to VARCHAR(100) NOT NULL,
    priority ENUM('Normal', 'High', 'Scheduled') DEFAULT 'Normal',
    status ENUM('In progress', 'Awaiting inspection', 'Completed', 'Scheduled') DEFAULT 'In progress',
    FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    department ENUM('Food & beverage', 'Kitchen', 'Housekeeping', 'Front desk') NOT NULL,
    role VARCHAR(80) NOT NULL,
    shift_window VARCHAR(50) NOT NULL,
    status ENUM('On duty', 'Upcoming', 'Off duty') DEFAULT 'On duty'
);

INSERT IGNORE INTO rooms (room_number, floor, room_type, status, guest_name, notes) VALUES
('301', 3, 'Deluxe King', 'Available', NULL, 'Ready for check-in'),
('302', 3, 'Deluxe King', 'Occupied', 'Amalia Patel', 'VIP welcome amenity'),
('303', 3, 'Deluxe King', 'Occupied', 'Emma Wilson', 'Allergy: No nuts'),
('304', 3, 'Deluxe King', 'Occupied', 'James Chen', 'Extra towels requested'),
('305', 3, 'Deluxe King', 'Maintenance', NULL, 'AC inspection');

INSERT IGNORE INTO menu_items (item_code, name, category, dietary_tag, price, portions_left, is_available, image_url) VALUES
('MN-001', 'Grilled salmon', 'Main courses', 'Gluten-free', 24.00, 6, TRUE, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80'),
('MN-002', 'Caesar salad', 'Starters', 'Vegetarian option', 12.00, 32, TRUE, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80'),
('MN-003', 'Truffle mushroom risotto', 'Main courses', 'Vegetarian', 19.00, 24, TRUE, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80'),
('MN-004', 'Club sandwich', 'Light bites', 'Contains gluten', 16.00, 18, TRUE, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'),
('MN-005', 'Seared sea bass', 'Main courses', 'Gluten-free', 26.00, 0, FALSE, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80'),
('MN-006', 'Margherita pizza', 'Main courses', 'Vegetarian', 17.00, 20, TRUE, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80');

INSERT IGNORE INTO meal_orders (order_id, room_or_table, guest_name, items_summary, allergy_alert, station, status, total_amount) VALUES
('#1048', 'Room 304', 'Emma Wilson · 2 guests', 'Grilled salmon, Caesar salad', 'No nuts', 'Hot kitchen', 'New', 36.00),
('#1047', 'Table 12', 'Walk-in · 2 guests', 'Truffle mushroom risotto', 'Vegetarian', 'Cold kitchen', 'Preparing', 19.00),
('#1046', 'Room 218', 'Liam Patel · 1 guest', 'Club sandwich, fresh juice', 'None', 'Pastry & beverages', 'Ready', 16.00),
('#1044', 'Room 512', 'James Chen · 2 guests', 'Seared sea bass, fries', 'Gluten-free', 'Hot kitchen', 'Delayed', 26.00);

INSERT IGNORE INTO inventory (sku, barcode, ingredient_name, category_storage, quantity_on_hand, unit, reorder_level, expiry_date, supplier) VALUES
('ST-001', '89012345001', 'Atlantic salmon', 'Seafood · Chilled', 1.20, 'kg', 5.00, '2026-11-16', 'Coast & Catch'),
('ST-002', '89012345002', 'Sea bass fillets', 'Seafood · Chilled', 1.20, 'kg', 4.00, '2026-11-15', 'Coast & Catch'),
('ST-003', '89012345003', 'Arborio rice', 'Dry goods · Pantry', 3.00, 'kg', 8.00, '2027-04-10', 'Pantry Partners'),
('ST-004', '89012345004', 'Romaine lettuce', 'Produce · Chilled', 24.00, 'heads', 10.00, '2026-11-16', 'Fresh & Co.'),
('ST-005', '89012345005', 'Fresh cream', 'Dairy · Chilled', 2.00, 'litres', 6.00, '2026-11-15', 'Fresh & Co.');
