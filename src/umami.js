import { normalizeAttributeKey, escapeQuotes, resolveBool, resolveValue } from "./util/index.js";
import attributes from "./attributes.js";

/** @typedef {import("./types.js").UmamiAttributes} UmamiAttributes */
/** @typedef {import("./types.js").UmamiOptions} UmamiOptions */
/** @typedef {import("./types.js").UmamiEventOptions} UmamiEventOptions */

/** @typedef {Record<string, string>} UmamiProcessedAttributes */
/** @typedef {Record<string, string>} UmamiPrefixedAttributes */

/**
 * @param {UmamiAttributes} attributesConfig
 * @returns {UmamiProcessedAttributes}
 */
function makeAttributes(attributesConfig) {
    /** @type Record<string, string> */
    const result = {};
    for (const [key, fn] of Object.entries(attributes)) {
        const value = fn(attributesConfig);
        if (value != null) result[key] = value;
    }
    return result;
}

/**
 * @param {UmamiProcessedAttributes} attributes
 * @returns {UmamiPrefixedAttributes}
 */
function prefixAttributes(attributes) {
    /** @type {Record<string, string>} */
    const result = {};
    for (const [key, value] of Object.entries(attributes)) {
        if (value != null) result[`data-${key}`] = escapeQuotes(String(value));
    }
    return result;
}

/**
 * @param {UmamiPrefixedAttributes} attributes
 * @returns {string}
 */
function convertAttributesToHtml(attributes) {
    return Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
}

class UmamiAnalytics {
    /**
     * @param {string} scriptUrl
     * @param {string} websiteId
     * @param {UmamiAttributes} attributesConfig
     */
    constructor(scriptUrl, websiteId, attributesConfig = {}) {
        this.scriptUrl = scriptUrl;
        this.websiteId = websiteId;
        this.baseAttributes = {
            "website-id": websiteId,
            ...makeAttributes(attributesConfig),
        };
    }

    /**
     * @param {UmamiEventOptions} eventOptions
     * @param {any} context
     * @returns
     */
    parseEvent(eventOptions, context) {
        if (!eventOptions) return null;

        const { key, properties } = eventOptions;
        /** @type Record<string, string> */
        const resolved = {};

        for (const [property, callback] of Object.entries(properties)) {
            const value = resolveValue(callback, context);
            if (value !== undefined) {
                resolved[`umami-event-${normalizeAttributeKey(property)}`] = value;
            }
        }

        if (Object.keys(resolved).length === 0) return null;

        return prefixAttributes({
            "umami-event": key,
            ...resolved,
        });
    }

    /**
     * @param {UmamiEventOptions} [eventOptions]
     * @param {UmamiAttributes} [overrides]
     * @param {any} [context]
     * @returns {UmamiPrefixedAttributes}
     */
    attributes(eventOptions, overrides, context) {
        const eventAttributes = eventOptions && this.parseEvent(eventOptions, context ?? {});

        return prefixAttributes({
            ...this.baseAttributes,
            ...(eventAttributes ?? {}),
            ...makeAttributes(overrides ?? {}),
        });
    }

    /**
     * @param {UmamiEventOptions} eventOptions
     * @param {UmamiAttributes} overrides
     * @param {any} context
     * @returns {string}
     */
    script(eventOptions, overrides, context) {
        const attrs = convertAttributesToHtml(this.attributes(eventOptions, overrides, context));
        return `<script src="${escapeQuotes(this.scriptUrl)}" ${attrs} defer></script>`;
    }

    /**
     *
     * @param {boolean | function} enabled
     * @param {any} context
     * @returns
     */
    isEnabled(enabled, context) {
        return resolveBool(enabled, context);
    }
}

export default UmamiAnalytics;
