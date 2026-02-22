require('dotenv').config()

require('./src/minecraft/bot')
require('./src/discord/discordControl')

process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection:', reason)
})