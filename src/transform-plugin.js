import UmamiAnalytics from "./umami.js";
import { mergeOptions } from "./util/index.js";

import matchHelper from "posthtml-match-helper";

/** @typedef {import("./types.js").TransformPluginOptions} TransformPluginOptions */
/** @typedef {import("./types.js").PostHtmlNode} PostHtmlNode */
/** @typedef {import("./types.js").PostHtmlTree} PostHtmlTree */

/** @type {TransformPluginOptions} */
const defaultOptions = {
    enabled: true,
    extensions: ["html"],
    ignore: true,

    umami: {
        url: "",
        websiteId: "",

        attributes: {},

        event: {
            matcher: "a",
            key: "outbound-link-click",
            properties: {
                url: (node) => {
                    const href = node.attrs?.href;
                    if (!href) return undefined;

                    const url = new URL(href, "http://internal");
                    if (url.host !== "internal") {
                        return url.href;
                    }

                    return undefined;
                },
            },
        },
    },
};

/**
 * @param {import("@11ty/eleventy/UserConfig").default} eleventyConfig
 * @param {TransformPluginOptions} pluginOptions
 */
async function eleventyUmamiTransformPlugin(eleventyConfig, pluginOptions) {
    const options = mergeOptions(defaultOptions, pluginOptions);

    if (!options.umami.url || !options.umami.websiteId) {
        throw new Error("Umami script URL and website ID are required!");
    }

    const tracker = new UmamiAnalytics(
        options.umami.url,
        options.umami.websiteId,
        options.umami.attributes,
    );

    /**
     * @callback TreeTransformer
     * @param {PostHtmlTree} tree
     * @returns {PostHtmlTree}
     */

    /** @type {TreeTransformer} */
    function injectScript(tree) {
        let injected = false;

        /** @param {PostHtmlNode} node */
        function appendScript(node) {
            node.content ??= [];
            node.content.push({
                tag: "script",
                attrs: {
                    src: options.umami.url,
                    defer: "",
                    ...tracker.attributes(),
                },
                content: [],
            });

            injected = true;
            return node;
        }

        tree.match({ tag: "head" }, appendScript);

        if (!injected) {
            tree.match({ tag: "body" }, appendScript);
        }

        return tree;
    }

    /** @type {TreeTransformer} */
    function injectEvent(tree) {
        const event = options.umami.event;
        if (!event) return tree;

        const { matcher } = event;

        tree.match(matchHelper(matcher), (node) => {
            if (options.ignore && node.attrs?.["umami:ignore"] !== undefined) {
                delete node.attrs["umami:ignore"];
                return node;
            }

            const resolved = tracker.parseEvent(options.umami.event, node);
            if (!resolved) return node;

            for (const [key, value] of Object.entries(resolved)) {
                if (value !== undefined && value !== null) {
                    node.attrs[key] = String(value);
                }
            }

            return node;
        });

        return tree;
    }

    /** @type {TreeTransformer} */
    function removeUmamiAttributes(tree) {
        tree.match({ tag: /\w+/ }, (node) => {
            if (node.attrs?.["umami:ignore"] !== undefined) {
                const attrs = /** @type {Record<string, string | undefined>} */ (node.attrs);
                delete attrs["umami:ignore"];
            }
            return node;
        });

        return tree;
    }

    /**
     * @param {Record<string, any>} context
     * @returns {(tree: PostHtmlTree) => PostHtmlTree}
     */
    function postHtmlPlugin(context) {
        /** @type {TreeTransformer} */
        return (tree) => {
            if (!tracker.isEnabled(options.enabled, context)) return tree;

            injectScript(tree);

            if (options.umami?.event) injectEvent(tree);

            removeUmamiAttributes(tree);

            return tree;
        };
    }

    // @ts-ignore
    eleventyConfig.htmlTransformer.addPosthtmlPlugin(options.extensions.join(","), postHtmlPlugin, {
        priority: 1,
    });
}

export default eleventyUmamiTransformPlugin;
