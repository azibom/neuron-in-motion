import * as THREE from './vendor/three.module.js';
import { scalePopulation } from './scale-film.mjs';

// A data diagram, not measured brain anatomy or a running 10,000-cell network.
export function createScaleScene({scene,clickable}){
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),mint=0x87e8cd;
  const root=new THREE.Group();root.position.set(61,0,-7);scene.add(root);
  const mat=(color,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness:.43,metalness:.08,clearcoat:.35,emissive:color,emissiveIntensity:.1,...extra});
  const texts=[];
  function text(parent,value,pos,width=2.5,color='#b6d3c7'){
    const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='500 44px Segoe UI';c.width=Math.ceil(ctx.measureText(value).width)+40;c.height=90;ctx.font='500 44px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(value,c.width/2,45);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));m.position.set(...pos);const h=Math.min(.35,width*c.height/c.width);m.scale.set(h*c.width/c.height,h,1);m.userData.base=m.scale.clone();parent.add(m);texts.push(m);return m;
  }
  function wire(points,color=mint,radius=.022){const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,36,radius,7,false),mat(color));root.add(mesh);return mesh;}
  const cell=new THREE.Mesh(new THREE.SphereGeometry(.67,40,32),mat(0x44887d,{transparent:true,opacity:.65,depthWrite:false}));cell.position.set(-3.2,.8,1);root.add(cell);clickable(cell,'scale-play');
  const nucleus=new THREE.Mesh(new THREE.SphereGeometry(.23,24,16),mat(0x699892));nucleus.position.set(-3.18,.85,1.25);root.add(nucleus);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a),y=Math.sin(a);wire([[-3.2+x*.55,.8+y*.55,1],[-3.2+x*1.0,.8+y*1.0,.9],[-3.2+x*1.2,.8+y*1.2,1]],0x588f83,.045);}
  text(root,'ONE NEURON',[-3.2,2.3,1],2.6);
  const record=new THREE.Group();record.position.set(-3.2,-1.2,1);root.add(record);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.18,.15),mat(0x193b38,{transparent:true,opacity:.72,depthWrite:false}));record.add(panel);
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry),new THREE.LineBasicMaterial({color:0x65988a,transparent:true,opacity:.55}));record.add(outline);
  const recordLabel=text(root,'ITS DATA RECORD',[-3.2,-2.12,1],3);
  const recordLink=wire([[-3.2,.13,1],[-3.2,-.25,1],[-3.2,-.6,1]],0x739c8b,.018);
  const fields=[];
  for(let i=0;i<4;i++){
    const group=new THREE.Group();record.add(group);
    const shape=new THREE.Mesh(new THREE.BoxGeometry(.59,.74,.12),mat(mint));shape.position.z=.14;group.add(shape);
    const labels={};for(const key of ['V','v','w','m','h','n'])labels[key]=text(group,key,[0,0,.26],.45,'#183c32');
    fields.push({group,shape,labels});
  }
  const population=new THREE.Group();population.position.set(2.3,.0,-1.2);root.add(population);
  const positions=[];let seed=1942;const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  // Exactly 25 × 20 × 20 proxy points; each point stands for one modeled cell.
  for(let x=0;x<25;x++)for(let y=0;y<20;y++)for(let z=0;z<20;z++)positions.push((x-12)*.205+(random()-.5)*.08,(y-9.5)*.205+(random()-.5)*.08,(z-9.5)*.205+(random()-.5)*.08);
  const pointsGeo=new THREE.BufferGeometry();pointsGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const dotCanvas=document.createElement('canvas');dotCanvas.width=dotCanvas.height=32;const ctx=dotCanvas.getContext('2d'),gradient=ctx.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'white');gradient.addColorStop(.28,'rgba(255,255,255,.7)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,32,32);
  const dotMap=new THREE.CanvasTexture(dotCanvas);
  const points=new THREE.Points(pointsGeo,new THREE.PointsMaterial({color:0x7ab89b,size:.062,map:dotMap,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));population.add(points);
  const box=new THREE.Box3Helper(new THREE.Box3(V(-2.65,-2.1,-2.1),V(2.65,2.1,2.1)),0x3b6654);box.material.transparent=true;box.material.opacity=.20;population.add(box);
  text(root,'10,000 MODELED CELLS',[2.3,2.8,-1.0],4.8);
  const populationLabel=text(root,'SAME CELL COUNT',[2.3,-2.9,-1.0],3.5,'#729a83');
  const replication=wire([[-1.56,-1.2,1],[-.4,-1.2,.6],[.8,-.8,-.4]],0x87b49d,.014);
  let phase=0,current=null;
  function setPhase(next){phase=next;}
  function pose(){
    const mobile=innerWidth<=800,target=root.position.clone().add(V(-.4,0,0));
    return {target,position:target.clone().add(V(mobile?.6:phase===0?2.3:phase===4?2.3:1.8,mobile?3.0:3.3,mobile?29:phase===0||phase===4?20:19))};
  }
  function update(time,frame={phase:0,keys:['V'],values:1,revealed:false,color:mint,cloudOpacity:.08}){
    current=frame;
    const mobile=innerWidth<=800;
    population.scale.setScalar(mobile?.72:1);populationLabel.position.y=mobile?-2.0:-2.9;
    texts.forEach(t=>t.scale.copy(t.userData.base).multiplyScalar(mobile?1.25:1));
    fields.forEach(({group,shape,labels},i)=>{
      group.visible=frame.revealed&&i<frame.values;group.position.x=(i-(frame.values-1)/2)*.72;
      group.scale.setScalar(frame.revealed?.75+.25*(frame.reveal??1):1);shape.material.color.setHex(frame.color);shape.material.emissive.setHex(frame.color);
      for(const [key,label] of Object.entries(labels))label.visible=key===frame.keys[i];
    });
    points.material.opacity=frame.cloudOpacity;replication.visible=frame.revealed;record.visible=frame.revealed;recordLink.visible=frame.revealed;recordLabel.visible=frame.revealed;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;population.rotation.y=reduced?0:Math.sin(time*.09)*.08;
  }
  return {root,setPhase,pose,update,snapshot:()=>({phase,proxyCells:positions.length/3,expectedCells:scalePopulation,...current})};
}
