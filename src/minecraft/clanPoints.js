const db = require('../database/db')

function startClanPoints(bot) {

    db.prepare(`
        CREATE TABLE IF NOT EXISTS clan_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            amount INTEGER,
            date TEXT
        )
    `).run()

    bot.on('messagestr', (msg) => {

        const limpio = msg.replace(/§[0-9a-fk-or]/gi, '')

        if (limpio.includes('El clan ha recibido 2 puntos')) {
            guardarPuntos('ganado', 2)
        }

        if (limpio.includes('El clan ha perdido 2 puntos')) {
            guardarPuntos('perdido', 2)
        }
    })

    function guardarPuntos(tipo, cantidad) {

        const hoy = new Date().toISOString().split('T')[0]

        db.prepare(`
            INSERT INTO clan_points (type, amount, date)
            VALUES (?, ?, ?)
        `).run(tipo, cantidad, hoy)

        console.log(`📊 Punto registrado: ${tipo} ${cantidad}`)

        // Notificar al sistema de meta diaria
        bot.emit('clanPointsUpdate')
    }
}

module.exports = startClanPoints