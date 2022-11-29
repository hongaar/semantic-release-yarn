# Migration log

## TypeScript conversion

- `definitions/errors.ts` removed dynamic import of `package.json` (due to TS
  rootDir limitation with resolveJsonModule enabled)
- add `definitions/constants.ts` to hold constants
- add `definitions/context.ts` to TypeScript context types
  (@types/semantic-release were incomplete, might want to open PR to add to
  @types/semantic-release later)

## Use `docker cp` for moving test/helpers/config.yaml

The Docker API `Binds` parameter doesn't work on certain environments (e.g. WSL)

See
https://github.com/hongaar/semantic-release-yarn/pull/1/commits/a31f17e7162bac60e327715349cc86f6d7316aa0

## `Throws error if NPM token is invalid`

See
https://github.com/hongaar/semantic-release-yarn/pull/1/commits/a1458ba9a8c40c9d5438beb12e5567f182ed5c43

```
 ✖ Throws error if NPM token is invalid
  ─

  Throws error if NPM token is invalid

  test/integration.test.js:103

   102:
   103:   const [error] = await t.throwsAsync(
   104:     t.context.m.verifyConditions(

  Promise resolved with:

  undefined

  › test/integration.test.js:103:27
```

Also happening on latest upstream, e.g.:
https://github.com/semantic-release/npm/actions/runs/3511912533/jobs/5883100863.
Seems only apparent on later Node version (16.x an later, but not on 16.0?)

Fixed with hacky workaround:

```
if (String(result.stdout).trim() === 'undefined') {
  throw new AggregateError([getError('EINVALIDNPMTOKEN', {registry})]);
}
```
