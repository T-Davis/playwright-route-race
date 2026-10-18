import { test, expect } from '@playwright/test';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

// Answers every request that no route intercepts.
let server: http.Server;
let origin: string;

test.beforeAll(async () => {
  server = http.createServer((req, res) => res.end('network'));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

test.afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

const fetchApi = () => fetch('/api').then(response => response.text());

for (const gap of [0, 200]) {
  test(`route added ${gap} ms after a { times: 1 } route expires`, async ({ page }) => {
    await page.goto(origin);

    await page.route('**/api', route => route.fulfill({ body: 'first' }), { times: 1 });
    expect(await page.evaluate(fetchApi)).toBe('first');

    if (gap)
      await page.waitForTimeout(gap);

    await page.route('**/api', route => route.fulfill({ body: 'second' }));
    expect(await page.evaluate(fetchApi), 'the second route never intercepted the request').toBe('second');
  });
}
