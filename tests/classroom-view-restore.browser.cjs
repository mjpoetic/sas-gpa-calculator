const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const p=await browser.newPage({viewport});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:'export function createClient(){return {auth:{onAuthStateChange(cb){setTimeout(()=>cb("INITIAL_SESSION",null),0)},getSession:async()=>({error:null})}}}'}));
 await p.goto((process.env.SAS_TEST_ORIGIN||'http://localhost:4173')+'/classroom/');await p.locator('.seat').first().waitFor({state:'attached',timeout:10000}).catch(e=>{throw new Error(JSON.stringify({viewport,errors})+' '+e.message);});
 for(let i=0;i<7;i++)await p.locator('#canvas-zoom-in').click();
 await p.locator('#dock-students').click();await p.locator('#jobs-tab').click();
 await p.locator('#jobs-week').fill('2026-10-12');await p.locator('#jobs-week').dispatchEvent('change');
 await p.evaluate(()=>{const s=document.querySelector('.room-scroll');s.scrollLeft=140;s.scrollTop=110;});
 const before=await p.evaluate(()=>({zoom:document.getElementById('zoom').value,left:document.querySelector('.room-scroll').scrollLeft,top:document.querySelector('.room-scroll').scrollTop}));
 await p.locator('#workspace-settings').click();await p.reload();await p.waitForTimeout(500);
 assert.equal(await p.locator('#settings-dialog').evaluate(d=>d.open),true);
 assert.equal(await p.locator('#jobs-tab').getAttribute('aria-selected'),'true');
 assert.equal(await p.locator('#jobs-week').inputValue(),'2026-10-12');
 assert.equal(await p.locator('#zoom').inputValue(),before.zoom);
 assert.equal(await p.locator('#canvas-pan').getAttribute('aria-pressed'),'true');
 const after=await p.locator('.room-scroll').evaluate(s=>({left:s.scrollLeft,top:s.scrollTop}));
 assert.ok(Math.abs(after.left-before.left)<2,JSON.stringify({before,after}));assert.ok(Math.abs(after.top-before.top)<2,JSON.stringify({before,after}));
 await p.getByRole('button',{name:'Close Classroom settings',exact:true}).click();
 await p.locator('#workspace-library .workspace-panel-close').click();await p.locator('#canvas-zoom-level').click();await p.locator('.seat').first().click();await p.reload();await p.waitForTimeout(400);
 assert.equal(await p.locator('.selected-seat').count(),1);assert.equal(await p.locator('#workspace-inspector').isVisible(),true);
 assert.deepEqual(errors,[]);await p.close();
 }
 console.log('Desktop/mobile refresh restores tools, week, dialog, zoom, pan, viewport, and seat selection.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
