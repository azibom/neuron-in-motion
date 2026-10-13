// A deliberately slowed structural storyboard, not an atomistic simulation or HH kinetics.
const clamp = x => Math.max(0, Math.min(1, x));
const ramp = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const channelStops = [0, .29, .56, .80];
export function channelState(progress = 0, type = 'Na') {
  const p = clamp(Number(progress) || 0), sodium = type === 'Na';
  const sensor = ramp(p, .12, .32) * (1 - ramp(p, .84, 1));
  const activation = ramp(p, .32, .48);
  const bound = sodium ? ramp(p, .65, .76) * (1 - ramp(p, .87, 1)) : 0;
  const aperture = sodium ? activation * (1 - bound) * (1 - ramp(p, .84, .96)) : activation * (1 - ramp(p, .66, .82));
  const conducting = aperture > .92 && bound < .08;
  const stage = p < .18 ? 0 : p < .34 ? 1 : p < .67 ? 2 : 3;
  const label = p >= .995 ? 'Ready again' : p > .87 ? 'Recovering' : bound > .75 ? 'Inactivated' : conducting ? 'Open' : sensor > .03 && aperture < .05 && p < .34 ? 'Sensor moving' : aperture > .05 ? 'Pore changing' : 'Closed';
  return { p, sensor, bound, aperture, conducting, stage, label, voltage: p < .12 || p >= .84 ? 'Resting / repolarized' : 'Depolarized' };
}
export function channelStepInfo(type = 'Na') {
  const sodium = type === 'Na';
  return [
    { name: 'Folded protein', title: 'A protein.<br>A passage.', cue: sodium ? 'One chain · four repeated domains.' : 'Four protein subunits · one shared pore.', note: 'The coils trace folded protein chains. They are not hollow tubes; ions pass through the central pore.' },
    { name: 'Sense voltage', title: 'Voltage moves<br>part of the protein.', cue: 'Charged S4 segments respond to the electric field.', note: 'Gold charges mark the voltage sensor. Sensor movement is coupled to the pore through the S4–S5 linker.' },
    { name: 'Open the pore', title: 'Shape changes.<br>Ions can pass.', cue: 'The inner S6 helices rearrange around the passage.', note: 'Inspect the pore from above. A selectivity filter favors the channel’s ion; an open channel is not a pump.' },
    { name: sodium ? 'Inactivate & recover' : 'Close & reset', title: sodium ? 'Open is temporary.<br>Recovery matters.' : 'Voltage returns.<br>The pore closes.', cue: sodium ? 'An intracellular motif binds beside the pore.' : 'Sensor and pore return toward their resting arrangement.', note: sodium ? 'The IFM motif binds to a side pocket and stabilizes a nonconducting arrangement. It does not act as a cork in the central pore.' : 'This Kv example illustrates activation and deactivation. Potassium channels also have other, subtype-dependent inactivation mechanisms.' }
  ];
}
