CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY,
    external_customer_ref VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    birth_date DATE,
    customer_segment VARCHAR(50),
    loyalty_status VARCHAR(50),
    marketing_opt_in BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10),
    country_code CHAR(2),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE addresses (
    address_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    address_type VARCHAR(50) NOT NULL,
    street_line_1 VARCHAR(255) NOT NULL,
    street_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    state_region VARCHAR(100),
    country_code CHAR(2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category_name VARCHAR(100),
    brand_name VARCHAR(100),
    supplier_id BIGINT,
    unit_price DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    stock_quantity INT NOT NULL,
    weight_kg DECIMAL(10,3),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE suppliers (
    supplier_id BIGINT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_email VARCHAR(255),
    supplier_phone VARCHAR(50),
    supplier_country CHAR(2),
    contract_start_date DATE,
    contract_end_date DATE,
    risk_level VARCHAR(50),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE orders (
    order_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    billing_address_id BIGINT,
    shipping_address_id BIGINT,
    order_status VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(100),
    order_total DECIMAL(14,2) NOT NULL,
    tax_total DECIMAL(14,2),
    shipping_total DECIMAL(14,2),
    discount_total DECIMAL(14,2),
    currency_code CHAR(3) NOT NULL,
    sales_channel VARCHAR(100),
    fraud_score FLOAT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE order_items (
    order_item_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    line_total DECIMAL(14,2) NOT NULL,
    fulfillment_status VARCHAR(50),
    warehouse_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    payment_provider VARCHAR(100),
    transaction_reference VARCHAR(255),
    payment_status VARCHAR(50) NOT NULL,
    payment_amount DECIMAL(14,2) NOT NULL,
    payment_currency CHAR(3) NOT NULL,
    payment_date TIMESTAMP,
    refunded_amount DECIMAL(14,2),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE shipments (
    shipment_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(255),
    shipment_status VARCHAR(50),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    estimated_delivery_date DATE,
    shipping_cost DECIMAL(12,2),
    warehouse_code VARCHAR(50),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE inventory_movements (
    movement_id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity_delta INT NOT NULL,
    reference_document VARCHAR(255),
    movement_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE customer_support_tickets (
    ticket_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_id BIGINT,
    ticket_category VARCHAR(100),
    ticket_priority VARCHAR(50),
    ticket_status VARCHAR(50),
    assigned_team VARCHAR(100),
    satisfaction_score INT,
    opened_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    issue_summary TEXT
);