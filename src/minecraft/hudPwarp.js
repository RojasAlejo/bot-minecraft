const { EmbedBuilder } = require('discord.js')
const db = require('../../database/db')

module.exports = (bot, discordClient) => {

    const CANAL_HUD_ID = '1209783958741454912'

    let mensajeHUD = null

    const DURACIONES = {
        2: 48,
        3: 24,
        4: 12,
        5: 4,
        6: 1
    }

    function tiempoRestante(slot) {

        const row = db.prepare(
            'SELECT timestamp FROM slots WHERE id = ?'
        ).get(slot.toString())

        if (!row) return 'Sin datos'

        const ultima = row.timestamp
        const horasTotales = DURACIONES[slot]
        const msTotal = horasTotales * 60 * 60 * 1000
        const restante = msTotal - (Date.now() - ultima)

        if (restante <= 0) return 'Expirado'

        const horas = Math.floor(restante / 3600000)
        const minutos = Math.floor((restante % 3600000) / 60000)

        return `${horas}h ${minutos}m`
    }

    async function actualizarHUD() {

        let canal
        try {
            canal = await discordClient.channels.fetch(CANAL_HUD_ID)
            if (!canal) return
        } catch (err) {
            return
        }

        const embed = new EmbedBuilder()
            .setTitle('📡 PANEL PWARP')
            .setColor(0x00ff88)
            .setDescription('🟢 **ACTIVO**')
            .addFields(
                { name: 'Slot 2 (48h)', value: tiempoRestante(2), inline: true },
                { name: 'Slot 3 (24h)', value: tiempoRestante(3), inline: true },
                { name: 'Slot 4 (12h)', value: tiempoRestante(4), inline: true },
                { name: 'Slot 5 (4h)', value: tiempoRestante(5), inline: true },
                { name: 'Slot 6 (1h)', value: tiempoRestante(6), inline: true }
            )
            .setFooter({ text: 'Actualización automática cada 1 min' })
            .setTimestamp()

        if (!mensajeHUD) {

            const mensajes = await canal.messages.fetch({ limit: 10 })
            const ultimoHUD = mensajes.find(
                m =>
                    m.author.id === discordClient.user.id &&
                    m.embeds.length > 0 &&
                    m.embeds[0].title === '📡 PANEL PWARP'
            )

            if (ultimoHUD) {
                mensajeHUD = ultimoHUD
                await mensajeHUD.edit({ embeds: [embed] })
            } else {
                mensajeHUD = await canal.send({ embeds: [embed] })
            }

        } else {
            await mensajeHUD.edit({ embeds: [embed] })
        }
    }

    setInterval(actualizarHUD, 60000)

    bot.actualizarHUD = actualizarHUD

    setTimeout(actualizarHUD, 5000)
}