import test from 'node:test';
import assert from 'node:assert/strict';
import { channelState,channelStops } from '../channel-state.mjs';
test('Na storyboard distinguishes resting closure, activation, inactivation and recovery',()=>{
  assert.equal(channelState(channelStops[0]).conducting,false);
  assert.ok(channelState(channelStops[1]).sensor>.8);
  assert.equal(channelState(channelStops[1]).conducting,false);
  assert.equal(channelState(channelStops[2]).conducting,true);
  const inactive=channelState(channelStops[3]);
  assert.equal(inactive.label,'Inactivated');assert.equal(inactive.conducting,false);assert.equal(inactive.sensor,1);
  const recovered=channelState(1);assert.equal(recovered.sensor,0);assert.equal(recovered.bound,0);assert.equal(recovered.label,'Ready again');
});
test('Kv activation/deactivation has no sodium IFM inactivation state',()=>{
  assert.equal(channelState(.56,'K').conducting,true);
  assert.equal(channelState(1,'K').conducting,false);
  for(let i=0;i<=1000;i++)assert.equal(channelState(i/1000,'K').bound,0);
});
test('a nonconducting pore never displays transiting ions throughout either cycle',()=>{
  for(const type of ['Na','K'])for(let i=0;i<=1000;i++){
    const s=channelState(i/1000,type);
    for(const key of ['sensor','bound','aperture'])assert.ok(s[key]>=0&&s[key]<=1);
    if(s.conducting){assert.ok(s.aperture>.92);assert.ok(s.bound<.08);}
  }
});
