import test from "ava";
import { mergeOptions } from "../../src/util/merge-options.js";

test("returns defaults when no overrides given", (t) => {
    t.deepEqual(mergeOptions({ a: 1 }, undefined), { a: 1 });
});

test("overrides a top-level key", (t) => {
    t.deepEqual(mergeOptions({ a: 1 }, { a: 2 }), { a: 2 });
});

test("deep merges nested objects", (t) => {
    t.deepEqual(
        mergeOptions({ a: { b: 1, c: 2 } }, { a: { b: 99 } }),
        { a: { b: 99, c: 2 } }
    );
});

test("replaces arrays wholesale rather than merging", (t) => {
    t.deepEqual(mergeOptions({ a: [1, 2] }, { a: [3] }), { a: [3] });
});

test("adds keys not present in defaults", (t) => {
    t.deepEqual(mergeOptions({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
});