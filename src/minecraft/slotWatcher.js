const db = require('../database/db')

function startSlotWatcher(discordClient) {

    const CANAL_ID = '1209783958741454912'
    const DURACIONES = {
        2: 48,
        3: 24,
        4: 12,
        5: 4,
        6: 1
    }

    let avisado2 = {}
    let avisado1 = {}

    setInterval(async () => {

        const canal = await discordClient.channels.fetch(CANAL_ID)
        const slots = db.prepare('SELECT * FROM slots').all()

        slots.forEach(({ id, timestamp }) => {

            const horas = DURACIONES[id]
            const tiempoFinal = timestamp + (horas * 60 * 60 * 1000)
            const restante = tiempoFinal - Date.now()

            if (restante <= 120000 && restante > 60000 && !avisado2[id]) {
                avisado2[id] = true
                canal.send(`⏳ Slot ${id} disponible en 2 minutos`)
            }

            if (restante <= 60000 && restante > 0 && !avisado1[id]) {
                avisado1[id] = true
                canal.send(`⚠ Slot ${id} disponible en 1 minuto`)
            }

            if (restante <= 0) {
                db.prepare('DELETE FROM slots WHERE id = ?').run(id)
                avisado1[id] = false
                avisado2[id] = false
            }
        })

    }, 5000)
}

module.exports = startSlotWatcher