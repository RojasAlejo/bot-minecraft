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

    client.on('messageCreate', (message) => {

        if (message.author.bot) return
        if (message.author.id !== TU_ID) return
        if (!message.content.startsWith('!')) return

        const comando = message.content.replace(/^!/, '')

        console.log('📩 Discord -> MC:', comando)

        mcBot.chat(comando)
        message.reply('✅ Comando enviado a Minecraft')
    })

    client.login(TOKEN)

    return client
}