import test from "ava";
import { resolveValue, resolveBool } from "../../src/util/resolve.js";

test("resolveValue returns a plain value as-is", (t) => {
    t.is(resolveValue("hello"), "hello");
});

test("resolveValue calls a function with args and returns the result", (t) => {
    t.is(resolveValue((x) => x * 2, 5), 10);
});

test("resolveBool casts truthy values to true", (t) => {
    t.true(resolveBool(1));
    t.true(resolveBool("yes"));
});

test("resolveBool casts falsy values to false", (t) => {
    t.false(resolveBool(0));
    t.false(resolveBool(null));
});

test("resolveBool resolves a function", (t) => {
    t.true(resolveBool((x) => x > 0, 5));
    t.false(resolveBool((x) => x > 0, -1));
});