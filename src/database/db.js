const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Ruta del volumen en Railway
const volumePath = '/app/database'

// Crear carpeta si no existe (para local)
if (!fs.existsSync(volumePath)) {
  fs.mkdirSync(volumePath, { recursive: true })
}

const dbPath = path.join(volumePath, 'database.sqlite')
const db = new Database(dbPath)

db.prepare(`
  CREATE TABLE IF NOT EXISTS slots (
    id TEXT PRIMARY KEY,
    timestamp INTEGER
  )
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS clan_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    amount INTEGER,
    date TEXT
)
`).run()

module.exports = db