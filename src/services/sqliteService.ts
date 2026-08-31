import initSqlJs, { Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { FairScenario, SqlQueryResult, AssetRegisterItem, ThreatRegisterItem, ScenarioSnapshot } from '../types/fair';

let dbInstance: Database | null = null;
let isInitialized = false;

const DB_LOCAL_STORAGE_KEY = 'open_fair_sqlite_raw';
const FALLBACK_SCENARIOS_KEY = 'open_fair_scenarios_json';
const FALLBACK_SNAPSHOTS_KEY = 'open_fair_snapshots_json';
const FALLBACK_HISTORY_KEY = 'open_fair_sim_history_json';

/**
 * Initialize SQLite Database using sql.js WebAssembly
 */
export async function getSqliteDb(): Promise<Database | null> {
  if (dbInstance) return dbInstance;

  try {
    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl || '/sql-wasm.wasm'
    });

    // Check if we have saved raw SQLite binary in localStorage
    const savedBase64 = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
    if (savedBase64) {
      try {
        const binary = Uint8Array.from(atob(savedBase64), c => c.charCodeAt(0));
        dbInstance = new SQL.Database(binary);
      } catch (e) {
        console.warn('Failed to restore SQLite binary from localStorage, creating new DB', e);
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
    }

    createSchemaIfNotExist(dbInstance);
    isInitialized = true;
    return dbInstance;
  } catch (error) {
    console.warn('Wasm SQL init warning, using memory fallback:', error);
    try {
      const SQL = await initSqlJs({
        locateFile: () => '/sql-wasm.wasm'
      });
      dbInstance = new SQL.Database();
      createSchemaIfNotExist(dbInstance);
      isInitialized = true;
      return dbInstance;
    } catch (fallbackError) {
      console.warn('WASM SQLite disabled, using structured localStorage engine:', fallbackError);
      return null;
    }
  }
}

/**
 * Create Open FAIR Database Schema
 */
function createSchemaIfNotExist(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      asset TEXT,
      threat_community TEXT,
      threat_effect TEXT,
      status TEXT DEFAULT 'Draft',
      category TEXT,
      currency TEXT DEFAULT '$',
      unit_scale REAL DEFAULT 1,
      sim_count INTEGER DEFAULT 10000,
      json_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS simulation_history (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      trials INTEGER NOT NULL,
      ale_mean_cur REAL,
      ale_p90_cur REAL,
      ale_p95_cur REAL,
      ale_mean_prop REAL,
      ale_p90_prop REAL,
      ale_p95_prop REAL,
      risk_reduction_pct REAL,
      risk_rating TEXT,
      FOREIGN KEY(scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asset_register (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      estimated_value REAL,
      criticality TEXT,
      owner TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS threat_register (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      capability_level TEXT,
      motivation TEXT,
      typical_contact_freq TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_logs (
      id TEXT PRIMARY KEY,
      scenario_id TEXT,
      timestamp TEXT NOT NULL,
      prompt_type TEXT,
      model_used TEXT,
      prompt TEXT,
      response TEXT
    );

    CREATE TABLE IF NOT EXISTS scenario_snapshots (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      json_data TEXT NOT NULL,
      FOREIGN KEY(scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
    );
  `);
}

/**
 * Persist current SQLite state to localStorage
 */
export function persistDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, base64);
  } catch (err) {
    console.error('Failed to persist SQLite to localStorage:', err);
  }
}

/**
 * Save or Update a FAIR Scenario in SQLite
 */
export async function saveScenarioToSqlite(scenario: FairScenario): Promise<void> {
  const db = await getSqliteDb();
  const now = new Date().toISOString();
  const jsonData = JSON.stringify(scenario);

  if (db) {
    try {
      db.run(
        `INSERT OR REPLACE INTO scenarios (
          id, name, description, asset, threat_community, threat_effect,
          status, category, currency, unit_scale, sim_count, json_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scenario.id,
          scenario.name,
          scenario.description || '',
          scenario.asset || '',
          scenario.threatCommunity || '',
          scenario.threatEffect || 'Confidentiality',
          scenario.status || 'Draft',
          scenario.category || 'General',
          scenario.currency || '$',
          scenario.unitScale || 1,
          scenario.simulationsCount || 10000,
          jsonData,
          scenario.createdAt || now,
          now
        ]
      );
      persistDatabase();
    } catch (e) {
      console.warn('SQLite write failed, persisting to localStorage fallback', e);
    }
  }

  // Always update structured localStorage fallback
  try {
    const raw = localStorage.getItem(FALLBACK_SCENARIOS_KEY);
    const existing: FairScenario[] = raw ? JSON.parse(raw) : [];
    const idx = existing.findIndex(s => s.id === scenario.id);
    if (idx >= 0) {
      existing[idx] = scenario;
    } else {
      existing.unshift(scenario);
    }
    localStorage.setItem(FALLBACK_SCENARIOS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Fallback localStorage write error', err);
  }
}

/**
 * Load all scenarios from SQLite
 */
export async function loadScenariosFromSqlite(): Promise<FairScenario[]> {
  const db = await getSqliteDb();
  if (db) {
    try {
      const results = db.exec('SELECT json_data FROM scenarios ORDER BY updated_at DESC');
      if (results.length > 0 && results[0].values) {
        const scenarios: FairScenario[] = [];
        for (const row of results[0].values) {
          try {
            const scenario = JSON.parse(row[0] as string);
            scenarios.push(scenario);
          } catch (e) {
            console.error('Error parsing scenario JSON from SQLite:', e);
          }
        }
        if (scenarios.length > 0) return scenarios;
      }
    } catch (e) {
      console.warn('SQLite read failed, falling back to localStorage', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SCENARIOS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading fallback scenarios:', e);
  }

  return [];
}

/**
 * Delete a scenario from SQLite
 */
export async function deleteScenarioFromSqlite(scenarioId: string): Promise<void> {
  const db = await getSqliteDb();
  if (db) {
    try {
      db.run('DELETE FROM scenarios WHERE id = ?', [scenarioId]);
      db.run('DELETE FROM simulation_history WHERE scenario_id = ?', [scenarioId]);
      db.run('DELETE FROM scenario_snapshots WHERE scenario_id = ?', [scenarioId]);
      persistDatabase();
    } catch (e) {
      console.warn('SQLite delete error:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SCENARIOS_KEY);
    if (raw) {
      const existing: FairScenario[] = JSON.parse(raw);
      const filtered = existing.filter(s => s.id !== scenarioId);
      localStorage.setItem(FALLBACK_SCENARIOS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Fallback delete error:', e);
  }
}

/**
 * Save a new Scenario Snapshot (Version History)
 */
export async function saveScenarioSnapshot(scenario: FairScenario, note?: string): Promise<ScenarioSnapshot> {
  const db = await getSqliteDb();
  const id = 'snap_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  let maxV = 0;
  if (db) {
    try {
      const vRes = db.exec(`SELECT MAX(version_number) FROM scenario_snapshots WHERE scenario_id = '${scenario.id}'`);
      if (vRes.length > 0 && vRes[0].values.length > 0 && vRes[0].values[0][0] !== null) {
        maxV = Number(vRes[0].values[0][0]) || 0;
      }
    } catch (e) {
      console.warn('Error reading max version number from SQLite:', e);
    }
  }

  const nextVersion = maxV + 1;

  // Build summary for quick parameter diffing
  const tefMode = scenario.current.lef.useDirectTef
    ? scenario.current.lef.directTef.mode
    : scenario.current.lef.contactFrequency.mode * (scenario.current.lef.probabilityOfAction.mode / 100);

  const vulnModePct = scenario.current.lef.useDirectVuln
    ? (scenario.current.lef.directVuln.mode || 0) * 100
    : scenario.current.lef.threatCapability.mode > scenario.current.lef.resistanceStrength.mode ? 100 : 0;

  const summary = {
    tefMode,
    vulnModePct,
    primaryLossMode:
      scenario.current.primaryLoss.productivity.mode +
      scenario.current.primaryLoss.response.mode +
      scenario.current.primaryLoss.replacement.mode +
      scenario.current.primaryLoss.finesAndJudgements.mode +
      scenario.current.primaryLoss.competitiveAdvantage.mode +
      scenario.current.primaryLoss.reputation.mode,
    secondaryLossMode:
      scenario.current.secondaryLoss.productivity.mode +
      scenario.current.secondaryLoss.response.mode +
      scenario.current.secondaryLoss.replacement.mode +
      scenario.current.secondaryLoss.finesAndJudgements.mode +
      scenario.current.secondaryLoss.competitiveAdvantage.mode +
      scenario.current.secondaryLoss.reputation.mode,
    hasProposed: scenario.hasProposed,
    threatCapabilityMode: scenario.current.lef.threatCapability.mode,
    resistanceStrengthMode: scenario.current.lef.resistanceStrength.mode
  };

  const snapshot: ScenarioSnapshot = {
    id,
    scenarioId: scenario.id,
    versionNumber: nextVersion,
    note: note || `Snapshot before Monte Carlo run (${scenario.simulationsCount.toLocaleString()} trials)`,
    createdAt: now,
    simulationsCount: scenario.simulationsCount,
    currency: scenario.currency,
    unitScale: scenario.unitScale,
    summary,
    scenarioData: JSON.parse(JSON.stringify(scenario))
  };

  if (db) {
    try {
      db.run(
        `INSERT INTO scenario_snapshots (
          id, scenario_id, version_number, note, created_at, json_data
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          snapshot.id,
          snapshot.scenarioId,
          snapshot.versionNumber,
          snapshot.note || '',
          snapshot.createdAt,
          JSON.stringify(snapshot)
        ]
      );
      persistDatabase();
    } catch (e) {
      console.warn('Error saving snapshot to SQLite:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SNAPSHOTS_KEY);
    const existing: ScenarioSnapshot[] = raw ? JSON.parse(raw) : [];
    existing.unshift(snapshot);
    localStorage.setItem(FALLBACK_SNAPSHOTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving snapshot to fallback localStorage:', e);
  }

  return snapshot;
}

/**
 * Get all snapshots for a scenario, ordered newest first
 */
export async function getScenarioSnapshots(scenarioId: string): Promise<ScenarioSnapshot[]> {
  const db = await getSqliteDb();
  if (db) {
    try {
      const results = db.exec(
        `SELECT json_data FROM scenario_snapshots WHERE scenario_id = '${scenarioId}' ORDER BY version_number DESC`
      );

      if (results.length > 0 && results[0].values) {
        const snapshots: ScenarioSnapshot[] = [];
        for (const row of results[0].values) {
          try {
            const snap = JSON.parse(row[0] as string);
            snapshots.push(snap);
          } catch (e) {
            console.error('Failed to parse scenario snapshot:', e);
          }
        }
        return snapshots;
      }
    } catch (e) {
      console.warn('Error querying snapshots from SQLite:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SNAPSHOTS_KEY);
    if (raw) {
      const allSnaps: ScenarioSnapshot[] = JSON.parse(raw);
      return allSnaps.filter(s => s.scenarioId === scenarioId);
    }
  } catch (e) {
    console.error('Error loading fallback snapshots:', e);
  }

  return [];
}

/**
 * Delete a specific snapshot
 */
export async function deleteScenarioSnapshot(snapshotId: string): Promise<void> {
  const db = await getSqliteDb();
  if (db) {
    try {
      db.run('DELETE FROM scenario_snapshots WHERE id = ?', [snapshotId]);
      persistDatabase();
    } catch (e) {
      console.warn('Error deleting snapshot from SQLite:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SNAPSHOTS_KEY);
    if (raw) {
      const allSnaps: ScenarioSnapshot[] = JSON.parse(raw);
      localStorage.setItem(FALLBACK_SNAPSHOTS_KEY, JSON.stringify(allSnaps.filter(s => s.id !== snapshotId)));
    }
  } catch (e) {
    console.error('Error deleting fallback snapshot:', e);
  }
}

/**
 * Update note on a snapshot
 */
export async function updateScenarioSnapshotNote(snapshotId: string, note: string): Promise<void> {
  const db = await getSqliteDb();
  if (db) {
    try {
      const results = db.exec(`SELECT json_data FROM scenario_snapshots WHERE id = '${snapshotId}'`);
      if (results.length > 0 && results[0].values.length > 0) {
        const snap: ScenarioSnapshot = JSON.parse(results[0].values[0][0] as string);
        snap.note = note;
        db.run(`UPDATE scenario_snapshots SET note = ?, json_data = ? WHERE id = ?`, [
          note,
          JSON.stringify(snap),
          snapshotId
        ]);
        persistDatabase();
      }
    } catch (e) {
      console.warn('Failed to update snapshot note in SQLite:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_SNAPSHOTS_KEY);
    if (raw) {
      const allSnaps: ScenarioSnapshot[] = JSON.parse(raw);
      const snap = allSnaps.find(s => s.id === snapshotId);
      if (snap) {
        snap.note = note;
        localStorage.setItem(FALLBACK_SNAPSHOTS_KEY, JSON.stringify(allSnaps));
      }
    }
  } catch (e) {
    console.error('Error updating fallback snapshot note:', e);
  }
}

/**
 * Log a Simulation Run in SQLite History
 */
export async function logSimulationRun(
  scenarioId: string,
  trials: number,
  curMean: number,
  curP90: number,
  curP95: number,
  propMean?: number,
  propP90?: number,
  propP95?: number,
  reductionPct?: number,
  rating?: string
): Promise<void> {
  const db = await getSqliteDb();
  const id = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  if (db) {
    try {
      db.run(
        `INSERT INTO simulation_history (
          id, scenario_id, timestamp, trials, ale_mean_cur, ale_p90_cur, ale_p95_cur,
          ale_mean_prop, ale_p90_prop, ale_p95_prop, risk_reduction_pct, risk_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          scenarioId,
          now,
          trials,
          curMean,
          curP90,
          curP95,
          propMean ?? null,
          propP90 ?? null,
          propP95 ?? null,
          reductionPct ?? null,
          rating ?? 'M'
        ]
      );
      persistDatabase();
    } catch (e) {
      console.warn('Error logging simulation run in SQLite:', e);
    }
  }

  try {
    const raw = localStorage.getItem(FALLBACK_HISTORY_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift({
      id,
      scenarioId,
      timestamp: now,
      trials,
      curMean,
      curP90,
      curP95,
      propMean,
      propP90,
      propP95,
      reductionPct,
      rating
    });
    localStorage.setItem(FALLBACK_HISTORY_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error('Error logging simulation run to fallback storage:', e);
  }
}

/**
 * Log AI Interaction
 */
export async function logAiInteraction(
  scenarioId: string,
  promptType: string,
  modelUsed: string,
  prompt: string,
  response: string
): Promise<void> {
  const db = await getSqliteDb();
  const id = 'ai_' + Date.now();
  const now = new Date().toISOString();

  if (db) {
    try {
      db.run(
        `INSERT INTO ai_logs (id, scenario_id, timestamp, prompt_type, model_used, prompt, response)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, scenarioId, now, promptType, modelUsed, prompt, response]
      );
      persistDatabase();
    } catch (e) {
      console.warn('Error logging AI interaction in SQLite:', e);
    }
  }
}

/**
 * Execute Arbitrary SQL Query (for SQL console in UI)
 */
export async function executeSqlQuery(sql: string): Promise<SqlQueryResult> {
  const db = await getSqliteDb();
  const startTime = performance.now();

  try {
    const trimmed = sql.trim();
    if (!trimmed) {
      return { columns: [], values: [], rowCount: 0, executionTimeMs: 0 };
    }

    if (!db) {
      return {
        columns: ['Message'],
        values: [['In-Memory SQLite running in localStorage fallback mode. Raw query execution is available when WebAssembly is active.']],
        rowCount: 1,
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100
      };
    }

    const results = db.exec(trimmed);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (results.length === 0) {
      persistDatabase();
      return {
        columns: ['Status'],
        values: [['Query executed successfully. (0 rows returned)']],
        rowCount: 0,
        executionTimeMs
      };
    }

    const first = results[0];
    persistDatabase();
    return {
      columns: first.columns,
      values: first.values,
      rowCount: first.values.length,
      executionTimeMs
    };
  } catch (error: any) {
    return {
      columns: ['Error'],
      values: [[error.message || 'SQL Execution Error']],
      rowCount: 0,
      executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      error: error.message
    };
  }
}

/**
 * Export SQLite Binary File (.sqlite / .db)
 */
export async function exportSqliteBinaryFile(): Promise<Blob> {
  const db = await getSqliteDb();
  if (db) {
    const binary = db.export();
    return new Blob([binary], { type: 'application/x-sqlite3' });
  }
  // Fallback blob
  const raw = localStorage.getItem(FALLBACK_SCENARIOS_KEY) || '[]';
  return new Blob([raw], { type: 'application/json' });
}

/**
 * Import and replace database with an uploaded SQLite Binary File
 */
export async function importSqliteBinaryFile(fileBuffer: ArrayBuffer): Promise<boolean> {
  try {
    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl || '/sql-wasm.wasm'
    });

    const uint8 = new Uint8Array(fileBuffer);
    dbInstance = new SQL.Database(uint8);
    createSchemaIfNotExist(dbInstance);
    persistDatabase();
    return true;
  } catch (e) {
    console.error('Import error:', e);
    return false;
  }
}

/**
 * Export Table to CSV
 */
export async function exportTableToCsv(tableName: string): Promise<string> {
  const db = await getSqliteDb();
  if (!db) return '';
  try {
    const res = db.exec(`SELECT * FROM ${tableName}`);
    if (res.length === 0) return '';

    const columns = res[0].columns;
    const rows = res[0].values;

    let csv = columns.map(c => `"${c}"`).join(',') + '\n';
    for (const row of rows) {
      const line = row.map(val => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
      csv += line + '\n';
    }
    return csv;
  } catch (e) {
    console.warn('Error exporting table to CSV:', e);
    return '';
  }
}

/**
 * Seed initial Asset and Threat register items
 */
export async function seedRegistersIfEmpty(assets: AssetRegisterItem[], threats: ThreatRegisterItem[]): Promise<void> {
  const db = await getSqliteDb();
  if (!db) return;
  try {
    for (const a of assets) {
      db.run(
        `INSERT OR REPLACE INTO asset_register (id, name, category, estimated_value, criticality, owner, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.name, a.category, a.estimatedValue, a.criticality, a.owner, a.description]
      );
    }
    for (const t of threats) {
      db.run(
        `INSERT OR REPLACE INTO threat_register (id, name, category, capability_level, motivation, typical_contact_freq)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [t.id, t.name, t.category, t.capabilityLevel, t.motivation, t.typicalContactFrequency]
      );
    }
    persistDatabase();
  } catch (e) {
    console.warn('Error seeding registers:', e);
  }
}

/**
 * Reset and seed all 4 Industry benchmark scenarios (Bank, Trade, Retail, AI Company)
 */
export async function resetDatabaseToIndustryDefaults(
  scenarios: FairScenario[],
  assets: AssetRegisterItem[],
  threats: ThreatRegisterItem[]
): Promise<void> {
  const db = await getSqliteDb();
  for (const sc of scenarios) {
    await saveScenarioToSqlite(sc);
  }
  await seedRegistersIfEmpty(assets, threats);
  persistDatabase();
}

