import * as THREE from './vendor/three.module.js';
export function createModelingScene({scene,clickable}){
  const root=new THREE.Group();root.position.set(-10,-11,-3);scene.add(root);
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),mint=0x82efce,purple=0xb8a2fa,amber=0xffba7a;
  const mat=color=>new THREE.MeshPhysicalMaterial({color,roughness:.38,metalness:.2,emissive:color,emissiveIntensity:.1});
  const dot=new THREE.SphereGeometry(.04,10,8);
  function wire(parent,points,color=0x80a9a4,radius=.018){const path=new THREE.CurvePath();for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(V(...points[i-1]),V(...points[i])));const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,Math.max(8,points.length*4),radius,8,false),mat(color));parent.add(mesh);return mesh;}
  function text(parent,value,pos,width=3,color='#c8ded6'){
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font='500 52px Segoe UI';canvas.width=Math.ceil(ctx.measureText(value).width)+40;canvas.height=110;ctx.font='500 52px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,canvas.width/2,55);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));sprite.position.set(...pos);const h=Math.min(.65,width*110/canvas.width);sprite.scale.set(h*canvas.width/110,h,1);parent.add(sprite);
  }
  function board(parent){const mesh=new THREE.Mesh(new THREE.BoxGeometry(8.6,6,.1),new THREE.MeshPhysicalMaterial({color:0x0e252e,transparent:true,opacity:.6,roughness:.6,metalness:.1}));mesh.position.set(0,-.3,-.15);parent.add(mesh);}
  function cap(parent,x){for(const y of [.15,.42]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.9,.045,.3),mat(purple));mesh.position.set(x,y,.1);parent.add(mesh);}wire(parent,[[x,1.55,0],[x,.42,.1]],purple);wire(parent,[[x,.15,.1],[x,-1.65,0]],purple);text(parent,'C',[x-.6,.3,.2],.6,'#b8a2fa');}
  function branch(parent,x,name,color,variable=false){const mesh=wire(parent,[[x,1.55,0],[x,1.15,0],[x-.13,1,0],[x+.13,.8,0],[x-.13,.6,0],[x+.13,.4,0],[x,.25,0],[x,-.65,0]],color,.023);wire(parent,[[x-.28,-.65,0],[x+.28,-.65,0]],color);wire(parent,[[x-.15,-.85,0],[x+.15,-.85,0]],color);wire(parent,[[x,-.85,0],[x,-1.65,0]],color);if(variable)wire(parent,[[x-.33,.25,.12],[x+.35,1.22,.12],[x+.18,1.13,.12],[x+.35,1.22,.12],[x+.34,1.02,.12]],color);text(parent,name,[x,2.1,.2],1.6);text(parent,name==='R'?'Eₗ':'E'+name.slice(1),[x,-1.13,.2],1.4);return mesh;}
  function rails(parent,left,right){wire(parent,[[-4,1.55,0],[right,1.55,0]]);wire(parent,[[left,-1.65,0],[right,-1.65,0]]);text(parent,'Iinput',[-3.5,2.1,.2],1.5,'#82efce');text(parent,'V · INSIDE',[0,2.6,.2],3);text(parent,'OUTSIDE · 0 mV',[0,-2.2,.2],3.5,'#89aaa2');}
  const lif=new THREE.Group();root.add(lif);board(lif);cap(lif,-1.5);const resistor=branch(lif,1.6,'R',amber);rails(lif,-1.5,1.6);clickable(resistor,'model-run');text(lif,'voltage state + threshold / reset',[0,-3,.3],7,'#89aaa2');
  const hh=new THREE.Group();root.add(hh);board(hh);cap(hh,-3);const ionBranches=[];
  for(const [j,name] of ['Na','K','L'].entries()){const x=-1+j*2,mesh=branch(hh,x,'g'+name,[mint,purple,amber][j],j<2);clickable(mesh,'model-run');ionBranches.push(mesh);}rails(hh,-3,3);text(hh,'V, m, h, n · separate currents',[0,-3,.3],7,'#89aaa2');
  const particles=[];for(let j=0;j<3;j++)for(let k=0;k<7;k++){const mesh=new THREE.Mesh(dot,new THREE.MeshBasicMaterial({color:[mint,purple,amber][j]}));hh.add(mesh);particles.push({mesh,j,phase:k/7});}
  const fhn=new THREE.Group();root.add(fhn);board(fhn);
  const nodes=[];for(const [j,name] of ['v','w'].entries()){const x=j?2:-2,node=new THREE.Mesh(new THREE.SphereGeometry(.4,32,24),mat(j?amber:purple));node.position.set(x,1.6,.2);fhn.add(node);nodes.push(node);clickable(node,'model-run');text(fhn,name,[x,1.6,.8],.7);text(fhn,j?'SLOW RECOVERY':'FAST EXCITATION',[x,2.5,.2],3.8);}
  wire(fhn,[[-1.5,1.85,0],[0,2.2,0],[1.5,1.85,0]],purple);wire(fhn,[[1.5,1.4,0],[0,1.05,0],[-1.5,1.4,0]],amber);text(fhn,'recovery opposes excitation',[0,.55,.2],5.6,'#ffba7a');
  wire(fhn,[[-3.2,-2.3,.2],[3.2,-2.3,.2]],0x466d6a,.009);wire(fhn,[[-3.2,-2.3,.2],[-3.2,.1,.2]],0x466d6a,.009);text(fhn,'v →',[3,-2.6,.2],.9);text(fhn,'w',[-3.65,-.1,.2],.6);text(fhn,'DIMENSIONLESS STATE PLANE',[0,-3,.3],6,'#89aaa2');
  const plotPoint=(v,w)=>V(v*1.35,-1.15+w*.75,.3);
  const makeLine=(color)=>{const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color,transparent:true,opacity:.8}));fhn.add(line);return line;};
  const cubic=makeLine(purple),recovery=makeLine(amber),trajectory=makeLine(mint),cursor=new THREE.Mesh(new THREE.SphereGeometry(.065,16,10),new THREE.MeshBasicMaterial({color:mint}));fhn.add(cursor);
  let cachedInput=null,cachedResult=null,step=0,selectedModel='LIF';
  function curves(input){cachedInput=input;const points=[];for(let v=-2.15;v<=2.15;v+=.025)points.push(plotPoint(v,input+v-v**3/3));cubic.geometry.dispose();cubic.geometry=new THREE.BufferGeometry().setFromPoints(points);const line=[];for(let v=-1.8;v<=.2;v+=.03)line.push(plotPoint(v,(v+.7)/.8));recovery.geometry.dispose();recovery.geometry=new THREE.BufferGeometry().setFromPoints(line);}
  function setStep(value,model){step=value;selectedModel=['LIF','HH','FHN'][step];lif.visible=step===0;hh.visible=step===1;fhn.visible=step===2;}
  function update(time,state){
    if(step===1){for(const p of particles){const current=state.sample?.[['na','k','leak'][p.j]]??0;p.mesh.visible=state.playing&&Math.abs(current)>.05;const phase=(time*(.2+Math.min(1.4,Math.abs(current)/150))+p.phase)%1;p.mesh.position.set(-1+2*p.j,current<0?-1.6+phase*3.2:1.6-phase*3.2,.1);}const s=state.sample;ionBranches.forEach((mesh,j)=>mesh.material.emissiveIntensity=.1+(s?Math.abs([s.na,s.k,s.leak][j])/1000:0));}
    if(step===2){const input=state.sample?.input??state.fhnI??.55;if(cachedInput!==input)curves(input);const r=state.result,isFHN=r?.type==='FHN';trajectory.visible=cursor.visible=isFHN;if(isFHN){if(cachedResult!==r){cachedResult=r;trajectory.geometry.dispose();trajectory.geometry=new THREE.BufferGeometry().setFromPoints(r.trace.filter((s,i)=>i%6===0).map(s=>plotPoint(s.v,s.w)));}trajectory.geometry.setDrawRange(0,Math.ceil(trajectory.geometry.attributes.position.count*state.head/r.duration));if(state.sample){cursor.position.copy(plotPoint(state.sample.v,state.sample.w));nodes[0].scale.setScalar(.6+(state.sample.v+2.5)*.13);nodes[1].scale.setScalar(.7+(state.sample.w+1)*.15);}}}
  }
  setStep(0);
  return {root,setStep,update,pose:()=>({position:root.position.clone().add(V(1.3,2.3,17)),target:root.position.clone().add(V(.2,.3,0))}),snapshot:()=>({step,model:selectedModel})};
}
