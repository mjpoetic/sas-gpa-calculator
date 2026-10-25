const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage();await page.goto(process.env.CLASSROOM_URL||'http://127.0.0.1:4173/classroom/');
  const result=await page.evaluate(async()=>{
   const {avatarSVG,defaultAvatar,avatarOptions}=await import('/classroom/avatars.mjs');
   const pixels=async svg=>{const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=240;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,240,240);return ctx;};
   let comparisons=0;const failures=[],gaps=[];
   for(const hair of ['braids','boxbraids']){
    const svg=avatarSVG({...defaultAvatar(),hair});const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
    const rear=doc.querySelector('[data-avatar-layer="rear-hair"]').outerHTML;
    const context=await pixels(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${rear}</svg>`);
    const row=context.getImageData(50,150,140,1).data;let open=0,covered=0;for(let i=3;i<row.length;i+=4){if(row[i]<120)open++;if(row[i]>230)covered++;}gaps.push({hair,open,covered});
    for(const [bodyBuild] of avatarOptions.bodyBuild)for(const [bodyHeight] of avatarOptions.bodyHeight)for(const [style] of avatarOptions.style){
     const avatar={...defaultAvatar(),hair,bodyBuild,bodyHeight,style,clothing:'tee',clothingColor:'#4c95b9'};
     const base=(await pixels(avatarSVG(avatar))).getImageData(0,0,240,240).data;
     for(const braidDecoration of ['beads','cuffs'])for(const braidDecorationCoverage of ['few','more','all']){
      const decorated=(await pixels(avatarSVG({...avatar,braidDecoration,braidDecorationCoverage,braidDecorationColor:'#ff00ff'}))).getImageData(0,0,240,240).data;
      for(let i=0;i<base.length;i+=4)if(base[i]===76&&base[i+1]===149&&base[i+2]===185&&[0,1,2].some(k=>base[i+k]!==decorated[i+k])){failures.push({hair,bodyBuild,bodyHeight,style,braidDecoration});break;}
      comparisons++;
     }
    }
   }return {comparisons,failures,gaps};
  });
  assert.deepEqual(result.failures,[],'Decorations must not paint over clothing hiding rear strands');
  for(const gap of result.gaps){assert.ok(gap.open>5,`${gap.hair} has visible gaps`);assert.ok(gap.covered>70,`${gap.hair} keeps full rear coverage`);}
  console.log(`Braid layering passed: ${result.comparisons} decoration/body/head combinations and narrow gaps in both braid styles.`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
