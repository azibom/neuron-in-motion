import test from 'node:test';
import assert from 'node:assert/strict';
import {scaleModels,scaleFilmFrame,scalePopulation,scaleDuration} from '../scale-film.mjs';
test('population stays fixed while counts follow the actual model state dimensions',()=>{
  assert.equal(scalePopulation,10000);
  assert.deepEqual(scaleModels.map(m=>m.values),[1,2,4]);
  assert.deepEqual(scaleModels.map(m=>m.total),[10000,20000,40000]);
  for(const m of scaleModels){assert.equal(m.keys.length,m.values);assert.equal(m.total,m.values*scalePopulation);}
});
test('one-click explanation reveals one record before the final state-count conclusion',()=>{
  assert.equal(scaleFilmFrame(0).revealed,false);
  for(const [t,model,total] of [[4,'LIF',10000],[10,'FHN',20000],[16,'HH',40000]]){
    const frame=scaleFilmFrame(t);assert.equal(frame.model,model);assert.equal(frame.total,total);assert.equal(frame.revealed,true);
  }
  assert.equal(scaleFilmFrame(scaleDuration).ended,true);assert.equal(scaleFilmFrame(scaleDuration).phase,4);
});
