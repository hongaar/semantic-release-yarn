> ⚠️  
> **Do not use in production!**  
> **This plugin is work in progress.**

# semantic-release-yarn [![npm](https://img.shields.io/npm/v/semantic-release-yarn)](https://www.npmjs.com/package/semantic-release-yarn)

[**semantic-release**](https://semantic-release.gitbook.io/semantic-release/)
plugin to publish a [npm](https://www.npmjs.com) package with
[yarn](https://yarnpkg.com).

> ⚠️  
> Please note this plugin only works with **Yarn 2** and higher.

| Step               | Description                                                                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify Yarn 2 or higher is installed, verify the presence of the `NPM_TOKEN` environment variable or an `.yarnrc.yml` file, and verify the authentication method is valid. |
| `prepare`          | Update the `package.json` version and [create](https://yarnpkg.com/cli/pack) the package tarball.                                                                          |
| `addChannel`       | [Add a tag](https://yarnpkg.com/cli/npm/tag/add) for the release.                                                                                                          |
| `publish`          | [Publish](https://yarnpkg.com/cli/npm/publish) to the npm registry.                                                                                                        |

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

Only the
[`npmAuthToken`](https://yarnpkg.com/configuration/yarnrc/#npmAuthToken) is
supported. The legacy
[`npmAuthIdent`](https://yarnpkg.com/configuration/yarnrc/#npmAuthIdent)
(`username:password`) authentication is strongly discouraged and not supported
by this plugin.

> ⚠️  
> When
> [two-factor authentication](https://docs.npmjs.com/configuring-two-factor-authentication)
> is enabled on your NPM account, it needs to be disabled for writes. This
> plugin will not work with the default setting. To read how to disable 2FA for
> writes, see
> [Disabling 2FA for writes](https://docs.npmjs.com/configuring-two-factor-authentication#disabling-2fa-for-writes).

> ⚠️  
> The presence of an `.yarnrc.yml` file will override any specified environment
> variables.

### Environment variables

| Variable                | Description                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN`             | Npm token created via [npm token create](https://docs.npmjs.com/getting-started/working_with_tokens#how-to-create-new-tokens) |
| `NPM_USERNAME`          | Npm username created via [npm adduser](https://docs.npmjs.com/cli/adduser) or on [npmjs.com](https://www.npmjs.com)           |
| `NPM_PASSWORD`          | Password of the npm user.                                                                                                     |
| `NPM_EMAIL`             | Email address associated with the npm user                                                                                    |
| `NPM_CONFIG_USERCONFIG` | Path to non-default .npmrc file                                                                                               |

Use either `NPM_TOKEN` for token authentication or `NPM_USERNAME`,
`NPM_PASSWORD` and `NPM_EMAIL` for legacy authentication

### Yarn configuration

The plugin uses the [`yarn` CLI](https://yarnpkg.com/cli) which will read the
configuration from a `.yarnrc.yml` file if present. See
[Yarnrc files](https://yarnpkg.com/configuration/yarnrc) for the option list.

The NPM registry to publish to can be configured via the environment variable
`NPM_CONFIG_REGISTRY` and will take precedence over the configuration in
`.yarnrc.yml`.

The
[`registry`](https://yarnpkg.com/configuration/manifest#publishConfig.registry)
can be configured in the `package.json` and will take precedence over the
configuration in `.yarnrc.yml` and `NPM_CONFIG_REGISTRY`:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  }
}
```

> ⚠️ The `@semantic-release/npm` plugin supports setting the `publishConfig.tag`
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
