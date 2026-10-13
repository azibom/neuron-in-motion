import * as THREE from './vendor/three.module.js';
import { channelState } from './channel-state.mjs';

// Architecture and motion follow structural evidence; schematic coordinates and
// synchronized timing are intentionally illustrative. Experimental coordinates
// are displayed separately, without morphing them into invented conformations.
export function createChannelScene({ scene, clickable, low = false }) {
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  const root=new THREE.Group();root.position.set(0,0,1.6);scene.add(root);
  const mechanism=new THREE.Group(),measured=new THREE.Group();root.add(mechanism,measured);
  const colors=[0x65cdb9,0x72aecd,0xa692d7,0xc0d195], gold=0xffc783,ink=0xd5f3e9;
  const material=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.48,metalness:.06,clearcoat:.28,emissive:color,emissiveIntensity:.07,...extra});
  const beamMat=material(0x73988e,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
  const membrane=new THREE.Group();root.add(membrane);
  const disc=new THREE.Shape();disc.absarc(0,0,5.2,0,Math.PI*2,false);
  const hole=new THREE.Path();hole.absarc(0,0,2.85,0,Math.PI*2,true);disc.holes.push(hole);
  for(const z of [-1.5,1.5]){const m=new THREE.Mesh(new THREE.ShapeGeometry(disc,64),beamMat);m.position.z=z;membrane.add(m);}
  const headGeo=new THREE.SphereGeometry(.11,8,6),lipidMaterial=material(0x537a78,{roughness:.85});
  const heads=[];for(let x=-5;x<=5;x+=.37)for(let y=-5;y<=5;y+=.37){const r=Math.hypot(x,y);if(r<2.85||r>5.1)continue;for(const z of [-1.5,1.5])heads.push([x,y,z]);}
  const lipids=new THREE.InstancedMesh(headGeo,lipidMaterial,heads.length),dummy=new THREE.Object3D();
  heads.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();lipids.setMatrixAt(i,dummy.matrix);});membrane.add(lipids);
  const tailGeo=new THREE.CylinderGeometry(.023,.023,1.18,4),tails=new THREE.InstancedMesh(tailGeo,material(0x596859),heads.length*2);
  heads.forEach(([x,y,z],i)=>{for(let j=0;j<2;j++){dummy.position.set(x+(j?-.05:.05),y,z-Math.sign(z)*.68);dummy.rotation.set(Math.PI/2,0,0);dummy.updateMatrix();tails.setMatrixAt(i*2+j,dummy.matrix);}});membrane.add(tails);
  function curveMesh(parent,points,radius,color,segments=30){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,6,false),typeof color==='number'?material(color):color);parent.add(mesh);return mesh;
  }
  function reshape(mesh,points){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p)),geo=mesh.geometry;
    const count=geo.parameters.tubularSegments,radius=geo.parameters.radius,radial=geo.parameters.radialSegments,frames=curve.computeFrenetFrames(count,false),positions=geo.attributes.position;
    for(let i=0;i<=count;i++){const center=curve.getPointAt(i/count);for(let j=0;j<=radial;j++){const a=j/radial*Math.PI*2,p=center.clone().addScaledVector(frames.normals[i],-radius*Math.cos(a)).addScaledVector(frames.binormals[i],radius*Math.sin(a));positions.setXYZ(i*(radial+1)+j,p.x,p.y,p.z);}}
    positions.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
  }
  function text(parent,value,pos,width=2.5,color='#bddecf'){
    const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='500 44px Segoe UI';c.width=Math.ceil(ctx.measureText(value).width)+30;c.height=80;ctx.font='500 44px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,c.width/2,40);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));sprite.position.set(...pos);const h=Math.min(.32,width*c.height/c.width);sprite.scale.set(h*c.width/c.height,h,1);parent.add(sprite);return sprite;
  }
  // One reusable helical backbone; its continuous coils make the folded chain visible.
  const helixPoints=[];for(let i=0;i<=150;i++){const f=i/150,a=f*Math.PI*2*7.2;helixPoints.push(V(.16*Math.cos(a),.16*Math.sin(a),-1.5+3*f));}
  const ribbonVertices=[],ribbonIndices=[];
  helixPoints.forEach((p,i)=>{for(const dz of [-.065,.065])ribbonVertices.push(p.x,p.y,p.z+dz);if(i<helixPoints.length-1){const n=i*2;ribbonIndices.push(n,n+1,n+2,n+1,n+3,n+2);}});
  const helixGeo=new THREE.BufferGeometry();helixGeo.setAttribute('position',new THREE.Float32BufferAttribute(ribbonVertices,3));helixGeo.setIndex(ribbonIndices);helixGeo.computeVertexNormals();
  const domains=[],sensors=[],inner=[],outerLoops=[];
  for(let d=0;d<4;d++){
    const angle=d*Math.PI/2+Math.PI/4, domain=new THREE.Group();domain.rotation.z=angle;mechanism.add(domain);
    const base=material(colors[d],{side:THREE.DoubleSide}),silent=material(colors[d],{transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide});
    const positions=[[2.1,-.50],[2.48,-.12],[2.14,.42],[1.68,.18],[1.17,-.25],[.58,0]];
    const helices=[];
    for(let h=0;h<6;h++){
      const mesh=new THREE.Mesh(helixGeo,h===3?material(gold,{side:THREE.DoubleSide}):base);domain.add(mesh);mesh.position.set(...positions[h],0);helices.push(mesh);
      clickable(mesh,h===3?'channel-sensor':h===5?'channel-pore':'channel-protein');
    }
    const sensor=helices[3];const charges=new THREE.Group();sensor.add(charges);
    for(let j=0;j<4;j++){const z=-.8+j*.52,a=j*1.9;const charge=new THREE.Mesh(new THREE.SphereGeometry(.115,12,8),material(gold,{emissiveIntensity:.4}));charge.position.set(.21*Math.cos(a),.21*Math.sin(a),z);charges.add(charge);if(d===0)text(charges,'+',charge.position.toArray(),.18,'#ffe4b2');}
    // Dynamic S4–S5 linker and S5–pore–S6 chain, with no swinging door/disc.
    const linker=curveMesh(domain,[[1.68,.18,-1.5],[1.4,.28,-1.85],[1.17,-.25,-1.5]],.07,gold,18);
    const poreLoop=curveMesh(domain,[[1.17,-.25,1.5],[1.05,-.1,1.92],[.35,0,1.6],[.58,0,1.5]],.09,base,24);
    for(let h=0;h<3;h++){
      const z=h%2?-1.5:1.5;
      curveMesh(domain,[[...positions[h],z],[(positions[h][0]+positions[h+1][0])/2,(positions[h][1]+positions[h+1][1])/2,z+Math.sign(z)*.35],[...positions[h+1],z]],.055,base,16);
    }
    const sensorMaterial=sensor.material;
    for(const pos of [[-.12,0,-1.25],[-.10,.09,-1.42],[-.10,-.09,-1.1]]){const sidechain=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),base);sidechain.position.set(...pos);helices[5].add(sidechain);}
    domains.push({domain,helices,base,silent,sensorMaterial});sensors.push({mesh:sensor,base:V(...positions[3],0),linker});inner.push(helices[5]);outerLoops.push(poreLoop);
  }
  // Schematic inter-domain links: Na's four repeats belong to one pore-forming chain.
  const chainLinks=[];for(let d=0;d<3;d++){
    const a=d*Math.PI/2+Math.PI/4,b=a+Math.PI/2;
    chainLinks.push(curveMesh(mechanism,[V(Math.cos(a)*.7,Math.sin(a)*.7,-1.65),V(Math.cos(a+.3)*2.9,Math.sin(a+.3)*2.9,-2.2),V(Math.cos(b-.3)*2.9,Math.sin(b-.3)*2.9,-2.2),V(Math.cos(b)*2.15,Math.sin(b)*2.15,-1.65)],.048,colors[d],28));
  }
  const filter=new THREE.Group();filter.position.z=1.57;mechanism.add(filter);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const oxygen=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),material(0xe69d8d));oxygen.position.set(Math.cos(a)*.29,Math.sin(a)*.29,0);filter.add(oxygen);}
  // IFM sits beside the pore (allosteric coupling), not on the axis as a cork.
  const ifm=new THREE.Group();mechanism.add(ifm);
  const motif=new THREE.Group();ifm.add(motif);for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.12,14,10),material(gold));m.position.x=(i-1)*.22;motif.add(m);}
  const pocket=new THREE.Mesh(new THREE.TorusGeometry(.26,.065,8,28),material(0xad8b54,{emissiveIntensity:.3}));pocket.position.set(1.08,-.60,-1.05);pocket.rotation.y=.7;ifm.add(pocket);
  const ifmLink=curveMesh(ifm,[[1.4,-1.6,-1.6],[1.8,-1.2,-2.5],[2.0,-.5,-2.0]],.045,gold,24);
  const ifmLeader=curveMesh(ifm,[[2,-.6,-2.15],[1.6,-.6,-1.6],[1.08,-.6,-1.05]],.014,new THREE.MeshBasicMaterial({color:gold}),12);
  const ionGeo=new THREE.SphereGeometry(.09,14,10),ionMat=material(0x93f4d4,{emissiveIntensity:.55});
  const ions=[];for(let i=0;i<9;i++){const m=new THREE.Mesh(ionGeo,ionMat);mechanism.add(m);ions.push(m);}
  const guides=new THREE.Group();mechanism.add(guides);
  const labels={sensor:text(guides,'S4 · VOLTAGE SENSOR',[2.55,1.55,.7],2.4,'#ffce96'),pore:text(guides,'S6 · INNER PORE',[1.2,0,-2.2],2.1),filter:text(guides,'SELECTIVITY FILTER',[-1.0,.1,2.05],2.3),ifm:text(guides,'IFM · SIDE POCKET',[2,-.6,-2.15],2.2,'#ffce96')};
  const sideLabels=[text(root,'OUTSIDE',[-3.8,0,2.3],1.6),text(root,'INSIDE',[-3.8,0,-2.3],1.6)];
  const evidenceGroups=[new THREE.Group(),new THREE.Group()];evidenceGroups.forEach(g=>measured.add(g));let loaded=0,error=false;
  Promise.all(['nav-5x0m','kv-2r9r'].map(async(name,j)=>{
    const response=await fetch(`./assets/${name}.json`);if(!response.ok)throw Error('Structure unavailable');const data=await response.json();
    const chains=[...new Set(data.segments.map(s=>s.chain))];
    for(const s of data.segments){const mesh=curveMesh(evidenceGroups[j],s.points.map(p=>[p[1]*.075,p[2]*.075,p[3]*.075]),.045,colors[chains.indexOf(s.chain)%4],Math.max(16,s.points.length*2));clickable(mesh,'channel-protein');}
    loaded++;
  })).catch(()=>{error=true;});
  let step=0,type='Na',view='mechanism',current=channelState(0),cutaway=false,lastPhase=-1;
  function setStep(next,nextType='Na',nextView='mechanism'){if(type!==nextType)lastPhase=-1;step=next;type=nextType;view=nextView;}
  function pose(){
    const mobile=innerWidth<=800;
    const positions=view==='measured'?[7,6,18]:[[9,7,18],[7,4,11],[1.1,.8,12],[5,-7,-10]][step];
    const targets=view==='measured'?[0,0,-1]:[[0,0,0],[1.35,1.2,0],[0,0,.5],[.8,-.5,-1]][step];
    const target=root.position.clone().add(V(...targets)),position=root.position.clone().add(V(...positions));
    if(mobile){const direction=position.clone().sub(target);position.copy(target).add(direction.multiplyScalar(view==='measured'?2.0:[2.1,1.8,1.9,1.9][step]));}
    return {position,target};
  }
  function update(time,state={}){
    current=channelState((state.channelPhase??0)/100,type);cutaway=!!state.channelCutaway;
    const changed=lastPhase!==current.p;lastPhase=current.p;
    const isMeasured=view==='measured';mechanism.visible=!isMeasured;measured.visible=isMeasured;
    evidenceGroups.forEach((g,j)=>g.visible=j===(type==='Na'?0:1));
    sideLabels.forEach(l=>l.visible=step===0||isMeasured);
    membrane.visible=step===0||isMeasured;
    domains.forEach(({domain,helices,base,silent,sensorMaterial},d)=>{
      const slice=cutaway&&d===0;
      domain.visible=!slice;
      for(let h=0;h<6;h++){const m=helices[h];m.material=h===3&&step===1?sensorMaterial:(step===1&&d!==0||step===3&&h!==5)?silent:base;}
      const sensor=sensors[d];sensor.mesh.position.copy(sensor.base).add(V(0,0,current.sensor*.48));sensor.mesh.rotation.z=current.sensor*.35;
      // Linker follows the charged sensor's intracellular end; exaggerated displacement.
      if(changed)reshape(sensor.linker,[[1.68,.18,-1.5+current.sensor*.48],[1.4,.28,-1.85+current.sensor*.22],[1.17,-.25,-1.5]]);
      const gate=inner[d];gate.position.set(.58+current.aperture*.24,0,0);gate.rotation.y=.28-current.aperture*.34;
      if(changed)reshape(outerLoops[d],[[1.17,-.25,1.5],[1.05,-.1,1.92],[.35,0,1.6],V(0,0,1.5).applyAxisAngle(V(0,1,0),gate.rotation.y).add(gate.position)]);
      outerLoops[d].visible=!slice;
    });
    chainLinks.forEach(m=>m.visible=type==='Na');ifm.visible=type==='Na'&&step===3;
    const free=V(2.0,-.5,-2.0),bound=V(1.08,-.60,-1.05);motif.position.lerpVectors(free,bound,current.bound);
    if(changed)reshape(ifmLink,[[1.4,-1.6,-1.6],[1.8,-1.2,-2.5],motif.position.clone()]);
    labels.sensor.visible=step===1;labels.pore.visible=step===2;labels.filter.visible=step===2;labels.ifm.visible=type==='Na'&&step===3;
    ionMat.color.setHex(type==='Na'?0x93f4d4:0xc7b5ff);ionMat.emissive.copy(ionMat.color);
    ions.forEach((m,i)=>{const f=(time*.28+i/9)%1;m.visible=current.conducting&&(step===2||step===3);m.position.set(Math.sin(i*2.7)*.04,Math.cos(i*2.7)*.04,(type==='Na'?1:-1)*(3.0-f*6));});
  }
  return {root,setStep,pose,update,snapshot:()=>({step,type,view,cutaway,loaded,error,...current,ionDirection:type==='Na'?'inward':'outward',motifPosition:motif.position.toArray()})};
}
