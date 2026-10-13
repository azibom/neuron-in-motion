import { estimateState } from './physics.mjs';

export const scalePopulation=10000,scaleDuration=25;
export const scaleModels=[
  {name:'LIF',keys:['V'],meaning:'Voltage',color:0x87e8cd},
  {name:'FHN',keys:['v','w'],meaning:'Excitation + recovery',color:0xb8a3ed},
  {name:'HH',keys:['V','m','h','n'],meaning:'Voltage + 3 gating variables',color:0xffc18a}
].map(m=>({...m,values:estimateState(m.name,1).states,total:estimateState(m.name,scalePopulation).states*scalePopulation}));
export const scaleChapters=[
  {title:'What must the<br>computer remember?',cue:'Start with one neuron and the numbers describing its state.'},
  {title:'Keep the<br>voltage.',cue:'LIF · one changing value.'},
  {title:'Also keep<br>recovery.',cue:'FHN · excitation and recovery.'},
  {title:'Also track<br>the channels.',cue:'HH · voltage and three gating variables.'},
  {title:'Keep what<br>your question needs.',cue:'More detail is useful when it helps answer the question.'}
];
export function scaleFilmFrame(seconds=0){
  const t=Math.max(0,Math.min(scaleDuration,Number(seconds)||0));
  const phase=t<3?0:t<9?1:t<15?2:t<21?3:4;
  const model=scaleModels[Math.max(0,Math.min(2,phase-1))],start=[0,3,9,15,21][phase];
  return {t,phase,model:model.name,keys:model.keys,values:model.values,total:model.total,meaning:model.meaning,color:model.color,
    revealed:phase>0,cloudOpacity:phase===0?.08:.55,reveal:Math.min(1,(t-start)/.9),ended:t>=scaleDuration};
}
export function scaleMarkup({header}){
  return `${header('A NEURON AS DATA','GUIDED EXPLANATION')}
    <div class="scale-models" aria-label="Models in the explanation">${scaleModels.map(m=>`<span id="scale-model-${m.name}">${m.name}<small>${m.values}</small></span>`).join('')}</div>
    <div class="scale-record"><span>One neuron keeps</span><div><b id="scale-values">—</b><small id="scale-word">numbers</small></div><p id="scale-meaning">A number can describe its current voltage.</p></div>
    <div class="scale-total"><span>In 10,000 neurons</span><b id="scale-total">—</b><small>numbers describing their state</small></div>
    <button class="primary" data-action="scale-play" aria-pressed="false">Play the explanation<span>▶</span></button>
    <div class="decision-progress"><i id="scale-progress"></i></div>
    <div class="decision-controls"><span id="scale-chapter">25 seconds · one idea</span><button class="quiet small" data-action="scale-restart" aria-label="Replay this explanation">↺</button></div>
    <button class="quiet small scale-research" data-action="landmark">A real research example ↗</button>`;
}
