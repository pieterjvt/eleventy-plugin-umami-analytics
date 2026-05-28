/** Relaxing type definition of `content` to allow strings. 
 * @typedef {Omit<import("posthtml").Node, "content"> & { content?: Array<any | string> }} PostHtmlNode */
/** @typedef {PostHtmlNode[] & import("posthtml").NodeAPI} PostHtmlTree */

/** @typedef {object} UmamiAttributes */

/**
 * @typedef {object} UmamiEventOptions
 * @property {string} matcher
 * @property {string} key
 * @property {Object.<string, (node: PostHtmlNode) => string | undefined>} properties
 */

/**
 * @typedef {object} UmamiOptions
 * @property {string} url
 * @property {string} websiteId
 * @property {UmamiAttributes} [attributes]
 * @property {UmamiEventOptions} [event]
 */

/**
 * @typedef {object} TransformPluginOptions
 * @property {boolean} [enabled]
 * @property {boolean} [ignore]
 * @property {string[]} [extensions]
 * @property {UmamiOptions} umami
 */

export {};