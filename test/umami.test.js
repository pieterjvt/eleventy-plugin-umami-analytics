import test from "ava";
import UmamiAnalytics from "../src/umami.js";

const URL = "https://cloud.umami.is/script.js";
const ID = "test-website-id";

test("attributes always includes data-website-id", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    t.like(umami.attributes(), { "data-website-id": ID });
});

test("attributes includes config-driven attributes", (t) => {
    const umami = new UmamiAnalytics(URL, ID, { excludeSearch: true });
    t.like(umami.attributes(), { "data-exclude-search": "true" });
});

test("attributes omits undefined attributes", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    t.false("data-tag" in umami.attributes());
});

test("parseEvent returns null when no properties resolve", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    const result = umami.parseEvent({ key: "click", properties: { url: () => undefined } }, {});
    t.is(result, null);
});

test("parseEvent returns prefixed event attributes when properties resolve", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    const eventOptions = { key: "my-event", properties: { url: () => "https://example.com" } };
    t.deepEqual(umami.parseEvent(eventOptions, {}), {
        "data-umami-event": "my-event",
        "data-umami-event-url": "https://example.com",
    });
});

test("parseEvent normalizes camelCase property names", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    const result = umami.parseEvent({ key: "click", properties: { myProp: () => "value" } }, {});
    t.like(result, { "data-umami-event-my-prop": "value" });
});

test("script returns a valid script tag", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    const tag = umami.script();
    t.true(tag.includes(`src="${URL}"`));
    t.true(tag.includes("defer"));
    t.true(tag.includes(`data-website-id="${ID}"`));
});

test("isEnabled returns true for true", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    t.true(umami.isEnabled(true, {}));
});

test("isEnabled returns false for false", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    t.false(umami.isEnabled(false, {}));
});

test("isEnabled resolves a function using context", (t) => {
    const umami = new UmamiAnalytics(URL, ID);
    t.true(umami.isEnabled((ctx) => ctx.env === "prod", { env: "prod" }));
    t.false(umami.isEnabled((ctx) => ctx.env === "prod", { env: "dev" }));
});
