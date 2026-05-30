/**
 * @param {any} value
 * @returns {boolean}
 */
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Deep merges `overrides` into `defaults`, recursing into nested objects.
 *
 * @param {Record<string, any>} defaults
 * @param {Record<string, any>} overrides
 * @returns {Record<string, any>}
 */
function mergeOptions(defaults, overrides) {
    if (!overrides) return defaults;

    const result = { ...defaults };

    for (const key of Object.keys(overrides)) {
        const bothAreObjects = isObject(defaults[key]) && isObject(overrides[key]);
        result[key] = bothAreObjects ? mergeOptions(defaults[key], overrides[key]) : overrides[key];
    }

    return result;
}

export { mergeOptions };
