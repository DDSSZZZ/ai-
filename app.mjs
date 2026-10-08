import {SCENES,EVIDENCE,endingFor,validateState} from './story.mjs';

const $=s=>document.querySelector(s), app=$('#app'), modal=$('#modal'), toast=$('#toast');
const KEY='future-signal-state-v1';
let state=loadState()||{version:1,scene:'wake',ending:null,history:[],evidence:[],started:false};
let audioOn=false, audioCtx=null, ambience=null;

function loadState(){try{return validateState(JSON.parse(localStorage.getItem(KEY)))}catch{return null}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
function ensureAudio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}

function makeSuspenseBuffer(ctx){
 const sr=Math.max(22050,Math.min(44100,ctx.sampleRate)),seconds=24,length=Math.floor(sr*seconds);
 const buffer=ctx.createBuffer(2,length,sr);
 const melody=[146.83,174.61,196.00,174.61,130.81,146.83,164.81,130.81];
 const bass=[73.42,87.31,98.00,87.31];
 const beat=0.75;

 for(let ch=0;ch<2;ch++){
  const data=buffer.getChannelData(ch);
  for(let i=0;i<length;i++){
   const time=i/sr;
   const slow=0.5+0.5*Math.sin(2*Math.PI*time/12);
   let v=0;

   // Warm low drone.
   v += 0.045*Math.sin(2*Math.PI*49*time)*(0.72+0.28*slow);
   v += 0.022*Math.sin(2*Math.PI*98*time);
   v += 0.010*Math.sin(2*Math.PI*147*time);

   // Rhythmic low pulse every beat.
   const phase=time%beat;
   if(phase<0.22){
    const env=Math.exp(-phase*13);
    v += 0.055*env*Math.sin(2*Math.PI*58*phase);
    v += 0.018*env*Math.sin(2*Math.PI*116*phase);
   }

   // Eight-note suspense melody, repeated in phrases.
   const phraseTime=time%6;
   const noteIndex=Math.floor(phraseTime/0.75)%melody.length;
   const within=phraseTime%0.75;
   const f=melody[noteIndex];
   const attack=Math.min(within/0.025,1);
   const release=Math.exp(-within*2.5);
   const env=attack*release;
   v += 0.030*env*Math.sin(2*Math.PI*f*within);
   v += 0.010*env*Math.sin(2*Math.PI*f*2*within);

   // Bass note changes give the piece a clear harmonic movement.
   const bassPhrase=time%3;
   const bi=Math.floor(bassPhrase/0.75)%bass.length;
   const bw=bassPhrase%0.75;
   const bf=bass[bi];
   const benv=Math.min(bw/0.035,1)*Math.exp(-bw*2.1);
   v += 0.032*benv*Math.sin(2*Math.PI*bf*bw);

   // Tiny stereo variation.
   data[i]=v*(ch===0?1.0:0.92);
  }

  const fade=Math.floor(sr*1.4);
  for(let i=0;i<fade;i++)data[i]*=i/fade;
  for(let i=length-fade;i<length;i++)data[i]*=(length-i)/fade;
 }
 return buffer;
}
function buzz(){
 if(!audioOn)return;
 const ctx=ensureAudio(),o=ctx.createOscillator(),g=ctx.createGain();
 o.type='sine';o.frequency.value=220;
 g.gain.setValueAtTime(.018,ctx.currentTime);
 g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.11);
 o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.11);
}

function startAmbience(){
 const ctx=ensureAudio();if(ambience)return;
 const master=ctx.createGain();
 master.gain.setValueAtTime(0,ctx.currentTime);
 master.gain.linearRampToValueAtTime(1.15,ctx.currentTime+1.6);
 master.connect(ctx.destination);

 const source=ctx.createBufferSource();
 source.buffer=makeSuspenseBuffer(ctx);
 source.loop=true;
 source.loopStart=0;
 source.loopEnd=24;
 source.connect(master);
 source.start();

 ambience={master,source};
}
function stopAmbience(){
 if(!ambience||!audioCtx)return;
 const current=ambience;ambience=null;
 current.master.gain.cancelScheduledValues(audioCtx.currentTime);
 current.master.gain.setValueAtTime(current.master.gain.value,audioCtx.currentTime);
 current.master.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1.0);
 setTimeout(()=>{try{current.source.stop()}catch{}},1100);
}

function landing(){
 app.innerHTML=`<section class="hero"><div class="hero-copy"><div class="eyebrow">CASE FILE / 01 · INTERACTIVE ANTI-FRAUD</div><h1>你会相信<br><em>十分钟后的你</em>吗？</h1><p class="hero-intro">一条来自未来的消息，<br>一场还没有发生的骗局。<br><strong>你的每一个选择，都会改写结局。</strong></p><div class="meta-chips"><span><i>◉</i> 悬疑叙事</span><span><i>◌</i> 约 5 分钟</span></div><div class="hero-actions"><button class="primary" id="start">开始调查 <span class="arrow">↗</span></button><button class="secondary" id="continue" ${state.history.length?'':'hidden'}>继续上次调查</button></div><p class="start-note">虚构情境 · 不涉及真实交易 · 可随时退出</p></div><div class="hero-art"><div class="orbit"><span class="orbit-tick">SIGNAL / 21:50:07</span></div><div class="big-time">21:50</div><div class="signal-card"><small>INCOMING / FROM YOURSELF</small><p>不要付第二笔钱。<br><span>— 十分钟后的你</span></p></div><div class="phone"><div class="phone-screen"><div class="phone-island"></div><div class="phone-status"><span>21:40</span><span>▮▮▮ ◇</span></div><div class="lock-date">星期五 · 10月24日</div><div class="lock-time">21:40</div><div class="notification"><header><b>↗ 未来来信</b><span>刚刚</span></header><strong>你有一条来自未来的消息</strong><p>先别付第二笔钱。<br>我知道你刚刚付了 199 元订金...</p></div><div class="phone-bottom">向上滑动以调查</div></div></div><div class="warning-card"><small>WARNING / 02</small><p>你还剩 <b>10:00</b><br>改变这一切。</p></div><div class="art-coordinate">40°N 116°E / SIGNAL LOCKED</div></div></section><section class="intro-strip"><div class="intro-item"><span class="intro-number">01</span><div><h3>像真实聊天一样调查</h3><p>没有标准答案，只有你的判断。</p></div><span class="intro-icon">⌁</span></div><div class="intro-item"><span class="intro-number">02</span><div><h3>打开证据，找到破绽</h3><p>每份材料都藏着一个问题。</p></div><span class="intro-icon">▧</span></div><div class="intro-item"><span class="intro-number">03</span><div><h3>结局复盘每一步</h3><p>把“感觉不对”变成可验证。</p></div><span class="intro-icon">✦</span></div></section>`;
 $('#start').onclick=()=>{try{ensureAudio()}catch{}state={version:1,scene:'wake',ending:null,history:[],evidence:[],started:true};save();renderScene()};
 $('#continue')?.addEventListener('click',()=>{try{ensureAudio()}catch{}renderScene()});
}

function renderScene(){
 const scene=SCENES[state.scene]; if(!scene){renderEnding();return}
 const seen=state.history.length, active=Math.min(seen+1,5);
 app.innerHTML=`<div class="game-wrap"><div class="game-top"><button class="back" id="quit">← 返回首页</button><span class="chapter-label">CHAPTER ${scene.chapter} / ${esc(scene.name.toUpperCase())}</span><button class="restart-link" id="restart">重新开始</button></div><div class="game-grid"><section class="chat-panel"><header class="chat-head"><div class="avatar ${scene.kind}">${esc(scene.avatar)}</div><div><h2>${esc(scene.speaker)}</h2><small>${esc(scene.signal)}</small></div><span class="chat-clock">${esc(scene.time)}</span></header><div class="chat-content"><div class="scene-divider">— ${scene.kind==='future'?'未知来源 / 加密消息':'消息记录'} —</div>${scene.messages.map(x=>`<div class="bubble ${scene.kind}">${esc(x)}</div>`).join('')}${scene.attachment?attachmentButton(scene.attachment):''}<p class="narration">${esc(scene.narration)}</p>${scene.future?`<div class="future-whisper"><small>来自十分钟后的你 / 语音转文字</small>${esc(scene.future)}</div>`:''}</div><div class="choices"><div class="choice-heading"><span>你会怎么做？</span><span>选择会影响时间线</span></div>${scene.choices.map((c,i)=>`<button class="choice" data-choice="${c.id}"><span class="choice-letter">${String.fromCharCode(65+i)}</span><span><strong>${esc(c.text)}</strong><small>${esc(c.sub)}</small></span><span class="choice-arrow">→</span></button>`).join('')}</div></section><aside class="game-sidebar"><section class="side-panel progress-panel"><div class="side-heading"><h3>时间线</h3><span>${String(active).padStart(2,'0')} / 05</span></div><div class="timeline">${[1,2,3,4,5].map(i=>`<i class="${i<=active?'active':''}"></i>`).join('')}</div><p class="side-description">你的调查正在改变未来。先暂停，再核实，最后决定。</p></section><section class="side-panel evidence-panel"><div class="side-heading"><h3>证据档案</h3><span>${String(state.evidence.length).padStart(2,'0')} FOUND</span></div><div>${EVIDENCE.map(e=>`<button class="evidence-button" data-evidence="${e.id}"><span class="file-num">${e.number}</span><span><strong>${esc(e.name)}</strong><small>${esc(e.type)}</small></span><span class="file-state">${state.evidence.includes(e.id)?'已查看':'未打开'}</span></button>`).join('')}</div></section></aside></div></div>`;
 $('#quit').onclick=landing;$('#restart').onclick=()=>{state={version:1,scene:'wake',ending:null,history:[],evidence:[],started:true};save();renderScene()};
 app.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(b.dataset.choice));app.querySelectorAll('[data-evidence]').forEach(b=>b.onclick=()=>openEvidence(b.dataset.evidence));
}
function attachmentButton(id){const e=EVIDENCE.find(x=>x.id===id);return `<button class="attachment" data-evidence="${id}"><span class="attachment-icon">▧</span><span><strong>${esc(e.name)}</strong><small>${esc(e.type)} · 点击查看</small></span><span>↗</span></button>`}
function choose(id){const scene=SCENES[state.scene], choice=scene.choices.find(x=>x.id===id);if(!choice)return;buzz();state.history.push({scene:state.scene,choice:id});if(choice.openEvidence&&!state.evidence.includes(scene.attachment))state.evidence.push(scene.attachment);if(choice.ending)state.ending=choice.ending;else state.scene=choice.next;save();if(choice.feedback)showToast(choice.feedback);setTimeout(()=>state.ending?renderEnding():renderScene(),300)}
function openEvidence(id){const e=EVIDENCE.find(x=>x.id===id);if(!e)return;if(!state.evidence.includes(id)){state.evidence.push(id);save()}modal.innerHTML=`<div class="modal-inner"><button class="modal-close" aria-label="关闭">×</button><div class="modal-kicker">EVIDENCE / ${e.number} · ${esc(e.type.toUpperCase())}</div><h2>${esc(e.name)}</h2><div class="exhibit"><span class="specimen">CASE 24-10 / SIMULATION</span><h3>${esc(e.title)}</h3><h4>${esc(e.subtitle)}</h4><p>${esc(e.body)}</p><small>${esc(e.note)}</small>${id==='ticket'?'<div class="barcode"></div>':''}</div><button class="hotspot">⌁ 先猜一猜：${esc(e.hotspot)}</button><div class="finding"><strong>调查发现 / ${esc(e.label)}</strong><p>${esc(e.finding)}</p></div><p class="modal-caption">证据用于虚构情境演示。现实中请通过自己找到的官方渠道核实。</p></div>`;modal.showModal();modal.querySelector('.modal-close').onclick=()=>modal.close()}
 function renderEnding(){const end=endingFor(state.ending), rows=state.history.map((r,i)=>{const s=SCENES[r.scene],c=s.choices.find(x=>x.id===r.choice);return `<div class="review-row"><small>STEP ${String(i+1).padStart(2,'0')} / ${esc(s.name)}</small><h4>${esc(c.text)}</h4><p>${esc(c.feedback||'')}</p></div>`}).join('');app.innerHTML=`<div class="end-wrap ${end.color==='pink'?'pink':''}"><section class="end-hero"><div class="end-symbol">${end.color==='pink'?'↻':'✓'}</div><div class="eyebrow">${esc(end.label.toUpperCase())}</div><h1>${esc(end.title)}</h1><p class="end-subtitle">${esc(end.subtitle)}</p><p class="end-description">${esc(end.message)}</p></section><div class="end-grid"><section class="review-panel"><div class="side-heading"><h3>你的调查复盘</h3><span>${state.history.length} STEPS</span></div>${rows||'<p class="side-description">你还没有做出选择。</p>'}</section><section class="actions-panel"><div class="side-heading"><h3>现实中的下一步</h3><span>KEEP THIS</span></div><ol class="action-list"><li>停止继续转账，不为解冻、退款或追款再付钱。</li><li>保存聊天、链接、账号、订单和转账记录。</li><li>通过自己找到的官方渠道、银行或 110 求助核实。</li></ol></section></div><div class="end-buttons"><button class="primary" id="again">再调查一次 <span class="arrow">↗</span></button><button class="secondary" id="poster">生成我的结局海报</button></div><p class="download-note">把这次判断带回现实：越催你立刻决定，越要先暂停、再核实。</p></div>`;$('#again').onclick=()=>{state={version:1,scene:'wake',ending:null,history:[],evidence:[],started:true};save();renderScene()};$('#poster').onclick=generatePoster}
 async function generatePoster(){
 const end=endingFor(state.ending);
 const canvas=document.createElement('canvas'),w=1080,h=1920;
 canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d');
 const accent=end.color==='pink'?'#ee9bbd':'#c8fa82';
 ctx.fillStyle='#0c1014';ctx.fillRect(0,0,w,h);
 const bg=ctx.createRadialGradient(760,520,40,760,520,720);
 bg.addColorStop(0,end.color==='pink'?'#3b202e55':'#33402b55');
 bg.addColorStop(1,'#0c101400');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle=accent+'20';ctx.lineWidth=2;ctx.beginPath();ctx.arc(810,520,310,0,Math.PI*2);ctx.stroke();
 ctx.setLineDash([8,14]);ctx.strokeStyle=accent+'14';ctx.beginPath();ctx.arc(810,520,250,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);

 const font='-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
 const mono='ui-monospace,SFMono-Regular,Consolas,"Courier New",monospace';
 ctx.textBaseline='top';ctx.fillStyle='#8f9a9c';ctx.font='20px '+mono;ctx.fillText('FUTURE SIGNAL / CASE FILE 01',72,74);
 ctx.fillStyle=accent;ctx.font='bold 22px '+mono;ctx.fillText('结局记录 / '+String(state.history.length).padStart(2,'0')+' STEPS',72,118);

 ctx.fillStyle='#f3f5f3';ctx.font='bold 84px '+font;ctx.fillText('十分钟后的你',72,220);
 ctx.fillStyle=accent;ctx.font='bold 48px '+font;
 const titleLines=[];let line='',max=900;
 for(const ch of end.title){const test=line+ch;if(ctx.measureText(test).width>max){titleLines.push(line);line=ch}else line=test} if(line)titleLines.push(line);
 titleLines.slice(0,2).forEach((ln,i)=>ctx.fillText(ln,72,350+i*62));

 ctx.fillStyle='#bcc5c1';ctx.font='26px '+font;
 const subtitleLines=[];line='';
 for(const ch of end.subtitle){const test=line+ch;if(ctx.measureText(test).width>870){subtitleLines.push(line);line=ch}else line=test}if(line)subtitleLines.push(line);
 subtitleLines.slice(0,3).forEach((ln,i)=>ctx.fillText(ln,72,490+i*40));

 ctx.fillStyle='#18201b';ctx.strokeStyle=accent+'38';ctx.lineWidth=2;
 roundRect(ctx,72,650,936,280,24,true,true);
 ctx.fillStyle='#93a09b';ctx.font='19px '+mono;ctx.fillText('调查复盘 / WHAT YOU DID',104,686);
 ctx.fillStyle='#e3e8e3';ctx.font='23px '+font;
 const review=state.history.slice(-3).map((r,i)=>{const s=SCENES[r.scene],c=s.choices.find(x=>x.id===r.choice);return (i+1)+'  '+s.name+'  ·  '+c.text});
 review.forEach((txt,i)=>{
   ctx.fillStyle=accent;ctx.font='20px '+mono;ctx.fillText(String(i+1).padStart(2,'0'),104,740+i*55);
   ctx.fillStyle='#d5ddd7';ctx.font='21px '+font;
   const short=txt.length>34?txt.slice(0,33)+'…':txt;ctx.fillText(short,160,738+i*55);
 });
 ctx.fillStyle='#a4afaa';ctx.font='18px '+font;
 const msgLines=wrapCanvas(ctx,end.message,850);
 msgLines.slice(0,4).forEach((ln,i)=>ctx.fillText(ln,104,850+i*29));

 ctx.fillStyle='#f3f5f3';ctx.font='bold 29px '+font;ctx.fillText('现实中的下一步',72,1010);
 const actions=['停止继续转账，不为解冻、退款或追款再付钱。','保存聊天、链接、账号、订单和转账记录。','通过自己找到的官方渠道、银行或 110 求助核实。'];
 actions.forEach((txt,i)=>{
   ctx.fillStyle=accent;ctx.font='bold 22px '+mono;ctx.fillText('0'+(i+1),76,1080+i*92);
   ctx.fillStyle='#c4cdca';ctx.font='22px '+font;wrapCanvas(ctx,txt,790).slice(0,2).forEach((ln,j)=>ctx.fillText(ln,150,1076+i*92+j*30));
 });
 ctx.strokeStyle='#293038';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(72,1390);ctx.lineTo(1008,1390);ctx.stroke();
 ctx.fillStyle='#667373';ctx.font='19px '+mono;ctx.fillText('保持怀疑，也保持连接。',72,1430);
 ctx.fillStyle=accent;ctx.font='bold 30px '+font;ctx.fillText('先暂停，再核实。',72,1490);
 ctx.fillStyle='#596563';ctx.font='18px '+font;ctx.fillText('虚构情境 · 反诈互动体验 · 仅用于教育展示',72,1775);
 ctx.fillStyle='#596563';ctx.font='18px '+mono;ctx.fillText('© 2026 FUTURE SIGNAL',72,1812);

 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob)throw new Error('poster generation failed');
 const url=URL.createObjectURL(blob);
 modal.innerHTML='<div class="modal-inner"><button class="modal-close" aria-label="关闭">×</button><div class="modal-kicker">RESULT POSTER / '+esc(end.label.toUpperCase())+'</div><h2>你的调查海报已经生成</h2><img class="poster-preview" src="'+url+'" alt="你的反诈调查结果海报"><div class="poster-actions"><button class="primary" id="share-poster">分享海报 ↗</button><button class="secondary" id="save-poster">保存图片</button></div><p class="modal-caption">海报由本地浏览器生成，不会上传你的调查记录。</p></div>';
 modal.showModal();
 const cleanup=()=>{URL.revokeObjectURL(url);modal.removeEventListener('close',cleanup)};
 modal.addEventListener('close',cleanup);
 modal.querySelector('.modal-close').onclick=()=>modal.close();
 const filename='十分钟后的你-调查结果.png';
 const savePoster=()=>{const link=document.createElement('a');link.href=url;link.download=filename;link.click();showToast('海报已生成，可以保存或发送给朋友。')};
 modal.querySelector('#save-poster').onclick=savePoster;
 modal.querySelector('#share-poster').onclick=async()=>{
   const file=new File([blob],filename,{type:'image/png'});
   try{
     if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
       await navigator.share({title:'十分钟后的你 · 调查结果',text:'我的反诈互动结局：'+end.title,files:[file]});
     }else savePoster();
   }catch(e){if(e?.name!=='AbortError')savePoster();}
 };
}

function roundRect(ctx,x,y,width,height,r,fill,stroke){
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+width,y,x+width,y+height,r);ctx.arcTo(x+width,y+height,x,y+height,r);ctx.arcTo(x,y+height,x,y,r);ctx.arcTo(x,y,x+width,y,r);ctx.closePath();
 if(fill)ctx.fill();if(stroke)ctx.stroke();
}
function wrapCanvas(ctx,text,maxWidth){
 const lines=[];let line='';
 for(const ch of String(text)){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch}else line=test}
 if(line)lines.push(line);return lines;
}
$('#sound-toggle').onclick=()=>{$('#sound-toggle').setAttribute('aria-pressed',String(audioOn=!audioOn));$('#sound-toggle span').textContent=audioOn?'声音开':'声音关';if(audioOn){startAmbience();buzz()}else stopAmbience()};$('#about-button').onclick=()=>{modal.innerHTML=`<div class="modal-inner"><button class="modal-close" aria-label="关闭">×</button><div class="modal-kicker">ABOUT THE EXPERIENCE</div><h2>一条消息，改变一次判断。</h2><p>《十分钟后的你》是一款悬疑叙事式反诈互动 H5。它把“先暂停、再核实、求助”变成一次可以亲手完成的调查。</p><div class="about-grid"><div>悬疑叙事<small>用时间线制造代入感</small></div><div>证据练习<small>从来源和独立渠道核实</small></div><div>AI 陪练<small>把疑问变成可验证的问题</small></div><div>虚构安全<small>无真实链接、无真实付款</small></div></div><p class="modal-caption">参赛作品原型 · FUTURE SIGNAL / 2026</p></div>`;modal.showModal();modal.querySelector('.modal-close').onclick=()=>modal.close()};
 if(state.started&&state.history.length)renderScene();else landing();


