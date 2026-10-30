const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>(errors.push(e.message),console.log('PAGE ERROR',e.message)));await p.route('**/*',r=>r.request().url().startsWith('http://localhost:4173/')?r.fallback():r.fulfill({body:'',contentType:'application/javascript'}));await p.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:'export function createClient(){return {auth:{onAuthStateChange(){},getSession:async()=>({error:null})}}}'}));await p.route('http://localhost:4173/**',async r=>{const fs=require('node:fs'),path=require('node:path');let file=path.join(require('node:path').resolve(__dirname,'..'),new URL(r.request().url()).pathname);if(file.endsWith('/'))file+='index.html';try{await r.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.html')?'text/html':/\.(mjs|js)$/.test(file)?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'application/octet-stream'});}catch{await r.fulfill({status:404,body:''});}});await p.addInitScript(()=>{window.pickerTicks=0;const A=window.AudioContext;if(A){const original=A.prototype.createOscillator;A.prototype.createOscillator=function(){window.pickerTicks++;return original.call(this);};}});await p.goto('http://localhost:4173/classroom/',{waitUntil:'domcontentloaded'});
await p.locator('#room').waitFor();
await p.locator('.upcoming-panel summary').click();
await p.locator('#public-calendar-settings').click();
await p.getByLabel('Calendar name',{exact:true}).fill('School dates');
await p.getByLabel('Public calendar link',{exact:true}).fill('https://evil.example/calendar/embed?src=school');
await p.getByRole('button',{name:'Save calendar',exact:true}).click();
assert.match(await p.locator('.public-calendar-dialog [role=status]').textContent(),/public Google/);
await p.getByLabel('Public calendar link',{exact:true}).fill('https://calendar.google.com/calendar/embed?src=school%40group.calendar.google.com');
await p.getByRole('button',{name:'Save calendar',exact:true}).click();
assert.equal(await p.locator('.upcoming-calendar iframe').count(),1);
assert.match(await p.locator('.upcoming-calendar iframe').getAttribute('src'),/mode=AGENDA/);
await p.reload();await p.locator('#room').waitFor();await p.locator('.upcoming-panel summary').click();
assert.equal(await p.locator('.upcoming-calendar-heading strong').textContent(),'School dates');
for(const width of [1280,390,320]){await p.setViewportSize({width,height:850});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`/tmp/upcoming-${width}.png`});}
await p.locator('#public-calendar-settings').click();await p.getByRole('button',{name:'Disconnect',exact:true}).click();assert.equal(await p.locator('.upcoming-calendar iframe').count(),0);
await p.locator('.upcoming-panel summary').click();await p.locator('#room-tools-open').click();await p.locator('#birthdays-open').click();assert.equal(await p.locator('.birthday-directory .birthday-countdown').count(),1);
assert.deepEqual(errors,[]);await b.close();console.log('Upcoming browser checks passed');})().catch(e=>{console.error(e);process.exit(1)});
