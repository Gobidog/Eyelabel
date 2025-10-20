const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  const consoleMessages = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`[${msg.type()}]`, text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  try {
    // Step 1: Login
    console.log('=== Step 1: Logging in ===');
    await page.goto('http://192.168.50.61:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@eyelighting.com.au');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Navigate to label editor
    console.log('=== Step 2: Navigating to label editor ===');
    await page.goto('http://192.168.50.61:3000/labels/create', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/tmp/test-step1-blank-editor.png' });
    console.log('Screenshot: /tmp/test-step1-blank-editor.png');

    // Step 3: Select template (click on the Select dropdown)
    console.log('=== Step 3: Selecting template ===');
    const templateSelects = await page.$$('div[role="button"]');
    if (templateSelects.length >= 2) {
      await templateSelects[1].click(); // Second dropdown is Template
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Click first template in the list (not "Blank Canvas")
      await page.evaluate(() => {
        const menuItems = Array.from(document.querySelectorAll('[role="option"]'));
        const firstTemplate = menuItems.find(item => item.textContent && item.textContent.trim() !== 'Blank Canvas' && item.textContent.trim() !== '');
        if (firstTemplate) firstTemplate.click();
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: '/tmp/test-step2-template-loaded.png' });
      console.log('Screenshot: /tmp/test-step2-template-loaded.png');
    }

    // Step 4: Select product
    console.log('=== Step 4: Selecting product ===');
    const productSelects = await page.$$('div[role="button"]');
    if (productSelects.length >= 1) {
      await productSelects[0].click(); // First dropdown is Product
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Click first product in the list
      await page.evaluate(() => {
        const menuItems = Array.from(document.querySelectorAll('[role="option"]'));
        const firstProduct = menuItems.find(item => item.textContent && item.textContent.trim() !== 'Select Product' && item.textContent.trim() !== '');
        if (firstProduct) firstProduct.click();
      });
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: '/tmp/test-step3-product-populated.png', fullPage: true });
    console.log('Screenshot: /tmp/test-step3-product-populated.png');

    // Check if population console log appeared
    const populationLog = consoleMessages.find(msg => msg.includes('Populating template with product:'));
    console.log('\n=== Verification ===');
    console.log('Product population triggered:', !!populationLog);
    if (populationLog) {
      console.log('Population log:', populationLog);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
