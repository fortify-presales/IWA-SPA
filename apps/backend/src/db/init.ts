import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/pharmacy.db');

function initDb() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Try several candidate locations for the SQL files so the init works
  // both in-source and after build (dist) or when run from project root.
  const schemaCandidates = [
    path.join(__dirname, 'schema.sql'),
    path.join(process.cwd(), 'apps', 'backend', 'src', 'db', 'schema.sql'),
    path.join(process.cwd(), 'apps', 'backend', 'dist', 'db', 'schema.sql'),
    path.join(process.cwd(), 'src', 'db', 'schema.sql'),
    path.join(process.cwd(), 'db', 'schema.sql'),
  ];

  const seedCandidates = schemaCandidates.map(p => p.replace('schema.sql', 'seed.sql'));

  const findExisting = (candidates: string[]) => candidates.find(p => fs.existsSync(p));

  const schemaPath = findExisting(schemaCandidates);
  const seedPath = findExisting(seedCandidates);

  if (!schemaPath) {
    throw new Error('schema.sql not found. Looked in: ' + JSON.stringify(schemaCandidates, null, 2));
  }
  if (!seedPath) {
    throw new Error('seed.sql not found. Looked in: ' + JSON.stringify(seedCandidates, null, 2));
  }

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seed = fs.readFileSync(seedPath, 'utf8');

  db.exec(schema);
  db.exec(seed);

  console.log('Database initialised at', DB_PATH);
  db.close();
}

if (require.main === module) {
  initDb();
}

export default initDb;
