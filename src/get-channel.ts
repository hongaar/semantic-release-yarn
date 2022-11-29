import semver from "semver";

export function getChannel(channel: string) {
  return channel
    ? semver.validRange(channel)
      ? `release-${channel}`
      : channel
    : "latest";
}
