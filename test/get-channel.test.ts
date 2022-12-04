import test from "ava";
import { getChannel } from "../src/get-channel.js";

test("Get default channel", (t) => {
  t.is(getChannel(), "latest");
});

test("Get passed channel if valid", (t) => {
  t.is(getChannel("next"), "next");
});

test('Prefix channel with "release-" if invalid', (t) => {
  t.is(getChannel("1.x"), "release-1.x");
  t.is(getChannel("1.0.0"), "release-1.0.0");
});
