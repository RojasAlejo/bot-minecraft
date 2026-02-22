const mineflayer = require('mineflayer')
const config = require('../../config')
const logger = require('../utils/logger')

let currentBot = null

function crearBot() {

    const bot = mineflayer.createBot(config)
    currentBot = bot

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
        console.log('Bot desconectado')

        if (currentBot) {
            try {
                currentBot.removeAllListeners()
            } catch (e) { }
        }

        setTimeout(() => {
            console.log('Reiniciando instancia limpia...')
            crearBot()
        }, 10000)
    })
}

crearBot()