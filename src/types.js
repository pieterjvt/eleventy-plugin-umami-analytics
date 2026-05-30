/**
 * Relaxing type definition of `content` to allow strings.
 *
 * @typedef {Omit<import("posthtml").Node, "content"> & { content?: (any | string)[] }} PostHtmlNode
 */
/** @typedef {PostHtmlNode[] & import("posthtml").NodeAPI} PostHtmlTree */

/**
 * Intentionally loose, accepts any key/value pairs as Umami script attributes.
 *
 * @typedef {object} UmamiAttributes
 */

/**
 * @typedef {object} UmamiEventOptions
 * @property {string} matcher - PostHTML/CSS selector for nodes to attach event attributes to.
 * @property {string} key - Umami event name, set as `data-umami-event`.
 * @property {Object<string, (node: PostHtmlNode) => string | undefined>} properties - Map of event
 *   property names to resolver functions called with the matched node.
 */

/**
 * @typedef {object} UmamiOptions
 * @property {string} url - URL of the Umami script.
 * @property {string} websiteId - Umami website ID.
 * @property {UmamiAttributes} [attributes] - Optional base attribute config.
 * @property {UmamiEventOptions} [event] - Optional event tracking config.
 */

/**
 * @typedef {object} TransformPluginOptions
 * @property {boolean | function} [enabled] - Whether the plugin is active. Accepts a function
 *   resolved against page context.
 * @property {boolean} [ignore] - Whether to respect `umami:ignore` attributes on matched nodes.
 * @property {string[]} [extensions] - File extensions to apply the transform to.
 * @property {UmamiOptions} umami - Umami configuration.
 */
export {};
