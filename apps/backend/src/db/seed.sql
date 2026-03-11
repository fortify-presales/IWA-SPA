-- IWA-SPA Seed Data
-- INTENTIONAL: plaintext passwords, demo admin credentials

INSERT OR IGNORE INTO users (id, username, password, email, role, bio, address) VALUES
  (1, 'admin', 'admin123', 'admin@pharmacy.local', 'admin', 'System administrator', '1 Admin Lane, Demo City'),
  (2, 'user', 'user123', 'user@pharmacy.local', 'user', 'Regular pharmacy user. <script>alert("XSS")</script>', '42 Main Street, Demo City'),
  (3, 'john', 'password', 'john@example.com', 'user', 'Hi I am John', '10 Oak Road, Demo City');

INSERT OR IGNORE INTO products (id, name, description, price, category, isPrescriptionOnly, imageUrl) VALUES
  (1, 'Aspirin 100mg', 'Pain relief tablet. Take one daily.', 4.99, 'Pain Relief', 0, '/images/aspirin.png'),
  (2, 'Amoxicillin 500mg', 'Antibiotic – requires prescription. <b>Important:</b> complete the course.', 12.99, 'Antibiotics', 1, '/images/amoxicillin.png'),
  (3, 'Vitamin C 1000mg', 'Immune support supplement.', 8.49, 'Vitamins', 0, '/images/vitc.png'),
  (4, 'Ibuprofen 200mg', 'Anti-inflammatory pain relief.', 5.99, 'Pain Relief', 0, '/images/ibuprofen.png'),
  (5, 'Metformin 850mg', 'Diabetes management – prescription required.', 15.99, 'Diabetes', 1, '/images/metformin.png'),
  (6, 'Cetirizine 10mg', 'Antihistamine for allergies.', 6.49, 'Allergy', 0, '/images/cetirizine.png'),
  (7, 'Omeprazole 20mg', 'Proton pump inhibitor for acid reflux.', 9.99, 'Digestive', 0, '/images/omeprazole.png'),
  (8, 'Atorvastatin 40mg', 'Cholesterol lowering – prescription required.', 22.50, 'Cardiovascular', 1, '/images/atorvastatin.png');

INSERT OR IGNORE INTO orders (id, userId, total, status, createdAt) VALUES
  (1, 2, 13.48, 'completed', '2024-01-15 10:30:00'),
  (2, 2, 8.49, 'shipped', '2024-02-01 14:00:00'),
  (3, 3, 28.98, 'pending', '2024-02-10 09:00:00');

INSERT OR IGNORE INTO order_items (id, orderId, productId, qty, priceAtPurchase) VALUES
  (1, 1, 1, 1, 4.99),
  (2, 1, 4, 1, 5.99),
  (3, 1, 6, 1, 2.50),
  (4, 2, 3, 1, 8.49),
  (5, 3, 2, 1, 12.99),
  (6, 3, 5, 1, 15.99);

-- INTENTIONAL: stored XSS in review content
INSERT OR IGNORE INTO reviews (id, productId, userId, content, createdAt) VALUES
  (1, 1, 2, 'Great product! Really helped with my headache.', '2024-01-20 11:00:00'),
  (2, 3, 3, 'Works well. <img src=x onerror=alert("XSS")>', '2024-01-25 15:30:00'),
  (3, 4, 2, 'Good value for money.', '2024-02-05 08:00:00');
