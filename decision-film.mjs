import { simulateLIF } from './physics.mjs';

export const decisionDuration=27;
export const decisionCases=[
  {key:'none',label:'Neither',a:0,b:0},
  {key:'a',label:'A only',a:1,b:0},
  {key:'b',label:'B only',a:0,b:1},
  {key:'both',label:'A + B',a:1,b:1}
].map(c=>{
  const events=[...(c.a?[{t:30,weight:8}]:[]),...(c.b?[{t:30,weight:8}]:[])];
  const result=simulateLIF({duration:65,events});
  return {...c,result,peakRise:Math.max(...result.trace.map(s=>s.v+65)),fires:result.spikes.length>0};
});
export const decisionChapters=[
  {title:'One receiver.<br>Two possible inputs.',cue:'Watch which messages make it fire.',label:'Meet the circuit'},
  {title:'A arrives.<br>It stays quiet.',cue:'One message raises voltage, but not enough.',label:'A alone'},
  {title:'B arrives.<br>Still quiet.',cue:'The second input has the same effect on its own.',label:'B alone'},
  {title:'Together,<br>they cross the line.',cue:'Two simultaneous messages trigger one output event.',label:'A + B together'},
  {title:'Both are needed.<br>A decision emerges.',cue:'Inputs change voltage. Threshold turns that state into an event.',label:'The result'}
];
const clamp=x=>Math.max(0,Math.min(1,x));
export function decisionFilmFrame(seconds=0){
  const t=Math.max(0,Math.min(decisionDuration,Number(seconds)||0));
  const phase=t<3?0:t<9?1:t<15?2:t<22?3:4;
  const start=[0,3,9,15,22][phase],local=t-start;
  const c=decisionCases[phase===4?3:phase];
  // Deliberately slowed playback. Hold the event-time sample for one second so
  // the viewer can see the threshold crossing; the underlying LIF trace resets.
  const head=phase===0?0:phase===4?65:local<1?20*local:local<2?20+(local-1)*10:local<3?30:Math.min(65,30+(local-3)*35);
  const sample=c.result.trace[Math.min(c.result.trace.length-1,Math.floor(head/c.result.dt+1e-7))];
  const arrived=phase>0&&(phase===4||local>=2);
  const fired=arrived&&c.fires;
  const complete=[t>=3,t>=9,t>=15,t>=22];
  return {t,phase,local,head,a:phase===4?0:c.a,b:phase===4?0:c.b,caseKey:c.key,
    arrived,fired,voltage:sample.v,rise:Math.max(0,sample.v+65),peakRise:arrived?c.peakRise:0,
    inputProgress:phase>0&&phase<4?clamp(local-1):0,
    outputProgress:fired&&phase<4?clamp((local-2)/1.3):0,
    emitting:phase>0&&phase<4&&local>=1&&local<2,
    outputMoving:fired&&phase<4&&local>=2&&local<3.3,
    complete,ended:t>=decisionDuration};
}
export function decisionMarkup({header}){
  return `${header('WATCH THE DECISION','GUIDED FILM')}
    <div class="decision-cases" aria-label="Four input conditions">${decisionCases.map(c=>`<div id="decision-case-${c.key}" class="decision-case"><span>${c.label}</span><b>—</b></div>`).join('')}</div>
    <div class="decision-peak"><span>Peak voltage rise</span><div><b id="decision-rise">0</b><small>/ 15 mV to fire</small></div></div>
    <div class="decision-meter"><i id="decision-fill"></i><span></span></div>
    <div class="decision-outcome" id="decision-outcome" role="status">Press play. Follow the messages.</div>
    <button class="primary" data-action="decision-play" aria-pressed="false">Play the explanation<span>▶</span></button>
    <div class="decision-progress"><i id="decision-progress"></i></div>
    <div class="decision-controls"><span id="decision-chapter">27 seconds · one continuous story</span><button class="quiet small" data-action="decision-restart" aria-label="Replay from the beginning">↺</button></div>`;
}
