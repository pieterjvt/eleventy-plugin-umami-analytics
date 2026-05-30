# Eleventy Plugin Umami Analytics [![NPM Version](https://img.shields.io/npm/v/eleventy-plugin-umami-analytics)](https://npm.im/eleventy-plugin-umami-analytics)

An [Eleventy](https://www.11ty.dev/) plugin for integrating [Umami Analytics](https://umami.is/) with flexible customization options.

## Requirements

- Node.js 18+
- Eleventy 3.x+ (for the HTML transform plugin)

## Installation

```sh
npm install --save-dev eleventy-plugin-umami-analytics
```

## Usage

### Transform Plugin (recommended)

Automatically injects the Umami script into every HTML page and optionally adds event tracking attributes to matching elements.

In your Eleventy config (`eleventy.config.js`):

```js
import { eleventyUmamiTransformPlugin } from "eleventy-plugin-umami-analytics";

export default function (eleventyConfig) {
    eleventyConfig.addPlugin(eleventyUmamiTransformPlugin, {
        umami: {
            url: "https://cloud.umami.is/script.js",
            websiteId: "your-website-id",
        },
    });
};
```

### JavaScript API

Use the `UmamiAnalytics` class directly for full control:

```js
import UmamiAnalytics from "eleventy-plugin-umami-analytics/umami";

const umami = new UmamiAnalytics(
    "https://cloud.umami.is/script.js",
    "your-website-id",
    { /* optional attributes config */ }
);

// Returns: <script src="..." data-website-id="..." defer></script>
const scriptTag = umami.script();
```

### Custom Shortcode

Build an [Eleventy shortcode](https://www.11ty.dev/docs/shortcodes/) around `UmamiAnalytics` when you need to call it from templates or pass per-page options dynamically:

```js
import UmamiAnalytics from "eleventy-plugin-umami-analytics/umami";

export default function (eleventyConfig) {
    eleventyConfig.addShortcode("umami", function (websiteId, options = {}) {
        const umami = new UmamiAnalytics(
            "https://cloud.umami.is/script.js",
            websiteId,
            options
        );
        return umami.script();
    });
};
```

Then in any template:

```njk
{% umami "your-website-id" %}
```

Use `addAsyncShortcode` if the website ID or options need to be resolved asynchronously, for example from an environment variable:

```js
eleventyConfig.addAsyncShortcode("umami", async function (options = {}) {
    const websiteId = process.env.UMAMI_WEBSITE_ID;
    const umami = new UmamiAnalytics(
        "https://cloud.umami.is/script.js",
        websiteId,
        options
    );
    return umami.script();
});
```

## Plugin Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean \| (context) => boolean` | `true` | Whether to inject the script. Accepts a function receiving the page context. |
| `ignore` | `boolean` | `true` | Skip event injection on elements with `umami:ignore`. |
| `extensions` | `string[]` | `["html"]` | File extensions to run the transform on. |
| `umami.url` | `string` | *required* | URL of the Umami script. |
| `umami.websiteId` | `string` | *required* | Your Umami website ID. |
| `umami.attributes` | `UmamiAttributes` | `{}` | Extra `data-*` attributes for the script tag (see below). |
| `umami.event` | `UmamiEventOptions` | see below | Automatic event attribute injection config. |

### `umami.attributes`

Maps to [Umami's tracker configuration](https://docs.umami.is/docs/tracker-configuration) options.

| Key | Type | Description |
|---|---|---|
| `hostUrl` | `string` | Sets `data-host-url` |
| `domains` | `string \| string[]` | Sets `data-domains` (array joined with commas) |
| `tag` | `string` | Sets `data-tag` |
| `beforeSend` | `string` | Sets `data-before-send` |
| `performance` | `boolean` | Sets `data-performance="true"` |
| `excludeSearch` | `boolean` | Sets `data-exclude-search="true"` |
| `excludeHash` | `boolean` | Sets `data-exclude-hash="true"` |
| `doNotTrack` | `boolean` | Sets `data-do-not-track="true"` |
| `autoTrack` | `boolean` | Sets `data-auto-track="false"` when `false` |

### `umami.event`

Controls which elements get [Umami event](https://docs.umami.is/docs/track-events) attributes and what values they receive.

| Key | Type | Default | Description |
|---|---|---|---|
| `matcher` | `string` | `"a"` | [PostHTML selector](https://github.com/posthtml/posthtml-match-helper) for elements to track. |
| `key` | `string` | `"outbound-link-click"` | Value for `data-umami-event`. |
| `properties` | `Record<string, (node) => string \| undefined>` | see below | Event property names mapped to resolver functions. |

By default, event tracking applies to `<a>` tags with an external `href`, implementing [Umami's outbound link tracking](https://docs.umami.is/docs/track-outbound-links):
```html
<a href="https://example.com"
   data-umami-event="outbound-link-click"
   data-umami-event-url="https://example.com/">
```

Set `umami.event` to `false` or `null` to disable event injection entirely.

### Ignoring Elements

Add `umami:ignore` to skip event injection on a specific element:

```html
<a href="https://example.com" umami:ignore>Not tracked</a>
```

The attribute is stripped from the final HTML. Requires `ignore: true` (the default).

## `UmamiAnalytics` API

### `new UmamiAnalytics(scriptUrl, websiteId, attributesConfig?)`

Creates a new instance.

### `.script(eventOptions?, overrides?, context?)`

Returns a full `<script>` tag as an HTML string, ready to insert into a template.

### `.attributes(eventOptions?, overrides?, context?)`

Returns an object of `data-*` attributes suitable for spreading into a PostHTML node.

### `.parseEvent(eventOptions, context)`

Resolves event attribute values for a given context node. Returns `null` if no properties resolved.

### `.isEnabled(enabled, context)`

Resolves a boolean or function to determine whether tracking is active.

## License

[MIT](LICENSE)