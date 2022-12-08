import { PLUGIN_GIT_BRANCH, PLUGIN_HOMEPAGE } from "./constants.js";

function linkify(file: string) {
  return `${PLUGIN_HOMEPAGE}/blob/${PLUGIN_GIT_BRANCH}/${file}`;
}

export function EINVALIDNPMPUBLISH({ npmPublish }: { npmPublish: unknown }) {
  return {
    message: 'Invalid "npmPublish" option.',
    details: `The [npmPublish option](${linkify(
      "README.md#plugin-options"
    )}) option, if defined, must be a "Boolean".

Your configuration for the "npmPublish" option is "${npmPublish}".`,
  };
}

export function EINVALIDTARBALLDIR({ tarballDir }: { tarballDir: unknown }) {
  return {
    message: 'Invalid "tarballDir" option.',
    details: `The [tarballDir option](${linkify(
      "README.md#plugin-options"
    )}) option, if defined, must be a "String".

Your configuration for the "tarballDir" option is "${tarballDir}".`,
  };
}

export function EINVALIDPKGROOT({ pkgRoot }: { pkgRoot: unknown }) {
  return {
    message: 'Invalid "pkgRoot" option.',
    details: `The [pkgRoot option](${linkify(
      "README.md#plugin-options"
    )}) option, if defined, must be a "String".

Your configuration for the "pkgRoot" option is "${pkgRoot}".`,
  };
}

export function ENONPMTOKEN({ registry }: { registry: string }) {
  return {
    message: "No NPM access token specified.",
    details: `A [NPM access token](${linkify(
      "README.md#npm-registry-authentication"
    )}) must be provided in your configuration. The token must allow to publish to the registry "${registry}".
      
Please refer to the [npm registry authentication](${linkify(
      "README.md#npm-registry-authentication"
    )}) section of the README to learn how to configure the NPM registry access token.`,
  };
}

export function EINVALIDNPMTOKEN({ registry }: { registry: string }) {
  return {
    message: "Invalid NPM access token.",
    details: `The [NPM access token](${linkify(
      "README.md#npm-registry-authentication"
    )}) configured must be a valid [access token](https://docs.npmjs.com/getting-started/working_with_tokens) allowing to publish to the registry "${registry}".
    
Please refer to the [npm registry authentication](${linkify(
      "README.md#npm-registry-authentication"
    )}) section of the README to learn how to configure the NPM registry access token.`,
  };
}

export function ENOPKGNAME() {
  return {
    message: 'Missing "name" property in "package.json".',
    details: `The "package.json"'s [name](https://docs.npmjs.com/files/package.json#name) property is required in order to publish a package to the registry.

Please make sure to add a valid "name" for your package in your "package.json".`,
  };
}

export function ENOPKG() {
  return {
    message: 'Missing "package.json" file.',
    details: `A [package.json file](https://docs.npmjs.com/files/package.json) at the root of your project is required to release on NPM.

Please follow the [npm guideline](https://docs.npmjs.com/getting-started/creating-node-modules) to create a valid "package.json" file.`,
  };
}

export function ENOYARN() {
  return {
    message: "Yarn not found.",
    details: `The Yarn CLI could not be found in your PATH. Make sure Yarn is installed and try again.`,
  };
}

export function EINVALIDYARN({ version }: { version: string }) {
  return {
    message: "Incompatible Yarn version detected.",
    details: `The version of Yarn that you are using is not compatible. Please refer to [the README](${linkify(
      "README.md#install"
    )}) to review which versions of Yarn are currently supported

Your version of Yarn is "${version}".`,
  };
}
