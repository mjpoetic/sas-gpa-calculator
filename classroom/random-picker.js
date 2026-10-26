import {eligibleStudents} from './student-eligibility.mjs?v=20261020-exclusions1';
import {openStudentExclusions} from './student-exclusions.js?v=20261020-names1';
import {pickerRound} from './picker-round.mjs?v=20261020-picker2';
import {avatarSVG,defaultAvatar} from './avatars.mjs?v=20261025-release37';
import {seatName} from './student-names.mjs?v=20261025-release37';

export function setupRandomPicker(getChart,commit) {
  const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const launch=make('button','random-picker-launch');
  launch.id='random-picker-open';launch.type='button';launch.setAttribute('aria-label','Pick a random student');launch.title='Pick a random student with a big avatar reveal';
  launch.innerHTML='<svg class="button-glyph" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-12 12 12)"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="7.5" cy="7.5" r="1.8"/><circle cx="16.5" cy="7.5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/></g></g></svg><span>Pick a name</span>';
  document.getElementById('shuffle').before(launch);
  const dialog=make('dialog','workspace-dialog random-picker');dialog.id='random-picker-dialog';dialog.setAttribute('aria-labelledby','random-picker-title');
  const header=make('header','random-picker-header'),title=make('h2','','Random student');title.id='random-picker-title';
  const close=make('button','','×');close.type='button';close.setAttribute('aria-label','Close random student picker');header.append(title,close);
  const classroom=make('p','hint random-picker-classroom');
  const stage=make('div','random-picker-stage'),portrait=make('div','random-picker-avatar');portrait.id='random-picker-avatar';portrait.setAttribute('aria-hidden','true');
  const name=make('div','random-picker-name','Who will it be?');name.id='random-picker-name';
  const status=make('p','hint random-picker-status');status.id='random-picker-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const caption=make('p','random-picker-caption');caption.id='random-picker-caption';
  stage.append(portrait,caption,name);
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
  const reset=make('button','random-picker-reset','Reset round');reset.id='random-picker-reset';reset.type='button';reset.title='Clear chosen students and make everyone eligible again';controls.append(reset);
  const exclusions=make('button','','Excluded students');exclusions.id='random-picker-exclusions';exclusions.type='button';controls.append(exclusions);
  dialog.append(header,classroom,content,status,controls);document.body.append(dialog);
  let timer,audio,busy=false,run=0,finaleCount=0;
  const rounds=new Map(),roundKey=id=>'sas-classroom-picker-round-'+id;
  function seenIds(c){
    let seen=rounds.get(c.id)||[];
    try{const saved=localStorage.getItem(roundKey(c.id));if(saved!==null)seen=JSON.parse(saved);}catch{}
    return Array.isArray(seen)?[...new Set(seen)].filter(id=>c.students.some(s=>s.id===id)):[];
  }
  function round(c){return pickerRound(eligibleStudents(c,'picker'),seenIds(c));}
  function renderChosen(c){
    chosenPanel.hidden=!showChosen.checked;content.classList.toggle('show-chosen',showChosen.checked);
    const ids=seenIds(c);chosenList.replaceChildren(...ids.map(id=>make('li','',seatName(c.students.find(s=>s.id===id),c.students))));chosenEmpty.hidden=!!ids.length;
    chosenTitle.textContent=`Already chosen (${ids.length})`;reset.disabled=!ids.length;
  }
  showChosen.onchange=()=>{try{localStorage.setItem('sas-classroom-picker-show-chosen',showChosen.checked?'on':'off');}catch{}renderChosen(getChart());};
  function remember(c,id){
    const {picked}=round(c),seen=[...new Set([...picked,id])];rounds.set(c.id,seen);
    try{localStorage.setItem(roundKey(c.id),JSON.stringify(seen));}catch{}
    return eligibleStudents(c,'picker').filter(s=>!seen.includes(s.id)).length;
  }
  const placeholder=()=>{portrait.innerHTML=avatarSVG(defaultAvatar());};
  function paint(student){portrait.innerHTML=avatarSVG(student.avatar||defaultAvatar());name.textContent=seatName(student,getChart().students);}
  function stop(){run++;clearTimeout(timer);busy=false;dialog.classList.remove('is-spinning','is-mystery');caption.textContent='';stage.removeAttribute('aria-busy');if(audio){void audio.close().catch(()=>{});audio=null;}}
  function tone(final=false,frequency=null,delay=0){
    if(!sound.checked||!audio||audio.state!=='running')return;
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime+delay;
    oscillator.type='triangle';oscillator.frequency.setValueAtTime(frequency||(final?880:620),now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency||(final?660:180),now+(final?.16:.025));
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.09,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+(final?.28:.04));
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+(final?.3:.045));
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  function enableAudio(){
    if(!sound.checked)return;
    try{const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;if(!audio)audio=new Context();void audio.resume().catch(()=>{});}catch{/* Picking still works when audio is unavailable. */}
  }
  sound.onchange=()=>{try{localStorage.setItem('sas-classroom-picker-sound',sound.checked?'on':'off');}catch{}if(sound.checked)enableAudio();};
  function refreshPicker(){
    stop();const c=getChart();classroom.textContent=c.name;renderChosen(c);
    name.textContent=eligibleStudents(c,'picker').length?'Who will it be?':c.students.length?'No eligible students':'Add students to get started';placeholder();
    status.textContent=c.students.length?`${round(c).remaining.length} of ${eligibleStudents(c,'picker').length} eligible students left this round · Manage excluded students to restore names.`:'Open People → Students to add your classroom roster.';
    pick.textContent='Pick a student';pick.disabled=!eligibleStudents(c,'picker').length;
  }
  launch.onclick=()=>{refreshPicker();dialog.showModal();};
  exclusions.onclick=()=>{refreshPicker();openStudentExclusions(getChart,commit,'picker',refreshPicker);pick.disabled=!eligibleStudents(getChart(),'picker').length;pick.textContent='Pick a student';};
  pick.onclick=()=>{
    if(busy)return;
    const owner=getChart(),students=structuredClone(round(owner).remaining);if(!students.length)return;
    stop();busy=true;const token=run,winner=students[Math.floor(Math.random()*students.length)];
    enableAudio();pick.disabled=true;pick.textContent='Choosing…';status.textContent='Choosing a student…';stage.setAttribute('aria-busy','true');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,total=reduced?4:25,finalStudent=students.length===1;
    function reveal(){
      const left=remember(owner,winner.id);renderChosen(owner);paint(winner);
      if(finalStudent){caption.textContent='Plot twist… it’s';tone(true,523.25);tone(true,659.25,.12);tone(true,783.99,.24);}else tone(true);
      busy=false;stage.removeAttribute('aria-busy');dialog.classList.remove('is-spinning','is-mystery');dialog.classList.add('has-winner');
      status.textContent=`Chosen: ${seatName(winner,getChart().students)} · ${left?`${left} left this round.`:"Everyone’s had a turn! 🎉 The next pick starts a new round."}`;pick.textContent='Pick again';pick.disabled=false;
    }
    if(finalStudent){
      const lines=['Who could it possibly be?','The suspense is entirely unnecessary…','Our extremely surprising final contestant…'];
      caption.textContent=lines[finaleCount++%lines.length];name.textContent='The final mystery…';status.textContent='One student left. A very mysterious reveal…';pick.textContent='Revealing…';
      portrait.innerHTML='<svg viewBox="0 0 160 160" aria-hidden="true"><rect x="4" y="4" width="152" height="152" rx="36" fill="currentColor" opacity=".08"/><circle cx="80" cy="57" r="30" fill="currentColor" opacity=".4"/><path d="M25 148v-17a55 55 0 0 1 110 0v17" fill="currentColor" opacity=".4"/><text x="80" y="115" text-anchor="middle" font-size="52" font-weight="800" fill="currentColor">?</text></svg>';
      dialog.classList.add('is-mystery');tone();
      timer=setTimeout(()=>{if(token!==run||!dialog.open)return;tone();timer=setTimeout(()=>{if(token===run&&dialog.open)reveal();},reduced?300:700);},reduced?250:650);
      return;
    }
    if(!reduced)dialog.classList.add('is-spinning');
    let step=0,last=-1;
    function tick(){
      if(token!==run||!dialog.open)return;
      if(step===total){reveal();return;}
      if(!reduced){let index=Math.floor(Math.random()*students.length);if(students.length>1&&index===last)index=(index+1)%students.length;last=index;paint(students[index]);}
      tone();step++;timer=setTimeout(tick,reduced?160:55+Math.pow(step/total,3)*280);
    }
    dialog.classList.remove('has-winner');tick();
  };
  reset.onclick=()=>{
    stop();const c=getChart();rounds.set(c.id,[]);
    try{localStorage.setItem(roundKey(c.id),'[]');}catch{}
    renderChosen(c);placeholder();name.textContent=c.students.length?'Who will it be?':'Add students to get started';dialog.classList.remove('has-winner');
    status.textContent=`Round reset · All ${eligibleStudents(c,'picker').length} non-excluded students are eligible again.`;pick.textContent='Pick a student';pick.disabled=!eligibleStudents(c,'picker').length;
  };
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{stop();dialog.classList.remove('has-winner');launch.focus();});
  dialog.addEventListener('cancel',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&busy){stop();name.textContent='Pick paused';status.textContent='Ready when you are.';pick.textContent='Pick a student';pick.disabled=false;}});
}
