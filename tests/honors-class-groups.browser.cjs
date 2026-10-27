const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Substitute only PDF decoding; exercise the real parser, React UI and certificate generator.
    const pages = ['Student: Alpha, Amy  School: SAS  Grade: 3  Teacher: Ms. East  School Year: 2026-2027  Math  A', '', 'Student: Beta, Ben  School: SAS  Grade: 5  Teacher: Mr. West  School Year: 2026-2027  Math  A', ''];
    await page.route('**/assets/index-CzOoK3C1.js*', route => {
      const source = fs.readFileSync('assets/index-CzOoK3C1.js', 'utf8');
      const start = source.indexOf('async function parsePDFByPage(');
      const end = source.indexOf('function readTextFile(', start);
      return route.fulfill({ contentType: 'application/javascript', body: source.slice(0, start) + `async function parsePDFByPage(){return ${JSON.stringify(pages)}}` + source.slice(end) });
    });
    await page.goto('http://localhost:4173/?tab=honors');
    await page.getByTestId('input-honors-file-upload').setInputFiles({name:'mixed-grades.pdf',mimeType:'application/pdf',buffer:Buffer.from('fixture')});
    const groups = page.getByTestId('honors-class-group');
    await groups.nth(1).waitFor();
    assert.equal(await groups.count(), 2);
    assert.match(await groups.nth(0).textContent(), /Grade 3 · Ms. East/);
    assert.equal(await groups.nth(1).getByTestId('input-teacher-name').inputValue(), 'Mr. West');
    await groups.nth(0).getByTestId('input-teacher-name').fill('Ms. Updated');
    await groups.nth(0).locator('summary').click();
    await groups.nth(0).getByTestId('input-teacher-name').waitFor({state:'hidden'});
    assert.equal(await groups.nth(1).getByTestId('input-teacher-name').isVisible(), true);
    await groups.nth(0).locator('summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await groups.nth(0).getByTestId('input-teacher-name').inputValue(), 'Ms. Updated');
    assert.equal(await groups.nth(0).getByTestId('input-teacher-name').isVisible(), true);
    await page.evaluate(() => { window.open = url => { window.certificateOutput = fetch(url).then(response => response.text()); return {addEventListener(){}}; }; });
    await groups.nth(0).getByTestId('button-honors-print-certificates').click();
    await page.waitForFunction(() => !!window.certificateOutput);
    const output = await page.evaluate(() => window.certificateOutput);
    assert.match(output, /Amy Alpha/);
    assert.match(output, /Ms. Updated/);
    assert.doesNotMatch(output, /Ben Beta|Mr. West/);
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await groups.nth(1).getByTestId('button-honors-reset').click();
    await page.getByTestId('input-honors-file-upload').waitFor({state:'attached'});
    assert.deepEqual(errors, []);
    console.log('Grouped results, independent teacher editing, isolated certificate printing, mobile layout and reset passed.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exit(1);});
