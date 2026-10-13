import test from 'node:test';
import assert from 'node:assert/strict';
import {decisionCases,decisionFilmFrame,decisionDuration} from '../decision-film.mjs';
test('independent film trials use numerical LIF outcomes, not a hard-coded truth table',()=>{
  assert.deepEqual(decisionCases.map(c=>c.result.spikes.length),[0,0,0,1]);
  assert.deepEqual(decisionCases.map(c=>c.peakRise),[0,8,8,16]);
  assert.equal(decisionCases[3].result.spikes[0],30);
  for(const c of decisionCases){assert.equal(c.result.trace[0].v,-65);assert.equal(c.result.threshold,-50);}
});
test('delivery precedes arrival and only the paired case emits an output',()=>{
  for(const start of [3,9,15]){
    const travelling=decisionFilmFrame(start+1.5);assert.equal(travelling.emitting,true);assert.equal(travelling.arrived,false);assert.equal(travelling.fired,false);
    const arrived=decisionFilmFrame(start+2.2);assert.equal(arrived.arrived,true);assert.equal(arrived.fired,start===15);assert.equal(arrived.outputMoving,start===15);
  }
});
test('summary uses completed trials and peak meter stays distinct from reset voltage',()=>{
  assert.deepEqual(decisionFilmFrame(0).complete,[false,false,false,false]);
  const summary=decisionFilmFrame(decisionDuration);assert.deepEqual(summary.complete,[true,true,true,true]);assert.equal(summary.ended,true);assert.equal(summary.peakRise,16);assert.equal(summary.voltage,-65);
});
