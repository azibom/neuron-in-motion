import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFHN,fhnDerivative,fhnInitial,estimateState,benchmark} from '../physics.mjs';
test('dimensionless FHN rests at its equilibrium and conserves the normalized current balance',()=>{
  const resting=simulateFHN({duration:20,current:()=>0});
  assert.ok(resting.trace.every(s=>Math.abs(s.v-resting.trace[0].v)<1e-10));
  assert.equal(resting.spikes.length,0);
  for(const s of simulateFHN().trace){assert.ok(Number.isFinite(s.v)&&Number.isFinite(s.w));assert.ok(Math.abs(s.input-s.ionic-fhnDerivative([s.v,s.w],s.input)[0])<1e-10);}
});
test('FHN creates continuous excursions without resets and converges with a smaller step',()=>{
  const coarse=simulateFHN(),fine=simulateFHN({dt:.01});
  assert.ok(coarse.spikes.length>0);assert.equal(coarse.spikes.length,fine.spikes.length);
  assert.ok(Math.max(...coarse.trace.map(s=>s.v))>1.5);
  assert.ok(Math.abs(coarse.trace.at(-1).v-fine.trace.at(-1).v)<.01);
  const fast=simulateFHN({epsilon:.16}),slow=simulateFHN({epsilon:.04});assert.notEqual(fast.spikes.length,slow.spikes.length);
});
test('FHN compute budget counts two states and benchmark labels dimensionless time',()=>{
  assert.equal(estimateState('FHN',10000).bytes,160000);
  assert.ok(fhnInitial().every(Number.isFinite));
  const r=benchmark('FHN',20);assert.equal(r.timeUnit,'dimensionless');assert.ok(Number.isFinite(r.checksum));
});
