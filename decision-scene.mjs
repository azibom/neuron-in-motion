import * as THREE from './vendor/three.module.js';

export function createDecisionScene({scene,clickable}){
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),mint=0x83ead0,purple=0xbba3f0,amber=0xffc18a;
  const root=new THREE.Group();root.position.set(44,0,-2);scene.add(root);
  const textSprites=[];
  const mat=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.40,metalness:.06,clearcoat:.4,emissive:color,emissiveIntensity:.08,...extra});
  function path(points,color,radius=.025){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,48,radius,8,false),mat(color));root.add(mesh);return {mesh,curve};}
  function ball(pos,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,28,20),mat(color));m.position.set(...pos);root.add(m);return m;}
  function text(value,pos,width=2.2,color='#b8d9cf'){
    const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='500 42px Segoe UI';c.width=Math.ceil(ctx.measureText(value).width)+40;c.height=90;ctx.font='500 42px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,c.width/2,45);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));m.position.set(...pos);const h=Math.min(.33,width*c.height/c.width);m.scale.set(h*c.width/c.height,h,1);m.userData.baseScale=m.scale.clone();textSprites.push(m);root.add(m);return m;
  }
  const sources=[ball([-3.9,1.7,0],.37,mint),ball([-3.9,-1.7,0],.37,purple)];
  sources.forEach(m=>clickable(m,'decision-play'));
  const receiver=ball([0,0,0],.74,0x3a8c7e);
  receiver.material.transparent=true;receiver.material.opacity=.58;receiver.material.depthWrite=false;
  const nucleus=ball([.06,.06,.20],.26,0x507b7c);
  const filaments=[];for(let i=0;i<9;i++){const a=i*2.399;filaments.push(path([[Math.cos(a)*.23,Math.sin(a)*.23,.1],[Math.cos(a)*.48,Math.sin(a)*.48,.2],[Math.cos(a)*.67,Math.sin(a)*.67,0]],0x4f847b,.009).mesh);}
  const dendrites=[];for(const sign of [1,-1]){
    const color=sign===1?mint:purple;
    dendrites.push(path([[-.55,sign*.3,0],[-1.05,sign*.70,.15],[-1.5,sign*1.0,0]],color,.075));
    path([[-1.05,sign*.70,.15],[-1.5,sign*.4,.18],[-1.75,sign*.50,0]],color,.045);
    path([[-1.05,sign*.70,.15],[-1.13,sign*1.27,.1],[-1.35,sign*1.47,0]],color,.038);
  }
  const links=[path([[-3.5,1.7,0],[-2.45,1.6,.28],[-1.50,1.0,0]],mint),path([[-3.5,-1.7,0],[-2.45,-1.6,.28],[-1.50,-1.0,0]],purple)];
  const contacts=[ball([-1.5,1,0],.105,mint),ball([-1.5,-1,0],.105,purple)];
  const axon=path([[.68,0,0],[1.55,0,.2],[2.5,0,0],[3.3,0,0]],0x9e8061,.035);
  const output=ball([3.4,0,0],.20,amber);
  const outputBurst=[0,1].map(i=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(.28+i*.08,.012,6,60),new THREE.MeshBasicMaterial({color:amber,transparent:true,opacity:0}));ring.position.copy(output.position);root.add(ring);return ring;});
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.94,.014,8,100),new THREE.MeshBasicMaterial({color:mint,transparent:true,opacity:.17}));root.add(halo);
  const sourceRings=sources.map((s,i)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.49,.012,6,64),new THREE.MeshBasicMaterial({color:i?purple:mint,transparent:true,opacity:.2}));r.position.copy(s.position);root.add(r);return r;});
  text('A',[-3.9,2.50,0],.65,'#b2f4dc');text('B',[-3.9,-2.50,0],.65,'#d4bfff');
  text('RECEIVER',[0,1.40,0],2.2);text('OUTPUT',[3.4,.85,0],1.8,'#edcfab');
  text('8 mV',[-2.5,2.12,0],1.2,'#8cbdad');text('8 mV',[-2.5,-2.12,0],1.2,'#ab99c9');
  const riseLabel=text('PEAK RISE',[0,-2.50,0],2,'#8cac9e');
  const meter=new THREE.Group();meter.position.set(0,-1.8,0);root.add(meter);
  const bars=[];for(let i=0;i<16;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.085,.28,.075),new THREE.MeshBasicMaterial({color:0x274a43}));m.position.x=(i-7.5)*.13;meter.add(m);bars.push(m);}
  const threshold=path([[.91,-2.1,0],[.91,-1.5,0]],amber,.016),fireLabel=text('FIRE',[1.45,-1.78,0],.95,'#e2be94');
  const particles=[ball([0,0,0],.075,mint),ball([0,0,0],.075,purple)],outParticle=ball([0,0,0],.075,amber);
  let phase=0,current=null;
  function setPhase(value){phase=value;}
  function pose(){
    const mobile=innerWidth<=800;
    const targets=[[-.4,-.1,0],[-1.2,.4,0],[-1.2,-.4,0],[-.3,-.1,0],[-.4,-.1,0]],t=mobile?[-.4,0,0]:targets[phase];
    const target=root.position.clone().add(V(...t));
    return {target,position:target.clone().add(V(mobile?.6:1.0,mobile?3:3.2,mobile?27:phase===0||phase===4?18:16))};
  }
  function update(frame={phase:0}){
    current=frame;
    textSprites.forEach(m=>m.scale.copy(m.userData.baseScale).multiplyScalar(innerWidth<=800?1.35:1));
    const active=[frame.a,frame.b];
    sources.forEach((m,i)=>{const on=active[i]&&frame.local>=.4;m.material.emissiveIntensity=on?.65:.08;sourceRings[i].material.opacity=on?.6:.13;links[i].mesh.material.emissiveIntensity=on?.35:.05;contacts[i].material.emissiveIntensity=active[i]&&frame.arrived?.8:.08;});
    particles.forEach((m,i)=>{m.visible=!!(active[i]&&frame.emitting);if(m.visible)m.position.copy(links[i].curve.getPoint(frame.inputProgress));});
    outParticle.visible=!!frame.outputMoving;if(outParticle.visible)outParticle.position.copy(axon.curve.getPoint(frame.outputProgress));
    const rise=frame.rise??0;receiver.material.emissiveIntensity=.08+Math.min(rise/15,1)*.6;halo.material.opacity=frame.outputMoving?.8:.10+Math.min(rise/15,1)*.2;
    output.material.emissiveIntensity=frame.fired?.85:.03;output.scale.setScalar(frame.fired?1.18:1);
    outputBurst.forEach((m,i)=>{m.visible=!!frame.outputMoving;m.scale.setScalar(1+(frame.outputProgress??0)*(i?2.2:1.5));m.material.opacity=.6*(1-(frame.outputProgress??0));});
    bars.forEach((m,i)=>m.material.color.setHex(i<(frame.peakRise??0)?(i<15?mint:amber):0x274a43));
    meter.visible=phase>0;riseLabel.visible=phase>0;threshold.mesh.visible=phase>0;fireLabel.visible=phase>0;
  }
  return {root,setPhase,pose,update,snapshot:()=>({phase,...current})};
}
