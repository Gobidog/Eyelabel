const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}]`, msg.text());
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  // Capture request failures
  page.on('requestfailed', request => {
    console.log('[REQUEST FAILED]', request.url(), request.failure().errorText);
  });

  try {
    console.log('Navigating to http://192.168.50.61:3000/labels/create');
    await page.goto('http://192.168.50.61:3000/labels/create', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    // Wait a bit for React to mount
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot
    await page.screenshot({ path: '/tmp/label-editor-screenshot.png' });
    console.log('Screenshot saved to /tmp/label-editor-screenshot.png');

    // Get page content
    const content = await page.content();
    console.log('\n=== Page has root div:', content.includes('<div id="root">'));

  } catch (error) {
    console.error('Navigation error:', error.message);
  } finally {
    await browser.close();
  }
})();
