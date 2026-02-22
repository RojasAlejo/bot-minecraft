const db = require('../../database/db')

let notified2min = {}
let notified1min = {}

function startSlotWatcher(discordClient) {

    setInterval(() => {
        try {

            const slots = db.prepare('SELECT * FROM slots').all()

            slots.forEach(({ id, timestamp }) => {

                const restante = timestamp - Date.now()

                // Aviso 2 minutos
                if (restante <= 120000 && restante > 60000 && !notified2min[id]) {
                    notified2min[id] = true

                    discordClient.channels.cache.first()?.send(
                        `⏳ Slot ${id} disponible en 2 minutos`
                    )
                }

                // Aviso 1 minuto
                if (restante <= 60000 && restante > 0 && !notified1min[id]) {
                    notified1min[id] = true

                    discordClient.channels.cache.first()?.send(
                        `⚠ Slot ${id} disponible en 1 minuto`
                    )
                }

                // Cuando termina el tiempo
                if (restante <= 0) {
                    db.prepare('DELETE FROM slots WHERE id = ?').run(id)

                    notified1min[id] = false
                    notified2min[id] = false
                }

            })

        } catch (err) {
            console.error('SlotWatcher error:', err)
        }

    }, 5000)

}

module.exports = startSlotWatcher