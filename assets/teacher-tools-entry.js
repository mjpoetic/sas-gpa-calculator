// Attach to the calculator header after its app has rendered.
function attachTeacherTools(){
 const host=document.querySelector('#root header > div');
 if(!host||host.querySelector('.teacher-tools-entry'))return;
 host.dataset.teacherToolsNavigation='';
 const link=document.createElement('a');link.className='teacher-tools-entry';link.href=new URL('./teacher-tools/',document.baseURI).href;
 link.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v12H4ZM8 21l4-4 4 4M8 9h8m-8 4h5"/></svg><span>Teacher Tools</span>';
 host.insertBefore(link,host.children[1]||null);
}
new MutationObserver(attachTeacherTools).observe(document.getElementById('root'),{childList:true,subtree:true});
attachTeacherTools();
