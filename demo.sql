-- Demo SQL for Data Contract Builder QA
-- Covers multi-table import, primary keys, composite primary keys,
-- table-level single-column foreign keys, named foreign keys,
-- inline REFERENCES, quoted identifiers, schema-prefixed references,
-- ON DELETE / ON UPDATE clauses, and composite foreign keys.

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
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_addresses_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
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

CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category_name VARCHAR(100),
    brand_name VARCHAR(100),
    supplier_id BIGINT REFERENCES suppliers(supplier_id),
    unit_price DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    stock_quantity INT NOT NULL,
    weight_kg DECIMAL(10,3),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
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
    updated_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_orders_billing_address
        FOREIGN KEY (billing_address_id)
        REFERENCES addresses(address_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_orders_shipping_address
        FOREIGN KEY (shipping_address_id)
        REFERENCES addresses(address_id)
        ON UPDATE CASCADE
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
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id),
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
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
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
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
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE inventory_movements (
    movement_id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50) NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity_delta INT NOT NULL,
    reference_document VARCHAR(255),
    movement_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
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
    issue_summary TEXT,
    CONSTRAINT fk_tickets_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id),
    CONSTRAINT fk_tickets_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
);

CREATE TABLE warehouses (
    warehouse_id BIGINT PRIMARY KEY,
    warehouse_code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_name VARCHAR(255) NOT NULL,
    country_code CHAR(2) NOT NULL,
    city VARCHAR(100),
    capacity_units INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE warehouse_stock (
    warehouse_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    available_quantity INT NOT NULL,
    reserved_quantity INT DEFAULT 0,
    last_inventory_check TIMESTAMP,
    PRIMARY KEY (warehouse_id, product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE product_bundle_items (
    bundle_product_id BIGINT NOT NULL,
    component_product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (bundle_product_id, component_product_id),
    CONSTRAINT fk_bundle_product
        FOREIGN KEY (bundle_product_id)
        REFERENCES products(product_id),
    CONSTRAINT fk_component_product
        FOREIGN KEY (component_product_id)
        REFERENCES products(product_id)
);

CREATE TABLE warehouse_stock_audits (
    audit_id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    counted_quantity INT NOT NULL,
    counted_at TIMESTAMP NOT NULL,
    counted_by VARCHAR(255),
    CONSTRAINT fk_stock_audit_stock
        FOREIGN KEY (warehouse_id, product_id)
        REFERENCES warehouse_stock(warehouse_id, product_id)
);

CREATE TABLE "loyalty_accounts" (
    loyalty_account_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    program_code VARCHAR(50) NOT NULL,
    points_balance INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT "fk_loyalty_customer"
        FOREIGN KEY ("customer_id")
        REFERENCES "customers"("customer_id")
);

CREATE TABLE [customer_devices] (
    device_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    device_type VARCHAR(50),
    last_seen_at TIMESTAMP,
    FOREIGN KEY ([customer_id]) REFERENCES [customers]([customer_id])
);

CREATE TABLE marketing_events (
    event_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    campaign_code VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);

CREATE TABLE returns (
    return_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    return_reason VARCHAR(255),
    return_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_returns_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id),
    CONSTRAINT fk_returns_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(order_item_id)
);

CREATE TABLE shipment_packages (
    shipment_id BIGINT NOT NULL,
    package_number INT NOT NULL,
    package_weight_kg DECIMAL(10,3),
    package_status VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (shipment_id, package_number),
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id)
);

CREATE TABLE package_events (
    shipment_id BIGINT NOT NULL,
    package_number INT NOT NULL,
    event_sequence INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_time TIMESTAMP NOT NULL,
    event_location VARCHAR(255),
    PRIMARY KEY (shipment_id, package_number, event_sequence),
    CONSTRAINT fk_package_events_package
        FOREIGN KEY (shipment_id, package_number)
        REFERENCES shipment_packages(shipment_id, package_number)
);

CREATE TABLE external_tax_reports (
    report_id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    jurisdiction_code VARCHAR(50) NOT NULL,
    reported_amount DECIMAL(14,2) NOT NULL,
    reported_at TIMESTAMP,
    CONSTRAINT fk_external_tax_order
        FOREIGN KEY (order_id)
        REFERENCES analytics.orders(order_id)
);

CREATE TABLE inventory_reservations (
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    reserved_qty INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id),
    CONSTRAINT fk_reservation_stock FOREIGN KEY (product_id, warehouse_id)
        REFERENCES warehouse_stock(product_id, warehouse_id)
);