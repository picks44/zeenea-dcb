import { describe, expect, it } from 'vitest'
import { parseDDLMulti } from '@/lib/ddlParser'

describe('ddlParser ODCS schema fields', () => {
  it('sets name, physicalType on table and TIME maps to logicalType time', () => {
    const sql = `
      CREATE TABLE events (
        id INT PRIMARY KEY,
        started_at TIME NOT NULL
      );
    `
    const tables = parseDDLMulti(sql)
    expect(tables).toHaveLength(1)
    const table = tables[0]
    expect(table.name).toBe('events')
    expect(table.physicalType).toBe('table')
    const timeCol = table.columns.find(c => c.physicalName === 'started_at')
    expect(timeCol?.name).toBe('started_at')
    expect(timeCol?.logicalType).toBe('time')
  })
})
