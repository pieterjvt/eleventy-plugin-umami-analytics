/**
 * @param {string} key
 * @returns {string}
 */
function normalizeAttributeKey(key) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * @param {string} text
 * @returns {string}
 */
function escapeQuotes(text) {
    return text.replace(/"/g, '\\"');
}

export { normalizeAttributeKey, escapeQuotes };
