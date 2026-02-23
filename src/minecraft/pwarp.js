module.exports = (bot, discordClient) => {

    const db = require('../database/db')

    console.log('🧠 Módulo pwarp cargado')

    const TU_ID = '421053729605943297'
    const CANAL_ID = '1209783958741454912'
    const TIEMPO = 30000
    const SLOTS = [2, 3, 4, 5, 6]

    let anterior = {}
    let esperando = false
    let ultimoMensaje = null

    bot.pwarpActivo = true
    bot.modoListo = false

    bot.once('spawn', () => {

        console.log('🚀 Loop pwarp iniciado')

        setInterval(() => {

            if (!bot.pwarpActivo) return
            if (!bot.modoListo) return
            if (esperando) return

            esperando = true
            bot.chat('/pwarp')

            setTimeout(() => {
                if (esperando) esperando = false
            }, 8000)

        }, TIEMPO)
    })

    bot.on('windowOpen', async (window) => {

        const title = window.title?.toString() || ''

        if (title.includes('Warps comunitarios') && !title.includes('(1/')) {

            setTimeout(() => {
                if (window.slots[13]) {
                    bot.clickWindow(13, 0, 0)
                } else {
                    esperando = false
                }
            }, 600)

            return
        }

        if (title.includes('(1/')) {

            for (const i of SLOTS) {

                const item = window.slots[i]

                const actual = item
                    ? `${item.name}|${item.displayName || ''}|${item.count}`
                    : "VACIO"

                if (anterior[i] !== undefined && anterior[i] !== actual) {

                    console.log(`🚨 Cambio detectado slot ${i}`)

                    const canal = await discordClient.channels.fetch(CANAL_ID)

                    // borrar mensaje anterior
                    if (ultimoMensaje) {
                        try { await ultimoMensaje.delete() } catch { }
                    }

                    ultimoMensaje = await canal.send(
                        `<@${TU_ID}> 🚨 CAMBIO SLOT ${i}`
                    )

                    // si quedó ocupado guardamos tiempo
                    if (item) {
                        const timestamp = Date.now()

                        db.prepare(`
                            INSERT INTO slots (id, timestamp)
                            VALUES (?, ?)
                            ON CONFLICT(id) DO UPDATE SET timestamp = excluded.timestamp
                        `).run(i.toString(), timestamp)
                    } else {
                        db.prepare(`DELETE FROM slots WHERE id = ?`)
                            .run(i.toString())
                    }

                    if (bot.actualizarHUD) bot.actualizarHUD()
                }

                anterior[i] = actual
            }

            setTimeout(() => {
                bot.closeWindow(window)
                esperando = false
            }, 1200)
        }
    })
}