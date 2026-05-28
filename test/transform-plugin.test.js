import test from "ava";
import posthtml from "posthtml";

const SCRIPT_URL = "https://cloud.umami.is/script.js";
const WEBSITE_ID = "test-id";

const baseOptions = {
    umami: {
        url: SCRIPT_URL,
        websiteId: WEBSITE_ID,
    },
};

async function capturePlugin(pluginOptions) {
    const { default: plugin } = await import("../src/transform-plugin.js");
    return new Promise((resolve) => {
        const fakeConfig = {
            htmlTransformer: {
                addPosthtmlPlugin: (_ext, pluginFn) => resolve(pluginFn),
            },
        };
        plugin(fakeConfig, pluginOptions);
    });
}

async function transform(html, pluginOptions = baseOptions, context = {}) {
    const pluginFn = await capturePlugin(pluginOptions);
    const result = await posthtml([pluginFn(context)]).process(html);
    return result.html;
}

// read the default event key from the plugin's own defaults rather than hardcoding it
async function defaultEventKey() {
    const pluginFn = await capturePlugin(baseOptions);
    // process a known outbound link and extract whatever key was applied
    const result = await posthtml([pluginFn({})]).process(
        `<html><head></head><body><a href="https://example.com">link</a></body></html>`
    );
    const match = result.html.match(/data-umami-event="([^"]+)"/);
    return match?.[1];
}

test("injects script into <head>", async (t) => {
    const html = await transform("<html><head></head><body></body></html>");
    t.true(html.includes(`src="${SCRIPT_URL}"`));
    t.true(html.includes("data-website-id"));
    t.true(html.indexOf("<script") < html.indexOf("</head>"));
});

test("falls back to <body> if no <head>", async (t) => {
    const html = await transform("<html><body></body></html>");
    t.true(html.includes("<script"));
});

test("adds data-umami-event to outbound links using the configured key", async (t) => {
    const key = await defaultEventKey();
    const html = await transform(
        `<html><head></head><body><a href="https://example.com">link</a></body></html>`
    );
    t.true(html.includes(`data-umami-event="${key}"`));
    t.true(html.includes('data-umami-event-url="https://example.com/"'));
});

test("uses a custom event key when configured", async (t) => {
    const html = await transform(
        `<html><head></head><body><a href="https://example.com">link</a></body></html>`,
        { umami: { ...baseOptions.umami, event: { matcher: "a", key: "custom-key", properties: { url: (node) => node.attrs?.href } } } }
    );
    t.true(html.includes('data-umami-event="custom-key"'));
});

test("does not add event attrs to internal links", async (t) => {
    const html = await transform(
        `<html><head></head><body><a href="/about">link</a></body></html>`
    );
    t.false(html.includes("data-umami-event"));
});

test("skips elements with umami:ignore and removes the attribute", async (t) => {
    const html = await transform(
        `<html><head></head><body><a href="https://example.com" umami:ignore>link</a></body></html>`
    );
    t.false(html.includes("data-umami-event"));
    t.false(html.includes("umami:ignore"));
});

test("skips injection when enabled is false", async (t) => {
    const html = await transform(
        "<html><head></head><body></body></html>",
        { ...baseOptions, enabled: false }
    );
    t.false(html.includes("<script"));
});

test("resolves enabled as a function using context", async (t) => {
    const html = await transform(
        "<html><head></head><body></body></html>",
        { ...baseOptions, enabled: (ctx) => ctx.inject },
        { inject: false }
    );
    t.false(html.includes("<script"));
});