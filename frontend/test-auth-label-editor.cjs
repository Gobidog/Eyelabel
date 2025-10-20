const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  const page = await browser.newPage();

  // Disable cache
  await page.setCacheEnabled(false);

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
    // Step 1: Login
    console.log('=== Step 1: Logging in ===');
    await page.goto('http://192.168.50.61:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: '/tmp/step1-login-page.png' });
    console.log('Screenshot: /tmp/step1-login-page.png');

    // Fill in login form (MUI TextFields)
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@eyelighting.com.au');
    await page.type('input[type="password"]', 'admin123');

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/tmp/step2-after-login.png' });
    console.log('Screenshot: /tmp/step2-after-login.png');

    // Step 2: Navigate to label editor
    console.log('=== Step 2: Navigating to label editor ===');
    await page.goto('http://192.168.50.61:3000/labels/create', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/tmp/step3-label-editor.png', fullPage: true });
    console.log('Screenshot: /tmp/step3-label-editor.png');

    // Check page content
    const content = await page.content();
    console.log('\n=== Verification ===');
    console.log('Has root div:', content.includes('<div id="root">'));
    console.log('Current URL:', page.url());

    // Try to find key elements
    const hasEmailField = await page.$('input[type="email"]');
    const isOnLoginPage = hasEmailField !== null;
    console.log('On login page:', isOnLoginPage);
    console.log('Successfully navigated to label editor:', !isOnLoginPage);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
