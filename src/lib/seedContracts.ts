import { DataContract } from '@/types/odcs'
import { CURRENT_USER } from './currentUser'

const NOW = '2026-05-06T10:00:00.000Z'

const ME = { id: CURRENT_USER.id, name: CURRENT_USER.name, email: CURRENT_USER.email, invitedAt: NOW }

function col(physicalName: string, logicalName: string, physicalType: string, logicalType: any, required = false, isPrimaryKey = false): any {
  return {
    id: crypto.randomUUID(),
    physicalName, logicalName, physicalType, logicalType,
    required, isPrimaryKey, isPII: false, isUnique: false,
    description: '', examples: '', qualityRule: '', isUnknownType: false,
  }
}

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
    dataset: [
      {
        physicalName: 'orders',
        quantumName: 'orders',
        tableType: 'table',
        description: 'One row per customer order.',
        columns: [
          col('id', 'Order ID', 'uuid', 'string', true, true),
          col('customer_id', 'Customer ID', 'uuid', 'string', true),
          col('created_at', 'Created At', 'timestamp', 'timestamp', true),
          col('total_amount', 'Total Amount', 'decimal(10,2)', 'number', true),
          col('status', 'Status', 'varchar(20)', 'string', true),
          col('currency', 'Currency', 'char(3)', 'string', true),
        ],
        relationships: [],
      },
      {
        physicalName: 'order_items',
        quantumName: 'order_items',
        tableType: 'table',
        description: 'Line items belonging to an order.',
        columns: [
          col('id', 'Item ID', 'uuid', 'string', true, true),
          col('order_id', 'Order ID', 'uuid', 'string', true),
          col('product_id', 'Product ID', 'uuid', 'string', true),
          col('quantity', 'Quantity', 'integer', 'integer', true),
          col('unit_price', 'Unit Price', 'decimal(10,2)', 'number', true),
        ],
        relationships: [{ id: 'r1', toTable: 'orders', type: 'belongs_to', fromColumn: 'order_id' }],
      },
    ],
    stakeholders: [
      { id: 's1', name: 'Florent Simon', role: 'Data Owner', email: 'florentsimon@gmail.com', team: 'Platform' },
    ],
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
          info: { title: 'Customer Orders', version: '1.0.0', domain: 'Commerce', owner: 'Florent Simon', description: '', status: 'deprecated', tags: [] },
          dataset: [],
          stakeholders: [],
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
          info: { title: 'Customer Orders', version: '2.1.0', domain: 'Commerce', owner: 'Florent Simon', description: 'Tracks all customer orders and their line items across the platform.', status: 'active', tags: ['Commerce', 'Orders', 'Core'] },
          dataset: [],
          stakeholders: [],
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
    dataset: [
      {
        physicalName: 'products',
        quantumName: 'products',
        tableType: 'table',
        description: 'Core product definition.',
        columns: [
          col('id', 'Product ID', 'uuid', 'string', true, true),
          col('name', 'Name', 'varchar(255)', 'string', true),
          col('sku', 'SKU', 'varchar(100)', 'string', true),
          col('price', 'Price', 'decimal(10,2)', 'number', true),
          col('category', 'Category', 'varchar(100)', 'string', false),
          col('in_stock', 'In Stock', 'boolean', 'boolean', true),
        ],
        relationships: [],
      },
    ],
    stakeholders: [],
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
    dataset: [
      {
        physicalName: 'events',
        quantumName: 'events',
        tableType: 'table',
        description: 'Raw event stream.',
        columns: [
          col('id', 'Event ID', 'uuid', 'string', true, true),
          col('user_id', 'User ID', 'uuid', 'string', true),
          col('event_type', 'Event Type', 'varchar(100)', 'string', true),
          col('properties', 'Properties', 'jsonb', 'object', false),
          col('occurred_at', 'Occurred At', 'timestamp', 'timestamp', true),
        ],
        relationships: [],
      },
    ],
    stakeholders: [
      { id: 's2', name: 'Thomas Bernard', role: 'Data Owner', email: 'thomas.bernard@company.com', team: 'Analytics' },
    ],
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
          info: { title: 'User Analytics Events', version: '3.0.0', domain: 'Analytics', owner: 'Thomas Bernard', description: '', status: 'active', tags: ['Analytics', 'Events'] },
          dataset: [],
          stakeholders: [],
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
    dataset: [
      {
        physicalName: 'transactions',
        quantumName: 'transactions',
        tableType: 'table',
        description: 'One row per payment attempt.',
        columns: [
          col('id', 'Transaction ID', 'uuid', 'string', true, true),
          col('user_id', 'User ID', 'uuid', 'string', true),
          col('amount', 'Amount', 'decimal(12,2)', 'number', true),
          col('currency', 'Currency', 'char(3)', 'string', true),
          col('status', 'Status', 'varchar(20)', 'string', true),
          col('created_at', 'Created At', 'timestamp', 'timestamp', true),
        ],
        relationships: [],
      },
    ],
    stakeholders: [
      { id: 's3', name: 'Sophie Lebrun', role: 'Data Owner', email: 'sophie.lebrun@company.com', team: 'Finance' },
    ],
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
    dataset: [
      {
        physicalName: 'inventory',
        quantumName: 'inventory',
        tableType: 'table',
        description: 'Current stock levels per product per warehouse.',
        columns: [
          col('product_id', 'Product ID', 'uuid', 'string', true, true),
          col('warehouse_id', 'Warehouse ID', 'uuid', 'string', true),
          col('quantity', 'Quantity', 'integer', 'integer', true),
          col('reserved_qty', 'Reserved Quantity', 'integer', 'integer', true),
          col('updated_at', 'Updated At', 'timestamp', 'timestamp', true),
        ],
        relationships: [],
      },
    ],
    stakeholders: [
      { id: 's4', name: 'Alice Martin', role: 'Data Owner', email: 'alice.martin@company.com', team: 'Operations' },
    ],
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
          info: { title: 'Inventory Sync', version: '1.5.0', domain: 'Operations', owner: 'Alice Martin', description: '', status: 'active', tags: ['Inventory', 'Operations'] },
          dataset: [],
          stakeholders: [],
        },
      },
    ],
    openPR: null,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-20T16:00:00.000Z',
  },
]
