const fs = require('fs')
const path = require('path')

const estadoPath = path.join(__dirname, '../../estadoPwarp.json')

let notified2min = {}
let notified1min = {}

function startSlotWatcher(discordClient) {
    setInterval(() => {
        try {
            const data = JSON.parse(fs.readFileSync(estadoPath, 'utf8'))

            if (!data.activo) return

            Object.entries(data.slots).forEach(([slot, timestamp]) => {
                if (!timestamp) return

                const restante = timestamp - Date.now()

                if (restante <= 120000 && restante > 60000 && !notified2min[slot]) {
                    notified2min[slot] = true
                    discordClient.channels.cache.first()?.send(`⏳ Slot ${slot} disponible en 2 minutos`)
                }

                if (restante <= 60000 && restante > 0 && !notified1min[slot]) {
                    notified1min[slot] = true
                    discordClient.channels.cache.first()?.send(`⚠ Slot ${slot} disponible en 1 minuto`)
                }

                if (restante <= 0) {
                    notified1min[slot] = false
                    notified2min[slot] = false
                }
            })

        } catch (err) {
            console.error('SlotWatcher error:', err)
        }
    }, 5000)
}

module.exports = startSlotWatcher