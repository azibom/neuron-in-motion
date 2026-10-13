import { channelStepInfo, channelState } from './channel-state.mjs';
export function channelMarkup(p, { header, slider }) {
  const steps = channelStepInfo(p.channelType), measured = p.channelView === 'measured';
  return `${header('INSIDE AN ION CHANNEL', '3D EXPLORER')}
    <div class="segments channel-types" aria-label="Channel type">${['Na','K'].map(type => `<button class="segment ${p.channelType===type?'active':''}" data-channel-type="${type}" aria-pressed="${p.channelType===type}">${type==='Na'?'Sodium · Na⁺':'Potassium · K⁺'}</button>`).join('')}</div>
    ${measured ? '<div class="channel-evidence"><b>Measured backbone</b><span id="channel-structure-label">Loading coordinates…</span></div>' : `<div class="channel-stops" aria-label="Mechanism chapters">${steps.map((step,i)=>`<button data-channel-step="${i}" class="${p.channelStep===i?'active':''}" aria-pressed="${p.channelStep===i}"><span>0${i+1}</span>${step.name}<i>↗</i></button>`).join('')}</div>
    <div class="channel-state"><span id="channel-state">${channelState(p.channelPhase/100,p.channelType).label}</span><small id="channel-voltage">${channelState(p.channelPhase/100,p.channelType).voltage}</small></div>
    <button class="primary" data-action="channel-play" aria-pressed="false">Play the full cycle<span>▶</span></button>
    ${slider('channelPhase','Scrub the motion',p.channelPhase,0,100,.1,'% of cycle',0)}`}
    <div class="channel-view"><button class="quiet small" data-action="channel-view">${measured?'Return to mechanism ↗':'Inspect measured structure ↗'}</button><button class="quiet small" data-action="structures">Evidence ↗</button></div>
    ${measured ? '<p class="hint">Static experimental coordinates · drag to inspect.</p>' : '<label class="channel-cutaway"><input type="checkbox" data-channel-cutaway '+(p.channelCutaway?'checked':'')+'> Cutaway view</label><p class="hint">Structural teaching animation · motion exaggerated.</p>'}`;
}
