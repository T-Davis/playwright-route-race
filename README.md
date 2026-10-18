# Playwright route race repro

A `page.route()` added just after a `{ times: 1 }` route has handled its request can resolve without intercepting the next request.

```sh
npm ci
npx playwright install chromium firefox webkit
npm test
```

`tests/route-race.spec.ts` runs the same steps twice. The `0 ms` test adds the second route straight away and fails intermittently in all three browsers. The `200 ms` test waits first and always passes. `npm test` repeats each test 100 times.
