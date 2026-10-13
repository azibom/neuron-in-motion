// LIF/HH: ms and mV. FHN: dimensionless state, input and time.
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export function nernst(outside, inside, temperature = 37, z = 1) {
  if (outside <= 0 || inside <= 0 || z === 0) throw new RangeError('Positive concentrations and nonzero valence required');
  return 1000 * 8.314462618 * (temperature + 273.15) / (z * 96485.33212) * Math.log(outside / inside);
}

export function simulateLIF({ duration = 120, dt = .1, R = 100, C = .1, rest = -65,
  threshold = -50, reset = -65, refractory = 5, current = () => 0,
  events = [], adaptation = 0, tauW = 120, passive = false } = {}) {
  // R: MΩ, C: nF, I: nA. MΩ × nF = ms; MΩ × nA = mV.
  const tau = R * C, trace = [], spikes = [];
  let v = rest, blockedUntil = -1, w = 0, ei = 0;
  const ordered = [...events].sort((a, b) => a.t - b.t);
  for (let k = 0; k <= Math.round(duration / dt); k++) {
    const t = k * dt, input = current(t);
    while (ei < ordered.length && ordered[ei].t <= t + 1e-8) {
      if (t >= blockedUntil) v += ordered[ei].weight;
      ei++;
    }
    let fired = false;
    if (!passive && t >= blockedUntil && v >= threshold) fired = true;
    const leak = (v - rest) / R;
    trace.push({ t, v, input, leak, capacitor: input - leak - w, w });
    if (k === Math.round(duration / dt)) break;
    if (t >= blockedUntil && !fired) {
      // Exact exponential update for piecewise constant current over this step.
      const target = rest + R * (input - w);
      v = target + (v - target) * Math.exp(-dt / tau);
      if (!passive && v >= threshold) fired = true;
    }
    w *= Math.exp(-dt / tauW);
    if (fired) {
      spikes.push(t); v = reset; blockedUntil = t + refractory; w += adaptation;
    } else if (t < blockedUntil) v = reset;
  }
  return { trace, spikes, dt, duration, type: passive ? 'RC' : 'LIF', threshold, units: 'nA' };
}

const safeExp = x => Math.exp(clamp(x, -80, 80));
const vtrap = (x, y) => Math.abs(x / y) < 1e-7 ? y * (1 - x / y / 2) : x / Math.expm1(x / y);
export function hhRates(v) {
  return {
    am: .1 * vtrap(-(v + 40), 10), bm: 4 * safeExp(-(v + 65) / 18),
    ah: .07 * safeExp(-(v + 65) / 20), bh: 1 / (1 + safeExp(-(v + 35) / 10)),
    an: .01 * vtrap(-(v + 55), 10), bn: .125 * safeExp(-(v + 65) / 80)
  };
}
export function hhInitial() {
  const r = hhRates(-65);
  return [-65, r.am / (r.am + r.bm), r.ah / (r.ah + r.bh), r.an / (r.an + r.bn)];
}
export function hhCurrents([v, m, h, n], sodium = 1, potassium = 1) {
  return { na: 120 * sodium * m ** 3 * h * (v - 50), k: 36 * potassium * n ** 4 * (v + 77), leak: .3 * (v + 54.387) };
}
export function hhDerivative(state, input = 0, sodium = 1, potassium = 1) {
  const [v, m, h, n] = state, r = hhRates(v), c = hhCurrents(state, sodium, potassium);
  return [input - c.na - c.k - c.leak, r.am * (1 - m) - r.bm * m,
    r.ah * (1 - h) - r.bh * h, r.an * (1 - n) - r.bn * n];
}
export function rk4(state, dt, derivative) {
  const a = derivative(state), b = derivative(state.map((x, i) => x + dt * a[i] / 2));
  const c = derivative(state.map((x, i) => x + dt * b[i] / 2));
  const d = derivative(state.map((x, i) => x + dt * c[i]));
  return state.map((x, i) => x + dt * (a[i] + 2 * b[i] + 2 * c[i] + d[i]) / 6);
}
export function simulateHH({ duration = 60, dt = .025, current = () => 0, sodium = 1, potassium = 1 } = {}) {
  // Classic squid axon HH at 6.3 °C. I: µA/cm², C=1 µF/cm², g: mS/cm².
  let s = hhInitial(), previous = s[0];
  const trace = [], spikes = [];
  for (let i = 0; i <= Math.round(duration / dt); i++) {
    const t = i * dt, input = current(t), currents = hhCurrents(s, sodium, potassium);
    trace.push({ t, v: s[0], m: s[1], h: s[2], n: s[3], input, ...currents });
    if (s[0] >= 0 && previous < 0) spikes.push(t);
    previous = s[0];
    s = rk4(s, dt, x => hhDerivative(x, input, sodium, potassium));
  }
  return { trace, spikes, dt, duration, type: 'HH', units: 'µA/cm²' };
}

export function temporalExperiment(gap = 5, amplitude = .2) {
  return simulateLIF({ current: t => (t >= 20 && t < 30) || (t >= 30 + gap && t < 40 + gap) ? amplitude : 0 });
}
export function equalChargeExperiment() {
  return [simulateLIF({ current: t => t >= 20 && t < 25 ? .6 : 0 }),
    simulateLIF({ current: t => t >= 20 && t < 50 ? .1 : 0 })];
}
export function synapseExperiment(weight = 8, delay = 2, count = 1, inhibitory = false) {
  return simulateLIF({ events: Array.from({ length: count }, (_, i) => ({ t: 20 + delay + i * 4, weight: inhibitory ? -weight : weight })) });
}
export function networkExperiment(a, b, weight = 5, inhibition = 0) {
  const events = [];
  for (const t of [20, 50, 80]) {
    if (a) events.push({ t: t + 2, weight });
    if (b) events.push({ t: t + 2, weight });
    if (inhibition) events.push({ t: t + 2, weight: -inhibition });
  }
  return simulateLIF({ events });
}
export function networkTruth(weight, inhibition = 0) {
  return [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => ({ a, b, out: networkExperiment(a, b, weight, inhibition).spikes.length > 0 ? 1 : 0 }));
}

export function modelComparison(model = 'LIF', pattern = 'regular') {
  // Drives are illustrative, model-specific; their numeric values are not equal physical currents.
  if (model === 'HH') return simulateHH({ duration: 120, current: t => t > 20 && t < 100 ? 10 : 0 });
  if (model === 'FHN') return simulateFHN();
  return simulateLIF({ duration: 400, current: t => t > 30 && t < 350 ? .3 : 0, adaptation: pattern === 'regular' ? 0 : .04 });
}

export function estimateState(model, count) {
  const states = { LIF: 1, HH: 4, FHN: 2 }[model];
  return { states, bytes: states * count * 8, neurons: count };
}

export function benchmark(model, count = 1000) {
  // Uncoupled neurons, 10 ms. This excludes synapses, rendering and array allocation time.
  count = clamp(Math.round(count), 1, 10000);
  const dt = model === 'HH' ? .025 : model==='FHN'?.02:.1, steps = Math.round(10 / dt);
  let checksum = 0;
  const states = Array.from({ length: count }, () => model === 'HH' ? hhInitial() : model === 'FHN'?fhnInitial():[-65]);
  const start = performance.now();
  for (let step = 0; step < steps; step++) {
    for (let i = 0; i < count; i++) {
      let s = states[i];
      if (model === 'HH') states[i] = rk4(s, dt, x => hhDerivative(x, 10));
      else if(model==='FHN')states[i]=rk4(s,dt,x=>fhnDerivative(x,.55));
       else { s[0] = -35 + (s[0] + 35) * Math.exp(-dt / 10); if (s[0] >= -50) s[0] = -65; }
    }
  }
  const elapsed = performance.now() - start;
  for (const s of states) checksum += s[0];
  return { elapsed, dt, steps, count, checksum, timeUnit:model==='FHN'?'dimensionless':'ms', ...estimateState(model, count) };
}

// One dimensionless FitzHugh–Nagumo form. No reset rule or physical current units.
export function fhnDerivative([v,w],input=0,a=.7,b=.8,epsilon=.08){
  return [input+v-v**3/3-w,epsilon*(v+a-b*w)];
}
export function fhnInitial(a=.7,b=.8){
  // At zero input: w=(v+a)/b and v-v³/3-w=0. Bracket the negative rest state.
  let lo=-4,hi=0;for(let k=0;k<80;k++){const v=(lo+hi)/2,value=v-v**3/3-(v+a)/b;if(value>0)lo=v;else hi=v;}
  const v=(lo+hi)/2;return [v,(v+a)/b];
}
export function simulateFHN({duration=120,dt=.02,a=.7,b=.8,epsilon=.08,current=s=>s>=10&&s<100?.55:0}={}){
  let state=fhnInitial(a,b),previous=state[0];const trace=[],spikes=[];
  for(let k=0;k<=Math.round(duration/dt);k++){
    const t=k*dt,input=current(t),[v,w]=state,ionic=w-v+v**3/3;
    trace.push({t,v,w,input,ionic,capacitor:input-ionic});
    if(v>=0&&previous<0)spikes.push(t);previous=v;
    if(k<Math.round(duration/dt))state=rk4(state,dt,x=>fhnDerivative(x,input,a,b,epsilon));
  }
  return {trace,spikes,dt,duration,type:'FHN',units:'dimensionless',timeUnit:'s · dimensionless',parameters:{a,b,epsilon}};
}
