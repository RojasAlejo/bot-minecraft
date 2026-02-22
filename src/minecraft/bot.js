const mineflayer = require('mineflayer')
const config = require('../../config')

function crearBot() {

    const bot = mineflayer.createBot(config)

    bot.modoListo = false

    // Cargar módulos
    require('./login')(bot)
    require('./survival')(bot)
    const discordClient = require('../discord/discordControl')(bot)
    require('./pwarp')(bot, discordClient)
    require('./hudPwarp')(bot, discordClient)
    require('../commands/comandos')(bot)

    bot.on('spawn', () => {
        console.log('✅ Bot conectado')
    })

    bot.on('error', err => {
        console.log('❌ Error:', err.message)
    })

    bot.on('end', () => {
        console.log('⚠️ Bot desconectado')
        console.log('🔁 Reintentando conexión en 10 segundos...')

        setTimeout(() => {
            crearBot()
        }, 10000)
    })
}

crearBot()