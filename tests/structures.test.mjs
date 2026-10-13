import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { slides } from '../content.mjs';
test('causal narrative covers every scene once, in intended order',()=>{
  assert.deepEqual(slides.map(s=>s.scene),[0,1,5,7,8,3,4,9,11,12,13]);
  assert.ok(slides.every(s=>s.notes.length>=4&&s.refs.length>0));
});
for(const [file,count] of [['nav-5x0m',1323],['kv-2r9r',2848]]){
  test(`${file}: local experimental Cα data stays finite and preserves backbone gaps`,async()=>{
    const data=JSON.parse(await readFile(new URL(`../assets/${file}.json`,import.meta.url),'utf8'));
    assert.equal(data.count,count);
    for(const s of data.segments)for(let i=0;i<s.points.length;i++){
      const p=s.points[i];assert.ok(p.every(Number.isFinite));
      if(i){const prev=s.points[i-1];assert.equal(p[0]-prev[0],1);assert.ok(Math.hypot(...p.slice(1).map((x,j)=>x-prev[j+1]))<=7);}
    }
  });
}
