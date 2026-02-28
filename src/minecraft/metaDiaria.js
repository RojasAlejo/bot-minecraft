const db = require('../database/db')
const { EmbedBuilder } = require('discord.js')

module.exports = (bot, discordClient) => {

    const CANAL_RACHA_ID = '1476739358743593000'
    const ZONA = 'Europe/Madrid'
    const META_DIARIA = 300

    // =============================
    // 🗄 CREAR TABLA
    // =============================

    db.prepare(`
        CREATE TABLE IF NOT EXISTS clan_streak (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            streak INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            last_checked TEXT,
            message_id TEXT,
            meta_alcanzada_hoy INTEGER DEFAULT 0
        )
    `).run()

    try {
        db.prepare(`ALTER TABLE clan_streak ADD COLUMN best_streak INTEGER DEFAULT 0`).run()
    } catch {}

    try {
        db.prepare(`ALTER TABLE clan_streak ADD COLUMN meta_alcanzada_hoy INTEGER DEFAULT 0`).run()
    } catch {}

    const row = db.prepare(`SELECT * FROM clan_streak WHERE id = 1`).get()
    if (!row) {
        db.prepare(`
            INSERT INTO clan_streak (id, streak, best_streak, last_checked, message_id, meta_alcanzada_hoy)
            VALUES (1, 0, 0, NULL, NULL, 0)
        `).run()
    }

    // =============================
    // 🔁 EVENTOS
    // =============================

    bot.on('clanPointsUpdate', async () => {
        await actualizarMeta()
    })

    setTimeout(() => {
        actualizarMeta()
    }, 5000)

    // =============================
    // 📊 ACTUALIZAR META
    // =============================

    async function actualizarMeta() {

        const hoy = obtenerFechaEspaña(0)
        const ayer = obtenerFechaEspaña(1)

        const netoHoy = obtenerNeto(hoy)
        const netoAyer = obtenerNeto(ayer)

        const progreso = Math.max(0, Math.min(100, Math.floor((netoHoy / META_DIARIA) * 100)))
        const faltan = META_DIARIA - netoHoy

        await verificarMetaEnVivo(netoHoy)
        await manejarCambioDeDia()
        await actualizarEmbed(netoHoy, netoAyer, progreso, faltan)
    }

    // =============================
    // 🎯 META EN VIVO (cuando llegan a 300)
    // =============================

    async function verificarMetaEnVivo(netoHoy) {

        const data = db.prepare(`SELECT * FROM clan_streak WHERE id = 1`).get()

        if (netoHoy >= META_DIARIA && !data.meta_alcanzada_hoy) {

            const canal = await discordClient.channels.fetch(CANAL_RACHA_ID)
            if (canal) {
                canal.send(`🎉🔥 **META DIARIA ALCANZADA (${META_DIARIA} puntos)** 🔥🎉`)
            }

            db.prepare(`
                UPDATE clan_streak
                SET meta_alcanzada_hoy = 1
                WHERE id = 1
            `).run()
        }
    }

    // =============================
    // 🌙 CAMBIO DE DÍA (00:00 España)
    // =============================

    async function manejarCambioDeDia() {

        const hoy = obtenerFechaEspaña(0)
        const ayer = obtenerFechaEspaña(1)

        const data = db.prepare(`SELECT * FROM clan_streak WHERE id = 1`).get()

        if (data.last_checked === hoy) return

        const netoAyer = obtenerNeto(ayer)

        let nuevaRacha = 0
        let mejorRacha = data.best_streak || 0

        if (netoAyer >= META_DIARIA) {
            nuevaRacha = data.streak + 1
            if (nuevaRacha > mejorRacha) {
                mejorRacha = nuevaRacha
            }
        } else {
            nuevaRacha = 0
        }

        db.prepare(`
            UPDATE clan_streak
            SET streak = ?, best_streak = ?, last_checked = ?, meta_alcanzada_hoy = 0
            WHERE id = 1
        `).run(nuevaRacha, mejorRacha, hoy)

        if (data.streak !== nuevaRacha) {
            anunciarCambioRacha(nuevaRacha)
        }
    }

    async function anunciarCambioRacha(streak) {

        const canal = await discordClient.channels.fetch(CANAL_RACHA_ID)
        if (!canal) return

        if (streak === 0) {
            canal.send('❄️ **Racha reiniciada.**')
        } else {
            canal.send(`🔥 **Racha aumentada a ${streak} días.**`)
        }
    }

    // =============================
    // 🖼 EMBED
    // =============================

    async function actualizarEmbed(netoHoy, netoAyer, progreso, faltan) {

        const canal = await discordClient.channels.fetch(CANAL_RACHA_ID)
        if (!canal) return

        const data = db.prepare(`SELECT * FROM clan_streak WHERE id = 1`).get()

        const barra = generarBarra(progreso)

        const color =
            netoHoy >= META_DIARIA ? 0x00ff00 :
            progreso >= 70 ? 0xffcc00 :
            0xff0000

        const embed = new EmbedBuilder()
            .setTitle('🏆 META DIARIA — CLAN')
            .setColor(color)
            .setDescription(
                `🔥 **Racha actual:** ${data.streak} días\n` +
                `🏆 **Mejor racha:** ${data.best_streak || 0} días\n\n` +
                `🎯 **Meta diaria:** ${META_DIARIA}\n` +
                `📈 **Hoy:** ${formatear(netoHoy)}\n\n` +
                `📊 Progreso: ${progreso}%\n` +
                `🎯 Faltan: ${faltan > 0 ? '+' + faltan : 'META SUPERADA'}\n\n` +
                `${barra}\n\n` +
                `Actualizado • ${horaEspaña()}`
            )

        if (data.message_id) {
            try {
                const msg = await canal.messages.fetch(data.message_id)
                await msg.edit({ embeds: [embed] })
                return
            } catch {}
        }

        const nuevo = await canal.send({ embeds: [embed] })

        db.prepare(`
            UPDATE clan_streak
            SET message_id = ?
            WHERE id = 1
        `).run(nuevo.id)
    }

    // =============================
    // 🧰 UTILIDADES
    // =============================

    function obtenerNeto(fecha) {
        const data = db.prepare(`
            SELECT type, SUM(amount) as total
            FROM clan_points
            WHERE date = ?
            GROUP BY type
        `).all(fecha)

        let ganados = 0
        let perdidos = 0

        data.forEach(r => {
            if (r.type === 'ganado') ganados = r.total
            if (r.type === 'perdido') perdidos = r.total
        })

        return ganados - perdidos
    }

    function obtenerFechaEspaña(restarDias = 0) {
        const now = new Date()
        const madrid = new Date(now.toLocaleString('en-US', { timeZone: ZONA }))
        madrid.setDate(madrid.getDate() - restarDias)
        return madrid.toISOString().split('T')[0]
    }

    function generarBarra(porcentaje) {
        const total = 20
        const llenos = Math.round((porcentaje / 100) * total)
        const vacios = total - llenos
        return '█'.repeat(llenos) + '░'.repeat(vacios) + ` ${porcentaje}%`
    }

    function formatear(n) {
        return n >= 0 ? `+${n}` : `${n}`
    }

    function horaEspaña() {
        return new Date().toLocaleTimeString('es-ES', {
            timeZone: ZONA,
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}