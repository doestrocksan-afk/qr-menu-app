// Compatibility entry for deployments that still select next.config.js.
// The single source of configuration is next.config.mjs.
module.exports = async () => (await import('./next.config.mjs')).default;
