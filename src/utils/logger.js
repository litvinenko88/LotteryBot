const config = require('../config');

class Logger {
  info(message, ...args) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  sanitize(input) {
    return String(input).replace(/[\r\n\t]/g, ' ').substring(0, 100);
  }
}

module.exports = new Logger();