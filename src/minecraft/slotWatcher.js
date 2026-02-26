const db = require('../database/db')

function startSlotWatcher(discordClient) {

    const CANAL_ID = '1209783958741454912'
    const TU_ID = '421053729605943297'

    const DURACIONES = {
        2: 48,
        3: 24,
        4: 12,
        5: 4,
        6: 1
    }

    // Guardamos mensajes activos
    let avisos = {}

    setInterval(async () => {

        const canal = await discordClient.channels.fetch(CANAL_ID)
        const slots = db.prepare('SELECT * FROM slots').all()

        slots.forEach(async ({ id, timestamp }) => {

            const horas = DURACIONES[id]
            if (!horas) return

            const tiempoFinal = timestamp + (horas * 60 * 60 * 1000)
            const restante = tiempoFinal - Date.now()

            if (!avisos[id]) {
                avisos[id] = {
                    msg2: null,
                    msg1: null
                }
            }

            // 🟡 2 minutos
            if (restante <= 120000 && restante > 60000) {

                if (!avisos[id].msg2) {

                    avisos[id].msg2 = await canal.send(
                        `<@${TU_ID}> ⏳ Slot ${id} disponible en 2 minutos`
                    )
                }
            }

            // 🟠 1 minuto
            if (restante <= 60000 && restante > 0) {

                // borrar mensaje 2 min
                if (avisos[id].msg2) {
                    try { await avisos[id].msg2.delete() } catch {}
                    avisos[id].msg2 = null
                }

                if (!avisos[id].msg1) {

                    avisos[id].msg1 = await canal.send(
                        `<@${TU_ID}> ⚠️ Slot ${id} disponible en 1 minuto`
                    )
                }
            }

            // 🟢 Disponible
            if (restante <= 0) {

                if (avisos[id].msg2) {
                    try { await avisos[id].msg2.delete() } catch {}
                }

                if (avisos[id].msg1) {
                    try { await avisos[id].msg1.delete() } catch {}
                }

                delete avisos[id]

                db.prepare('DELETE FROM slots WHERE id = ?').run(id)
            }
        })

    }, 5000)
}

module.exports = startSlotWatcher