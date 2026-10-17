const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const p=await browser.newPage({viewport:{width:1400,height:950}}),errors=[];
 p.on('pageerror',e=>{errors.push(e.message);console.error('Page error:',e.message);});p.on('dialog',d=>d.accept());
 await p.route('https://esm.sh/**',r=>r.fulfill({contentType:'application/javascript',body:'export function createClient(){return {auth:{onAuthStateChange(cb){setTimeout(()=>cb("INITIAL_SESSION",null),0)},getSession:async()=>({error:null})}}}'}));
 await p.goto(process.env.CLASSROOM_URL||'http://127.0.0.1:4173/classroom/');await p.locator('.seat').first().waitFor();
 if(!await p.locator('#teacher-avatar-edit').isVisible())await p.locator('#dock-students').click();await p.locator('#teacher-avatar-edit').click();
 assert.equal(await p.locator('.avatar-heading h2').textContent(),'Create your teacher avatar');
 await p.locator('.teacher-avatar-name').fill('Mr. Rivera');
 const choose=(part,value)=>p.locator(`.avatar-choice[data-part="${part}"][data-value="${value}"]`),field=key=>p.locator(`[data-color-for="${key}"]`);
 assert.equal(await field('facialHairColor').isVisible(),false);
 await choose('facialHair','beard').click();await field('facialHairColor').waitFor({state:'visible'});await choose('facialHairColor','#65402c').click();await choose('wrinkles','defined').click();await choose('lipstick','soft').click();await field('lipstickColor').waitFor({state:'visible'});await choose('lipstickColor','#982c40').click();
 await p.getByRole('tab',{name:'Extras',exact:true}).click();await choose('drink','coffee').click();await field('drinkColor').waitFor({state:'visible'});await choose('drinkColor','#4c95b9').click();
 await p.screenshot({path:'/tmp/teacher-avatar-editor.png'});await p.locator('.avatar-save').click();
 const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('sas-classroom-studio-v1'))),active=s=>s.charts.find(c=>c.id===s.active);
 let c=active(await state());assert.equal(c.teacher.name,'Mr. Rivera');assert.equal(c.teacher.avatar.drink,'coffee');assert.equal(c.teacher.seatId,null);assert.equal(c.students.length,0);
 await p.locator('.avatar-editor').waitFor({state:'hidden'});await p.locator('#teacher-avatar-card').scrollIntoViewIfNeeded();await p.waitForTimeout(300);const source=await p.locator('#teacher-avatar-card').boundingBox(),target=await p.locator('.item.teacher').boundingBox();
 await p.mouse.move(source.x+source.width/2,source.y+source.height/2);await p.mouse.down();await p.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:16});await p.mouse.up();
 await p.locator('.teacher-seat-avatar').waitFor();c=active(await state());assert.equal(c.teacher.seatId,c.items.find(it=>it.type==='teacher').id);assert.equal(c.students.length,0);
 await p.locator('#undo').click();assert.equal(active(await state()).teacher.seatId,null);await p.locator('#redo').click();await p.locator('.teacher-seat-avatar').waitFor();
 await p.screenshot({path:'/tmp/teacher-avatar-seated.png'});await p.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.equal(await p.locator('#chart-print-sheet .teacher-seat-avatar svg').count(),1);await p.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await p.reload();await p.locator('.teacher-seat-avatar').waitFor();assert.equal(active(await state()).teacher.avatar.wrinkles,'defined');
 if(!await p.locator('#teacher-avatar-edit').isVisible())await p.locator('#dock-students').click();await p.getByRole('button',{name:'My seat',exact:true}).click();await p.getByRole('option',{name:'Not placed in room',exact:true}).click();assert.equal(await p.locator('.teacher-seat-avatar').count(),0);
 c=active(await state());const deskId=c.items.find(it=>it.type==='teacher').id;await p.getByRole('button',{name:'My seat',exact:true}).focus();await p.keyboard.press('ArrowDown');await p.keyboard.press('Home');await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');assert.equal(active(await state()).teacher.seatId,deskId);
 // Student creation still uses the original editor and has no adult controls.
 await p.locator('#roster-add-open').click();await p.locator('#student-names').fill('Alex Smith');await p.locator('#add-students button').click();await p.locator('.student-menu').first().click();await p.getByRole('button',{name:'Edit avatar for Alex S.',exact:true}).click();assert.equal(await choose('facialHair','beard').count(),0);await p.locator('.avatar-cancel').click();
 await p.locator('#teacher-avatar-edit').click();await p.setViewportSize({width:390,height:844});await p.getByRole('tab',{name:'Face',exact:true}).click();await choose('facialHair','none').click();await field('facialHairColor').waitFor({state:'hidden'});await p.getByRole('tab',{name:'Extras',exact:true}).click();await choose('drink','tumbler').click();await p.screenshot({path:'/tmp/teacher-avatar-mobile.png'});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('.avatar-save').click();
 await p.reload();await p.locator('.teacher-seat-avatar').waitFor();assert.equal(active(await state()).teacher.avatar.drink,'tumbler');await p.setViewportSize({width:1400,height:950});await p.locator('#copy-chart').dispatchEvent('click');let copied=active(await state());assert.notEqual(copied.teacher.seatId,deskId);assert.equal(copied.teacher.seatId,copied.items.find(it=>it.type==='teacher').id);await p.locator('#new-chart').dispatchEvent('click');assert.equal(active(await state()).teacher.name,'Mr. Rivera');assert.equal(active(await state()).teacher.seatId,null);assert.deepEqual(errors,[]);
 console.log('Teacher avatar browser checks passed: adult controls, conditional colors, drag, undo/redo, dropdown placement, reload, student isolation and mobile editor.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
