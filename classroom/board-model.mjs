export const BOARD_COLORS=['#f3f6fa','#e4edf1','#20384b','#f6eddf','#e5eee4'];
export const NOTE_COLORS=['#fff1bb','#ffffff','#dceefb','#e1f0de','#f8e1e9','#eee4fa'];
export function newNote(id,index=0){return {id,title:'',text:'',x:40+(index%5)*28,y:40+(index%5)*28,width:440,height:300,color:NOTE_COLORS[0],ink:'#20354e',fontSize:28,align:'left',locked:false,hidden:false};}
export function validateBoard(board,id){
 const fail=()=>{throw new Error('Invalid classroom board in backup.');};
 if(!board||!BOARD_COLORS.includes(board.color)||!Array.isArray(board.notes)||board.notes.length>100)fail();
 const number=(v,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)fail();return v;};
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)fail();return v;};
 return {color:board.color,notes:board.notes.map(n=>{
  if(!n||!NOTE_COLORS.includes(n.color)||!/^#[0-9a-f]{6}$/i.test(n.ink)||!['left','center','right'].includes(n.align)||typeof n.locked!=='boolean'||typeof n.hidden!=='boolean')fail();
  const width=number(n.width,220,1200),height=number(n.height,140,800);
  return {id:id(n.id),title:text(n.title,120),text:text(n.text,12000),x:number(n.x,0,1600-width),y:number(n.y,0,900-height),width,height,color:n.color,ink:n.ink,fontSize:number(n.fontSize,16,64),align:n.align,locked:n.locked,hidden:n.hidden};
 })};
}
