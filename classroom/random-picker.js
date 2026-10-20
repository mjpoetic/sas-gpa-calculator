import {pickerRound} from './picker-round.mjs?v=20261020-picker2';
import {avatarSVG,defaultAvatar} from './avatars.mjs?v=20261019-release9';
import {rosterName} from './student-names.mjs?v=20261019-release9';

export function setupRandomPicker(getChart) {
  const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const launch=make('button','random-picker-launch');
  launch.id='random-picker-open';launch.type='button';launch.setAttribute('aria-label','Pick a random student');launch.title='Pick a random student with a big avatar reveal';
  launch.innerHTML='<svg class="button-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01" stroke-linecap="round"/></svg><span>Pick a name</span>';
  document.getElementById('shuffle').before(launch);
  const dialog=make('dialog','workspace-dialog random-picker');dialog.id='random-picker-dialog';dialog.setAttribute('aria-labelledby','random-picker-title');
  const header=make('header','random-picker-header'),title=make('h2','','Random student');title.id='random-picker-title';
  const close=make('button','','×');close.type='button';close.setAttribute('aria-label','Close random student picker');header.append(title,close);
  const classroom=make('p','hint random-picker-classroom');
  const stage=make('div','random-picker-stage'),portrait=make('div','random-picker-avatar');portrait.id='random-picker-avatar';portrait.setAttribute('aria-hidden','true');
  const name=make('div','random-picker-name','Who will it be?');name.id='random-picker-name';
  const status=make('p','hint random-picker-status');status.id='random-picker-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  stage.append(portrait,name);
  const content=make('div','random-picker-content'),chosenPanel=make('aside','random-picker-chosen');chosenPanel.id='random-picker-chosen';chosenPanel.setAttribute('aria-labelledby','random-picker-chosen-title');
  const chosenTitle=make('h3','','Already chosen');chosenTitle.id='random-picker-chosen-title';
  const chosenList=make('ol'),chosenEmpty=make('p','hint','No students chosen yet this round.');chosenList.id='random-picker-chosen-list';chosenPanel.append(chosenTitle,chosenList,chosenEmpty);content.append(stage,chosenPanel);
  const controls=make('div','random-picker-controls'),soundLabel=make('label','check'),sound=make('input');sound.type='checkbox';sound.id='random-picker-sound';sound.checked=true;
  try{sound.checked=localStorage.getItem('sas-classroom-picker-sound')!=='off';}catch{}
  soundLabel.append(sound,document.createTextNode('Ticking sound'));
  const pick=make('button','primary','Pick a student');pick.id='random-picker-pick';pick.type='button';controls.append(soundLabel,pick);
  const showLabel=make('label','check'),showChosen=make('input');showChosen.type='checkbox';showChosen.id='random-picker-show-chosen';showChosen.checked=true;
  try{showChosen.checked=localStorage.getItem('sas-classroom-picker-show-chosen')!=='off';}catch{}
  showLabel.append(showChosen,document.createTextNode('Show chosen students'));controls.insertBefore(showLabel,pick);
  dialog.append(header,classroom,content,status,controls);document.body.append(dialog);
  let timer,audio,busy=false,run=0;
  const rounds=new Map(),roundKey=id=>'sas-classroom-picker-round-'+id;
  function seenIds(c){
    let seen=rounds.get(c.id)||[];
    try{const saved=localStorage.getItem(roundKey(c.id));if(saved!==null)seen=JSON.parse(saved);}catch{}
    return Array.isArray(seen)?[...new Set(seen)].filter(id=>c.students.some(s=>s.id===id)):[];
  }
  function round(c){return pickerRound(c.students,seenIds(c));}
  function renderChosen(c){
    chosenPanel.hidden=!showChosen.checked;content.classList.toggle('show-chosen',showChosen.checked);
    const ids=seenIds(c);chosenList.replaceChildren(...ids.map(id=>make('li','',rosterName(c.students.find(s=>s.id===id)))));chosenEmpty.hidden=!!ids.length;
    chosenTitle.textContent=`Already chosen (${ids.length})`;
  }
  showChosen.onchange=()=>{try{localStorage.setItem('sas-classroom-picker-show-chosen',showChosen.checked?'on':'off');}catch{}renderChosen(getChart());};
  function remember(c,id){
    const {picked}=round(c),seen=[...new Set([...picked,id])];rounds.set(c.id,seen);
    try{localStorage.setItem(roundKey(c.id),JSON.stringify(seen));}catch{}
    return c.students.filter(s=>!seen.includes(s.id)).length;
  }
  const placeholder=()=>{portrait.innerHTML=avatarSVG(defaultAvatar());};
  function paint(student){portrait.innerHTML=avatarSVG(student.avatar||defaultAvatar());name.textContent=rosterName(student);}
  function stop(){run++;clearTimeout(timer);busy=false;dialog.classList.remove('is-spinning');stage.removeAttribute('aria-busy');if(audio){void audio.close().catch(()=>{});audio=null;}}
  function tone(final=false){
    if(!sound.checked||!audio||audio.state!=='running')return;
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.type='triangle';oscillator.frequency.setValueAtTime(final?880:620,now);
    oscillator.frequency.exponentialRampToValueAtTime(final?660:180,now+(final?.16:.025));
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.09,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+(final?.28:.04));
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+(final?.3:.045));
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  function enableAudio(){
    if(!sound.checked)return;
    try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;if(!audio)audio=new Context();void audio.resume().catch(()=>{});}catch{/* Picking still works when audio is unavailable. */}
  }
  sound.onchange=()=>{try{localStorage.setItem('sas-classroom-picker-sound',sound.checked?'on':'off');}catch{}if(sound.checked)enableAudio();};
  launch.onclick=()=>{
    stop();const c=getChart();classroom.textContent=c.name;renderChosen(c);
    name.textContent=c.students.length?'Who will it be?':'Add students to get started';placeholder();
    status.textContent=c.students.length?`${round(c).remaining.length} of ${c.students.length} students left this round · No repeats until everyone has a turn.`:'Open People → Students to add your classroom roster.';
    pick.textContent='Pick a student';pick.disabled=!c.students.length;dialog.showModal();
  };
  pick.onclick=()=>{
    if(busy)return;
    const owner=getChart(),students=structuredClone(round(owner).remaining);if(!students.length)return;
    stop();busy=true;const token=run,winner=students[Math.floor(Math.random()*students.length)];
    enableAudio();pick.disabled=true;pick.textContent='Choosing…';status.textContent='Choosing a student…';stage.setAttribute('aria-busy','true');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,total=reduced?4:25;
    if(!reduced)dialog.classList.add('is-spinning');
    let step=0,last=-1;
    function tick(){
      if(token!==run||!dialog.open)return;
      if(step===total){const left=remember(owner,winner.id);renderChosen(owner);paint(winner);tone(true);busy=false;stage.removeAttribute('aria-busy');dialog.classList.remove('is-spinning');dialog.classList.add('has-winner');status.textContent=`Chosen: ${rosterName(winner)} · ${left?`${left} left this round.`:"Everyone has had a turn. The next pick starts a new round."}`;pick.textContent='Pick again';pick.disabled=false;return;}
      if(!reduced){let index=Math.floor(Math.random()*students.length);if(students.length>1&&index===last)index=(index+1)%students.length;last=index;paint(students[index]);}
      tone();step++;timer=setTimeout(tick,reduced?160:55+Math.pow(step/total,3)*280);
    }
    dialog.classList.remove('has-winner');tick();
  };
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{stop();dialog.classList.remove('has-winner');launch.focus();});
  dialog.addEventListener('cancel',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&busy){stop();name.textContent='Pick paused';status.textContent='Ready when you are.';pick.textContent='Pick a student';pick.disabled=false;}});
}
