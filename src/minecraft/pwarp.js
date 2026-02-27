module.exports = (bot, discordClient) => {

    const db = require('../database/db')

    console.log('🧠 Módulo pwarp OPTIMIZADO cargado')

    const TU_ID = '421053729605943297'
    const CANAL_ID = '1209783958741454912'
    const INTERVALO = 30000
    const SLOTS = [2, 3, 4, 5, 6]

    let anterior = {}
    let procesando = false
    let ultimoMensaje = null
    let ultimoCambio = 0

    bot.pwarpActivo = true
    bot.modoListo = false

    // =========================
    // LOOP INTELIGENTE
    // =========================

    async function loopPwarp() {

        if (!bot.pwarpActivo || !bot.modoListo || procesando) {
            return setTimeout(loopPwarp, 5000)
        }

        procesando = true
        bot.chat('/pwarp')

        // Timeout de seguridad
        setTimeout(() => {
            procesando = false
        }, 10000)

        setTimeout(loopPwarp, INTERVALO)
    }

    bot.once('spawn', () => {
        console.log('🚀 Loop pwarp inteligente iniciado')
        setTimeout(loopPwarp, 5000)
    })

    // =========================
    // DETECCIÓN DE GUI
    // =========================

    bot.on('windowOpen', async (window) => {

        const title = window.title?.toString() || ''

        if (title.includes('Warps comunitarios') && !title.includes('(1/')) {

            setTimeout(() => {
                if (window.slots[13]) {
                    bot.clickWindow(13, 0, 0)
                } else {
                    procesando = false
                }
            }, 600)

            return
        }

        if (!title.includes('(1/')) return

        for (const i of SLOTS) {

            const item = window.slots[i]

            const actual = item
                ? `${item.name}|${item.displayName || ''}|${item.count}`
                : "VACIO"

            // Anti rebote (evita dobles triggers rápidos)
            if (Date.now() - ultimoCambio < 1500) continue

            if (anterior[i] !== undefined && anterior[i] !== actual) {

                ultimoCambio = Date.now()

                console.log(`🚨 Cambio real detectado slot ${i}`)

                const canal = await discordClient.channels.fetch(CANAL_ID)

                if (ultimoMensaje) {
                    try { await ultimoMensaje.delete() } catch { }
                }

                ultimoMensaje = await canal.send(
                    `<@${TU_ID}> 🚨 CAMBIO SLOT ${i}`
                )

                // Guardado eficiente
                if (item) {
                    db.prepare(`
                        INSERT INTO slots (id, timestamp)
                        VALUES (?, ?)
                        ON CONFLICT(id) DO UPDATE SET timestamp = excluded.timestamp
                    `).run(i.toString(), Date.now())
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
            procesando = false
        }, 1000)
    })
}