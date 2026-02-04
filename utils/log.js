const colors = {
  reset: "\x1b[0m",
  info: "\x1b[36m", // Cyan
  warn: "\x1b[33m", // Yellow
  err: "\x1b[31m",  // Red
  success: "\x1b[32m" // Green
};

const log = {
  info: (msg) => console.log(`${colors.info}[ INFO ]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.warn}[ WARN ]${colors.reset} ${msg}`),
  err: (msg) => console.log(`${colors.err}[ ERR ]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.success}[ SUCCESS ]${colors.reset} ${msg}`)
};

log.loader = (msg, type) => {
  switch (type) {
    case 'warn': log.warn(msg); break;
    case 'error': log.err(msg); break;
    default: log.info(msg); break;
  }
};

module.exports = log;
