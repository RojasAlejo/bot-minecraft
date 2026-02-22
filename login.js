module.exports = (bot) => {

    let logueado = false

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString()

        if (msg.toLowerCase().includes('/login') && !logueado) {
            setTimeout(() => {
                bot.chat(`/login ${process.env.MC_PASS}`)
                logueado = true
                console.log('🔐 Login enviado')
            }, 2000)
        }
    })
}