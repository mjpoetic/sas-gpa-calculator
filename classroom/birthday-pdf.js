// PDF.js runs on the device, using the bundled worker rather than a hosted API.
export async function birthdayPDFText(file){
 if(file.size>10*1024*1024)throw new Error('Choose a PDF smaller than 10 MB.');
 const pdfjs=await import('./vendor/pdfjs/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useSystemFonts:true});
 let passwordProtected=false;task.onPassword=()=>{passwordProtected=true;task.destroy();};let pdf;
 try{pdf=await task.promise;if(pdf.numPages>30)throw new Error('Use a birthday report of 30 pages or fewer.');const lines=[];for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
  const page=await pdf.getPage(pageNumber),content=await page.getTextContent(),rows=[];
  for(const item of content.items){if(!item.str?.trim())continue;const y=item.transform[5],row=rows.find(r=>Math.abs(r.y-y)<2.5);if(row)row.items.push(item);else rows.push({y,items:[item]});}
  for(const row of rows.sort((a,b)=>b.y-a.y))lines.push(row.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(item=>item.str).join(' '));page.cleanup();
 }const text=lines.join('\n');if(text.length>200000)throw new Error('This report is too large. Export a smaller student group.');if(!text.trim())throw new Error('This PDF has no readable text. Export CSV or copy the report text instead.');return text;
 }catch(error){if(passwordProtected)throw new Error('Export an unprotected PDF or CSV; this report requires a password.');throw error;}finally{await task.destroy();}
}
