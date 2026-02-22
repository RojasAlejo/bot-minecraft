const levels = {
    info: "INFO",
    warn: "WARN",
    error: "ERROR"
}

const log = (level, message, extra = null) => {
    const time = new Date().toISOString()
    const formatted = `[${time}] [${levels[level]}] ${message}`

    if (level === "error") {
        console.error(formatted)
        if (extra) console.error(extra)
    } else if (level === "warn") {
        console.warn(formatted)
    } else {
        console.log(formatted)
    }
}

module.exports = {
    info: (msg) => log("info", msg),
    warn: (msg) => log("warn", msg),
    error: (msg, extra) => log("error", msg, extra)
}