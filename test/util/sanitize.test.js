import test from "ava";
import { normalizeAttributeKey, escapeQuotes } from "../../src/util/sanitize.js";

test("normalizeAttributeKey converts camelCase to kebab-case", (t) => {
    t.is(normalizeAttributeKey("eventUrl"), "event-url");
});

test("normalizeAttributeKey lowercases", (t) => {
    t.is(normalizeAttributeKey("MyKey"), "my-key");
});

test("normalizeAttributeKey replaces spaces with hyphens", (t) => {
    t.is(normalizeAttributeKey("event url"), "event-url");
});

test("normalizeAttributeKey collapses multiple hyphens", (t) => {
    t.is(normalizeAttributeKey("event--url"), "event-url");
});

test("normalizeAttributeKey trims leading and trailing hyphens", (t) => {
    t.is(normalizeAttributeKey("-event-"), "event");
});

test("escapeQuotes escapes double quotes", (t) => {
    t.is(escapeQuotes(`say "hello"`), `say \\"hello\\"`);
});

test("escapeQuotes leaves strings without quotes unchanged", (t) => {
    t.is(escapeQuotes("hello"), "hello");
});
