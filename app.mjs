import { slides, references } from './content.mjs';
import { createWorld } from './scene.mjs';
import { channelMarkup } from './channel-ui.mjs';
import { channelStops, channelState, channelStepInfo } from './channel-state.mjs';
import { decisionDuration, decisionCases, decisionChapters, decisionFilmFrame, decisionMarkup } from './decision-film.mjs';
import { scaleDuration, scaleModels, scaleChapters, scaleFilmFrame, scaleMarkup } from './scale-film.mjs';
import { modelingSteps, modelingGroups, modelingMarkup, derivationMarkup, comparisonMarkup, modelTheoryMarkup } from './modeling.mjs';
import { simulateLIF, simulateHH, simulateFHN, temporalExperiment, equalChargeExperiment, synapseExperiment,
  modelComparison, nernst } from './physics.mjs';

const $ = id => document.getElementById(id);
const lab=$('lab'), panel=$('panel');
const fmt=(x,d=1)=>Number(x).toFixed(d), pad=n=>String(n).padStart(2,'0');
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params={ i:.1,R:100,C:.1,gap:40,amplitude:.2,prediction:null,naOut:145,kOut:4,voltage:-65,naOpen:.5,kOpen:.5,
  hhI:20,blockNa:0,secondPulse:false,interval:3,measured:true,myelin:true,weight:8,delay:2,burst:1,inhibitory:false,
  drive:.25,adapt:false,model:'LIF',pattern:'regular',modelStep:0,modelRun:false,fhnI:.55,fhnEpsilon:.08,hhBranch:'Na',
  channelType:'Na',channelStep:0,channelPhase:0,channelView:'mechanism',channelCutaway:false };
let channelPlaying=false;
let decisionPlaying=false,decisionTime=0,decisionPhase=-1;
let scalePlaying=false,scaleTime=0,scalePhase=-1;
let index=0,position=0,result=null,secondResult=null,playing=false,head=0,hasRun=false,predicted=false,baselineHH=false,
  world=null,last=performance.now(),audioContext=null,soundOn=false,toastTimeout=null,notesMode=false,auxResult=null,currentSeries=null;
const progress=new Set();const parts=new Set();let focusedPart='';
try{for(const s of JSON.parse(localStorage.getItem('neuron-cinema-discoveries')||'[]'))progress.add(s);}catch{}
const header=(name,number='LIVE LAB')=>`<div class="lab-header"><span>${name}</span><b>${number}</b><button class="drawer-handle" data-action="expand" aria-label="Expand or shrink experiment panel">↕ EXPAND</button></div>`;
const slider=(name,label,value,min,max,step,unit='',digits=1)=>`<label class="control"><span class="control-head"><span>${label}</span><output id="out-${name}" for="${name}">${fmt(value,digits)} ${unit}</output></span><input id="${name}" data-param="${name}" type="range" value="${value}" min="${min}" max="${max}" step="${step}" data-unit="${unit}" data-digits="${digits}" aria-label="${label}"></label>`;
const toggle=(name,label,on)=>`<div class="toggle-row"><span>${label}</span><button class="switch" data-toggle="${name}" aria-label="${label}" aria-pressed="${on}"></button></div>`;
const plot=(id='trace',description='Membrane voltage in millivolts versus time in milliseconds')=>`<canvas id="${id}" class="plot" role="img" aria-label="${escapeHTML(description)}"></canvas>`;
const metrics=(a,b)=>`<div class="metrics"><div class="metric">${a}</div><div class="metric">${b}</div></div>`;
const runButton=(text='Run experiment')=>`<button class="primary" data-action="run">${text}<span>↗</span></button>`;
const status=(text)=>`<div id="result-status" class="status" role="status">${text}</div>`;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),3500);}
function award(key,message){if(progress.has(key))return;progress.add(key);try{localStorage.setItem('neuron-cinema-discoveries',JSON.stringify([...progress]));}catch{}toast(`Discovery unlocked · ${message}`);chime(true);}
function chime(success=false){if(!soundOn)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const t=audioContext.currentTime;for(let i=0;i<(success?3:1);i++){const osc=audioContext.createOscillator(),g=audioContext.createGain();osc.type='sine';osc.frequency.value=success?[392,493.88,587.33][i]:220;g.gain.setValueAtTime(0,t+i*.09);g.gain.linearRampToValueAtTime(.035,t+i*.09+.02);g.gain.exponentialRampToValueAtTime(.001,t+i*.09+.25);osc.connect(g).connect(audioContext.destination);osc.start(t+i*.09);osc.stop(t+i*.09+.28);}}catch{}}

function renderLab(preserve=true){
  const wasOpen=preserve&&lab.querySelector('details.advanced')?.open,p=params;
  lab.className='lab';
  lab.hidden=index===13;
  const advanced=body=>`<details class="advanced"><summary>Explore parameters <span>+</span></summary><div class="advanced-body">${body}</div></details>`;
  const results=body=>`<div class="lab-results" ${hasRun?'':'hidden'}>${body}</div>`;
  const tinyResult=(id,label)=>`<div class="single-result"><b id="${id}">—</b><span>${label}</span></div>`;
  const content=[
    ()=>`${header('EXPLORE THE CELL')}<div class="atom-list">${[['dendrites','Dendrites'],['soma','Soma'],['axon','Axon'],['terminals','Axon terminals']].map(([key,name])=>`<button class="secondary ${focusedPart===key?'active':''}" data-part="${key}" aria-pressed="${focusedPart===key}">${name}<span>↗</span></button>`).join('')}</div><button class="quiet small anatomy-overview" data-action="overview">Whole neuron ↗</button>${status('Select a part to look closer.')}`,
    ()=>modelingMarkup(p.modelStep,p,{header,slider,runButton,plot,status}),
    ()=>`${header('CHANGE ONE THING')}${slider('i','Input pulse · 60 ms',p.i,0,.5,.01,'nA',2)}${runButton('Inject current')}${results(`${plot()}<div class="balance-readout"><span>Input · nA <b id="rc-in">0.10</b></span><span>= Leak <b id="rc-leak">0.00</b></span><span>+ Stored <b id="rc-store">0.10</b></span></div>`)}${status('Some input changes stored charge. Some leaks away.')}${advanced(`${slider('R','Leak resistance',p.R,50,200,10,'MΩ',0)}${slider('C','Membrane capacitance',p.C,.05,.3,.01,'nF',2)}<p class="hint">Challenge: reach −50 ±1 mV at 15 ms.</p>`)}`,
    ()=>`${header('CHANGE ONLY THE TIMING')}${slider('gap','Gap between two equal pulses',p.gap,0,50,1,'ms',0)}${runButton('Send both pulses')}${results(`${plot()}${tinyResult('spike-count','output events')}`)}${status('Each pulse: 0.20 nA for 10 ms.')}${advanced(`<div class="button-row"><button class="secondary" data-preset="close">5 ms gap</button><button class="secondary" data-preset="far">40 ms gap</button></div>${slider('amplitude','Pulse amplitude',p.amplitude,.05,.3,.01,'nA',2)}<p class="hint">To test timing alone, leave amplitude at 0.20 nA.</p>`)}`,
    ()=>`${header('MAKE A PREDICTION')}<div class="prediction-choices"><button class="secondary" data-predict="short"><span class="input-symbol short"></span>Short + strong</button><button class="secondary" data-predict="long"><span class="input-symbol long"></span>Long + weak</button><button class="secondary" data-predict="both">Both will fire</button></div><button class="primary" data-action="run" id="compare" ${p.prediction===null?'disabled':''}>Test your prediction<span>↗</span></button>${results(`${plot()}<div class="plot-key"><span><i></i>0.6 nA × 5 ms</span><span><i style="background:var(--purple)"></i>0.1 nA × 30 ms</span></div><div class="equal-charge">Both deliver <b>3 pC</b></div>`)}${status('Same cell. Same charge. Will the outcome match?')}`,
    ()=>channelMarkup(p,{header,slider}),
    ()=>'',
    ()=>`${header('FOLLOW THE EVENT')}${runButton('Launch the wave')}<button class="mechanism-toggle" data-action="ride">Ride alongside it<span>↗</span></button>${toggle('myelin','Myelin insulation',p.myelin)}<p class="hint">Conceptual propagation, deliberately slowed.</p>`,
    ()=>`${header('TEST THE RECEIVER')}<div class="segments">${[1,3].map(n=>`<button class="segment ${p.burst===n?'active':''}" data-burst="${n}">${n===1?'One event':'A close burst'}</button>`).join('')}</div>${runButton('Send the message')}${results(`${plot()}${tinyResult('spike-count','receiver output events')}`)}${status('Watch release, arrival, and the receiver’s state.')}${advanced(`${slider('weight','Synaptic voltage jump',p.weight,1,20,1,'mV',0)}${slider('delay','Transmission delay',p.delay,0,20,1,'ms',0)}${toggle('inhibitory','Inhibitory connection',p.inhibitory)}<p class="hint">Numerical synapse: delayed voltage jump. Molecular release is illustrative.</p>`)}`,
    ()=>`${header('READ AN EVENT STREAM')}${slider('drive','Sustained input',p.drive,0,.6,.01,'nA',2)}${runButton('Record the events')}${results(`<canvas id="raster" class="plot" style="height:52px" role="img" aria-label="Spike times during the experiment"></canvas>${tinyResult('rate','events / 0.4 seconds · Hz')}<span class="hidden-metric" id="spike-count"></span>`)}${status('Change input strength. Watch event spacing.')}${advanced(`${toggle('adapt','Spike-frequency adaptation',p.adapt)}${plot()}<p class="hint">A spike adds 0.04 nA of opposing adaptation, decaying over 120 ms.</p>`)}`,
    ()=>'',
    ()=>decisionMarkup({header}),
    ()=>scaleMarkup({header}),
    ()=>''
  ];
  lab.innerHTML=content[index]();
  if(wasOpen&&lab.querySelector('details.advanced'))lab.querySelector('details.advanced').open=true;
  if(index===5)updateChannelReadout();
}

function prepare(){
  const p=params;secondResult=null;auxResult=null;currentSeries=null;
  switch(index){
    case 1:
      if(p.modelStep===0){result=simulateLIF({duration:90,R:p.R,C:p.C,current:t=>t<60?p.i:0});}
      else if(p.modelStep===1){const stimulus=t=>t>=5&&t<6?p.hhI:0;result=simulateHH({current:stimulus,sodium:1-p.blockNa/100});if(p.blockNa)secondResult=simulateHH({current:stimulus});}
      else result=simulateFHN({epsilon:p.fhnEpsilon,current:t=>t>=10&&t<100?p.fhnI:0});
      break;
    case 2:result=simulateLIF({duration:80,R:p.R,C:p.C,current:t=>t<60?p.i:0,passive:true});break;
    case 3:result=temporalExperiment(p.gap,p.amplitude);break;
    case 4:[result,secondResult]=equalChargeExperiment();break;
    case 6:result=simulateHH({sodium:1-p.blockNa/100,current:t=>((t>=5&&t<6)||(p.secondPulse&&t>=5+p.interval&&t<6+p.interval))?p.hhI:0});break;
    case 8:result=synapseExperiment(p.weight,p.delay,p.burst,p.inhibitory);break;
    case 9:result=simulateLIF({duration:500,current:t=>t>=50&&t<450?p.drive:0,adaptation:p.adapt?.04:0});break;
    case 10:result=modelComparison(p.model,p.pattern==='custom'?'regular':p.pattern);break;
    default:result=null;
  }
  if(result?.type==='FHN')auxResult={...result,type:'Aux',spikes:[],threshold:undefined,trace:result.trace.map(s=>({...s,v:s.w}))};
  if(result?.type==='HH')currentSeries=['na','k'].map((key,i)=>[{...result,type:'Aux',spikes:[],threshold:undefined,trace:result.trace.map(s=>({...s,v:s[key]}))},i?'#b8a2fa':'#82efce']);
}
function run(){
  chime();if(index===0)return;if(index===12){playScale();return;}if(index===11){playDecision();return;}if(index===5){playChannel();return;}if(index===7){world?.pulse();return;}
  if(index===4&&params.prediction===null)return;
  prepare();if(!result)return;playing=true;head=0;hasRun=true;if(index===1){params.modelRun=true;lab.querySelector('.compact-results')?.removeAttribute('hidden');}
  lab.querySelectorAll('.lab-results').forEach(el=>el.hidden=false);
  const s=$('result-status');if(s){s.className='status';s.textContent='Experiment running…';}
  world?.pulse(index===8?'synapse':'axon');
}
function sampleAt(r,t){return r?.trace[Math.min(r.trace.length-1,Math.max(0,Math.floor(t/r.dt)))];}
function setStatus(text,good=false){const s=$('result-status');if(s){s.textContent=text;s.className=`status${good?' success':''}`;}}
function completed(){
  if(!result)return;const n=result.spikes.length;
  if(index===1)setStatus(result.type==='FHN'?`${n} excursions · dimensionless time s.`:`${n} spike events · ${result.type}.`,true);
  if(index===2){const v=sampleAt(result,15).v,good=Math.abs(v+50)<=1;setStatus(`At 15 ms: ${fmt(v)} mV · ${good?'Target reached.':'Try adjusting input, leak or capacitance.'}`,good);if(good)award('balance','Current is stored as well as lost.');}
  if(index===3){setStatus(`${n} output event${n===1?'':'s'} · ${n?'The second pulse arrived before memory faded.':'The leak won this round.'}`,n>0);if(n>0&&params.amplitude===.2)award('timing','Timing changes the decision.');}
  if(index===4){setStatus(`${params.prediction==='short'?'Prediction confirmed.':'A surprise?'} Short: ${n} · Long: ${secondResult.spikes.length}. Equal charge is not equal effect.`,true);award('charge','Same charge. Different outcome.');}
  if(index===6){if(n>0&&params.blockNa===0)baselineHH=true;setStatus(`${n} spike${n===1?'':'s'} · Peak ${fmt(Math.max(...result.trace.map(s=>s.v)))} mV${params.blockNa===100?' · Sodium current removed.':''}`,n>0);if(baselineHH&&params.blockNa===100&&n===0)award('sodium','A spike is an ionic feedback loop.');}
  if(index===8){setStatus(`${params.burst} sent → ${n} fired. ${n?'The receiver crossed threshold.':'Arrival alone was not enough.'}`,n>0);if(n>0)award('synapse','The receiver has its own state.');}
  if(index===9){setStatus(params.adapt?'Same drive. A history-dependent rhythm.':'More drive can mean more events, not taller spikes.');if(params.adapt&&n>2)award('adaptation','The past changes the present.');}
  if(index===10)setStatus(`${result.type}: ${n} output events · ${result.units} drive.`);
}

function chart(canvas,r,other=null,progressTime=Infinity,options={}){
  if(!canvas)return;const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const dpr=Math.min(devicePixelRatio,2),w=rect.width,h=rect.height;
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const left=29,right=7,top=12,bottom=19,pw=w-left-right,ph=h-top-bottom;
  let ymin=-70,ymax=-42;
  if(r?.type==='HH'){ymin=-90;ymax=55;}if(r?.type==='FHN'){ymin=-2.5;ymax=2.5;}
  if(r?.type==='RC'){ymax=Math.max(-40,...r.trace.map(s=>s.v+3));}
  const series=options.series??[[r,'#82efce'],[other,'#b8a2fa']];
  if(options.autoscale&&r){let min=Infinity,max=-Infinity;for(const [rr] of series)if(rr)for(const s of rr.trace){min=Math.min(min,s.v);max=Math.max(max,s.v);}const margin=Math.max(1,(max-min)*.1);ymin=min-margin;ymax=max+margin;}
  const duration=r?.duration??120,x=t=>left+t/duration*pw,y=v=>top+(ymax-v)/(ymax-ymin)*ph;
  ctx.font='8px Segoe UI';ctx.lineWidth=.6;ctx.strokeStyle='#2b45513f';ctx.fillStyle='#64828e';
  for(let i=0;i<4;i++){const v=ymin+(ymax-ymin)*i/3,yy=y(v);ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(w-right,yy);ctx.stroke();ctx.fillText(r?.type==='FHN'?fmt(v,1):String(Math.round(v)),1,yy+3);}
  for(let i=0;i<3;i++){const t=i*duration/2,xx=x(t);ctx.fillText(String(Math.round(t)),xx-3,h-5);}
  ctx.fillText(options.label??(r?.type==='FHN'?'v':'mV'),0,8);ctx.fillText(options.timeLabel??(r?.type==='FHN'?'s':'ms'),w-14,h-5);
  if(r?.threshold!==undefined){ctx.strokeStyle='#ffb77d77';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(left,y(r.threshold));ctx.lineTo(w-right,y(r.threshold));ctx.stroke();ctx.setLineDash([]);}
  if(!r)return;
  if(index===3||index===6||index===9){ctx.fillStyle='#ffb77d0d';ctx.beginPath();ctx.moveTo(x(0),top+ph);for(let i=0;i<r.trace.length;i+=Math.max(1,Math.floor(r.trace.length/450))){const s=r.trace[i];if(s.t>progressTime)break;ctx.lineTo(x(s.t),top+ph-Math.min(1,s.input/(index===6?50:.6))*ph*.55);}ctx.lineTo(x(Math.min(progressTime,duration)),top+ph);ctx.closePath();ctx.fill();}
  for(const [rr,color] of series){
    if(!rr)continue;ctx.save();ctx.beginPath();ctx.rect(left,top,pw,ph);ctx.clip();ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.beginPath();let first=true;
    const skip=Math.max(1,Math.floor(rr.trace.length/(pw*2)));
    for(let i=0;i<rr.trace.length;i+=skip){const s=rr.trace[i];if(s.t>progressTime)break;if(first){ctx.moveTo(x(s.t),y(s.v));first=false;}else ctx.lineTo(x(s.t),y(s.v));}ctx.stroke();
    if(rr.type!=='HH'&&rr.type!=='FHN'){ctx.strokeStyle=color;ctx.globalAlpha=.8;for(const t of rr.spikes){if(t>progressTime)break;ctx.beginPath();ctx.moveTo(x(t),top+3);ctx.lineTo(x(t),top+13);ctx.stroke();}}
    ctx.restore();
  }
  if(Number.isFinite(progressTime)&&progressTime>0&&progressTime<duration){const s=sampleAt(r,progressTime);ctx.fillStyle='#effdf6';ctx.beginPath();ctx.arc(x(s.t),y(s.v),2.8,0,Math.PI*2);ctx.fill();}
}
function raster(r,time){const c=$('raster');if(!c||!r)return;const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio,2);if(c.width!==Math.round(w*dpr)){c.width=Math.round(w*dpr);c.height=h*dpr;}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.strokeStyle='#2a4650';ctx.beginPath();ctx.moveTo(29,h/2);ctx.lineTo(w-7,h/2);ctx.stroke();ctx.strokeStyle='#82efce';ctx.lineWidth=1.4;for(const t of r.spikes){if(t>time)break;const x=29+(w-36)*t/r.duration;ctx.beginPath();ctx.moveTo(x,9);ctx.lineTo(x,h-8);ctx.stroke();}}

function updateIons(){
  const na=nernst(params.naOut,15),k=nernst(params.kOut,140),ina=params.naOpen*2*(params.voltage-na),ik=params.kOpen*2*(params.voltage-k);
  if($('e-na')){$('e-na').textContent=(na>0?'+':'')+fmt(na);$('e-k').textContent=fmt(k);$('i-na').textContent=`Na⁺ current: ${fmt(ina,0)} pA (outward positive)`;$('i-k').textContent=`${fmt(Math.abs(ik),0)} pA`;if($('k-direction')){$('k-direction').textContent=Math.abs(ik)<.05?'↔':ik<0?'↓':'↑';$('k-direction-text').textContent=Math.abs(ik)<.05?'K⁺ is balanced':ik<0?'K⁺ flows in':'K⁺ flows out';}}
  if(ik<-.1&&params.voltage===-65){setStatus('K⁺ now flows inward, at the same clamped voltage.',true);award('ions','Concentration can reverse a current.');}
  else if(Math.abs(ik)<.05&&params.kOpen>0)setStatus('K⁺ net current is zero at its equilibrium voltage.',true);
  else setStatus('Reverse K⁺ flow by changing concentration at −65 mV.');
  return {naCurrent:ina,kCurrent:ik};
}
function go(next,replace=false){
  channelPlaying=false;decisionPlaying=false;decisionTime=0;decisionPhase=-1;scalePlaying=false;scaleTime=0;scalePhase=-1;focusedPart='';document.body.classList.remove('lab-expanded');
  position=Math.max(0,Math.min(slides.length-1,Math.trunc(Number(next)||0)));index=slides[position].scene;playing=false;head=0;hasRun=false;result=null;secondResult=null;
  const s=slides[position];$('tag').textContent=s.tag;$('slide-title').innerHTML=s.title;$('cue').textContent=s.cue;$('chapter').textContent=s.chapter;$('model-badge').textContent=s.model;$('current-slide').textContent=pad(position+1);$('total-slides').textContent=slides.length;$('prev').disabled=position===0;$('next').innerHTML=position===slides.length-1?'Replay <span>↺</span>':'Next <span>→</span>';document.body.classList.toggle('is-arrival',position===0);document.body.classList.toggle('is-modeling',index===1);
  $('next').title=s.nextLabel;
  document.body.classList.toggle('is-channel',index===5);
  document.body.classList.toggle('is-decision',index===11);
  document.body.classList.toggle('is-scale',index===12);
  document.body.classList.toggle('is-closing',index===13);
  document.title=`${position+1}/${slides.length} · ${s.title.replace(/<br>/g,' ')} · NEURON`;
  document.querySelectorAll('.timeline button').forEach((b,i)=>{b.className=i===position?'active':i<position?'past':'';if(i===position)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  history[replace?'replaceState':'pushState']({},'',`#slide=${position+1}`);renderLab(false);world?.setSlide(index,replace);if(index===1)setModelingStep(params.modelStep,replace);if(index===5)setChannelStep(params.channelStep,replace,true);if(index===11)updateDecision(decisionFilmFrame(0),replace);if(index===12)updateScale(scaleFilmFrame(0),replace);if(notesMode&&panel.open)showNotes();chime();
}
function playScale(restart=false){
  if(restart||scaleTime>=scaleDuration){scaleTime=0;scalePhase=-1;scalePlaying=true;}else scalePlaying=!scalePlaying;
  updateScale(scaleFilmFrame(scaleTime));
}
function updateScale(frame,instant=false){
  if(frame.phase!==scalePhase){scalePhase=frame.phase;const chapter=scaleChapters[frame.phase];$('slide-title').innerHTML=chapter.title;$('cue').textContent=chapter.cue;world?.setScalePhase(frame.phase,instant);}
  scaleModels.forEach(m=>$(`scale-model-${m.name}`)?.classList.toggle('active',frame.revealed&&m.name===frame.model));
  if($('scale-values'))$('scale-values').textContent=frame.revealed?frame.values:'—';
  if($('scale-word'))$('scale-word').textContent=frame.values===1?'number':'numbers';
  if($('scale-meaning'))$('scale-meaning').textContent=frame.revealed?frame.meaning:'A number can describe its current voltage.';
  if($('scale-total'))$('scale-total').textContent=frame.revealed?frame.total.toLocaleString('en-US'):'—';
  if($('scale-progress'))$('scale-progress').style.width=`${frame.t/scaleDuration*100}%`;
  if($('scale-chapter'))$('scale-chapter').textContent=scalePlaying?(frame.phase===0?'One cell becomes data':frame.phase===4?'Choose the detail you need':`${frame.model} · ${frame.values} values per neuron`):frame.ended?'Complete · replay any time':frame.t>0?'Paused · continue any time':'25 seconds · one idea';
  const button=lab.querySelector('[data-action="scale-play"]');if(button){button.innerHTML=scalePlaying?'Pause<span>Ⅱ</span>':frame.ended?'Replay the explanation<span>↺</span>':frame.t>0?'Continue<span>▶</span>':'Play the explanation<span>▶</span>';button.setAttribute('aria-pressed',String(scalePlaying));}
}
function playDecision(restart=false){
  if(restart||decisionTime>=decisionDuration){decisionTime=0;decisionPhase=-1;decisionPlaying=true;}
  else decisionPlaying=!decisionPlaying;
  updateDecision(decisionFilmFrame(decisionTime));
}
function updateDecision(frame,instant=false){
  if(frame.phase!==decisionPhase){decisionPhase=frame.phase;const chapter=decisionChapters[frame.phase];$('slide-title').innerHTML=chapter.title;$('cue').textContent=chapter.cue;world?.setDecisionPhase(frame.phase,instant);}
  decisionCases.forEach((c,i)=>{const el=$(`decision-case-${c.key}`);if(!el)return;const done=frame.complete[i],active=frame.phase<4&&i===frame.phase;el.classList.toggle('active',active);el.classList.toggle('done',done);el.querySelector('b').textContent=done?(c.fires?'Fired ✓':'Quiet ✓'):active&&frame.arrived?(c.fires?'Fired':'Quiet'):'—';});
  if($('decision-rise'))$('decision-rise').textContent=frame.peakRise.toFixed(0);
  if($('decision-fill'))$('decision-fill').style.width=`${Math.min(100,frame.peakRise/16*100)}%`;
  if($('decision-outcome'))$('decision-outcome').textContent=frame.phase===4?'Only A + B produced an output.':frame.phase===0?(decisionPlaying?'No messages → no output.':'Press play. Follow the messages.'):!frame.arrived?'Messages are on their way…':frame.fired?'Threshold crossed → one output event.':'Below threshold → no output event.';
  if($('decision-progress'))$('decision-progress').style.width=`${frame.t/decisionDuration*100}%`;
  if($('decision-chapter'))$('decision-chapter').textContent=decisionPlaying?decisionChapters[frame.phase].label:frame.ended?'Complete · replay any time':frame.t>0?'Paused · continue any time':'27 seconds · one continuous story';
  const button=lab.querySelector('[data-action="decision-play"]');if(button){button.innerHTML=decisionPlaying?'Pause<span>Ⅱ</span>':frame.ended?'Replay the explanation<span>↺</span>':frame.t>0?'Continue<span>▶</span>':'Play the explanation<span>▶</span>';button.setAttribute('aria-pressed',String(decisionPlaying));}
}
function channelLocation(){history.replaceState({},'',`#slide=3&channel=${params.channelType}&part=${params.channelStep+1}&view=${params.channelView}`);}
function setChannelStep(value,instant=false,keepPhase=false){
  params.channelStep=Math.max(0,Math.min(3,Number(value)||0));
  if(!keepPhase){channelPlaying=false;params.channelPhase=channelStops[params.channelStep]*100;}
  renderLab(false);const info=channelStepInfo(params.channelType)[params.channelStep],measured=params.channelView==='measured';
  $('tag').textContent=`02 / ${measured?'STRUCTURAL EVIDENCE':info.name.toUpperCase()}`;
  $('slide-title').innerHTML=measured?'A measured<br>protein structure.':info.title;
  $('cue').textContent=measured?'A static backbone from an experimental structure.':info.cue;
  world?.setChannelStep(params.channelStep,params.channelType,params.channelView,instant);channelLocation();
}
function updateChannelReadout(){
  const s=channelState(params.channelPhase/100,params.channelType);
  if($('channel-state'))$('channel-state').textContent=s.label;
  if($('channel-voltage'))$('channel-voltage').textContent=s.voltage;
  const button=lab.querySelector('[data-action="channel-play"]');if(button){button.innerHTML=channelPlaying?'Pause the motion<span>Ⅱ</span>':params.channelPhase>0&&params.channelPhase<100?'Continue the motion<span>▶</span>':'Play the full cycle<span>▶</span>';button.setAttribute('aria-pressed',String(channelPlaying));}
  if($('channelPhase')){$('channelPhase').value=params.channelPhase;$('out-channelPhase').textContent=`${Math.round(params.channelPhase)} % of cycle`;}
  if($('channel-structure-label')){const info=world?.snapshot().channel;$('channel-structure-label').textContent=info?.loaded===2?(params.channelType==='Na'?'5X0M · cockroach NaVPaS':'2R9R · rat Kv chimera'):info?.error?'Structure data could not load. Return to the mechanism.':!world?'3D is unavailable. Read Notes for the mechanism.':'Loading coordinates…';}
}
function playChannel(){
  if(params.channelView==='measured'){params.channelView='mechanism';setChannelStep(0);}
  if(channelPlaying){channelPlaying=false;}else{if(params.channelPhase>=100){params.channelPhase=0;setChannelStep(0,false,true);}channelPlaying=true;}
  updateChannelReadout();
}
function setModelingStep(value,instant=false){
  params.modelStep=Math.max(0,Math.min(modelingSteps.length-1,Number(value)||0));playing=false;hasRun=false;head=0;result=null;secondResult=null;auxResult=null;currentSeries=null;params.modelRun=false;
  if(params.modelStep===0&&params.i<.2)params.i=.2;
  const step=modelingSteps[params.modelStep],group=modelingGroups.find(g=>params.modelStep>=g.start&&params.modelStep<=g.end);
  if(step.family)params.model=step.family;
  renderLab(false);$('tag').textContent=`02 / ${group.name.toUpperCase()}`;$('slide-title').innerHTML=step.title;$('cue').textContent=step.cue;
  history.replaceState({},'',`#slide=2&build=${params.modelStep+1}`);
  world?.setModelingStep?.(params.modelStep,params.model,instant);if(notesMode&&panel.open)showNotes();
}
function nextStop(){if(index===1&&params.modelStep<modelingSteps.length-1)setModelingStep(params.modelStep+1);else if(index===5&&params.channelView==='mechanism'&&params.channelStep<3)setChannelStep(params.channelStep+1);else go(position===slides.length-1?0:position+1);}
function previousStop(){if(index===1&&params.modelStep>0)setModelingStep(params.modelStep-1);else if(index===5&&params.channelView==='mechanism'&&params.channelStep>0)setChannelStep(params.channelStep-1);else go(position-1);}
function openPanel(tag,body){$('panel-tag').textContent=tag;$('panel-body').innerHTML=body;if(!panel.open)panel.showModal();}
function sourceLinks(keys){return keys.map(k=>`<li><a href="${references[k].url}" target="_blank" rel="noopener noreferrer">${references[k].title} ↗</a><p>${references[k].detail}</p></li>`).join('');}
function showNotes(){notesMode=true;const s=slides[position],step=index===1?modelingSteps[params.modelStep]:null;openPanel(`PRESENTER NOTES / ${pad(position+1)}${step?` · BUILD ${params.modelStep+1}/${modelingSteps.length}`:''}`,`<h2>${step?.title??s.title}</h2>${step?`<p>${step.note}</p><h3>Full slide narrative</h3>`:''}${s.notes.map(n=>`<p>${n}</p>`).join('')}<h3>Slide references</h3><ul class="source-list">${sourceLinks(s.refs)}</ul><div class="button-row"><button class="secondary" data-dialog="prev">← Previous notes</button><button class="secondary" data-dialog="next">Next notes →</button></div><div class="kbd-help"><span><kbd>N</kbd> close notes</span><span><kbd>Esc</kbd> close panel</span></div>`);}
function showSources(){notesMode=false;openPanel('THE SCIENCE',`<h2>Explore. Verify.<br>Go deeper.</h2><p>Numerical experiments use explicitly defined educational models. The anatomical scenes and molecular particles are schematic. Each slide’s notes explain parameters, assumptions and sources.</p><h3>This stop</h3><ul class="source-list">${sourceLinks(slides[position].refs)}</ul><h3>Selected bibliography</h3><ul class="source-list">${sourceLinks(Object.keys(references).filter(k=>!slides[position].refs.includes(k)))}</ul><h3>Built on your experiments</h3><p>The supplied NeuronLab notebooks informed the membrane, temporal-summation, equal-charge, adaptation and delayed-synapse experiments. See the project README for the mapping and numerical conventions.</p>`);}
function showChapters(){notesMode=false;openPanel('EXPEDITION MAP',`<h2>One cell.<br>One journey.</h2><div class="slide-grid">${slides.map((s,i)=>`<button data-slide="${i}" class="${i===position?'active':''}"><span>${pad(i+1)} · ${s.chapter.split(' / ')[1]}</span>${s.title.replace('<br>',' ')}</button>`).join('')}</div><div class="kbd-help"><span><kbd>→</kbd> next</span><span><kbd>←</kbd> previous</span><span><kbd>N</kbd> notes</span><span><kbd>F</kbd> fullscreen</span><span><kbd>H</kbd> hide captions</span><span><kbd>Space</kbd> run experiment</span></div>`);}
async function showShare(){
  notesMode=false;let base=location.href.split('#')[0];let local=false;
  if(['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname)){local=true;try{const r=await fetch('./__host');if(r.ok){const data=await r.json();if(data.urls?.[0])base=data.urls[0]+'/';}}catch{}}
  let url=base+`#slide=${position+1}`;
  openPanel('TAKE THE LAB WITH YOU',`<h2>Your screen.<br>Your experiments.</h2><div class="share-layout"><div id="qr" class="qr"></div><div class="share-content"><label for="share-url">Presentation URL · current stop</label><input class="text-input" id="share-url" value="${escapeHTML(url)}" spellcheck="false"><div class="button-row"><button class="secondary" data-dialog="copy">Copy link</button><button class="secondary" data-dialog="qr">Update QR</button></div><p>${local?'On a local server: use the same Wi-Fi and a reachable computer address. You can edit the address above. Windows Firewall may need to allow this port.':'Scan to open this stop on a phone or laptop.'}</p></div></div><p>Everyone gets an independent experiment. Slide changes are not synchronized. Once hosted on GitHub Pages, the public URL works beyond your local network.</p>`);
  renderQR(url);
}
function renderQR(url){const qr=$('qr');if(!qr)return;try{if(!/^https?:\/\//i.test(url))throw Error('Use an http or https URL.');const code=window.qrcode(0,'M');code.addData(url);code.make();qr.innerHTML=code.createImgTag(5,1,'Scan to open the current presentation slide');}catch(error){qr.textContent='URL is invalid or too long.';}}
function selectPart(part){const descriptions={dendrites:'Branches that receive many incoming signals.',soma:'Cell body · contains the nucleus and cellular machinery.',axon:'Long process that carries electrical pulses.',terminals:'Endings that connect with other cells at synapses.'};if(!descriptions[part])return;focusedPart=part;parts.add(part);renderLab();setStatus(descriptions[part]);world?.focusPart?.(part);if(index!==0&&parts.has('dendrites')&&parts.has('soma'))award('anatomy','Structure shapes the computation.');chime();}

lab.addEventListener('input',e=>{const el=e.target;if(el.dataset.channelCutaway!==undefined){params.channelCutaway=el.checked;return;}const key=el.dataset.param;if(!key)return;params[key]=Number(el.value);const output=$(`out-${key}`);if(output)output.textContent=`${fmt(params[key],Number(el.dataset.digits))} ${el.dataset.unit}`;if(index===5){channelPlaying=false;updateChannelReadout();}else if(hasRun){prepare();playing=true;head=0;}else{result=null;head=0;}});
lab.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.channelStep!==undefined){params.channelView='mechanism';setChannelStep(b.dataset.channelStep);return;}
  if(b.dataset.channelType){params.channelType=b.dataset.channelType;setChannelStep(params.channelStep);return;}
  if(b.dataset.modelStep!==undefined){setModelingStep(b.dataset.modelStep);return;}
  if(b.dataset.modelPreview){params.model=b.dataset.modelPreview;setModelingStep({LIF:0,HH:1,FHN:2}[params.model]);return;}
  if(b.dataset.hhBranch){params.hhBranch=b.dataset.hhBranch;renderLab();return;}
  if(b.dataset.part){selectPart(b.dataset.part);return;}
  if(b.dataset.toggle){const k=b.dataset.toggle;params[k]=!params[k];renderLab();if(![7,6].includes(index))run();return;}
  if(b.dataset.preset){params.gap=b.dataset.preset==='close'?5:40;renderLab();run();return;}
  if(b.dataset.predict){params.prediction=b.dataset.predict;lab.querySelectorAll('[data-predict]').forEach(el=>el.classList.toggle('active',el===b));$('compare').disabled=false;setStatus('Prediction recorded. Now test it.');return;}
  if(b.dataset.burst){params.burst=Number(b.dataset.burst);renderLab();run();return;}
  if(b.dataset.model){params.model=b.dataset.model;if(index===1)world?.setModelingStep?.(params.modelStep,params.model);renderLab();run();return;}
  if(b.dataset.pattern){params.pattern=b.dataset.pattern;renderLab();run();return;}
  const action=b.dataset.action;
  if(action==='scale-play'){playScale();return;}
  if(action==='scale-restart'){playScale(true);return;}
  if(action==='decision-play'){playDecision();return;}
  if(action==='decision-restart'){playDecision(true);return;}
  if(action==='channel-play'){playChannel();return;}
  if(action==='channel-view'){channelPlaying=false;params.channelView=params.channelView==='measured'?'mechanism':'measured';setChannelStep(params.channelStep,false,true);return;}
  if(action==='detail-block-sodium'){params.blockNa=params.blockNa===100?0:100;renderLab();run();return;}
  if(action==='model-proof'){openPanel('THE MODEL',modelTheoryMarkup(params.model)+`<ul class="source-list">${sourceLinks(params.model==='LIF'?['lif']:params.model==='HH'?['hh','gates']:['fhn'])}</ul>`);return;}
  if(action==='compare-models'){openPanel('THREE MODEL FAMILIES',comparisonMarkup()+`<ul class="source-list">${sourceLinks(['lif','hh','gates','fhn'])}</ul>`);return;}
  if(action==='overview'){focusedPart='';renderLab();world?.resetView();return;}
  if(action==='structures'){openPanel('STRUCTURE & MECHANISM','<h2>Protein motion.<br>Structural evidence.</h2><p>The animated view is a structural teaching model: four S1–S6 domains, charged S4 sensors, S4–S5 coupling, inner S6 pore helices, and a selectivity filter. Motion, geometry and timing are exaggerated; this is not an atomistic trajectory or an HH simulation.</p><p>For mammalian-type sodium fast inactivation, the intracellular IFM motif binds beside the pore and stabilizes a nonconducting conformation. The depicted motif is not a plug in the central pathway. The potassium example illustrates activation/deactivation; its other inactivation mechanisms are not animated.</p><p>Inspect measured structure shows separate static Cα coordinates: cockroach NaVPaS (5X0M) and rat Kv chimera with beta subunits (2R9R), oriented by OPM. Backbone traces omit side chains; missing residues remain gaps. These species and static structures are examples, not the exact conformations of the animation or the classic squid HH model.</p><ul class="source-list">'+sourceLinks(['navstructure','kvstructure','opm','navmotion','inactivation','proteinview'])+'</ul>');return;}
  if(action==='begin'){go(position+1);return;}
  if(action==='block-sodium'){params.blockNa=params.blockNa===100?0:100;renderLab();run();return;}
  if(action==='expand'){const expanded=document.body.classList.toggle('lab-expanded');b.textContent=expanded?'↕ SHRINK':'↕ EXPAND';return;}
  if(action==='run'){run();return;}
  if(action==='ride'){world?.rideSignal?.();return;}
  if(action==='equation'){openPanel('THE MEMBRANE EQUATION',`<h2>Nothing disappears.<br>Charge changes state.</h2><div class="formula"><span class="mint">I<sub>in</sub></span> = <span class="purple">C dV/dt</span> + <span class="orange">(V − E<sub>L</sub>)/R</span></div><p>Input current splits between changing charge stored across the membrane and current through the leak pathway. At steady state the stored charge stops changing, and all input flows through the leak.</p><div class="formula">τ dV/dt = E<sub>L</sub> − V + RI &nbsp; · &nbsp; τ = RC</div><p>Higher capacitance means a slower voltage change. Higher resistance means less leak. This passive equation describes subthreshold electrical behavior; a spike threshold and reset are additional LIF rules.</p><ul class="source-list">${sourceLinks(['lif'])}</ul>`);return;}
  if(action==='gate-na'||action==='gate-k'){const key=action==='gate-na'?'naOpen':'kOpen';params[key]=params[key]?0:.5;renderLab();return;}
  if(action==='equilibrium'){params.voltage=nernst(params.kOut,140);renderLab();return;}
  if(action==='model-equation'){openPanel('THE MODEL',modelTheoryMarkup(params.model));return;}
  if(action==='landmark'){openPanel('RESEARCH EXAMPLE / BLUE BRAIN',`<h2>From cell models<br>to a brain circuit.</h2><p>In 2015, researchers reconstructed a small piece of juvenile rat somatosensory cortex, using measurements of neurons and their connections. The published reconstruction contains 31,346 neurons.</p><p>It demonstrates why large simulations must choose which cellular details and connections to represent. The dots on this slide are a data illustration; they do not run that reconstruction.</p><ul class="source-list">${sourceLinks(['bluebrain','portal'])}</ul>`);return;}
  if(action==='journey'){const discoveries=[['anatomy','Structure shapes computation.'],['balance','Current can change stored charge.'],['timing','Timing changes the decision.'],['charge','Equal charge is not equal effect.'],['ions','Gradients can reverse currents.'],['sodium','A spike is a feedback loop.'],['synapse','The receiver has its own state.'],['adaptation','Past events change the rhythm.'],['network','Connections create decisions.'],['budget','Models keep what a question needs.']];openPanel('YOUR EXPEDITION',`<h2>You did more than<br>look at a neuron.</h2><p>${progress.size} discoveries unlocked through your experiments.</p><ul class="source-list">${discoveries.map(([k,t])=>`<li style="color:${progress.has(k)?'var(--mint)':'var(--muted)'}">${progress.has(k)?'✓':'○'} &nbsp; ${t}</li>`).join('')}</ul><p>Choose any stop from the expedition map to keep experimenting.</p>`);}
});

$('timeline').innerHTML=slides.map((s,i)=>`<button aria-label="Slide ${i+1}: ${s.title.replace('<br>',' ')}" title="${s.title.replace('<br>',' ')}" data-jump="${i}"></button>`).join('');
$('timeline').addEventListener('click',e=>{const b=e.target.closest('[data-jump]');if(b)go(Number(b.dataset.jump));});
$('next').onclick=nextStop;$('prev').onclick=previousStop;$('chapters').onclick=showChapters;$('notes').onclick=showNotes;$('sources').onclick=showSources;$('share').onclick=showShare;
$('reset-view').onclick=()=>world?.resetView();
$('close-panel').onclick=()=>{panel.close();notesMode=false;};
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){panel.close();notesMode=false;}}});
panel.addEventListener('close',()=>notesMode=false);
$('panel-body').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.slide){panel.close();go(Number(b.dataset.slide));return;}const action=b.dataset.dialog;if(action==='prev'||action==='next'){go(position+(action==='next'?1:-1));showNotes();}if(action==='qr')renderQR($('share-url').value);if(action==='copy'){try{await navigator.clipboard.writeText($('share-url').value);toast('Link copied.');}catch{$('share-url').select();toast('Select and copy the highlighted link.');}}});
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}}
$('fullscreen').onclick=fullscreen;
$('sound').onclick=()=>{soundOn=!soundOn;$('sound').setAttribute('aria-label',soundOn?'Disable sound':'Enable sound');$('sound').title=`Sound ${soundOn?'on':'off'}`;$('sound').style.color=soundOn?'var(--mint)':'';chime();};
let lowQuality=innerWidth<800;$('quality').onclick=()=>{lowQuality=!lowQuality;world?.quality(lowQuality);$('quality').textContent=lowQuality?'ECO':'HIGH';toast(lowQuality?'Lightweight graphics enabled.':'High quality graphics enabled.');};
function showTools(){notesMode=false;openPanel('PRESENTATION TOOLS',`<h2>Keep exploring.</h2><div class="tools-list"><button data-tool="chapters">Expedition map <span>M ↗</span></button><button data-tool="notes">Presenter notes <span>N ↗</span></button><button data-tool="sources">Scientific references <span>↗</span></button><button data-tool="fullscreen">Fullscreen <span>F ↗</span></button><button data-tool="quality">Graphics quality <span>${lowQuality?'ECO':'HIGH'} ↗</span></button><button data-tool="sound">Sound <span>${soundOn?'ON':'OFF'} ↗</span></button></div>`);}
$('tools').onclick=showTools;
$('panel-body').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(!b)return;const action=b.dataset.tool;if(action==='chapters')showChapters();if(action==='notes')showNotes();if(action==='sources')showSources();if(action==='fullscreen')fullscreen();if(action==='quality'){$('quality').click();showTools();}if(action==='sound'){$('sound').click();showTools();}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(panel.open){if(e.key.toLowerCase()==='n'&&notesMode){panel.close();e.preventDefault();}return;}if(['ArrowRight','PageDown'].includes(e.key)){nextStop();e.preventDefault();}if(['ArrowLeft','PageUp'].includes(e.key)){previousStop();e.preventDefault();}if(e.code==='Space'&&document.activeElement?.tagName!=='BUTTON'){run();e.preventDefault();}if(e.key.toLowerCase()==='n')showNotes();if(e.key.toLowerCase()==='m')showChapters();if(e.key.toLowerCase()==='f')fullscreen();if(e.key.toLowerCase()==='h')document.body.classList.toggle('focus-mode');});
function readLocation(){const hash=new URLSearchParams(location.hash.slice(1)),fromHash=Number(hash.get('slide')),fromQuery=Number(new URLSearchParams(location.search).get('slide')),target=Math.max(0,Math.min(slides.length-1,(fromHash||fromQuery||1)-1));if(target===1)params.modelStep=Math.max(0,Math.min(modelingSteps.length-1,(Number(hash.get('build'))||1)-1));if(target===2){params.channelStep=Math.max(0,Math.min(3,(Number(hash.get('part'))||1)-1));params.channelType=hash.get('channel')==='K'?'K':'Na';params.channelView=hash.get('view')==='measured'?'measured':'mechanism';params.channelPhase=channelStops[params.channelStep]*100;}return target;}
addEventListener('popstate',()=>go(readLocation(),true));
function handlePick(key){if(index===0){selectPart(['myelin','node'].includes(key)?'axon':key);return;}if(index===1){if(key==='model-run')run();return;}if(index===5&&params.channelView==='mechanism'){setChannelStep({'channel-protein':0,'channel-sensor':1,'channel-pore':2}[key]??params.channelStep);return;}if(index===11&&key==='decision-play'){playDecision();return;}if(index===12&&key==='scale-play'){playScale();return;}if([3,7,8].includes(index))run();}

try{world=createWorld($('stage'),{onPick:handlePick});}catch(error){console.error('3D scene initialization failed',error);}
if(!world)$('webgl-fallback').hidden=false;
go(readLocation(),true);
$('loading').style.opacity='0';setTimeout(()=>$('loading').remove(),650);
let lastDraw=0;
function frame(now){
  const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(.05,elapsed);last=now;
  if(index===12&&scalePlaying){scaleTime=Math.min(scaleDuration,scaleTime+elapsed);if(scaleTime>=scaleDuration){scalePlaying=false;award('budget','More state values must be stored and updated.');}}
  const scale=index===12?scaleFilmFrame(scaleTime):null;if(scale)updateScale(scale);
  if(index===11&&decisionPlaying){decisionTime=Math.min(decisionDuration,decisionTime+elapsed);if(decisionTime>=decisionDuration){decisionPlaying=false;award('network','Only the combined inputs crossed threshold.');}}
  const film=index===11?decisionFilmFrame(decisionTime):null;if(film)updateDecision(film);
  if(index===5&&channelPlaying){params.channelPhase=Math.min(100,params.channelPhase+elapsed*100/15);const step=channelState(params.channelPhase/100,params.channelType).stage;if(step!==params.channelStep)setChannelStep(step,false,true);if(params.channelPhase>=100){channelPlaying=false;award('channels','Protein shape controls an ionic pathway.');}}
  if(playing&&result){const prev=head;head=Math.min(result.duration,head+elapsed*result.duration/(index===9||index===10?5:3.6));if(result.spikes.some(t=>t>prev&&t<=head)){world?.pulse();chime();}if(head>=result.duration){playing=false;completed();}}
  const sample=hasRun?sampleAt(result,head):null;
  const state={sample,playing,head,result:hasRun?result:null,hhBranch:params.hhBranch,blockNa:params.blockNa,fhnI:params.fhnI,fhnEpsilon:params.fhnEpsilon,myelin:params.myelin,naOpen:params.naOpen,kOpen:params.kOpen,
    twinSamples:hasRun?[sampleAt(result,head),sampleAt(secondResult,head)]:null,
    twinFlashes:[result,secondResult].map(r=>r?.spikes.some(t=>Math.abs(t-head)<3)?1:0),
    modelIndex:{LIF:0,HH:1,FHN:2}[params.model],measured:params.measured,
    channelPhase:params.channelPhase,channelCutaway:params.channelCutaway,decisionFilm:film,scaleFilm:scale};
  if(index===5)updateChannelReadout();world?.update(now/1000,dt,state);
  if(now-lastDraw>33){lastDraw=now;const shown=hasRun?head:0;chart($('trace'),hasRun?result:null,hasRun?secondResult:null,shown);if(index===9)raster(hasRun?result:null,shown);
    if(index===1&&$('recovery-trace'))chart($('recovery-trace'),hasRun?auxResult:null,null,shown,{autoscale:true,label:'w',timeLabel:'s'});
    if($('spike-count')&&result&&hasRun){const events=result.spikes.filter(t=>t<=head&&(index!==9||(t>=50&&t<450)));$('spike-count').textContent=events.length;if($('rate'))$('rate').textContent=fmt(events.length/.4,1);}
    if($('peak-v')&&result&&hasRun){let peak=-Infinity;for(const s of result.trace){if(s.t>head)break;peak=Math.max(peak,s.v);}$('peak-v').textContent=fmt(peak);}
    if(index===2&&sample){$('rc-in').textContent=fmt(sample.input,2);$('rc-leak').textContent=fmt(sample.leak,2);$('rc-store').textContent=fmt(sample.capacitor,2);}
    if(index===6&&sample){for(const key of ['m','h','n'])$(`gate-${key}`).style.width=`${Math.max(0,Math.min(100,sample[key]*100))}%`;}
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Explicit, read-only diagnostics useful when validating the offline app.
window.neuronDiagnostics=()=>({slide:position+1,modelingStep:index===1?params.modelStep:null,playing,decisionPlaying,decisionTime,scalePlaying,scaleTime,webgl:!!world,model:result?.type,spikes:result?.spikes.length,discoveries:[...progress],scene:world?.snapshot()});
