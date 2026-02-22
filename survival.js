module.exports = (bot) => {

    bot.modoListo = false
    const SLOT_SURVIVAL = 12
    let entrando = false

    bot.on('spawn', () => {

        console.log('📍 Spawn detectado')
        bot.modoListo = false
        entrando = false

        setTimeout(() => {
            console.log('📂 Ejecutando /modalidades')
            bot.chat('/modalidades')
        }, 6000)
    })

    bot.on('windowOpen', (window) => {

        const title = window.title?.toString() || ''
        if (!title.includes('Modalidades')) return
        if (entrando) return

        entrando = true

        console.log('📋 Menú Modalidades detectado')

        setTimeout(() => {

            if (!window.slots[SLOT_SURVIVAL]) {
                console.log('❌ Slot Survival vacío')
                entrando = false
                return
            }

            try {
                if (window.slots[SLOT_SURVIVAL]) {
                    bot.clickWindow(SLOT_SURVIVAL, 0, 0)
                    console.log('🔥 Click Survival')
                } else {
                    console.log('❌ Slot Survival vacío al hacer click')
                    entrando = false
                    return
                }
            } catch (err) {
                console.log('❌ Error al hacer click Survival:', err.message)
                entrando = false
                return
            }

            // 🔥 Esperar 10 segundos y activar pwarp
            setTimeout(() => {
                bot.modoListo = true
                console.log('✅ Survival activado - pwarp habilitado')
            }, 10000)

        }, 1000)
    })

}