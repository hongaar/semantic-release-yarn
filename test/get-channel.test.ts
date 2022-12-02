import { getChannel } from "../src/get-channel.js";

test("Get default channel", () => {
  expect(getChannel()).toBe("latest");
});

test("Get passed channel if valid", () => {
  expect(getChannel("next")).toBe("next");
});

test('Prefix channel with "release-" if invalid', () => {
  expect(getChannel("1.x")).toBe("release-1.x");
  expect(getChannel("1.0.0")).toBe("release-1.0.0");
});
