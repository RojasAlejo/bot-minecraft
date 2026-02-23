module.exports = (bot, discordClient) => {

    const db = require('../database/db')

    console.log('🧠 Módulo pwarp cargado (SQLite)')

    const TU_ID = '421053729605943297'
    const CANAL_ID = '1209783958741454912'
    const TIEMPO = 30000
    const SLOTS = [2, 3, 4, 5, 6]

    let anterior = {}
    let esperando = false

    bot.pwarpActivo = true
    bot.modoListo = false

    bot.once('spawn', () => {

        console.log('🚀 Loop pwarp iniciado (30s)')

        setInterval(() => {

            console.log('⏱️ Tick pwarp 30s')

            if (!bot.pwarpActivo) return
            if (!bot.modoListo) return
            if (esperando) return

            console.log('🔎 Buscando patrocinados...')
            esperando = true
            bot.chat('/pwarp')

            // reset de seguridad
            setTimeout(() => {
                if (esperando) {
                    console.log('⚠️ Reset forzado de estado esperando')
                    esperando = false
                }
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

            console.log('📋 Revisando slots')

            for (const i of SLOTS) {

                const item = window.slots[i]
                const actual = item ? "OCUPADO" : "VACIO"

                if (
                    (anterior[i] === undefined || anterior[i] === "VACIO") &&
                    actual === "OCUPADO"
                ) {

                    console.log(`🚨 Cambio detectado slot ${i}`)

                    const timestamp = Date.now()

                    // 🔥 Guardar en SQLite
                    db.prepare(`
                        INSERT INTO slots (id, timestamp)
                        VALUES (?, ?)
                        ON CONFLICT(id) DO UPDATE SET timestamp = excluded.timestamp
                    `).run(i.toString(), timestamp)

                    if (bot.actualizarHUD) bot.actualizarHUD()

                    try {
                        const canal = await discordClient.channels.fetch(CANAL_ID)
                        if (canal) {
                            canal.send(`<@${TU_ID}> 🚨 CAMBIO SLOT ${i}`)
                        }
                    } catch (err) {
                        console.log('❌ Error enviando alerta:', err.message)
                    }

                    const msg = `/msg irojas ${i} DISPONIBLE`
                    bot.chat(msg)
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