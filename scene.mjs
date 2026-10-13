import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createModelingScene } from './modeling-scene.mjs';
import { createChannelScene } from './channel-scene.mjs';
import { createDecisionScene } from './decision-scene.mjs';
import { createScaleScene } from './scale-scene.mjs';

const MINT = 0x77efd0, TEAL = 0x35bfc1, AMBER = 0xffb77d, PURPLE = 0xa790ee;
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
let seed = 12345;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

export function createWorld(container, { onPick = () => {}, onReady = () => {} } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let low = innerWidth < 800, renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); }
  catch { return null; }
  renderer.setClearColor(0x060d13);
  renderer.setPixelRatio(Math.min(devicePixelRatio, low ? 1.25 : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060d13, .0065);
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .008, 250);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .065;
  controls.enablePan = false; controls.minDistance = .38; controls.maxDistance = 65;
  controls.rotateSpeed = .45; controls.zoomSpeed = .65;
  scene.add(new THREE.AmbientLight(0x8ea9c5, .9));
  const sun = new THREE.DirectionalLight(0xa0d9ec, 3.2); sun.position.set(0,10,15); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x439c93, 3); rim.position.set(-10,2,-8); scene.add(rim);
  const warm = new THREE.DirectionalLight(0xeb9d70, 1.5); warm.position.set(20,-1,4); scene.add(warm);
  const mat = (color, extra={}) => new THREE.MeshPhysicalMaterial({ color, roughness: .39, metalness: .17, clearcoat: .5, ...extra });
  const tealMat = mat(0x356d70,{ emissive:0x124e4e,emissiveIntensity:.16,roughness:.57,metalness:.05 });
  const goldMat = mat(0x9c704b,{ emissive:0x6c3c14,emissiveIntensity:.28 });
  const purpleMat = mat(0x726b9f,{ emissive:0x342b68,emissiveIntensity:.3 });
  const glowMat = color => new THREE.MeshBasicMaterial({ color,transparent:true,opacity:.8 });
  const sphereGeo = new THREE.SphereGeometry(1,24,16);
  const dotGeo = new THREE.SphereGeometry(1,9,7);
  const pickables=[], labels=[], animated=[], halos=[];
  const labelLayer = document.getElementById('world-labels');
  const haloCanvas = document.createElement('canvas'); haloCanvas.width = haloCanvas.height = 128;
  const hc = haloCanvas.getContext('2d'), gr = hc.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,0.6)'); gr.addColorStop(.13,'rgba(255,255,255,0.28)'); gr.addColorStop(.4,'rgba(255,255,255,0.05)'); gr.addColorStop(1,'rgba(255,255,255,0)'); hc.fillStyle=gr; hc.fillRect(0,0,128,128);
  const glowTexture = new THREE.CanvasTexture(haloCanvas);
  function orb(parent,pos,size,color,glowing=false) {
    const mesh=new THREE.Mesh(glowing?dotGeo:sphereGeo,glowing?glowMat(color):mat(color)); mesh.position.copy(pos);mesh.scale.setScalar(size);parent.add(mesh);
    if(glowing) halo(mesh,V(),7,color,.4);
    return mesh;
  }
  function halo(parent,pos,size,color,opacity=.3) {
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false})); sp.position.copy(pos);sp.scale.set(size,size,1);parent.add(sp);halos.push(sp);return sp;
  }
  function tube(parent,points,radius,material,segments=32,taper=1) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>p.isVector3?p:V(...p)));
    const geo=new THREE.TubeGeometry(curve,segments,radius,7,false);
    if(taper!==1){const a=geo.attributes.position,frames=curve.computeFrenetFrames(segments,false);for(let i=0;i<=segments;i++){const center=curve.getPointAt(i/segments),factor=1-(1-taper)*i/segments;for(let j=0;j<=7;j++){const k=i*8+j;const p=V().fromBufferAttribute(a,k).sub(center).multiplyScalar(factor).add(center);a.setXYZ(k,p.x,p.y,p.z);}}geo.computeVertexNormals();}
    const mesh=new THREE.Mesh(geo,material);parent.add(mesh);return {mesh,curve};
  }
  function ring(parent,pos,radius,color,opacity=.24) {
    const m=new THREE.Mesh(new THREE.TorusGeometry(radius,.008,5,128),new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.copy(pos);parent.add(m);return m;
  }
  function label(text,position,slides,extraParent=null) {
    const el=document.createElement('span');el.className='world-label';el.textContent=text;el.hidden=true;labelLayer.appendChild(el);const item={el,position:V(...position),slides,parent:extraParent};labels.push(item);return item;
  }
  function clickable(mesh,key){mesh.userData.pick=key;pickables.push(mesh);}
  function mergeStatic(meshes,material,parent,key){
    if(!meshes.length)return null;const positions=[],normals=[];
    for(const mesh of meshes){mesh.updateMatrix();let geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrix);positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);mesh.visible=false;parent.remove(mesh);geo.dispose();}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));const merged=new THREE.Mesh(geometry,material);parent.add(merged);if(key)clickable(merged,key);return merged;
  }

  // Persistent cell: asymmetric soma, tapering branching dendrites and a myelinated axon.
  const neuron = new THREE.Group(); scene.add(neuron);
  const somaGeo = new THREE.SphereGeometry(1.55,64,48), sa=somaGeo.attributes.position;
  for(let i=0;i<sa.count;i++){const p=V().fromBufferAttribute(sa,i);const noise=1+.045*Math.sin(p.x*6)*Math.cos(p.y*5)+.025*Math.sin(p.z*9);p.multiplyScalar(noise);p.x*=1.03;p.y*=.9;sa.setXYZ(i,p.x,p.y,p.z);}somaGeo.computeVertexNormals();
  const soma = new THREE.Mesh(somaGeo,mat(0x32666a,{transparent:true,opacity:.55,emissive:0x123b3b,emissiveIntensity:.2,roughness:.49,metalness:0,clearcoat:.12,depthWrite:false}));soma.scale.set(1,.9,.83);neuron.add(soma);clickable(soma,'soma');
  const nucleus=orb(neuron,V(-.13,.12,.18),.69,0x3b828a);nucleus.material.emissive=new THREE.Color(0x17686b);nucleus.material.emissiveIntensity=.6;
  const nucleusWire=new THREE.Mesh(new THREE.IcosahedronGeometry(.72,2),new THREE.MeshBasicMaterial({color:0x6de6d5,wireframe:true,transparent:true,opacity:.13}));nucleusWire.position.copy(nucleus.position);neuron.add(nucleusWire);
  halo(neuron,V(0,0,.1),7,TEAL,.18);halo(neuron,V(-.1,.1,.7),2.5,MINT,.18);
  const somaLight=new THREE.PointLight(MINT,2.5,9);somaLight.position.set(0,1,2);neuron.add(somaLight);
  // Cytoplasmic organelles and a double nuclear envelope, kept below the outer membrane.
  const nuclearEnvelope=new THREE.Mesh(new THREE.SphereGeometry(.73,36,24),mat(0x447b7d,{transparent:true,opacity:.18,roughness:.68,side:THREE.DoubleSide,depthWrite:false}));nuclearEnvelope.position.copy(nucleus.position);neuron.add(nuclearEnvelope);
  for(let i=0;i<18;i++){const a=i*2.399,y=(rnd()-.5)*1.5,r=.84+rnd()*.25;const p=V(Math.cos(a)*r,y,Math.sin(a)*r*.65);const organelle=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.19,4,8),mat(0x8a8970,{roughness:.65,metalness:0}));organelle.position.copy(p);organelle.rotation.set(rnd()*3,rnd()*3,rnd()*3);neuron.add(organelle);}
  const granules=new THREE.InstancedMesh(dotGeo,mat(0x9db0a0,{roughness:.7,metalness:0}),90),granuleDummy=new THREE.Object3D();for(let i=0;i<90;i++){const a=rnd()*Math.PI*2,r=.8+rnd()*.55;granuleDummy.position.set(Math.cos(a)*r,(rnd()-.5)*1.5,Math.sin(a)*r*.7);granuleDummy.scale.setScalar(.016);granuleDummy.updateMatrix();granules.setMatrixAt(i,granuleDummy.matrix);}neuron.add(granules);
  const dendriteTips=[],spineHeads=[],spineNecks=[];
  function branch(start,dir,len,r,depth) {
    const end=start.clone().addScaledVector(dir,len),mid=start.clone().lerp(end,.48).add(V((rnd()-.5)*.4,(rnd()-.5)*.6,(rnd()-.5)*.5));
    const made=tube(neuron,[start,mid,end],r,tealMat,12,.55);clickable(made.mesh,'dendrites');
    if(depth>0){for(let j=0;j<2;j++){const d=dir.clone().add(V((rnd()-.5)*.8,(j?1:-1)*(.28+rnd()*.5),(rnd()-.5)*.85)).normalize();branch(end,d,len*(.61+rnd()*.15),r*.54,depth-1);}}
    else{dendriteTips.push({position:end,size:r*2.2});}
    // Dendritic spines: short necks with bulbous heads, rather than glowing branch tips.
    if(depth<3){for(let k=0;k<3;k++){const t=.25+k*.24,p=made.curve.getPoint(t),tangent=made.curve.getTangent(t);const off=V(-tangent.y,tangent.x,.25).normalize().multiplyScalar((k%2?1:-1)*(.09+r*.3));const end=p.clone().add(off);spineHeads.push(end);spineNecks.push([p,end]);}}
  }
  // Pyramidal-cell schematic: one dominant apical dendrite and a spreading basal arbor.
  branch(V(.1,1.1,0),V(.05,.98,.12).normalize(),4.3,.20,3);
  for(let i=0;i<7;i++){const angle=2.3+i*.42,dir=V(Math.cos(angle),Math.sin(angle),Math.sin(i*2)*.45).normalize();branch(dir.clone().multiplyScalar(1.15),dir,1.6+rnd()*.9,.13,3);}
  const spineDummy=new THREE.Object3D(),headInstances=new THREE.InstancedMesh(new THREE.SphereGeometry(.032,8,6),mat(0x6c9890,{roughness:.65,metalness:0}),spineHeads.length),neckInstances=new THREE.InstancedMesh(new THREE.CylinderGeometry(.013,.013,1,5),tealMat,spineHeads.length);
  spineHeads.forEach((p,i)=>{spineDummy.position.copy(p);spineDummy.scale.setScalar(1);spineDummy.quaternion.identity();spineDummy.updateMatrix();headInstances.setMatrixAt(i,spineDummy.matrix);const [a,b]=spineNecks[i];spineDummy.position.copy(a).lerp(b,.5);spineDummy.scale.set(1,a.distanceTo(b),1);spineDummy.quaternion.setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());spineDummy.updateMatrix();neckInstances.setMatrixAt(i,spineDummy.matrix);});neuron.add(headInstances,neckInstances);
  const tips=new THREE.InstancedMesh(dotGeo,mat(0x6ebbb2,{roughness:.65,metalness:0}),dendriteTips.length);dendriteTips.forEach((p,i)=>{spineDummy.position.copy(p.position);spineDummy.scale.setScalar(p.size);spineDummy.quaternion.identity();spineDummy.updateMatrix();tips.setMatrixAt(i,spineDummy.matrix);});neuron.add(tips);
  mergeStatic(neuron.children.filter(m=>m.isMesh&&!m.isInstancedMesh&&m.material===tealMat),tealMat,neuron,'dendrites');
  const axonPath=tube(neuron,[[1.2,-.2,0],[3,-.6,.1],[6,-.75,.3],[10,-.5,0],[15,-.85,-.3],[20,-.3,0],[22,.1,0]],.115,goldMat,150);
  const incomingPath=new THREE.CatmullRomCurve3([V(.4,5.4,.5),V(.2,3.2,.3),V(.1,1.1,0),V(0,0,0)]);
  clickable(axonPath.mesh,'axon');
  const myelin=[];
  for(let i=0;i<9;i++){
    const t=.12+i*.085,p=axonPath.curve.getPoint(t),tangent=axonPath.curve.getTangent(t);
    const sheath=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,1.48,36,1,true,Math.PI*.2,Math.PI*1.72),mat(0x899d8c,{transparent:true,opacity:.55,roughness:.62,metalness:0,side:THREE.DoubleSide,depthWrite:false}));sheath.position.copy(p);sheath.quaternion.setFromUnitVectors(V(0,1,0),tangent);neuron.add(sheath);myelin.push(sheath);clickable(sheath,'myelin');
    for(let layer=0;layer<5;layer++){const lamella=new THREE.Mesh(new THREE.CylinderGeometry(.17+layer*.023,.17+layer*.023,1.47,28,1,true,Math.PI*.2,Math.PI*1.72),mat(0x839787,{transparent:true,opacity:.3,roughness:.7,metalness:0,side:THREE.DoubleSide,depthWrite:false}));lamella.position.copy(p);lamella.quaternion.copy(sheath.quaternion);neuron.add(lamella);myelin.push(lamella);}
    for(let j=0;j<3;j++){const m=new THREE.Mesh(new THREE.TorusGeometry(.29,.007,4,20),new THREE.MeshBasicMaterial({color:MINT,transparent:true,opacity:.18}));m.position.copy(p).addScaledVector(tangent,(j-1)*.4);m.quaternion.setFromUnitVectors(V(0,0,1),tangent);neuron.add(m);myelin.push(m);}
  }
  const outerSheaths=myelin.filter(m=>m.material.isMeshPhysicalMaterial&&m.material.opacity>.5),innerSheaths=myelin.filter(m=>m.material.isMeshPhysicalMaterial&&m.material.opacity<=.5),wrapLines=myelin.filter(m=>!m.material.isMeshPhysicalMaterial);
  myelin.splice(0,myelin.length,...[[outerSheaths,'myelin'],[innerSheaths,null],[wrapLines,null]].map(([meshes,key])=>mergeStatic(meshes,meshes[0].material,neuron,key)));
  const axonNodes=[];
  for(let i=0;i<10;i++){const p=axonPath.curve.getPoint(.075+i*.085);const n=orb(neuron,p,.145,AMBER,true);axonNodes.push(n);clickable(n,'node');}
  for(let i=0;i<10;i++){const t=.075+i*.085,p=axonPath.curve.getPoint(t),tangent=axonPath.curve.getTangent(t);const normal=V(0,1,0).cross(tangent).normalize(),binormal=tangent.clone().cross(normal);for(let j=0;j<12;j++){const a=j*Math.PI/6;const channel=orb(neuron,p.clone().addScaledVector(normal,Math.cos(a)*.15).addScaledVector(binormal,Math.sin(a)*.15),.019,0x8bc5b3);}}
  const terminal=orb(neuron,V(23,.05,0),.75,0xa97f65);clickable(terminal,'terminals');
  tube(neuron,[[21.5,0,0],[22,.8,.2],[22.6,1.3,.4]],.09,goldMat,20,.5);orb(neuron,V(22.6,1.3,.4),.27,0xb68968);
  tube(neuron,[[21.5,0,0],[22,-1,-.2],[23,-1.3,-.1]],.09,goldMat,20,.5);orb(neuron,V(23,-1.3,-.1),.28,0xb68968);
  const anatomyLabels=[label('DENDRITES',[-4.1,4.7,.1],[0]),label('SOMA',[0,2.1,0],[0]),label('AXON',[8,.3,0],[0]),label('AXON TERMINALS',[22.7,2.3,.1],[0])];
  anatomyLabels.forEach((l,i)=>l.part=['dendrites','soma','axon','terminals'][i]);
  label('NODE OF RANVIER',[12.1,.6,.1],[7]);label('MYELIN',[14.6,-1.6,.3],[7]);
  const pulses=[];
  for(let i=0;i<12;i++){const p=orb(scene,V(),.13,MINT,true);p.visible=false;pulses.push({mesh:p,progress:0,active:false,kind:'axon'});}

  // RC station: an electrical reservoir, leak branch and charge-stack metaphor.
  const rc=new THREE.Group();rc.position.set(-10,-11,-3);scene.add(rc);
  const jar=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,3.6,48,1,true),mat(0x3c888b,{transparent:true,opacity:.16,side:THREE.DoubleSide,roughness:.1}));jar.visible=false;rc.add(jar);
  const plates=[];for(const y of [-.65,.65]){const plate=new THREE.Mesh(new THREE.BoxGeometry(2.5,.06,1.95),mat(0x728d8b,{roughness:.5,metalness:.4,clearcoat:.1}));plate.position.y=y;rc.add(plate);plates.push(plate);}
  const dielectric=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.18,1.84),mat(0x2c625d,{transparent:true,opacity:.08,roughness:.8,depthWrite:false}));rc.add(dielectric);
  const separatedCharges=[];for(let side=0;side<2;side++)for(let i=0;i<24;i++){const g=new THREE.Group(),material=glowMat(side?AMBER:MINT);const line=new THREE.Mesh(new THREE.BoxGeometry(.085,.014,.013),material);g.add(line);if(!side){const v=new THREE.Mesh(new THREE.BoxGeometry(.013,.014,.085),material);g.add(v);}g.position.set(-1.05+(i%6)*.42,side?-.71:.71,-.72+Math.floor(i/6)*.48);rc.add(g);separatedCharges.push(g);}
  const fill=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,1,40),mat(0x36a897,{transparent:true,opacity:.46,emissive:0x165e4e,emissiveIntensity:.4}));fill.visible=false;rc.add(fill);
  const chargeDisks=[];for(let i=0;i<12;i++){const disk=new THREE.Mesh(new THREE.TorusGeometry(1.12,.012,5,40),glowMat(MINT));disk.rotation.x=Math.PI/2;disk.position.y=-1.6+i*.28;rc.add(disk);chargeDisks.push(disk);}
  tube(rc,[[-3,2,0],[0,2,0],[0,.7,0]],.035,glowMat(MINT),32);
  tube(rc,[[0,1.5,0],[2.6,1.5,0],[2.6,-1.5,0],[0,-1.5,0],[0,-.7,0]],.035,goldMat,40);
  const resistor=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,1.5,16),goldMat);resistor.position.set(2.6,0,0);rc.add(resistor);
  for(let i=0;i<5;i++){const r=ring(rc,V(2.6,-.55+i*.27,0),.28,AMBER,.7);}
  const rcParticles=[];for(let i=0;i<24;i++)rcParticles.push(orb(rc,V(),.05,i<12?MINT:AMBER,true));
  ring(rc,V(0,-2.1,0),3.2,TEAL,.2);
  label('INPUT',[-3.1,2.3,0],[2],rc);label('CHARGE SEPARATION',[-.2,-2,0],[2],rc);label('LEAK',[3.3,0,0],[2],rc);
  const modeling=createModelingScene({scene,clickable});
  const channel=createChannelScene({scene,clickable,low});

  // Pair of cells for the equal-charge surprise.
  const pair=new THREE.Group();pair.position.set(-18,4,-5);scene.add(pair);
  const twins=[];for(let i=0;i<2;i++){const g=new THREE.Group();g.position.x=(i-.5)*4.2;pair.add(g);const s=orb(g,V(),.9,i?0x6d688f:0x368e85);s.material.emissive=new THREE.Color(i?PURPLE:TEAL);s.material.emissiveIntensity=.1;twins.push(s);for(let k=0;k<5;k++){const a=k*1.25;tube(g,[[Math.cos(a)*.8,Math.sin(a)*.8,0],[Math.cos(a)*1.5,Math.sin(a)*1.5,.2]],.055,i?purpleMat:tealMat,8,.3);}halo(g,V(),3.4,i?PURPLE:MINT,.2);ring(g,V(0,-1.5,0),1.5,i?PURPLE:MINT,.3);}
  label('0.6 nA × 5 ms',[-2.1,2,0],[4],pair);label('0.1 nA × 30 ms',[2.1,2,0],[4],pair);

  // Micro-scale membrane patch embedded on the soma's front surface.
  const patch=new THREE.Group();patch.position.set(0,0,1.6);patch.scale.setScalar(.24);scene.add(patch);
  const lipidGeo=new THREE.SphereGeometry(.098,low?12:16,low?8:12),lipidMat=mat(0x54777b,{metalness:0,roughness:.78,clearcoat:0});
  const lipidMatrices=[];
  for(let x=-3.5;x<=3.5;x+=.245)for(let y=-1.65;y<=1.65;y+=.245){if(Math.hypot(x+1.3,y)<.79||Math.hypot(x-1.3,y)<.79)continue;const xx=x+(rnd()-.5)*.05,yy=y+(rnd()-.5)*.05;for(const z of [-.31,.31])lipidMatrices.push([xx,yy,z+.028*Math.sin(x*1.3)*Math.cos(y)]);}
  const lipids=new THREE.InstancedMesh(lipidGeo,lipidMat,lipidMatrices.length),dummy=new THREE.Object3D();
  lipidMatrices.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();lipids.setMatrixAt(i,dummy.matrix);});patch.add(lipids);
  const tails=new THREE.InstancedMesh(new THREE.CylinderGeometry(.013,.013,.25,5),mat(0x6a7967,{roughness:.9,metalness:0,clearcoat:0}),lipidMatrices.length*2);
  let tailIndex=0;for(const [x,y,z] of lipidMatrices){for(const sign of [-1,1]){dummy.position.set(x+sign*.035,y,z-Math.sign(z)*.18);dummy.rotation.set(Math.PI/2,sign*.12,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tails.setMatrixAt(tailIndex++,dummy.matrix);}}patch.add(tails);
  const pores=[];
  for(let j=0;j<2;j++){
    const g=new THREE.Group();g.position.x=j?1.3:-1.3;patch.add(g);
    const sub=[];for(let i=0;i<4;i++){const a=i*Math.PI/2,domain=new THREE.Group();domain.position.set(Math.cos(a)*.48,Math.sin(a)*.48,0);domain.rotation.z=a;g.add(domain);sub.push(domain);for(let helix=0;helix<6;helix++){const h=new THREE.Mesh(new THREE.CapsuleGeometry(.058,.79,5,12),mat(j?0x8d81b0:0x4a9c8e,{roughness:.52,metalness:0,clearcoat:.1}));const ha=helix*Math.PI/3;h.position.set(Math.cos(ha)*.14,Math.sin(ha)*.14,Math.sin(helix)*.025);h.rotation.x=Math.PI/2;h.rotation.z=(helix%2?1:-1)*.08;domain.add(h);clickable(h,j?'k-gate':'na-gate');const loop=tube(domain,[[Math.cos(ha)*.14,Math.sin(ha)*.14,.4],[Math.cos(ha+.5)*.19,Math.sin(ha+.5)*.19,.52],[Math.cos(ha+1)*.14,Math.sin(ha+1)*.14,.4]],.026,h.material,12);}}
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.45,.025,8,48),glowMat(j?PURPLE:MINT));rim.position.z=.49;g.add(rim);
    halo(g,V(0,0,.3),2,j?PURPLE:MINT,.16);
    const gate=new THREE.Mesh(new THREE.CircleGeometry(.24,32),new THREE.MeshBasicMaterial({color:j?PURPLE:MINT,transparent:true,opacity:.3,side:THREE.DoubleSide}));gate.position.z=-.42;g.add(gate);pores.push({g,sub,rim,gate});
  }
  // Static measured structures: the original Cα coordinates are never deformed by HH gating.
  const measuredGroups=[new THREE.Group(),new THREE.Group()];
  measuredGroups.forEach((g,j)=>{g.position.x=j?1.3:-1.3;patch.add(g);g.visible=false;});
  let measuredReady=0;
  const structurePromise=Promise.all(['nav-5x0m','kv-2r9r'].map(async(name,j)=>{
    const response=await fetch(`./assets/${name}.json`);if(!response.ok)throw Error('Structure data unavailable');const data=await response.json();
    const palettes=j?[0x9386b6,0xb0a0cf,0x7a7199,0xc4b3d7]:[0x65a59b,0x90c4b6,0x4e877e,0xa7cbbb];
    const chains=[...new Set(data.segments.map(s=>s.chain))];
    for(const segment of data.segments){const coords=segment.points.map(p=>V(p[1]*.016,p[2]*.016,p[3]*.016));const material=mat(palettes[chains.indexOf(segment.chain)%palettes.length],{roughness:.45,metalness:.08,clearcoat:.1});const made=tube(measuredGroups[j],coords,.021,material,Math.max(24,coords.length*3));clickable(made.mesh,j?'k-gate':'na-gate');}
    measuredReady++;return data;
  })).catch(error=>{console.warn('Measured protein structures did not load:',error.message);return null;});
  const ions=[];for(let i=0;i<80;i++){const type=i%2;const mesh=orb(patch,V(),.055,type?PURPLE:MINT,i<28);ions.push({mesh,type,phase:rnd(),x:(rnd()-.5)*6.8,y:(rnd()-.5)*3,z:(rnd()>.5?1:-1)*(.5+rnd()*1.5)});}
  const sodiumLabel=label('Na⁺',[-1.3,1,1],[6],patch),potassiumLabel=label('K⁺',[1.3,1,1],[6],patch);

  // Synapse station sits at the existing terminal, with a visible cleft and receptor plate.
  const syn=new THREE.Group();syn.position.set(23,0,0);scene.add(syn);
  const receiver=new THREE.Mesh(new THREE.SphereGeometry(1.4,32,24,0,Math.PI*2,0,Math.PI*.57),tealMat);receiver.rotation.z=-Math.PI/2;receiver.position.set(2.2,0,0);syn.add(receiver);clickable(receiver,'receiver');
  const vesicles=[];for(let i=0;i<12;i++){const a=i*2.399;vesicles.push(orb(syn,V(Math.cos(a)*.45,Math.sin(a)*.45,(rnd()-.5)*.8),.10,AMBER));}
  vesicles.forEach((vesicle,i)=>{vesicle.material=mat(0xa99b77,{transparent:true,opacity:.34,roughness:.6,depthWrite:false});for(let j=0;j<8;j++){const a=j*2.399;const dot=new THREE.Mesh(dotGeo,glowMat(AMBER));dot.scale.setScalar(.12);dot.position.set(Math.cos(a)*.5,Math.sin(a)*.5,(j%3-1)*.3);vesicle.add(dot);}});
  const transmitters=[];for(let i=0;i<30;i++){const mesh=orb(syn,V(),.025,AMBER,true);mesh.visible=false;transmitters.push(mesh);}
  // Receptor cartoons: four subunits surround a central pore in the receiving membrane.
  for(let i=0;i<6;i++){const a=(i-2.5)*.32,g=new THREE.Group();g.position.set(1.65,Math.sin(a)*1.1,Math.cos(a)*.48);g.rotation.y=Math.PI/2;syn.add(g);for(let j=0;j<4;j++){const angle=j*Math.PI/2,protein=new THREE.Mesh(new THREE.CapsuleGeometry(.045,.22,4,10),purpleMat);protein.rotation.x=Math.PI/2;protein.position.set(Math.cos(angle)*.08,Math.sin(angle)*.08,0);g.add(protein);const binding=orb(g,V(Math.cos(angle)*.085,Math.sin(angle)*.085,-.18),.07,0x8b7caa);}}
  const activeZone=new THREE.Mesh(new THREE.TorusGeometry(.38,.025,8,40),goldMat);activeZone.rotation.y=Math.PI/2;activeZone.position.x=.66;syn.add(activeZone);
  const calcium=[];for(let i=0;i<14;i++){const m=orb(syn,V(.95+(i%3)*.09,(i%7-3)*.13,.25),.019,0x96c3db,true);m.visible=false;calcium.push(m);}
  for(const y of [-.27,.27]){const channel=new THREE.Group();channel.position.set(.65,y,.32);syn.add(channel);for(let j=0;j<4;j++){const a=j*Math.PI/2,p=orb(channel,V(0,Math.cos(a)*.055,Math.sin(a)*.055),1,0x6d9caa);p.scale.set(.09,.035,.035);}}
  label('SENDER',[0,1.4,0],[8],syn);label('SYNAPTIC CLEFT',[1.2,-1.25,0],[8],syn);label('RECEIVER',[2.5,1.7,0],[8],syn);

  // Event stream as a three-dimensional signal ribbon.
  const codeGroup=new THREE.Group();codeGroup.position.set(0,10,-8);scene.add(codeGroup);
  for(let row=0;row<3;row++){tube(codeGroup,[[-4,row*.6,0],[4,row*.6,0]],.009,new THREE.MeshBasicMaterial({color:0x3a626b}),8);}
  const eventBars=[];for(let i=0;i<80;i++){const bar=new THREE.Mesh(new THREE.BoxGeometry(.025,.8,.04),glowMat(MINT));codeGroup.add(bar);eventBars.push(bar);}
  const codeNeuron=orb(codeGroup,V(-5.2,.6,0),.7,0x3f9387);halo(codeGroup,V(-5.2,.6,0),3,MINT,.2);
  label('EVENTS → TIME',[0,-1,0],[9],codeGroup);

  // Three model totems: visible internal state, progressively more dimensions.
  const models=new THREE.Group();models.position.set(32,-9,-2);scene.add(models);
  const modelOrbs=[];
  for(let j=0;j<3;j++){const g=new THREE.Group();g.position.x=(j-1)*3.2;models.add(g);const count=[1,2,4][j],color=[MINT,PURPLE,AMBER][j];for(let i=0;i<count;i++){const a=i*Math.PI*2/count,p=V(count===1?0:Math.cos(a)*.55,count===1?0:Math.sin(a)*.55,0);const m=orb(g,p,count===1?.65:.34,color);modelOrbs.push({mesh:m,model:j});halo(g,p,1.9,color,.13);}ring(g,V(0,-1.4,0),1.2,color,.45);}
  label('LIF · V',[-3.2,1.5,0],[10],models);label('IZHIKEVICH · v, u',[0,1.5,0],[10],models);label('HH · V, m, h, n',[3.2,1.5,0],[10],models);

  const decision=createDecisionScene({scene,clickable});

  const scale=createScaleScene({scene,clickable});

  // Quiet depth cues: dust, an orbital grid and stars.
  const starsGeo=new THREE.BufferGeometry(),starPoints=[];
  for(let i=0;i<(low?700:1500);i++)starPoints.push((rnd()-.5)*180,(rnd()-.5)*100,(rnd()-.5)*120-15);
  starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPoints,3));
  const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x6fadae,size:.045,transparent:true,opacity:.45,sizeAttenuation:true}));scene.add(stars);
  const grid=new THREE.GridHelper(140,70,0x133038,0x11252c);grid.position.set(25,-16,-12);grid.material.transparent=true;grid.material.opacity=.28;scene.add(grid);
  const ambientRings=[];for(let i=0;i<3;i++)ambientRings.push(ring(scene,V(0,-3.6-i*.04,0),4.5+i*.65,TEAL,.1));

  const desktopPoses=[
    [[11,11,38],[8,1,0]],[[11,11,38],[8,1,0]],[[-4,-6,7],[-9,-10.6,-3]],
    [[3,3.4,13],[-.8,.5,0]],[[-16,8,9],[-18,4,-5]],
    [[.95,.8,3.9],[0,0,1.6]],[[.75,-.55,3.6],[0,0,1.6]],
    [[13,4.8,11],[12,-.5,0]],[[26,3.2,6.5],[24.2,0,0]],
    [[1,13,8],[0,10.5,-8]],[[33,-5,15],[32,-9,-2]],
    [[45,4.5,13],[44,-.2,-2]],[[68,4.5,10],[61,0,-7]],[[12,10,42],[8,1,0]]
  ];
  const mobilePoses=[
    [[10,12,100],[8,1,0]],[[10,17,58],[8,0,0]],[[-4,-5,12],[-9,-10.6,-3]],
    [[3,3,18],[0,0,0]],[[-16,9,17],[-18,4,-5]],
    [[.7,.7,4.8],[0,0,1.6]],[[.6,-.5,4.6],[0,0,1.6]],
    [[13,5,19],[12,-.5,0]],[[27,3,10],[24.4,0,0]],
    [[1,14,17],[0,10.5,-8]],[[34,-4,25],[32,-9,-2]],
    [[46,6,24],[44,-.5,-2]],[[67,6,21],[61,0,-7]],[[10,12,96],[8,1,0]]
  ];
  let active=0,transition=null,lastTime=0,signalTime=-100,selected='',state={},riding=false;
  function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.setViewOffset(w,h,w*(w>800?.075:0),h*(w>800?-.015:.045),w,h);camera.updateProjectionMatrix();if(!transition)go(active,true);}
  function go(index,instant=false){
    riding=false;selected='';const previous=active;active=index;
    controls.maxDistance=index===13?125:65;
    const p=(innerWidth<=800?mobilePoses:desktopPoses)[index],modelPose=index===1?modeling.pose():index===5?channel.pose():index===11?decision.pose():index===12?scale.pose():null;
    camera.setViewOffset(innerWidth,innerHeight,innerWidth*(innerWidth>800?(index===1?.15:.075):0),innerHeight*(index===5?(innerWidth>800?-.08:.105):[11,12].includes(index)&&innerWidth<=800?.1:innerWidth>800?-.015:.045),innerWidth,innerHeight);camera.updateProjectionMatrix();
    transition={start:performance.now(),duration:instant||reduced?0:1900,from:camera.position.clone(),fromTarget:controls.target.clone(),to:modelPose?.position??V(...p[0]),target:modelPose?.target??V(...p[1])};
    if(index===1&&innerWidth<=800)transition.to.copy(transition.target).add(V(.5,2,29));
    controls.enabled=false;document.body.classList.toggle('transitioning',!instant&&!reduced);setVisibility(instant?null:previous);
  }
  function setVisibility(previous=null){const both=key=>active===key||previous===key;neuron.visible=[0,3,7,8,13].some(both);modeling.root.visible=both(1);channel.root.visible=both(5);rc.visible=both(2);pair.visible=both(4);patch.visible=both(6);syn.visible=both(8);codeGroup.visible=both(9);models.visible=both(10);decision.root.visible=both(11);scale.root.visible=both(12);grid.visible=false;}
  function pulse(kind='axon'){signalTime=lastTime;const free=pulses.find(p=>!p.active)||pulses[0];free.active=true;free.progress=0;free.kind=kind;free.mesh.visible=true;}
  function update(now,dt,newState={}){
    lastTime=now;state=newState;
    if(transition){const p=transition.duration?Math.min(1,(performance.now()-transition.start)/transition.duration):1;const e=p<.5?4*p*p*p:1-(-2*p+2)**3/2;camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.fromTarget,transition.target,e);if(transition.from.distanceTo(transition.to)>5)camera.position.y+=Math.sin(p*Math.PI)*1.8;camera.lookAt(controls.target);if(p>=1){transition=null;controls.enabled=true;setVisibility();document.body.classList.remove('transitioning');}}
    else if(riding){const p=pulses.find(p=>p.active);if(p){const target=axonPath.curve.getPoint(p.progress),tangent=axonPath.curve.getTangent(p.progress);controls.target.copy(target).addScaledVector(tangent,1.3);camera.position.copy(target).add(V(-1.8,1.5,3.3));camera.lookAt(controls.target);}else{riding=false;controls.enabled=true;}}
    else controls.update();
    const time=reduced?0:now;
    if(active===1)modeling.update(time,state);
    if(active===5)channel.update(now,state);
    if(active===11)decision.update(state.decisionFilm);
    if(active===12)scale.update(now,state.scaleFilm);
    nucleusWire.rotation.y=time*.06;nucleusWire.rotation.z=time*.04;
    somaLight.intensity=1.6+Math.max(0,1-(now-signalTime)*1.5)*6;
    soma.material.emissiveIntensity=.25+Math.max(0,1-(now-signalTime)*1.5)*.6;
    if(active===0&&selected==='soma')soma.material.emissiveIntensity=.9;
    tealMat.emissiveIntensity=active===0&&selected==='dendrites'?.8:.16;
    goldMat.emissiveIntensity=active===0&&selected==='axon'?.9:.28;
    terminal.material.emissive.setHex(0x6c3c14);
    terminal.material.emissiveIntensity=active===0&&selected==='terminals'?.9:0;
    ambientRings.forEach(m=>m.visible=active===0||active===1||active===13);
    for(const p of pulses){if(!p.active)continue;p.mesh.visible=[0,1,3,7].includes(active);p.progress+=dt*(state.myelin===false?.16:.36);if(p.progress>=1){p.active=false;p.mesh.visible=false;continue;}const pos=(p.kind==='input'?incomingPath:axonPath.curve).getPoint(p.progress);p.mesh.position.copy(pos);}
    for(let i=0;i<axonNodes.length;i++){const n=axonNodes[i];n.scale.setScalar(.13+Math.max(0,Math.sin(time*5-i*.6))*.025);}
    myelin.forEach(m=>m.visible=state.myelin!==false);
    const frac=THREE.MathUtils.clamp(((state.sample?.v??-65)+65)/35,.04,1),height=.2+frac*3.1;fill.scale.y=height;fill.position.y=-1.7+height/2;chargeDisks.forEach(m=>m.visible=false);separatedCharges.forEach((m,i)=>m.visible=(i%24)<Math.ceil(frac*24));
    rcParticles.forEach((m,i)=>{const p=((time*.45+i/12)%1);if(i<12)m.position.set(-3+3*p,2,0);else m.position.set(2.6,1.4-p*2.8,0);m.visible=active===2&&state.playing!==false;});
    twins.forEach((m,i)=>{const n=state.twinSamples?.[i]?.v??-65;m.material.emissiveIntensity=.1+Math.max(0,(n+65)/15)*.5;const flash=state.twinFlashes?.[i]??0;m.scale.setScalar(.9+flash*.08);});
    let opens=active===6?[state.sample?.m**3*state.sample?.h||0,state.sample?.n**4||0]:[state.naOpen??.5,state.kOpen??.5];
    pores.forEach((p,j)=>{const measured=state.measured!==false&&measuredReady===2;measuredGroups[j].visible=measured;p.sub.forEach(m=>m.visible=!measured);const open=THREE.MathUtils.clamp(opens[j],0,1);p.sub.forEach((m,i)=>{const a=i*Math.PI/2,r=.43+open*.14;m.position.x=Math.cos(a)*r;m.position.y=Math.sin(a)*r;});p.gate.scale.setScalar(1-open*.94);p.rim.material.opacity=.15+open*.55;});
    const currents=active===6?[state.sample?.na??0,state.sample?.k??0]:[state.naCurrent??-5,state.kCurrent??3];
    if(active===5){[sodiumLabel,potassiumLabel].forEach((l,j)=>{const c=currents[j];l.el.textContent=`${j?'K⁺':'Na⁺'} · ${Math.abs(c)<.05?'BALANCED':c<0?'IN':'OUT'} · ${Math.abs(c).toFixed(0)} pA`;});}else{sodiumLabel.el.textContent='Na⁺';potassiumLabel.el.textContent='K⁺';}
    ions.forEach((ion,i)=>{const m=ion.mesh,current=currents[ion.type],open=opens[ion.type];if(i<32&&Math.abs(current)>.001&&open>.001){const speed=Math.min(.9,.15+Math.abs(current)*.006);const t=(time*speed+ion.phase)%1;m.position.set((ion.type?1.3:-1.3)+Math.sin(i*7)*.12,Math.cos(i*3)*.12,(current<0?1:-1)*(1.8-3.6*t));m.visible=true;}else{m.position.set(ion.x+Math.sin(time*.3+i)*.04,ion.y+Math.cos(time*.2+i)*.04,ion.z);m.visible=i>=32;}});
    const release=now-signalTime;
    terminal.material.transparent=active===8;terminal.material.opacity=active===8?.28:1;terminal.material.depthWrite=active!==8;
    calcium.forEach((m,i)=>{m.visible=active===8&&release>0&&release<.85;if(m.visible)m.position.x=.95-((release*1.8+i/14)%1)*.65;});
    if(active===8){const v=vesicles[0],phase=Math.max(0,Math.min(1,release*1.5));v.position.x=release>=0&&release<1.5?.25+phase*.35:.45;v.scale.set(.1,release>0&&release<1.5?.1*(1-phase*.5):.1,.1);}
    transmitters.forEach((m,i)=>{const t=release-i*.014;m.visible=active===8&&t>0&&t<2;if(m.visible)m.position.set(.45+Math.min(t/1.4,1)*1.2,Math.sin(i*3)*.35+Math.sin(t*2+i)*.05,Math.cos(i*2)*.33);});
    receiver.material.emissiveIntensity=.12+Math.max(0,((state.sample?.v??-65)+65)/15)*.5;
    const spikes=state.result?.spikes??[];
    eventBars.forEach((m,i)=>{m.visible=i<spikes.length;if(m.visible){m.position.set(-4+8*spikes[i]/(state.result?.duration??500),.6,0);m.scale.y=.5+(i%3)*.2;}});
    modelOrbs.forEach(({mesh,model})=>{mesh.material.emissive=new THREE.Color([MINT,PURPLE,AMBER][model]);mesh.material.emissiveIntensity=state.modelIndex===model?.45:.05;});
    for(const l of labels){l.el.hidden=!l.slides.includes(active)||!!transition;if(l.part&&active===0&&selected&&l.part!==selected)l.el.hidden=true;if(l.el.hidden)continue;const p=l.position.clone();if(l.parent)l.parent.localToWorld(p);p.project(camera);if(p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1){l.el.hidden=true;continue;}const half=l.el.offsetWidth/2+8,x=Math.max(half,Math.min(innerWidth-half,(p.x*.5+.5)*innerWidth));l.el.style.transform=`translate(${x}px,${(-p.y*.5+.5)*innerHeight}px) translate(-50%,-50%)`;}
    renderer.render(scene,camera);
  }
  let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||transition)return;const mouse=new THREE.Vector2(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1),ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const visible=pickables.filter(o=>{let p=o;while(p){if(!p.visible)return false;p=p.parent;}return true;});const hits=ray.intersectObjects(visible,false);if(hits.length)onPick(hits[0].object.userData.pick);});
  addEventListener('resize',resize);resize();go(0,true);onReady();
  return {setSlide:go,update,pulse,resetView:()=>go(active),
    setScalePhase(phase,instant=false){scale.setPhase(phase);if(active===12)go(12,instant);},
    setDecisionPhase(phase,instant=false){decision.setPhase(phase);if(active===11)go(11,instant);},
    setChannelStep(step,type,view,instant=false){channel.setStep(step,type,view);if(active===5)go(5,instant);},
    setModelingStep(step,model,instant=false){modeling.setStep(step,model);if(active===1)go(1,instant);},
    focusPart(part){selected=part;if(active!==0&&(part==='dendrites'||part==='soma'))pulse('input');const presets={dendrites:[[-4,4,15],[-3,1,0]],soma:[[1,2,9],[0,0,0]],axon:[[13,5,18],[12,-.5,0]],terminals:[[25,3,9],[23,0,0]]};const p=presets[part];if(!p)return;transition={start:performance.now(),duration:reduced?0:1500,from:camera.position.clone(),fromTarget:controls.target.clone(),to:V(...p[0]),target:V(...p[1])};controls.enabled=false;},
    rideSignal(){pulse();if(!reduced){transition=null;riding=true;controls.enabled=false;document.body.classList.remove('transitioning');}},
    quality(value){low=value;renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.65));resize();},snapshot:()=>({slide:active,modeling:active===1?modeling.snapshot():null,channel:active===5?channel.snapshot():null,decision:active===11?decision.snapshot():null,scale:active===12?scale.snapshot():null,camera:camera.position.toArray(),target:controls.target.toArray(),meshes:scene.children.length,webgl:true,transition:!!transition,measuredStructures:measuredReady,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),dispose(){controls.dispose();renderer.dispose();removeEventListener('resize',resize);}};
}
