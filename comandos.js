// comandos.js
module.exports = (bot) => {

    const autorizados = ['irojas']

    bot.on('messagestr', (raw) => {

        const msg = raw.replace(/§[0-9a-fk-or]/gi, '').trim()
        if (!msg.includes('MENSAJE')) return

        const match = msg.match(/De (\w+)/)
        if (!match) return

        const contenido = match[1] // ej: iRojaspwarp

        let remitente = null
        for (const user of autorizados) {
            if (contenido.toLowerCase().startsWith(user)) {
                remitente = user
                break
            }
        }

        if (!remitente) {
            console.log(`⛔ Intento no autorizado: ${contenido}`)
            return
        }

        const comando = contenido
            .slice(remitente.length)
            .toLowerCase()

        console.log('👤 Remitente:', remitente)
        console.log('📨 Comando:', comando)

        // 🔥 VENI
        if (comando === 'veni') {
            bot.chat('/tpa iRojas')
            console.log('🚀 Ejecutando /tpa iRojas')
            return
        }

        // 🏠 SPAWN
        if (comando === 'spawn') {
            bot.chat('/spawn')
            console.log('🏠 Ejecutando /spawn')
            return
        }

        // 🎯 PWARP TOGGLE
        if (comando === 'pwarp') {

            bot.pwarpActivo = !bot.pwarpActivo

            bot.pwarpEstado.activo = bot.pwarpActivo

            const fs = require('fs')
            try {
                fs.writeFileSync(
                    './estadoPwarp.json',
                    JSON.stringify(bot.pwarpEstado, null, 2)
                )
                console.log('💾 Estado guardado (toggle)')
            } catch (err) {
                console.log('❌ Error guardando estado:', err.message)
            }

            console.log(
                bot.pwarpActivo
                    ? '🟢 Pwarp ACTIVADO'
                    : '🔴 Pwarp DESACTIVADO'
            )

            bot.chat(
                bot.pwarpActivo
                    ? '/msg irojas Pwarp ACTIVADO'
                    : '/msg irojas Pwarp DESACTIVADO'
            )

            // Actualizar HUD si existe
            if (bot.actualizarHUD) bot.actualizarHUD()

            return
        }
    })
}