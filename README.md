# semantic-release-yarn [![npm](https://img.shields.io/npm/v/semantic-release-yarn)](https://www.npmjs.com/package/semantic-release-yarn)

[**semantic-release**](https://semantic-release.gitbook.io/semantic-release/)
plugin to publish a [npm](https://www.npmjs.com) package with
[Yarn](https://yarnpkg.com).

Use this plugin instead of the default
[@semantic-release/npm](https://github.com/semantic-release/npm) if you want to
use Yarn instead of the NPM CLI to publish your packages to the NPM registry.

As an added bonus, this plugin will also publish some simple monorepo patterns
(currently WIP).

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Usage](#usage)
- [NPM registry authentication](#npm-registry-authentication)
- [Configuration](#configuration)
  - [Environment variables](#environment-variables)
  - [`.yarnrc.yml` file](#yarnrcyml-file)
  - [`package.json` file](#packagejson-file)
  - [Plugin options](#plugin-options)
- [Examples](#examples)
- [Plugin steps](#plugin-steps)
- [Roadmap](#roadmap)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
yarn add --dev semantic-release-yarn
```

> ⚠️  
> Please note this plugin only works with **Yarn 2** and higher.

## Usage

The plugin must be added in the
[**semantic-release** configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration),
for example:

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "semantic-release-yarn",
    "@semantic-release/github"
  ]
}
```

## NPM registry authentication

The NPM authentication configuration is **required** and can be set either via
[environment variables](#environment-variables) or the
[`.yarnrc.yml`](#yarn-configuration) file.

> ⚠️  
> When
> [two-factor authentication](https://docs.npmjs.com/configuring-two-factor-authentication)
> is enabled on your NPM account and enabled for writes (default setting), the
> token needs to be of type **Automation**.

> ⚠️  
> Only the
> [`npmAuthToken`](https://yarnpkg.com/configuration/yarnrc/#npmAuthToken) is
> supported. The legacy
> [`npmAuthIdent`](https://yarnpkg.com/configuration/yarnrc/#npmAuthIdent)
> (`username:password`) authentication is strongly discouraged and not supported
> by this plugin.

## Configuration

### Environment variables

| Variable                    | Description                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `YARN_NPM_AUTH_TOKEN`       | [NPM token](https://docs.npmjs.com/creating-and-viewing-access-tokens). Translates to the [npmAuthToken](https://yarnpkg.com/configuration/yarnrc#npmAuthToken) `.yarnrc.yml` option. |
| `YARN_NPM_PUBLISH_REGISTRY` | NPM registry to use. Translates to the [npmPublishRegistry](https://yarnpkg.com/configuration/yarnrc#npmPublishRegistry) `.yarnrc.yml` option.                                        |

Most other Yarn options could be specified as environment variables as well.
Just prefix the names and write them in snake case. Refer to the
[Yarnrc files](https://yarnpkg.com/configuration/yarnrc) documentation to see
all options.

> ⚠️  
> The configuration set by environment variables will take precedence over
> configuration set in the `.yarnrc.yml` file.

### `.yarnrc.yml` file

Options can also be set in a `.yarnrc.yml` file. See
[Yarnrc files](https://yarnpkg.com/configuration/yarnrc) for the complete list
of option.

### `package.json` file

The
[`registry`](https://yarnpkg.com/configuration/manifest#publishConfig.registry)
can be configured in the `package.json` and will take precedence over the
configuration in environment variables and the `.yarnrc.yml` file.

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

> ⚠️  
> The `@semantic-release/npm` plugin supports setting the `publishConfig.tag`
> option. However, Yarn 2
> [doesn't seem to](https://github.com/yarnpkg/berry/issues?q=publishConfig+tag) >
> [support this](https://yarnpkg.com/configuration/manifest#publishConfig).

### Plugin options

These options can be added to the
[**semantic-release** configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration),
for example:

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-yarn",
      {
        "npmPublish": false
      }
    ],
    "@semantic-release/github"
  ]
}
```

| Options      | Description                                                                                                      | Default                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npmPublish` | Whether to publish the NPM package to the registry. If `false` the `package.json` version will still be updated. | `false` if the `package.json` [private](https://docs.npmjs.com/files/package.json#private) property is `true`, `true` otherwise. |
| `pkgRoot`    | Directory path to publish.                                                                                       | `.`                                                                                                                              |
| `tarballDir` | Directory path in which to write the package tarball. If `false` the tarball is not kept on the file system.     | `false`                                                                                                                          |

> ⚠️  
> The `pkgRoot` directory must contain a `package.json`. The version will be
> updated only in the `package.json` within the `pkgRoot` directory.

## Examples

The `npmPublish` and `tarballDir` option can be used to skip the publishing to
the NPM registry and instead release the package tarball with another plugin.
For example with the
[@semantic-release/github](https://github.com/semantic-release/github) plugin:

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-yarn",
      {
        "npmPublish": false,
        "tarballDir": "dist"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": "dist/*.tgz"
      }
    ]
  ]
}
```

## Plugin steps

| Step               | Description                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verifyConditions` | Verify Yarn 2 or higher is installed, verify the presence of an NPM auth token (either in an environment variable or an `.yarnrc.yml` file) and verify the authentication method is valid. |
| `prepare`          | Update the `package.json` version and [create](https://yarnpkg.com/cli/pack) the package tarball.                                                                                          |
| `addChannel`       | [Add a tag](https://yarnpkg.com/cli/npm/tag/add) for the release.                                                                                                                          |
| `publish`          | [Publish](https://yarnpkg.com/cli/npm/publish) to the npm registry.                                                                                                                        |

## Roadmap

- [ ] Monorepo support
- [ ] Get rid of CJS build once
      [upstream PR 2607](https://github.com/semantic-release/semantic-release/pull/2607)
      lands
- [ ] Since we're using the latest AggregateError package, `semantic-release` is
      not picking up our error stack and we get a generic error message instead
      of a well formatted one. Hope this can be fixed once
      [upstream PR #2631](https://github.com/semantic-release/semantic-release/pull/2631)
      lands

## Credits

©️ Copyright 2022 Joram van den Boezem  
♻️ Licensed under the MIT license  
⚡ Powered by Node.js and TypeScript (and a lot of
[amazing open source packages](./yarn.lock))  
🚀 This plugin is forked from the core
[@semantic-release/npm](https://github.com/semantic-release/npm) plugin.
