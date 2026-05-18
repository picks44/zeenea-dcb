import { DataContract, SchemaTable } from '@/types/odcs'
import { CURRENT_USER } from './currentUser'

const NOW = '2026-05-06T10:00:00.000Z'

const ME = { id: CURRENT_USER.id, name: CURRENT_USER.name, email: CURRENT_USER.email, invitedAt: NOW }

function col(
  id: string,
  physicalName: string,
  logicalName: string,
  physicalType: string,
  logicalType: string,
  required = false,
  isPrimaryKey = false,
) {
  return {
    id,
    physicalName,
    logicalName,
    physicalType,
    logicalType,
    required,
    isPrimaryKey,
    isPII: false,
    isUnique: false,
    description: '',
    examples: '',
    qualityRule: '',
    isUnknownType: false,
  }
}

function cloneDataset(tables: SchemaTable[]): SchemaTable[] {
  return JSON.parse(JSON.stringify(tables))
}

// ─── Customer Orders schema (stable column ids for snapshots) ─────────────────

const CUSTOMER_ORDERS_ORDERS_TABLE: SchemaTable = {
  physicalName: 'orders',
  quantumName: 'orders',
  tableType: 'table',
  description: 'One row per customer order.',
  columns: [
    col('co-o-id', 'id', 'Order ID', 'uuid', 'string', true, true),
    col('co-o-cid', 'customer_id', 'Customer ID', 'uuid', 'string', true),
    col('co-o-ca', 'created_at', 'Created At', 'timestamp', 'timestamp', true),
    col('co-o-ta', 'total_amount', 'Total Amount', 'decimal(10,2)', 'number', true),
    col('co-o-st', 'status', 'Status', 'varchar(20)', 'string', true),
    col('co-o-cu', 'currency', 'Currency', 'char(3)', 'string', true),
  ],
  relationships: [],
}

const CUSTOMER_ORDERS_ORDER_ITEMS_TABLE: SchemaTable = {
  physicalName: 'order_items',
  quantumName: 'order_items',
  tableType: 'table',
  description: 'Line items belonging to an order.',
  columns: [
    col('co-i-id', 'id', 'Item ID', 'uuid', 'string', true, true),
    col('co-i-oid', 'order_id', 'Order ID', 'uuid', 'string', true),
    col('co-i-pid', 'product_id', 'Product ID', 'uuid', 'string', true),
    col('co-i-qty', 'quantity', 'Quantity', 'integer', 'integer', true),
    col('co-i-up', 'unit_price', 'Unit Price', 'decimal(10,2)', 'number', true),
  ],
  relationships: [{ id: 'r1', toTable: 'orders', type: 'belongs_to', fromColumn: 'order_id' }],
}

const CUSTOMER_ORDERS_V1_DATASET: SchemaTable[] = [cloneDataset([CUSTOMER_ORDERS_ORDERS_TABLE])[0]]
const CUSTOMER_ORDERS_V2_DATASET: SchemaTable[] = cloneDataset([
  CUSTOMER_ORDERS_ORDERS_TABLE,
  CUSTOMER_ORDERS_ORDER_ITEMS_TABLE,
])

const CUSTOMER_ORDERS_STAKEHOLDERS = [
  { id: 's1', name: 'Florent Simon', role: 'Data Owner', email: 'florentsimon@gmail.com', team: 'Platform' },
]

// ─── Other seed schemas ───────────────────────────────────────────────────────

const PRODUCT_CATALOG_DATASET: SchemaTable[] = [
  {
    physicalName: 'products',
    quantumName: 'products',
    tableType: 'table',
    description: 'Core product definition.',
    columns: [
      col('pc-id', 'id', 'Product ID', 'uuid', 'string', true, true),
      col('pc-name', 'name', 'Name', 'varchar(255)', 'string', true),
      col('pc-sku', 'sku', 'SKU', 'varchar(100)', 'string', true),
      col('pc-price', 'price', 'Price', 'decimal(10,2)', 'number', true),
      col('pc-cat', 'category', 'Category', 'varchar(100)', 'string', false),
      col('pc-stock', 'in_stock', 'In Stock', 'boolean', 'boolean', true),
    ],
    relationships: [],
  },
]

const ANALYTICS_EVENTS_DATASET: SchemaTable[] = [
  {
    physicalName: 'events',
    quantumName: 'events',
    tableType: 'table',
    description: 'Raw event stream.',
    columns: [
      col('ua-id', 'id', 'Event ID', 'uuid', 'string', true, true),
      col('ua-uid', 'user_id', 'User ID', 'uuid', 'string', true),
      col('ua-type', 'event_type', 'Event Type', 'varchar(100)', 'string', true),
      col('ua-props', 'properties', 'Properties', 'jsonb', 'object', false),
      col('ua-at', 'occurred_at', 'Occurred At', 'timestamp', 'timestamp', true),
    ],
    relationships: [],
  },
]

const PAYMENT_TRANSACTIONS_DATASET: SchemaTable[] = [
  {
    physicalName: 'transactions',
    quantumName: 'transactions',
    tableType: 'table',
    description: 'One row per payment attempt.',
    columns: [
      col('pt-id', 'id', 'Transaction ID', 'uuid', 'string', true, true),
      col('pt-uid', 'user_id', 'User ID', 'uuid', 'string', true),
      col('pt-amt', 'amount', 'Amount', 'decimal(12,2)', 'number', true),
      col('pt-cur', 'currency', 'Currency', 'char(3)', 'string', true),
      col('pt-st', 'status', 'Status', 'varchar(20)', 'string', true),
      col('pt-ca', 'created_at', 'Created At', 'timestamp', 'timestamp', true),
    ],
    relationships: [],
  },
]

const INVENTORY_DATASET: SchemaTable[] = [
  {
    physicalName: 'inventory',
    quantumName: 'inventory',
    tableType: 'table',
    description: 'Current stock levels per product per warehouse.',
    columns: [
      col('inv-pid', 'product_id', 'Product ID', 'uuid', 'string', true, true),
      col('inv-wid', 'warehouse_id', 'Warehouse ID', 'uuid', 'string', true),
      col('inv-qty', 'quantity', 'Quantity', 'integer', 'integer', true),
      col('inv-rq', 'reserved_qty', 'Reserved Quantity', 'integer', 'integer', true),
      col('inv-ua', 'updated_at', 'Updated At', 'timestamp', 'timestamp', true),
    ],
    relationships: [],
  },
]

export const SEED_CONTRACTS: DataContract[] = [
  {
    uid: 'seed-orders',
    dataContractSpecification: '3.1.0',
    id: 'customer-orders',
    info: {
      title: 'Customer Orders',
      version: '2.1.0',
      domain: 'Commerce',
      owner: 'Florent Simon',
      description: 'Tracks all customer orders and their line items across the platform.',
      status: 'active',
      tags: ['Commerce', 'Orders', 'Core'],
    },
    dataset: cloneDataset(CUSTOMER_ORDERS_V2_DATASET),
    stakeholders: [...CUSTOMER_ORDERS_STAKEHOLDERS],
    roles: [],
    slaProperties: [],
    collaborators: [
      { ...ME, role: 'owner' },
      { id: 'u1', name: 'Alice Martin', email: 'alice.martin@company.com', role: 'editor', invitedAt: NOW },
      { id: 'u2', name: 'Thomas Bernard', email: 'thomas.bernard@company.com', role: 'viewer', invitedAt: NOW },
    ],
    gitHistory: [
      {
        hash: 'abc123',
        message: 'Initial publish',
        timestamp: '2026-03-10T09:00:00.000Z',
        version: '1.0.0',
        contractStatus: 'deprecated',
        snapshot: {
          id: 'customer-orders',
          info: {
            title: 'Customer Orders',
            version: '1.0.0',
            domain: 'Commerce',
            owner: 'Florent Simon',
            description: '',
            status: 'deprecated',
            tags: [],
          },
          dataset: cloneDataset(CUSTOMER_ORDERS_V1_DATASET),
          stakeholders: [],
          roles: [],
          slaProperties: [],
        },
      },
      {
        hash: 'def456',
        message: 'Add order_items table',
        timestamp: '2026-04-15T14:30:00.000Z',
        version: '2.1.0',
        contractStatus: 'active',
        snapshot: {
          id: 'customer-orders',
          info: {
            title: 'Customer Orders',
            version: '2.1.0',
            domain: 'Commerce',
            owner: 'Florent Simon',
            description: 'Tracks all customer orders and their line items across the platform.',
            status: 'active',
            tags: ['Commerce', 'Orders', 'Core'],
          },
          dataset: cloneDataset(CUSTOMER_ORDERS_V2_DATASET),
          stakeholders: [...CUSTOMER_ORDERS_STAKEHOLDERS],
          roles: [],
          slaProperties: [],
        },
      },
    ],
    openPR: null,
    createdAt: '2026-03-10T09:00:00.000Z',
    updatedAt: '2026-04-15T14:30:00.000Z',
  },

  {
    uid: 'seed-catalog',
    dataContractSpecification: '3.1.0',
    id: 'product-catalog',
    info: {
      title: 'Product Catalog',
      version: '1.0.0',
      domain: 'Catalog',
      owner: 'Florent Simon',
      description: 'Master catalog of all products available in the platform.',
      status: 'draft',
      tags: ['Catalog', 'Products'],
    },
    dataset: cloneDataset(PRODUCT_CATALOG_DATASET),
    stakeholders: [],
    roles: [],
    slaProperties: [],
    collaborators: [
      { ...ME, role: 'owner' },
      { id: 'u3', name: 'Sophie Lebrun', email: 'sophie.lebrun@company.com', role: 'editor', invitedAt: NOW },
    ],
    gitHistory: [],
    openPR: null,
    createdAt: '2026-04-20T08:00:00.000Z',
    updatedAt: '2026-05-01T11:15:00.000Z',
  },

  {
    uid: 'seed-analytics',
    dataContractSpecification: '3.1.0',
    id: 'user-analytics-events',
    info: {
      title: 'User Analytics Events',
      version: '3.0.0',
      domain: 'Analytics',
      owner: 'Thomas Bernard',
      description: 'Behavioural events emitted by the front-end and ingested into the analytics warehouse.',
      status: 'active',
      tags: ['Analytics', 'Events', 'Tracking'],
    },
    dataset: cloneDataset(ANALYTICS_EVENTS_DATASET),
    stakeholders: [
      { id: 's2', name: 'Thomas Bernard', role: 'Data Owner', email: 'thomas.bernard@company.com', team: 'Analytics' },
    ],
    roles: [],
    slaProperties: [],
    collaborators: [
      { id: 'u2', name: 'Thomas Bernard', email: 'thomas.bernard@company.com', role: 'owner', invitedAt: NOW },
      { ...ME, role: 'editor' },
      { id: 'u1', name: 'Alice Martin', email: 'alice.martin@company.com', role: 'viewer', invitedAt: NOW },
    ],
    gitHistory: [
      {
        hash: 'ghi789',
        message: 'v3 schema refactor',
        timestamp: '2026-04-01T10:00:00.000Z',
        version: '3.0.0',
        contractStatus: 'active',
        snapshot: {
          id: 'user-analytics-events',
          info: {
            title: 'User Analytics Events',
            version: '3.0.0',
            domain: 'Analytics',
            owner: 'Thomas Bernard',
            description: 'Behavioural events emitted by the front-end and ingested into the analytics warehouse.',
            status: 'active',
            tags: ['Analytics', 'Events', 'Tracking'],
          },
          dataset: cloneDataset(ANALYTICS_EVENTS_DATASET),
          stakeholders: [
            { id: 's2', name: 'Thomas Bernard', role: 'Data Owner', email: 'thomas.bernard@company.com', team: 'Analytics' },
          ],
          roles: [],
          slaProperties: [],
        },
      },
    ],
    openPR: null,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
  },

  {
    uid: 'seed-payments',
    dataContractSpecification: '3.1.0',
    id: 'payment-transactions',
    info: {
      title: 'Payment Transactions',
      version: '1.2.0',
      domain: 'Finance',
      owner: 'Sophie Lebrun',
      description: 'All payment transactions processed through the platform payment gateway.',
      status: 'draft',
      tags: ['Finance', 'Payments', 'PCI'],
    },
    dataset: cloneDataset(PAYMENT_TRANSACTIONS_DATASET),
    stakeholders: [
      { id: 's3', name: 'Sophie Lebrun', role: 'Data Owner', email: 'sophie.lebrun@company.com', team: 'Finance' },
    ],
    roles: [],
    slaProperties: [],
    collaborators: [
      { id: 'u3', name: 'Sophie Lebrun', email: 'sophie.lebrun@company.com', role: 'owner', invitedAt: NOW },
      { ...ME, role: 'editor' },
    ],
    gitHistory: [],
    openPR: null,
    createdAt: '2026-04-28T14:00:00.000Z',
    updatedAt: '2026-05-04T09:30:00.000Z',
  },

  {
    uid: 'seed-inventory',
    dataContractSpecification: '3.1.0',
    id: 'inventory-sync',
    info: {
      title: 'Inventory Sync',
      version: '1.5.0',
      domain: 'Operations',
      owner: 'Alice Martin',
      description: 'Real-time inventory levels synced from the warehouse management system.',
      status: 'active',
      tags: ['Inventory', 'Operations', 'Warehouse'],
    },
    dataset: cloneDataset(INVENTORY_DATASET),
    stakeholders: [
      { id: 's4', name: 'Alice Martin', role: 'Data Owner', email: 'alice.martin@company.com', team: 'Operations' },
    ],
    roles: [],
    slaProperties: [],
    collaborators: [
      { id: 'u1', name: 'Alice Martin', email: 'alice.martin@company.com', role: 'owner', invitedAt: NOW },
      { id: 'u2', name: 'Thomas Bernard', email: 'thomas.bernard@company.com', role: 'editor', invitedAt: NOW },
      { ...ME, role: 'viewer' },
    ],
    gitHistory: [
      {
        hash: 'jkl012',
        message: 'Add reserved_qty column',
        timestamp: '2026-03-20T16:00:00.000Z',
        version: '1.5.0',
        contractStatus: 'active',
        snapshot: {
          id: 'inventory-sync',
          info: {
            title: 'Inventory Sync',
            version: '1.5.0',
            domain: 'Operations',
            owner: 'Alice Martin',
            description: 'Real-time inventory levels synced from the warehouse management system.',
            status: 'active',
            tags: ['Inventory', 'Operations', 'Warehouse'],
          },
          dataset: cloneDataset(INVENTORY_DATASET),
          stakeholders: [
            { id: 's4', name: 'Alice Martin', role: 'Data Owner', email: 'alice.martin@company.com', team: 'Operations' },
          ],
          roles: [],
          slaProperties: [],
        },
      },
    ],
    openPR: null,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-20T16:00:00.000Z',
  },
]
