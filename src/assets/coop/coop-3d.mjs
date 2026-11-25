import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Independent device state and time-of-day animation (local time, same periods as Smart Poultry).
export function periodFor(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 17 ? 'siang' : hour >= 17 && hour < 20 ? 'sore' : 'malam';
}
export function behaviorFor({period, music}) {
  return period === 'malam' ? 'sleep' : music ? 'dance' : 'idle';
}
const mix = (a,b,t) => a+(b-a)*t;
// Motion is measured in seconds, not frames; reduced motion softens rather than freezes.
export function henPose(t, phase, sleep, dance, evening, reduced = false) {
  const q=t*mix(1,.68,evening), beat=t*Math.PI*2*1.55+phase*.62;
  const awake=1-sleep, idle=awake*(1-dance), dancing=awake*dance;
  const m=reduced?.55:1;
  const peck=Math.pow(Math.max(0,Math.sin(q*1.65+phase)),5);
  const blink=Math.pow(Math.max(0,Math.cos(q*1.42+phase*2)),70);
  const sway=Math.sin(beat), bounce=(1-Math.cos(beat))*.5;
  const wander=Math.sin(q*1.15+phase), turn=Math.sin(q*1.35+phase);
  return {
    shiftX:m*(idle*.12*wander+dancing*.17*sway),
    shiftZ:m*(idle*.075*Math.sin(q*.91+phase)+dancing*.055*Math.cos(beat)),
    rootYaw:m*(idle*.27*turn+dancing*.29*sway),
    crouch:-.22*sleep+m*(idle*.018*Math.sin(q*2.4+phase)+dancing*.095*bounce),
    bodyYaw:m*(idle*.12*turn+dancing*.16*sway),
    bodyRoll:m*(idle*.05*wander+dancing*.16*sway),
    bodyBreath:1+m*(.025*awake*Math.sin(q*2+phase)+.04*sleep*Math.sin(t*1.8+phase)),
    headY:-.085*sleep+m*(idle*.055*Math.sin(q*2.6+phase)+dancing*.08*bounce),
    headPitch:-.66*sleep+m*(idle*(-.86*peck+.13*Math.sin(q*2.1+phase))+dancing*(.26*Math.sin(beat)-.22*bounce)),
    headYaw:m*(idle*.39*turn+dancing*.27*Math.sin(beat+.5)),
    wing:m*(idle*.075*Math.sin(q*1.7+phase)+dancing*(.15+.36*bounce)),
    eyeOpen:Math.max(.035,1-.965*sleep-.94*blink*idle),
    step:m*(idle*.035*Math.sin(q*2+phase)+dancing*.095*sway),
    footLift:m*(idle*.025*Math.sin(q*2+phase)+dancing*.065*sway),
    legHeight:1-.72*sleep,
  };
}
// Apply the actual animated transforms; shared by renderer and regression tests.
export function applyHenPose(h,p) {
  h.p.position.x=h.x+p.shiftX;h.p.position.z=h.z+p.shiftZ;
  h.p.rotation.y=h.heading+p.rootYaw;
  h.body.position.y=p.crouch;h.body.rotation.y=p.bodyYaw;h.body.rotation.x=p.bodyRoll;
  h.torso.scale.y=.33*p.bodyBreath;
  h.head.position.y=.57+p.headY;h.head.rotation.z=p.headPitch;h.head.rotation.y=p.headYaw;
  h.wings.forEach(({pivot,sign})=>pivot.rotation.x=sign*p.wing);
  h.eyes.forEach(e=>e.scale.y=.032*p.eyeOpen);
  h.legs.forEach((leg,i)=>{const sign=i===0?1:-1;leg.scale.y=p.legHeight;leg.position.x=sign*p.step;leg.position.y=Math.max(0,sign*p.footLift);});
}
// Absolute RAF time avoids slow-motion when the GPU misses frames.
export function advanceClock(clock,now){
  const dt=clock.last===null?0:Math.max(0,(now-clock.last)/1000);
  clock.last=now;clock.elapsed+=dt;return Math.min(dt,.25);
}
const PERIODS = ['siang','sore','malam'];
const ENV = {
  siang: {sky:0xfffaf2, ground:0x9aa99b, hemi:2.25, sun:0xfff6e9, direct:2.5, fill:1.3, fillColor:0xe1edff, pos:[-5,9,7]},
  sore: {sky:0xffe2b6, ground:0xb8a18b, hemi:1.65, sun:0xffbc75, direct:2.2, fill:.9, fillColor:0xc3d5ff, pos:[-8,3.5,5]},
  malam: {sky:0x9fbbed, ground:0x40536d, hemi:.75, sun:0xadc5ff, direct:.32, fill:.35, fillColor:0x7298dc, pos:[-5,7,4]},
};
// Listen to existing repo theme attributes, including automatic time changes.
export function bindRepoPeriod(coop, root = document.documentElement) {
  const sync = () => {
    const p = root.dataset.timePeriod || root.dataset.theme;
    if (PERIODS.includes(p)) coop.setState({period:p});
  };
  const observer = new MutationObserver(sync);
  observer.observe(root,{attributes:true,attributeFilter:['data-time-period','data-theme']});
  sync();
  return () => observer.disconnect();
}

// Front-facing perspective: the cage fills the panel without clipping its tank or feet.
// Fit the stepped tiers separately (rather than treating empty air as geometry).
export function frontCameraPose(aspect = 1) {
  aspect = Math.max(.05, Number.isFinite(aspect) ? aspect : 1);
  const target = [0, 2.50, 0];
  const yaw = Math.PI / 180, pitch = 4.5 * Math.PI / 180;
  const back = [Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), Math.cos(yaw)*Math.cos(pitch)];
  const right = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const up = [-Math.sin(yaw)*Math.sin(pitch), Math.cos(pitch), -Math.cos(yaw)*Math.sin(pitch)];
  const dot = (a,b) => a.reduce((v,n,i)=>v+n*b[i],0);
  const fov = 34, tan = Math.tan(fov*Math.PI/360);
  // Leave room for the overlay title and reset controls above/below the cage.
  const bounds = [
    [[-2.49,.015,-1.92],[2.49,1.64,2.05]],
    [[-2.49,1.64,-1.92],[2.49,2.98,1.27]],
    [[-2.63,2.96,-1.92],[2.49,4.43,.49]],
    [[-2.49,4.22,-1.48],[-.90,4.99,.29]]
  ];
  let distance = 5;
  for(const [lo,hi] of bounds) for(const x of [lo[0],hi[0]]) for(const y of [lo[1],hi[1]]) for(const z of [lo[2],hi[2]]) {
    const p = [x-target[0],y-target[1],z-target[2]];
    const depth = dot(p,back);
    distance = Math.max(distance, depth+Math.abs(dot(p,right))/(tan*aspect*.92), depth+Math.abs(dot(p,up))/(tan*.84));
  }
  return {target,position:target.map((n,i)=>n+back[i]*distance),distance,fov};
}

// Three fixed, fully meshed compartments. Dimensions are visual, not fabrication drawings.
export function mountCoop3D(root, initial = {}) {
  if (!root) throw new Error('Missing coop container');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  root.appendChild(renderer.domElement);
  renderer.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:pan-y';
  renderer.domElement.setAttribute('aria-label','Putar dan perbesar model 3D kandang. Gunakan tombol panah, plus, minus, atau Home.');
  renderer.domElement.tabIndex=0;
  const controls = new OrbitControls(camera, renderer.domElement);
  Object.assign(controls,{enableDamping:true,dampingFactor:.08,enablePan:false,minDistance:5,maxDistance:19,minPolarAngle:.18,maxPolarAngle:Math.PI*.49});
  renderer.domElement.style.touchAction='pan-y';
  const viewportAspect=()=>root.clientWidth>0&&root.clientHeight>0?root.clientWidth/root.clientHeight:1;
  let defaultDistance=frontCameraPose(viewportAspect()).distance;
  function updateCameraLimits(distance){controls.minDistance=Math.min(5,distance*.55);controls.maxDistance=Math.max(19,distance*2.3);camera.far=Math.max(50,controls.maxDistance+20);}
  function resetView(){
    const pose=frontCameraPose(viewportAspect());
    defaultDistance=pose.distance;
    // Flush residual orbit damping before assigning the new camera position.
    const damping=controls.enableDamping;controls.enableDamping=false;controls.update();
    updateCameraLimits(pose.distance);camera.aspect=viewportAspect();camera.fov=pose.fov;camera.zoom=1;camera.updateProjectionMatrix();
    controls.target.set(...pose.target);camera.position.set(...pose.position);controls.update();controls.enableDamping=damping;controls.saveState();
  }
  resetView();
  function handleCameraKeys(event){
    if(event.key==='Home'){event.preventDefault();resetView();return;}
    const offset=camera.position.clone().sub(controls.target);
    const spherical=new THREE.Spherical().setFromVector3(offset);
    switch(event.key){
      case 'ArrowLeft': spherical.theta+=.12; break;
      case 'ArrowRight': spherical.theta-=.12; break;
      case 'ArrowUp': spherical.phi-=.08; break;
      case 'ArrowDown': spherical.phi+=.08; break;
      case '+': case '=': spherical.radius*=.9; break;
      case '-': case '_': spherical.radius*=1.1; break;
      default: return;
    }
    event.preventDefault();
    spherical.phi=THREE.MathUtils.clamp(spherical.phi,controls.minPolarAngle,controls.maxPolarAngle);
    spherical.radius=THREE.MathUtils.clamp(spherical.radius,controls.minDistance,controls.maxDistance);
    camera.position.copy(new THREE.Vector3().setFromSpherical(spherical).add(controls.target));
    controls.update();
  }
  renderer.domElement.addEventListener('keydown',handleCameraKeys);
  const hemi=new THREE.HemisphereLight(0xfffaf2,0x9aa99b,2.25);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff6e9,2.5);sun.position.set(-5,9,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});sun.shadow.normalBias=.025;scene.add(sun);
  const fill=new THREE.DirectionalLight(0xe1edff,1.3);fill.position.set(5,5,-5);scene.add(fill);
  const model=new THREE.Group();scene.add(model);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.66,...extra});
  const M={frame:mat(0x9aa5a5,{metalness:.45}),wire:mat(0x9ba7a7,{metalness:.48}),tray:mat(0xd4d8d4,{metalness:.2}),white:mat(0xe9ece5),dark:mat(0x34443f),rubber:mat(0x222b27),red:mat(0xc94332),feed:mat(0xd6ad5f),beak:mat(0xe0a140),eye:mat(0x202622),green:mat(0x006b35),water:mat(0x68aeb5,{roughness:.25})};
  const unitBox=new THREE.BoxGeometry(1,1,1), unitSphere=new THREE.SphereGeometry(1,18,12);
  function mesh(g,m,x,y,z,p=model){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
  function box(w,h,d,m,x,y,z,p=model){const o=mesh(unitBox,m,x,y,z,p);o.scale.set(w,h,d);return o;}
  function cyl(rt,rb,h,m,x,y,z,p=model,n=18){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z,p);}
  function ell(rx,ry,rz,m,x,y,z,p=model){const o=mesh(unitSphere,m,x,y,z,p);o.scale.set(rx,ry,rz);return o;}
  function beam(a,b,w,m=M.frame,p=model){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),c=av.clone().add(bv).multiplyScalar(.5);const o=box(w,v.length(),w,m,c.x,c.y,c.z,p);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function rod(a,b,r,m,p=model){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),c=av.clone().add(bv).multiplyScalar(.5);const o=cyl(r,r,v.length(),m,c.x,c.y,c.z,p,10);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  const wires=[];
  function wire(a,b){wires.push([a,b]);}
  function grid(o,u,v,nu,nv){const p=(s,t)=>o.map((a,i)=>a+u[i]*s+v[i]*t);for(let i=0;i<=nu;i++)wire(p(i/nu,0),p(i/nu,1));for(let j=0;j<=nv;j++)wire(p(0,j/nv),p(1,j/nv));}
  // Fixed stepped steel chassis, including rear supports and diagonal front rails.
  const W=4.45, L=-W/2, R=W/2, rear=-1.78;
  const tiers=[{y:.48,z:1.65},{y:1.80,z:.87},{y:3.12,z:.09}];
  const H=1.12,D=1.39;
  for(const x of [L-.12,R+.12]){
    beam([x,.14,rear],[x,4.37,rear],.115);
    beam([x,.14,1.77],[x,1.50,1.77],.115);
    beam([x,1.50,1.77],[x,4.37,.08],.115);
    beam([x,4.37,rear],[x,4.37,.08],.105);
    beam([x,.22,rear],[x,.22,1.77],.115);
    for(const z of [rear,1.77])cyl(.115,.14,.09,M.rubber,x,.06,z);
    for(const t of tiers)beam([x,t.y-.12,rear],[x,t.y-.12,t.z+.10],.105);
  }
  for(const z of [rear,1.77])beam([L-.12,.22,z],[R+.12,.22,z],.12);
  beam([L-.12,4.37,rear],[R+.12,4.37,rear],.10);
  const lamps=[], cups=[];
  // Each tier has all six faces: front, back, left, right, ceiling and floor.
  for(const {y,z} of tiers){
    const b=z-D, top=y+H;
    for(const yy of [y,top]){for(const zz of [b,z])beam([L,yy,zz],[R,yy,zz],.055);for(const x of [L,R])beam([x,yy,b],[x,yy,z],.055);}
    for(const x of [L,R,-W/6,W/6])for(const zz of [b,z])beam([x,y,zz],[x,top,zz],.045);
    for(const zz of [b,z])grid([L,y,zz],[W,0,0],[0,H,0],30,8);
    for(const x of [L,R,-W/6,W/6])grid([x,y,b],[0,0,D],[0,H,0],10,8);
    for(const yy of [y,top])grid([L,yy,b],[W,0,0],[0,0,D],30,10);
    // Collection tray below cage, continuous external trough with visible grain.
    box(W+.15,.045,D+.10,M.tray,0,y-.12,(b+z)/2);
    box(W+.14,.055,.29,M.tray,0,y-.015,z+.20);
    const lip=box(W+.14,.19,.045,M.white,0,y+.06,z+.36);lip.rotation.x=-.16;
    box(W+.14,.11,.035,M.tray,0,y+.025,z+.06);
    box(W-.04,.025,.22,M.feed,0,y+.022,z+.20);
    for(const x of [L-.07,R+.07])box(.04,.15,.32,M.white,x,y+.04,z+.20);
    // PVC water line with individual red drinking cups along the front.
    rod([L-.08,top-.13,z+.075],[R+.08,top-.13,z+.075],.045,M.white);
    for(let i=0;i<9;i++){const x=L+.27+i*(W-.54)/8;rod([x,top-.13,z+.075],[x,top-.30,z+.075],.025,M.red);cyl(.095,.065,.045,M.red,x,top-.32,z+.075);const water=cyl(.073,.073,.012,M.water,x,top-.292,z+.075);cups.push(water);}
    // A fixed red + warm white lighting pair inside every cage tier.
    for(const [x,color] of [[-1.45,0xff6b45],[1.45,0xffd29a]]){
      box(.50,.065,.13,M.dark,x,top-.055,b+.29);
      const bulb=mat(0xb7b7a8,{emissive:color,emissiveIntensity:0});box(.43,.045,.10,bulb,x,top-.105,b+.29);
      const light=new THREE.PointLight(color,0,2.4,2);light.position.set(x,top-.22,b+.29);model.add(light);lamps.push({bulb,light,color:new THREE.Color(color)});
    }
  }
  // All thin wire cylinders in one draw call; omit shadow casting to reduce aliasing.
  const wireMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.009,.009,1,5),M.wire,wires.length);
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
  wires.forEach(([a,b],i)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);dummy.position.copy(av).add(bv).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,v.clone().normalize());dummy.scale.set(1,v.length(),1);dummy.updateMatrix();wireMesh.setMatrixAt(i,dummy.matrix);});
  wireMesh.instanceMatrix.needsUpdate=true;wireMesh.receiveShadow=true;model.add(wireMesh);
  // Fixed reservoir and supply tube, IoT cabinet, sensor and speaker.
  box(1.16,.48,.86,M.white,L+.37,4.66,-1.02);box(1.22,.09,.92,M.tray,L+.37,4.94,-1.02);
  const pipeX=L-.22;
  rod([L+.37,4.42,-1.02],[L+.37,4.18,-1.02],.045,M.dark);rod([L+.37,4.18,-1.02],[pipeX,4.18,-1.02],.045,M.dark);rod([pipeX,4.18,-1.02],[pipeX,.78,-1.02],.045,M.dark);
  for(const {y,z} of tiers){rod([pipeX,y+H-.13,-1.02],[pipeX,y+H-.13,z+.075],.038,M.dark);rod([pipeX,y+H-.13,z+.075],[L-.08,y+H-.13,z+.075],.038,M.dark);}
  const cabinet=new THREE.Group();cabinet.position.set(L-.24,2.66,-1.30);cabinet.rotation.y=-Math.PI/2;model.add(cabinet);
  box(.52,.67,.21,M.white,0,0,0,cabinet);box(.34,.21,.025,M.dark,0,.12,.12,cabinet);
  const statusLED=mat(0x55b82a,{emissive:0x55b82a,emissiveIntensity:.8});for(const x of [-.12,0,.12])ell(.024,.024,.012,statusLED,x,-.16,.123,cabinet);
  box(.36,.34,.16,M.white,0,-.68,0,cabinet);for(let i=0;i<5;i++)box(.22,.014,.013,M.dark,0,-.78+i*.045,.086,cabinet);
  const beaconMat=mat(0x7e9381,{emissive:0x55b82a,emissiveIntensity:0});cyl(.13,.13,.17,beaconMat,L-.25,3.22,-1.3);cyl(.145,.145,.055,M.dark,L-.25,3.105,-1.3);cyl(.145,.145,.055,M.dark,L-.25,3.335,-1.3);
  const speaker=new THREE.Group();speaker.position.set(L+.98,4.52,-.18);model.add(speaker);
  box(.57,.46,.34,M.dark,0,0,0,speaker);box(.50,.39,.05,M.tray,0,0,.19,speaker);
  const cone=cyl(.145,.16,.045,M.dark,0,0,.235,speaker);cone.rotation.x=Math.PI/2;const dome=ell(.064,.064,.035,M.frame,0,0,.268,speaker);
  const rings=[];for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(.18,.013,8,40),new THREE.MeshBasicMaterial({color:0x269348,transparent:true,opacity:0,depthWrite:false}),0,0,.29,speaker);r.castShadow=false;r.visible=false;rings.push(r);}
  // Reuse organic low-poly hen geometry, scaled to fit the mesh compartments.
  function hen(x,y,z,heading,color,phase){
    const p=new THREE.Group();p.position.set(x,y,z);p.scale.setScalar(.76);p.rotation.y=heading;model.add(p);
    const body=new THREE.Group();p.add(body);
    const feathers=mat(color),wing=mat(color===0xffefd4?0xe0be89:0xb88b5f);
    const torso=ell(.42,.33,.27,feathers,-.04,.46,0,body);
    const wings=[];
    for(const sign of [-1,1]){
      const pivot=new THREE.Group();pivot.position.set(.08,.51,sign*.22);body.add(pivot);
      ell(.27,.18,.06,wing,-.16,-.04,sign*.02,pivot);wings.push({pivot,sign});
    }
    for(const [i,a] of [[0,.7],[1,.95],[2,1.2]]){const tail=ell(.115,.29,.075,wing,-.38-i*.03,.59+i*.03,(i-1)*.11,body);tail.rotation.z=a;}
    const legs=[];
    for(const z0 of [-.12,.12]){const leg=new THREE.Group();leg.position.z=z0;p.add(leg);rod([.01,.27,0],[.01,.05,0],.025,M.beak,leg);for(const dz of [-.05,.05])rod([.01,.05,0],[.15,.025,dz],.016,M.beak,leg);legs.push(leg);}
    const head=new THREE.Group();head.position.set(.21,.57,0);body.add(head);
    ell(.17,.24,.17,feathers,.07,.10,0,head);ell(.18,.18,.16,feathers,.19,.25,0,head);
    const beak=mesh(new THREE.ConeGeometry(.085,.18,4),M.beak,.39,.22,0,head);beak.rotation.z=-Math.PI/2;
    const eyes=[];
    for(const z0 of [-.144,.144])eyes.push(ell(.028,.032,.015,M.eye,.24,.29,z0,head));
    for(let i=0;i<3;i++)ell(.045,.075+i*.008,.05,M.red,.11+i*.07,.415,0,head);
    ell(.06,.084,.05,M.red,.29,.105,0,head);
    p.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
    return {p,body,torso,head,wings,eyes,legs,phase,x,y,z,heading};
  }
  const hens=[];tiers.forEach(({y,z},i)=>{for(let j=0;j<3;j++)hens.push(hen(-W/3+j*W/3,y+.02,z-.65,j%2?2.8:.25,[0xd7a66c,0xf1d5ae,0xc99462][(i+j)%3],i*2+j*1.7));});
  const floor=mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.23}),0,0,0,scene);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
  const state={lamp:false,music:false,valve:false,period:'siang',motion:'auto'};
  function setViewStatus(status){
    root.dataset.coopStatus=status;
    root.setAttribute('aria-hidden',String(status!=='ready'));
    const poster=root.parentElement?.querySelector('.user-pro-coop-photo');
    if(poster){if(status==='ready')poster.setAttribute('aria-hidden','true');else poster.removeAttribute('aria-hidden');}
    const container=root.closest('.user-pro-dashboard');
    const statusText=container?.querySelector('#pro-coop-animation-status');
    if(statusText){
      const messages={ready:'Animasi 3D berjalan. Status perangkat hanya simulasi.',fallback:'Foto kandang ditampilkan, tampilan 3D tidak tersedia.',disposed:'Tampilan 3D ditutup.'};
      statusText.textContent=messages[status]||'Memuat tampilan 3D.';
    }
  }
  function setState(next={}){
    for(const k of ['lamp','music','valve'])if(typeof next[k]==='boolean')state[k]=next[k];
    if(PERIODS.includes(next.period))state.period=next.period;
    if(['auto','full','gentle'].includes(next.motion))state.motion=next.motion;
    root.dataset.coopPeriod=state.period;
  }
  setState(initial);
  let level=state.lamp?1:0,disposed=false,frame=0;
  const clock={last:null,elapsed:0};
  const resetClock=()=>{clock.last=null;};document.addEventListener('visibilitychange',resetClock);
  let renderedFrames=0, lastRendered=0, lastPose=null, renderError=null;
  let sleep=state.period==='malam'?1:0,dance=state.music&&state.period!=='malam'?1:0,evening=state.period==='sore'?1:0;
  const motionPreference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const isGentle=()=>state.motion==='gentle'||(state.motion==='auto'&&!!motionPreference?.matches);
  // Cage is static. Cache its shadow; animated hens do not cast costly per-frame shadows.
  sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;
  const envColors={};for(const [key,e] of Object.entries(ENV))envColors[key]={sky:new THREE.Color(e.sky),ground:new THREE.Color(e.ground),sun:new THREE.Color(e.sun),fill:new THREE.Color(e.fillColor),pos:new THREE.Vector3(...e.pos)};
  function applyEnvironment(alpha){const e=ENV[state.period],c=envColors[state.period];hemi.color.lerp(c.sky,alpha);hemi.groundColor.lerp(c.ground,alpha);hemi.intensity=mix(hemi.intensity,e.hemi,alpha);sun.color.lerp(c.sun,alpha);sun.intensity=mix(sun.intensity,e.direct,alpha);sun.position.lerp(c.pos,alpha);fill.color.lerp(c.fill,alpha);fill.intensity=mix(fill.intensity,e.fill,alpha);}
  applyEnvironment(1);
  const resize=()=>{
    const w=root.clientWidth,h=root.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);
    const pose=frontCameraPose(w/h),ratio=pose.distance/defaultDistance;
    // Preserve the user's orbit and relative zoom when the layout resizes.
    camera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);
    defaultDistance=pose.distance;updateCameraLimits(pose.distance);camera.aspect=w/h;camera.fov=pose.fov;camera.updateProjectionMatrix();controls.update();
  };
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(root);resize();
  if(!ro)window.addEventListener('resize',resize);
  // Render while the tab is active. Do not rely on IntersectionObserver (embedded previews can misreport visibility).
  function tick(now){
    if(disposed)return;
    frame=requestAnimationFrame(tick);
    if(document.hidden){clock.last=null;return;}
    if(root.clientWidth===0||root.clientHeight===0){clock.last=null;return;}
    const dt=advanceClock(clock,now),elapsed=clock.elapsed,reduce=isGentle();
    level=THREE.MathUtils.damp(level,state.lamp?1:0,8,dt);
    for(const l of lamps){l.bulb.emissiveIntensity=level*2.8;l.bulb.color.set(0xb7b7a8).lerp(l.color,level);l.light.intensity=level*3.6;}
    beaconMat.emissiveIntensity=level*1.5;beaconMat.color.set(0x7e9381).lerp(new THREE.Color(0x55b82a),level);
    const smooth=(v,target,rate)=>THREE.MathUtils.damp(v,target,rate,dt);
    const behavior=behaviorFor(state);
    sleep=smooth(sleep,behavior==='sleep'?1:0,3.2);
    dance=smooth(dance,behavior==='dance'?1:0,5);
    evening=smooth(evening,state.period==='sore'?1:0,2);
    const prevSun=sun.position.clone();
    applyEnvironment(1-Math.exp(-2.5*dt));
    if(prevSun.distanceToSquared(sun.position)>.000025)sun.shadow.needsUpdate=true;
    for(const h of hens){
      const p=henPose(elapsed,h.phase,sleep,dance,evening,reduce);
      applyHenPose(h,p);
      if(h===hens[0])lastPose=p;
    }
    const pulse=state.music&&!reduce?Math.sin(elapsed*18)*.012:0;cone.position.z=.235+pulse;dome.position.z=.268+pulse;
    rings.forEach((r,i)=>{const f=reduce?(i+1)/4:(elapsed*.78+i/3)%1;r.visible=state.music;r.scale.setScalar(.8+f*1.8);r.position.z=.29+f*.75;r.material.opacity=.7*(1-f);});
    // Valve indicates simulated supply, not measured water level.
    cups.forEach(w=>{w.visible=state.valve;});
    controls.update();
    try{renderer.render(scene,camera);if(root.dataset.coopStatus!=='ready')setViewStatus('ready');renderedFrames++;lastRendered=now;renderError=null;}catch(e){renderError=String(e);setViewStatus('fallback');cancelAnimationFrame(frame);console.error(e);}
  }
  frame=requestAnimationFrame(tick);
  return {setState,resetView,getState:()=>({...state}),getBehavior:()=>behaviorFor(state),getDiagnostics:()=>({frames:renderedFrames,elapsed:clock.elapsed,lastRendered,behavior:behaviorFor(state),gentle:isGentle(),pose:lastPose?{...lastPose}:null,error:renderError}),dispose(){disposed=true;cancelAnimationFrame(frame);setViewStatus('disposed');renderer.domElement.removeEventListener('keydown',handleCameraKeys);document.removeEventListener('visibilitychange',resetClock);ro?.disconnect();if(!ro)window.removeEventListener('resize',resize);controls.dispose();const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());wireMesh.dispose();renderer.dispose();renderer.domElement.remove();}};
}
