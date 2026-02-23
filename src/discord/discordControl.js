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

    client.on('messageCreate', async (message) => {

        if (message.author.bot) return
        if (message.author.id !== TU_ID) return

        // 🔥 Control remoto prender/apagar
        if (message.content === '/apagar') {

            mcBot.pwarpActivo = false

            if (mcBot.currentWindow) {
                try { mcBot.closeWindow(mcBot.currentWindow) } catch { }
            }

            return message.reply('🛑 Pwarp APAGADO')
        }

        if (message.content === '/prender') {

            mcBot.pwarpActivo = true
            return message.reply('🟢 Pwarp ENCENDIDO')
        }

        // 🎮 Comandos manuales hacia Minecraft con !
        if (message.content.startsWith('!')) {

            const comando = message.content.slice(1)

            console.log('📩 Discord -> MC:', comando)

            mcBot.chat(comando)

            return message.reply('✅ Comando enviado a Minecraft')
        }

    })

    client.login(TOKEN)
        .catch(err => {
            console.error('❌ Error al loguear Discord:', err)
        })

    return client
}