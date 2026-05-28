/** @type {Record<string, (config: any) => string | undefined>} */
const attributes = {
    "host-url": (config) => config.hostUrl,
    "domains": (config) => Array.isArray(config.domains) ? config.domains.join(",") : config.domains,
    "tag": (config) => config.tag,
    "before-send": (config) => config.beforeSend,
    "performance": (config) => config.performance === true ? "true" : undefined,
    "exclude-search": (config) => config.excludeSearch === true ? "true" : undefined,
    "exclude-hash": (config) => config.excludeHash === true ? "true" : undefined,
    "do-not-track": (config) => config.doNotTrack === true ? "true" : undefined,
    "auto-track": (config) => config.autoTrack === false ? "false" : undefined,
};

export default attributes;