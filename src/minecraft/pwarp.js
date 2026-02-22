module.exports = (bot, discordClient) => {

    const fs = require('fs')
    const ESTADO_FILE = './estadoPwarp.json'

    let estadoInicial = {
        activo: true,
        slots: {
            2: null,
            3: null,
            4: null,
            5: null,
            6: null
        }
    }

    // 🔄 Cargar estado si existe
    if (fs.existsSync(ESTADO_FILE)) {
        try {
            const data = fs.readFileSync(ESTADO_FILE)
            estadoInicial = JSON.parse(data)
            console.log('📂 Estado pwarp cargado desde archivo')
        } catch (err) {
            console.log('❌ Error leyendo estado guardado:', err.message)
        }
    }

    bot.pwarpEstado = estadoInicial

    bot.pwarpActivo = bot.pwarpEstado.activo
    bot.modoListo = false

    console.log('🧠 Módulo pwarp cargado')

    const TU_ID = '421053729605943297'
    const CANAL_ID = '1209783958741454912'
    const TIEMPO = 30000
    const SLOTS = [2, 3, 4, 5, 6]

    let anterior = {}
    let esperando = false

    bot.once('spawn', () => {

        console.log('🚀 Loop pwarp iniciado (30s)')

        function loopPwarp() {

            console.log('⏱️ Tick pwarp 30s')

            if (!bot.pwarpActivo) {
                console.log('⛔ Pwarp desactivado')
                return setTimeout(loopPwarp, TIEMPO)
            }

            if (!bot.modoListo) {
                console.log('⛔ Survival aún no listo')
                return setTimeout(loopPwarp, TIEMPO)
            }

            if (esperando) {
                console.log('⏳ Esperando cierre menú')
                return setTimeout(loopPwarp, TIEMPO)
            }

            console.log('🔎 Buscando patrocinados...')
            esperando = true
            bot.chat('/pwarp')

            // 🔎 Si el menú no abre en 3s, reintentar rápido
            setTimeout(() => {
                if (esperando) {
                    console.log('⚠️ Menú no abrió, reintentando...')
                    esperando = false
                    return loopPwarp()
                }
            }, 3000)

            // 🔥 Timeout seguridad absoluto
            setTimeout(() => {
                if (esperando) {
                    console.log('⚠️ Timeout seguridad activado - reseteando estado')
                    esperando = false
                }
            }, 10000)

            setTimeout(loopPwarp, TIEMPO)
        }

        loopPwarp()
    })

    bot.on('windowOpen', async (window) => {

        const title = window.title?.toString() || ''

        if (title.includes('Warps comunitarios') && !title.includes('(1/')) {

            setTimeout(() => {
                try {
                    if (window.slots[13]) {
                        bot.clickWindow(13, 0, 0)
                        console.log('📖 Click libro')
                    } else {
                        console.log('⚠️ Slot libro vacío')
                        esperando = false
                    }
                } catch (err) {
                    console.log('❌ Error al hacer click libro:', err.message)
                    esperando = false
                }
            }, 600)

            return
        }

        if (title.includes('(1/')) {

            console.log('📋 Revisando slots')

            for (const i of SLOTS) {

                const item = window.slots[i]
                const actual = item
                    ? `${item.name}|${item.displayName || ''}|${item.count}`
                    : "VACIO"

                if (anterior[i] !== undefined && anterior[i] !== actual) {

                    console.log(`🚨 Cambio detectado slot ${i}`)
                    bot.pwarpEstado.slots[i] = Date.now()
                    if (bot.actualizarHUD) bot.actualizarHUD()

                    // 💾 Guardar estado en archivo
                    try {
                        fs.writeFileSync(
                            ESTADO_FILE,
                            JSON.stringify(bot.pwarpEstado, null, 2)
                        )
                        console.log('💾 Estado guardado')
                    } catch (err) {
                        console.log('❌ Error guardando estado:', err.message)
                    }

                    let canal
                    try {
                        canal = await discordClient.channels.fetch(CANAL_ID)
                        if (canal) {
                            canal.send(`<@${TU_ID}> 🚨 CAMBIO SLOT ${i}`)
                        }
                    } catch (err) {
                        console.log('❌ Error enviando alerta a Discord:', err.message)
                    }

                    const msg = `/msg irojas ${i} DISPONIBLE`

                    bot.chat(msg)
                    setTimeout(() => bot.chat(msg), 800)
                    setTimeout(() => bot.chat(msg), 1600)
                }

                anterior[i] = actual
            }

            setTimeout(() => {
                bot.closeWindow(window)
                esperando = false
                console.log('❌ Menú cerrado')
            }, 1200)
        }
    })
}