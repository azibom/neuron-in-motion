import { mkdir, cp, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url)),dest=resolve(root,'dist');
await mkdir(dest,{recursive:true});
for(const file of ['index.html','styles.css','app.mjs','physics.mjs','scene.mjs','content.mjs','modeling.mjs','modeling-scene.mjs','channel-state.mjs','channel-ui.mjs','channel-scene.mjs','decision-film.mjs','decision-scene.mjs','scale-film.mjs','scale-scene.mjs','benchmark-worker.mjs','LICENSE','THIRD_PARTY.md','assets','vendor'])await cp(resolve(root,file),resolve(dest,file),{recursive:true});
await writeFile(resolve(dest,'.nojekyll'),'');
console.log(`Static GitHub Pages output ready: ${dest}`);
