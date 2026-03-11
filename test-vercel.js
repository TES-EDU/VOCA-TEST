import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.error(`[Browser Error] ${error.message}`));

    try {
        await page.goto('https://voca-test-eight.vercel.app', { waitUntil: 'networkidle' });
        console.log('[Script] Page loaded.');
        await page.waitForTimeout(2000); // Give it a moment to render or crash
    } catch (e) {
        console.error(`[Script Error] ${e}`);
    } finally {
        await browser.close();
    }
})();
