const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  const home=process.env.SITE_URL || 'http://localhost:4173/';
  const logo=()=>page.locator('[data-achievement-logo]').first();
  const open=async()=>{await page.goto(home);await logo().waitFor();};
  await open();await logo().click();assert.equal(await page.locator('.achievement-burst').count(),1);assert.equal(page.url().split('#')[0],home);
  const box=await logo().boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(200);await page.mouse.up();await page.waitForTimeout(1300);assert.equal(page.url().split('#')[0],home,'Early release should cancel');
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width+40,box.y+box.height);await page.waitForTimeout(1300);await page.mouse.up();assert.equal(page.url().split('#')[0],home,'Dragging should cancel');
  await logo().focus();await page.keyboard.press('Space');await page.waitForTimeout(1300);assert.equal(page.url().split('#')[0],home,'Short keyboard press should cancel');
  await logo().focus();const start=Date.now();await page.keyboard.down('Space');await page.waitForURL('**/classroom/');assert.ok(Date.now()-start<3000,'Hold opens within three seconds');await page.keyboard.up('Space');
  await open();const pointerBox=await logo().boundingBox();await page.mouse.move(pointerBox.x+pointerBox.width/2,pointerBox.y+pointerBox.height/2);const pointerStart=Date.now();await page.mouse.down();await page.waitForURL('**/classroom/');assert.ok(Date.now()-pointerStart<3000);await page.mouse.up();
  await open();await logo().dispatchEvent('pointerdown',{pointerId:42,pointerType:'touch',isPrimary:true,button:0,clientX:10,clientY:10});await logo().dispatchEvent('pointercancel',{pointerId:42,pointerType:'touch',isPrimary:true});await page.waitForTimeout(1300);assert.equal(page.url().split('#')[0],home,'Touch cancellation should stop navigation');
  await logo().dispatchEvent('pointerdown',{pointerId:43,pointerType:'touch',isPrimary:true,button:0,clientX:10,clientY:10});await page.waitForURL('**/classroom/');
  console.log('Logo shortcut checks passed: normal click, early release, drag cancellation, short keyboard press, keyboard hold, mouse hold, touch cancellation, touch hold; navigation under three seconds.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
