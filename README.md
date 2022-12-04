> ⚠️  
> **Do not use in production!**  
> **This plugin is work in progress.**

# semantic-release-yarn [![npm](https://img.shields.io/npm/v/semantic-release-yarn)](https://www.npmjs.com/package/semantic-release-yarn)

[**semantic-release**](https://semantic-release.gitbook.io/semantic-release/)
plugin to publish a [npm](https://www.npmjs.com) package with
[yarn](https://yarnpkg.com).

| Step               | Description                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verifyConditions` | Verify Yarn 2 or higher is installed, verify the presence of an NPM auth token (either in an environment variable or an `.yarnrc.yml` file) and verify the authentication method is valid. |
| `prepare`          | Update the `package.json` version and [create](https://yarnpkg.com/cli/pack) the package tarball.                                                                                          |
| `addChannel`       | [Add a tag](https://yarnpkg.com/cli/npm/tag/add) for the release.                                                                                                                          |
| `publish`          | [Publish](https://yarnpkg.com/cli/npm/publish) to the npm registry.                                                                                                                        |

## Intended audience

Use this plugin if you want to use Yarn instead of the NPM CLI to publish your
packages to the NPM registry.

As an added bonus, this plugin will also publish some simple monorepo patterns
(WIP).

> 💡  
> You could also use this plugin to publish packages which are using NPM for
> dependency management.

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

## Configuration

### NPM registry authentication

The NPM authentication configuration is **required** and can be set either via
[environment variables](#environment-variables) or the
[`.yarnrc.yml`](#yarn-configuration) file.

The configuration set by environment variables will take precedence over
configuration set in an existing `.yarnrc.yml` file as detailed in
[Yarnrc files](https://yarnpkg.com/configuration/yarnrc)

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

### Environment variables

| Variable                    | Description                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `YARN_NPM_AUTH_TOKEN`       | [NPM token](https://docs.npmjs.com/creating-and-viewing-access-tokens). Translates to the [npmAuthToken](https://yarnpkg.com/configuration/yarnrc#npmAuthToken) `.yarnrc.yml` option. |
| `YARN_NPM_PUBLISH_REGISTRY` | NPM registry to use. Translates to the [npmPublishRegistry](https://yarnpkg.com/configuration/yarnrc#npmPublishRegistry) `.yarnrc.yml` option.                                        |

Other valid `.yarnrc.yml` options could be specified as environment variables as
mentioned in the [Yarnrc files](https://yarnpkg.com/configuration/yarnrc)
documentation:

> Finally, note that most settings can also be defined through environment
> variables (at least for the simpler ones; arrays and objects aren't supported
> yet). To do this, just prefix the names and write them in snake case:
> YARN_CACHE_FOLDER will set the cache folder (such values will overwrite any
> that might have been defined in the RC files - use them sparingly).

### Yarn configuration

The plugin uses the [`yarn` CLI](https://yarnpkg.com/cli) which will read the
configuration from a `.yarnrc.yml` file if present. See
[Yarnrc files](https://yarnpkg.com/configuration/yarnrc) for the option list.

The NPM registry to publish to can be configured via the
[environment variable](#environment-variables) `YARN_NPM_PUBLISH_REGISTRY` and
will take precedence over the configuration in `.yarnrc.yml`.

The
[`registry`](https://yarnpkg.com/configuration/manifest#publishConfig.registry)
can be configured in the `package.json` and will take precedence over the
configuration in `.yarnrc.yml` and `YARN_NPM_PUBLISH_REGISTRY`:

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

**Note**: The `pkgRoot` directory must contain a `package.json`. The version
will be updated only in the `package.json` within the `pkgRoot` directory.

**Note**: If you use a
[shareable configuration](https://semantic-release.gitbook.io/semantic-release/usage/shareable-configurations)
that defines one of these options you can set it to `false` in your
[**semantic-release** configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration)
in order to use the default value.

### Examples

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

## Credits

©️ Copyright 2022 Joram van den Boezem  
♻️ Licensed under the MIT license  
⚡ Powered by Node.js and TypeScript (and a lot of
[amazing open source packages](./yarn.lock))  
🚀 This plugin is forked from the core
[@semantic-release/npm](https://github.com/semantic-release/npm) plugin.
