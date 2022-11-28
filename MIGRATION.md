# Migration log

## Tests

Ran into some issues with the integration tests.

### Throws error if NPM token is invalid

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

Also happening on latest upstream, e.g.: https://github.com/semantic-release/npm/actions/runs/3511912533/jobs/5883100863. Seems only apparent on later Node version (16.x an later, but not on 16.0?)

Fixed with hacky workaround:

```
if (String(result.stdout).trim() === 'undefined') {
  throw new AggregateError([getError('EINVALIDNPMTOKEN', {registry})]);
}
```

## TypeScript
