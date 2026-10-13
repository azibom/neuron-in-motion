import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
for(const [name,id,citation] of [['nav','5x0m','10.1126/science.aal4326'],['kv','2r9r','10.1038/nature06265']]){
  const source=await readFile(resolve(root,`research/structures/${name}-${id}.pdb`),'utf8');
  const chains={};const seen=new Set();
  for(const line of source.split(/\r?\n/)){
    if(line.startsWith('ENDMDL'))break;
    if(!line.startsWith('ATOM  ')||line.slice(12,16).trim()!=='CA'||![' ','A'].includes(line[16]))continue;
    const chain=line[21].trim()||'A',residue=Number(line.slice(22,26)),key=chain+':'+residue;
    if(seen.has(key))continue;seen.add(key);
    (chains[chain]??=[]).push([residue,...[30,38,46].map(start=>Number(line.slice(start,start+8)))]);
  }
  const segments=[];
  for(const [chain,atoms] of Object.entries(chains)){
    let points=[],last=null;
    for(const atom of atoms){
      if(last&&(atom[0]!==last[0]+1||Math.hypot(...atom.slice(1).map((x,i)=>x-last[i+1]))>7)){
        if(points.length>1)segments.push({chain,points});points=[];
      }
      points.push(atom);last=atom;
    }
    if(points.length>1)segments.push({chain,points});
  }
  const output={pdb:id.toUpperCase(),representation:'C-alpha backbone; missing residues remain gaps',
    coordinates:'OPM membrane orientation, Angstroms; rigid transform of deposited PDB coordinates',
    source:`https://opm-assets.storage.googleapis.com/pdb/${id}.pdb`,citation:`https://doi.org/${citation}`,
    count:seen.size,segments};
  await writeFile(resolve(root,`assets/${name}-${id}.json`),JSON.stringify(output));
  console.log(`${id}: ${seen.size} C-alpha positions, ${segments.length} continuous segments. Chains: ${Object.entries(chains).map(([c,a])=>`${c}=${a.length}`).join(', ')}`);
}
