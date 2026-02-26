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
    const CANAL_STATS_ID = '1476705870187597914'

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

        // 🔥 Forzar slot manualmente
        if (message.content.startsWith('/forzar')) {

            const partes = message.content.split(' ')

            if (partes.length !== 3)
                return message.reply('Uso correcto: /forzar SLOT MINUTOS')

            const slot = partes[1]
            const minutos = parseInt(partes[2])

            if (isNaN(minutos))
                return message.reply('Los minutos deben ser un número')

            const db = require('../database/db')

            const timestamp = Date.now() - (minutos * 60 * 1000)

            db.prepare(`
                INSERT INTO slots (id, timestamp)
                VALUES (?, ?)
                ON CONFLICT(id) DO UPDATE SET timestamp = excluded.timestamp
            `).run(slot.toString(), timestamp)

            if (mcBot.actualizarHUD)
                mcBot.actualizarHUD()

            return message.reply(
                `✅ Slot ${slot} forzado como adquirido hace ${minutos} minutos`
            )
        }

        // 📊 Comando puntos del clan
        if (message.content === '!puntos') {

            if (message.channel.id !== CANAL_STATS_ID)
                return message.reply('❌ Este comando solo funciona en el canal de estadísticas.')

            const db = require('../database/db')

            const hoy = new Date().toISOString().split('T')[0]

            const ayerDate = new Date()
            ayerDate.setDate(ayerDate.getDate() - 1)
            const ayer = ayerDate.toISOString().split('T')[0]

            const hoyData = db.prepare(`
                SELECT type, SUM(amount) as total
                FROM clan_points
                WHERE date = ?
                GROUP BY type
            `).all(hoy)

            const ayerData = db.prepare(`
                SELECT type, SUM(amount) as total
                FROM clan_points
                WHERE date = ?
                GROUP BY type
            `).all(ayer)

            let ganadosHoy = 0
            let perdidosHoy = 0

            hoyData.forEach(row => {
                if (row.type === 'ganado') ganadosHoy = row.total
                if (row.type === 'perdido') perdidosHoy = row.total
            })

            let ganadosAyer = 0
            let perdidosAyer = 0

            ayerData.forEach(row => {
                if (row.type === 'ganado') ganadosAyer = row.total
                if (row.type === 'perdido') perdidosAyer = row.total
            })

            const totalHoy = ganadosHoy - perdidosHoy
            const totalAyer = ganadosAyer - perdidosAyer
            const diferencia = totalHoy - totalAyer

            return message.reply(
`📊 **PUNTOS DEL CLAN**

🟢 Hoy ganados: ${ganadosHoy}
🔴 Hoy perdidos: ${perdidosHoy}
📈 Neto hoy: ${totalHoy >= 0 ? '+' : ''}${totalHoy}

📅 Ayer neto: ${totalAyer >= 0 ? '+' : ''}${totalAyer}

📊 Diferencia: ${diferencia >= 0 ? '+' : ''}${diferencia}`
            )
        }

        // 🎮 Comandos manuales hacia Minecraft (permitidos)
        const comandosPermitidos = ['warp', 'spawn', 'home', 'msg']

        if (message.content.startsWith('!')) {

            const comando = message.content.slice(1)
            const base = comando.split(' ')[0]

            if (!comandosPermitidos.includes(base)) {
                return message.reply('❌ Comando no permitido para Minecraft.')
            }

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