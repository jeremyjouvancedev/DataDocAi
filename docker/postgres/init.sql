-- init.sql
-- Script to create a table for house pricing and insert fake data

-- Create a table named 'house_pricing'
CREATE TABLE IF NOT EXISTS public.house_pricing (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    square_feet INT,
    bedrooms INT,
    bathrooms DECIMAL(2,1),
    listing_price DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    listing_date DATE,
    sale_date DATE,
    status VARCHAR(50)
);

-- Insert fake data into 'house_pricing'
INSERT INTO house_pricing
(address, city, state, zip_code, square_feet, bedrooms, bathrooms, listing_price, sale_price, listing_date, sale_date, status)
VALUES
('123 Oak Street', 'Springfield', 'StateName', '12345', 2000, 3, 2.5, 300000.00, 295000.00, '2021-01-15', '2021-02-20', 'Sold'),
('456 Maple Avenue', 'Riverdale', 'StateName', '12346', 1500, 2, 1.0, 200000.00, 210000.00, '2021-03-01', '2021-04-10', 'Sold'),
('789 Pine Lane', 'Shelbyville', 'StateName', '12347', 1800, 4, 3.0, 250000.00, 240000.00, '2021-02-01', NULL, 'Listed');
