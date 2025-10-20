const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto('http://192.168.50.61:3000/label-editor');
  await page.waitForTimeout(1000);
  
  await page.fill('input[type="email"]', 'admin@eyelighting.com.au');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(2000);

  console.log('Step 1: Taking initial screenshot of label editor...');
  await page.screenshot({ path: '/tmp/label_editor_initial.png', fullPage: true });
  console.log('Initial screenshot saved');

  console.log('\nStep 2: Selecting product...');
  const selects = await page.locator('select').all();
  console.log('Found ' + selects.length + ' select elements');
  
  if (selects.length >= 1) {
    const productSelect = selects[0];
    const options = await productSelect.locator('option').all();
    console.log('Product options count: ' + options.length);
    
    if (options.length > 1) {
      await productSelect.selectOption({ index: 1 });
      console.log('Product selected');
      await page.waitForTimeout(1000);
    }
  }

  console.log('\nStep 3: Selecting template...');
  const selects2 = await page.locator('select').all();
  if (selects2.length >= 2) {
    const templateSelect = selects2[1];
    const templateOptions = await templateSelect.locator('option').all();
    console.log('Template options count: ' + templateOptions.length);
    
    for (let i = 0; i < templateOptions.length; i++) {
      const text = await templateOptions[i].textContent();
      console.log('Template option ' + i + ': ' + text);
      if (text.includes('Carton Label with Selectable Options')) {
        await templateSelect.selectOption({ index: i });
        console.log('Template "Carton Label with Selectable Options" selected');
        break;
      }
    }
  }

  console.log('\nStep 4: Waiting 2 seconds for template to load...');
  await page.waitForTimeout(2000);

  console.log('Taking final screenshot...');
  await page.screenshot({ path: '/tmp/label_editor_with_template.png', fullPage: true });
  console.log('Template screenshot saved to /tmp/label_editor_with_template.png');

  console.log('\nStep 5: Analyzing canvas content...');
  const canvas = await page.locator('canvas');
  const canvasCount = await canvas.count();
  console.log('Canvas elements found: ' + canvasCount);
  
  if (canvasCount > 0) {
    const canvasElement = canvas.first();
    const bbox = await canvasElement.boundingBox();
    if (bbox) {
      console.log('Canvas size: ' + bbox.width + 'x' + bbox.height);
    }
  }

  const pageContent = await page.content();
  const hasCanvas = pageContent.includes('<canvas');
  console.log('Page contains canvas element: ' + hasCanvas);

  await browser.close();
  console.log('\nTest completed successfully!');
})();
