# eleventy-plugin-umami-analytics

An [Eleventy](https://www.11ty.dev/) plugin that automatically injects [Umami Analytics](https://umami.is/) into your HTML pages using a PostHTML transform, and optionally tags outbound links (or any element) with Umami event attributes.

## Requirements

- Eleventy 3.x (uses `htmlTransformer.addPosthtmlPlugin`)
- Node.js 18+

## Installation

```sh
npm install eleventy-plugin-umami-analytics
```

## Usage

### Transform Plugin (recommended)

The transform plugin automatically injects the Umami script into every HTML page and optionally adds event tracking attributes to matching elements.

In your Eleventy config file (`eleventy.config.js`):

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

### Script Tag (manual)

If you want to generate the script tag yourself (e.g. in a Nunjucks/Liquid shortcode), you can use the `UmamiAnalytics` class directly:

```js
import UmamiAnalytics from "eleventy-plugin-umami-analytics";

const umami = new UmamiAnalytics(
    "https://cloud.umami.is/script.js",
    "your-website-id",
    { /* optional attributes config */ }
);

// Returns an HTML string: <script src="..." data-website-id="..." defer></script>
const scriptTag = umami.script();
```

## Plugin Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean \| (context) => boolean` | `true` | Whether to inject the script. Can be a function receiving the page context. |
| `ignore` | `boolean` | `true` | If `true`, elements with the `umami:ignore` attribute are skipped for event injection. |
| `extensions` | `string[]` | `["html"]` | File extensions to run the transform on. |
| `umami.url` | `string` | *required* | URL of the Umami script. |
| `umami.websiteId` | `string` | *required* | Your Umami website ID. |
| `umami.attributes` | `UmamiAttributes` | `{}` | Extra Umami `data-` attributes for the script tag (see below). |
| `umami.event` | `UmamiEventOptions` | see below | Configuration for automatic event attribute injection. |

### `umami.attributes`

Controls the `data-*` attributes added to the injected `<script>` tag. Corresponds to [Umami's tracker configuration](https://umami.is/docs/tracker-configuration).

| Key | Type | Description |
|---|---|---|
| `hostUrl` | `string` | Sets `data-host-url` |
| `domains` | `string \| string[]` | Sets `data-domains` (array is joined with commas) |
| `tag` | `string` | Sets `data-tag` |
| `beforeSend` | `string` | Sets `data-before-send` |
| `performance` | `boolean` | Sets `data-performance="true"` |
| `excludeSearch` | `boolean` | Sets `data-exclude-search="true"` |
| `excludeHash` | `boolean` | Sets `data-exclude-hash="true"` |
| `doNotTrack` | `boolean` | Sets `data-do-not-track="true"` |
| `autoTrack` | `boolean` | Sets `data-auto-track="false"` when `false` |

### `umami.event`

Controls automatic injection of Umami event attributes onto matched elements.

| Key | Type | Default | Description |
|---|---|---|---|
| `matcher` | `string` | `"a"` | [PostHTML match](https://github.com/posthtml/posthtml-match-helper) selector for elements to track. |
| `key` | `string` | `"outbound-link-click"` | Value for `data-umami-event`. |
| `properties` | `Record<string, (node) => string \| undefined>` | see below | Map of event property names to resolver functions. |

By default, event tracking is applied to all `<a>` tags whose `href` points to an external URL, adding:

```html
<a href="https://example.com" data-umami-event="outbound-link-click" data-umami-event-url="https://example.com/">
```

To disable event injection entirely, set `umami.event` to `false` or `null`.

### Ignoring elements

Add the `umami:ignore` attribute to any element to skip event injection for it:

```html
<a href="https://example.com" umami:ignore>Not tracked</a>
```

The attribute is removed from the final HTML output. This requires `ignore: true` (the default).

## `UmamiAnalytics` API

### `new UmamiAnalytics(scriptUrl, websiteId, attributesConfig?)`

Creates a new instance.

### `.script(eventOptions?, overrides?, context?): string`

Returns a full `<script>` HTML string ready to insert into a template.

### `.attributes(eventOptions?, overrides?, context?): Record<string, string>`

Returns an object of `data-*` attributes suitable for spreading into a PostHTML node.

### `.parseEvent(eventOptions, context): Record<string, string> | null`

Resolves event attribute values for a given context node. Returns `null` if no properties resolved to a value.

### `.isEnabled(enabled, context): boolean`

Resolves a boolean or function to determine whether tracking is active.

## License
This project is licensed under the [MIT License](LICENSE).