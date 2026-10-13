import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateLIF, simulateHH, temporalExperiment, equalChargeExperiment,
  nernst, hhRates, synapseExperiment, networkTruth, estimateState } from '../physics.mjs';

test('RC response matches analytical solution and conserves signed current',()=>{
  const r=simulateLIF({passive:true,duration:50,current:()=>.2});
  for(const s of r.trace){assert.ok(Math.abs(s.v-(-65+20*(1-Math.exp(-s.t/10))))<1e-8);assert.ok(Math.abs(s.input-s.leak-s.capacitor)<1e-12);}
});
test('larger capacitance slows voltage change without changing asymptote',()=>{
  const slow=simulateLIF({C:.2,passive:true,duration:20,current:()=>.2});
  const fast=simulateLIF({C:.1,passive:true,duration:20,current:()=>.2});
  assert.ok(slow.trace.at(-1).v<fast.trace.at(-1).v);
});
test('timing experiment: same charge, close pulses fire and distant pulses do not',()=>{
  assert.equal(temporalExperiment(5).spikes.length,1);
  assert.equal(temporalExperiment(40).spikes.length,0);
});
test('equal-charge experiment has distinct outcomes',()=>{
  const [short,long]=equalChargeExperiment();assert.equal(short.spikes.length,1);assert.equal(long.spikes.length,0);
});
test('Nernst values, equilibrium and concentration-induced current reversal',()=>{
  assert.ok(Math.abs(nernst(145,15)-60.63)<.1);
  assert.ok(Math.abs(nernst(4,140)+95.02)<.1);
  assert.equal(nernst(10,10),0);
  assert.ok(-65-nernst(4,140)>0);assert.ok(-65-nernst(40,140)<0);
});
test('HH rate singularities are removable and all rates stay finite',()=>{
  for(const v of [-80,-65,-55,-40,0,50])for(const n of Object.values(hhRates(v)))assert.ok(Number.isFinite(n)&&n>0);
});
test('classic HH: rest stable, stimulus creates a spike, sodium blockade removes it',()=>{
  const rest=simulateHH({duration:60});assert.ok(Math.abs(rest.trace.at(-1).v+65)<.1);
  const current=t=>t>=5&&t<6?20:0;
  const active=simulateHH({current});assert.equal(active.spikes.length,1);assert.ok(Math.max(...active.trace.map(s=>s.v))>30);
  assert.equal(simulateHH({current,sodium:0}).spikes.length,0);
});
test('HH integration converges when the step is halved',()=>{
  const options={duration:30,current:t=>t>=5&&t<6?20:0};
  const a=simulateHH({...options,dt:.025}),b=simulateHH({...options,dt:.0125});
  assert.equal(a.spikes.length,b.spikes.length);assert.ok(Math.abs(a.spikes[0]-b.spikes[0])<.05);
});
test('synaptic arrival need not cause output; a close burst can',()=>{
  assert.equal(synapseExperiment(8,2,1).spikes.length,0);
  assert.ok(synapseExperiment(8,2,3).spikes.length>0);
  assert.equal(synapseExperiment(8,2,3,true).spikes.length,0);
});
test('AND challenge is solvable and inhibition can suppress output',()=>{
  assert.deepEqual(networkTruth(8).map(x=>x.out),[0,0,0,1]);
  assert.deepEqual(networkTruth(8,10).map(x=>x.out),[0,0,0,0]);
});
test('compute-budget estimate counts only continuous float64 state',()=>{
  assert.equal(estimateState('LIF',10000).bytes,80000);assert.equal(estimateState('HH',10000).bytes,320000);
});
