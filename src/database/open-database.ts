import {Database} from 'bun:sqlite';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

/** The tracker keeps everything in one SQLite file; `:memory:` gives tests a fresh database. */
export function openDatabase(path: string): Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), {recursive: true});
  }
  const database = new Database(path, {strict: true, create: true});
  database.run('PRAGMA journal_mode = WAL');
  database.run('PRAGMA foreign_keys = ON');
  database.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      key TEXT PRIMARY KEY,
      number INTEGER NOT NULL UNIQUE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      rank INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`);
  database.run(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_key TEXT NOT NULL REFERENCES tickets(key) ON DELETE CASCADE,
      actor TEXT NOT NULL,
      kind TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT,
      comment TEXT,
      at TEXT NOT NULL
    )`);
  return database;
}
