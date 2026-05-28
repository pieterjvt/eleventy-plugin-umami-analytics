/**
 * @param {boolean | function | any} value 
 * @param  {...any} args 
 * @returns {boolean}
 */
function resolveBool(value, ...args) {
    if (typeof value === "function") return Boolean(value(...args));
    return Boolean(value);
}

/**
 * @param {function | any} value 
 * @param  {...any} args 
 * @returns {any}
 */
function resolveValue(value, ...args) {
    if (typeof value === "function") return value(...args);
    return value;
}

export { resolveBool, resolveValue };