const { Client, GatewayIntentBits } = require('discord.js')

module.exports = (mcBot) => {

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    })

    const TOKEN = process.env.DISCORD_TOKEN
    const TU_ID = '421053729605943297'

    client.once('clientReady', () => {
        console.log('🤖 Bot Discord conectado')
    })

    client.on('error', (err) => {
        console.error('💥 Discord error:', err)
    })

    client.on('shardError', (err) => {
        console.error('💥 Shard error:', err)
    })

    client.on('messageCreate', (message) => {

        if (message.author.bot) return
        if (message.author.id !== TU_ID) return
        if (!message.content.startsWith('!')) return

        const comando = message.content.replace(/^!/, '')

        console.log('📩 Discord -> MC:', comando)

        mcBot.chat(comando)
        message.reply('✅ Comando enviado a Minecraft')
    })

    discordClient.on('messageCreate', async (message) => {

        if (message.author.bot) return

        // SOLO TU ID puede usarlo
        if (message.author.id !== '421053729605943297') return

        if (message.content === '/apagar') {

            bot.closeWindow(bot.currentWindow)
            bot.pwarpActivo = false
            message.reply('🛑 Bot pwarp APAGADO')

        }

        if (message.content === '/prender') {

            bot.pwarpActivo = true
            message.reply('🟢 Bot pwarp ENCENDIDO')

        }

    })

    client.login(TOKEN)
        .catch(err => {
            console.error('❌ Error al loguear Discord:', err)
        })

    return client
}