/**
 * Captures the README screenshots into docs/screenshots/.
 *
 * Usage:  npm run screenshots
 *
 * The script serves the production build with `vite preview` and drives an installed
 * Microsoft Edge or Google Chrome through playwright-core, so no browser download is needed.
 * Set SCREENSHOT_BROWSER=chrome to use Chrome instead of Edge.
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { preview } from 'vite';

const OUT_DIR = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/** Waits until the page is idle, every image in the viewport has loaded and chart animations have settled. */
async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(
    () =>
      [...document.images].every((img) => {
        const rect = img.getBoundingClientRect();
        const inViewport = rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
        // Lazy images below the fold are never requested, so only visible ones must be complete.
        return !inViewport || (img.complete && img.naturalWidth > 0);
      }),
    undefined,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(1200);
}

async function shot(page, name) {
  await settle(page);
  await page.screenshot({ path: `${OUT_DIR}${name}.png` });
  console.log(`  ✔ ${name}.png`);
}

async function newPage(browser, { mode = 'light', viewport = DESKTOP } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', colorScheme: mode, locale: 'en-US' });
  await context.addInitScript((colorMode) => {
    localStorage.setItem('newsroom-dashboard/color-mode', colorMode);
    localStorage.setItem('newsroom-dashboard/sidebar-collapsed', '0');
  }, mode);
  return context.newPage();
}

const server = await preview({ preview: { port: PORT, strictPort: true, open: false } });
const browser = await chromium.launch({ channel: process.env.SCREENSHOT_BROWSER === 'chrome' ? 'chrome' : 'msedge' });

try {
  await mkdir(OUT_DIR, { recursive: true });
  console.log('Capturing screenshots…');

  const page = await newPage(browser);

  await page.goto(`${BASE}/`);
  await page.getByRole('heading', { level: 1 }).waitFor();
  await shot(page, 'dashboard');

  // Pick a representative article from the persisted demo data.
  await page.waitForFunction(() => localStorage.getItem('newsroom-dashboard/state'));
  const articleId = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('newsroom-dashboard/state'));
    const withMedia = state.articles.filter((a) => a.featuredImageId && a.body.some((b) => b.type === 'quote'));
    return (withMedia.find((a) => a.status === 'in_review') ?? withMedia[0]).id;
  });

  await page.goto(`${BASE}/articles`);
  await page.locator('.MuiDataGrid-row').first().waitFor();
  await shot(page, 'articles');

  await page.goto(`${BASE}/sites/tech`);
  await page.locator('.MuiDataGrid-row').first().waitFor();
  await shot(page, 'sites');

  await page.goto(`${BASE}/publisher`);
  await page.getByText('Publishing schedule').waitFor();
  await shot(page, 'publisher');

  await page.goto(`${BASE}/publisher/articles/${articleId}`);
  await page.getByRole('textbox', { name: 'Headline' }).waitFor();
  await shot(page, 'editor');

  await page.getByRole('tab', { name: 'Preview' }).click();
  await shot(page, 'editor-preview');

  await page.getByRole('tab', { name: /SEO/ }).click();
  await shot(page, 'editor-seo');

  await page.goto(`${BASE}/media/photos`);
  await page.getByRole('button', { name: /^Open / }).first().waitFor();
  await shot(page, 'photos');

  await page.goto(`${BASE}/media/videos`);
  await page.getByRole('button', { name: /^Open / }).first().waitFor();
  await shot(page, 'videos');

  await page.goto(`${BASE}/profile`);
  await page.getByText('My publications').waitFor();
  await shot(page, 'profile');

  const dark = await newPage(browser, { mode: 'dark' });
  await dark.goto(`${BASE}/`);
  await dark.getByRole('heading', { level: 1 }).waitFor();
  await shot(dark, 'dashboard-dark');

  const mobile = await newPage(browser, { viewport: MOBILE });
  await mobile.goto(`${BASE}/`);
  await mobile.getByRole('heading', { level: 1 }).waitFor();
  await shot(mobile, 'mobile');

  console.log(`Done – saved to ${OUT_DIR}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
