import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const root = document.querySelector('#world');
const intro = document.querySelector('#intro');
const pondUI = document.querySelector('#pondUI');
const enterButton = document.querySelector('#enterButton');
const soundToggle = document.querySelector('#soundToggle');
const soundLabel = document.querySelector('#soundLabel');
const soundNote = document.querySelector('#soundNote');
const statusText = document.querySelector('#statusText');
const weatherLabel = document.querySelector('#weatherLabel');
const clockLabel = document.querySelector('#clockLabel');
const toast = document.querySelector('#toast');
const panel = document.querySelector('#sectionPanel');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#c8d8cf');
// Dense meadow mist hides the far side of the circuit and lets only a slice of track emerge.
scene.fog = new THREE.Fog('#c8d8cf', 18, 42);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 250);
camera.position.set(0, 2, 8);
camera.lookAt(0, 17, -22);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
let pixelStyle = '64';
function setPixelResolution(){
  const divisor = pixelStyle === '8' ? 4 : pixelStyle === '16' ? 2.5 : 1;
  renderer.setSize(Math.max(240,Math.floor(innerWidth/divisor)),Math.max(135,Math.floor(innerHeight/divisor)),false);
}
setPixelResolution();
renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
root.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xc9e9f0, 0x2e4939, 2.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8bd, 3.2);
sun.position.set(-12, 22, 8);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x8dc9cf, 1.1);
fill.position.set(10, 8, -18);
scene.add(fill);

// A visible sun anchors the opening sky shot. It stays in the scene as the camera dives toward the circuit.
const sunDisc = new THREE.Mesh(new THREE.BoxGeometry(4.3,4.3,1), new THREE.MeshBasicMaterial({ color: 0xffedc2 }));
sunDisc.position.set(0, 18, -22);
scene.add(sunDisc);
const sunHalo = new THREE.Mesh(new THREE.BoxGeometry(6,6,.8), new THREE.MeshBasicMaterial({ color: 0xffd99a, transparent: true, opacity: .13, depthWrite: false }));
sunHalo.position.copy(sunDisc.position);
scene.add(sunHalo);

const mats = {};
function mat(color, roughness = .75, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
mats.grass = mat('#6f9a63');
mats.darkGrass = mat('#456b4a');
mats.track = mat('#4d5153', .9);
mats.trackEdge = mat('#d8d8b9', .7);
mats.rock = mat('#777f82', .92);
mats.stone = mat('#b7b8a9', .86);
mats.lily = mat('#58845a', .42);
mats.lilyLight = mat('#83a765', .55);
mats.white = mat('#f0eee1', .45);
mats.red = mat('#d24b35', .36, .16);
mats.orange = mat('#e6a14e', .38, .12);
mats.black = mat('#202629', .35, .22);
mats.frog = mat('#80b85b', .56);
mats.frogDark = mat('#315b39', .58);
mats.koiWhite = mat('#f0eee2', .34);
mats.koiOrange = mat('#e76b3f', .42);
mats.koiBlack = mat('#242a2b', .45);
mats.bark = mat('#765341');
mats.leaf = mat('#356847');
mats.leaf2 = mat('#4f8050');


function pixelMountain(x,z,w,h,colors){
 const g=new THREE.Group();
 for(let i=0;i<7;i++){const f=1-i/7;const m=new THREE.Mesh(new THREE.BoxGeometry(w*f,h/7+.12,3.5),mat(colors[i%colors.length]));m.position.y=-h*.35+i*h/7;g.add(m);}
 g.position.set(x,0,z);scene.add(g);
 if(h>15)for(let k=0;k<4;k++){const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.12,1.2,3.6),mat('#f0dfd7'));cap.position.set(x-w*.13+k*w*.09,h*.43,z);scene.add(cap);}
}
for(let i=0;i<14;i++){const x=-38+i*5.8;pixelMountain(x,-48-(i%3)*3,13+(i%4)*2,17+(i%5)*3,['#728c7c','#91a88b','#c2bca0']);pixelMountain(x+2,-40-(i%4)*2,9+(i%3)*2,10+(i%4)*2,['#6d8e7a','#9bb393','#c7c3a6']);}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), mats.grass);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -.58;
scene.add(ground);

// Meadow rocks and a tiny legendary sword landmark, built from crisp low-poly blocks.
function makeMeadowRock(x,z,scale=1,seed=0){
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),mat(seed%2?'#8b9490':'#707b7a',.96));
  base.scale.set(1.15*scale,.72*scale,.92*scale);base.position.y=.03*scale;g.add(base);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(.9*scale,.18*scale,.8*scale),mat('#b7b9a8',.94));
  cap.position.set(-.08*scale,.48*scale,-.04*scale);cap.rotation.y=.18;g.add(cap);
  const shade=new THREE.Mesh(new THREE.BoxGeometry(.55*scale,.12*scale,.82*scale),mat('#596967',1));
  shade.position.set(.23*scale,.28*scale,.08*scale);shade.rotation.z=-.18;g.add(shade);
  g.position.set(x,-.46,z);g.rotation.y=seed*.73;scene.add(g);return g;
}
[
 [-10,-10,1.6,1],[-8.5,-12,.9,2],[10,-13,1.35,3],[12,-11,.8,4],
 [-12,-3,.95,5],[11,3,1.25,6],[-7,8,.72,7],[8,8,.85,8],
 [-18,-25,2.2,9],[18,-29,2.4,10],[-23,-35,1.8,11],[24,-37,2,12]
].forEach(v=>makeMeadowRock(...v));
const relic=new THREE.Group();
const relicStone=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),mat('#697674',.96));
relicStone.scale.set(1.18,.88,1.05);relicStone.position.y=.14;relic.add(relicStone);
const swordBlade=new THREE.Mesh(new THREE.BoxGeometry(.16,1.75,.12),mat('#d7e7df',.28,.45));
swordBlade.position.set(0,1.25,0);swordBlade.rotation.z=-.12;relic.add(swordBlade);
const swordEdge=new THREE.Mesh(new THREE.BoxGeometry(.045,1.45,.035),new THREE.MeshBasicMaterial({color:0xf4fff0}));
swordEdge.position.set(-.055,1.28,.07);swordEdge.rotation.z=-.12;relic.add(swordEdge);
const guard=new THREE.Mesh(new THREE.BoxGeometry(.72,.13,.19),mat('#d5a65f',.42,.35));
guard.position.set(0,.52,0);guard.rotation.z=-.12;relic.add(guard);
const grip=new THREE.Mesh(new THREE.BoxGeometry(.19,.52,.2),mat('#75503c',.8));
grip.position.set(0,.2,0);grip.rotation.z=-.12;relic.add(grip);
const pommel=new THREE.Mesh(new THREE.BoxGeometry(.28,.2,.24),mat('#e4c27a',.4,.3));
pommel.position.set(0,-.07,0);relic.add(pommel);
relic.position.set(5.4,-.2,-10.2);relic.rotation.y=-.22;scene.add(relic);
// Soft, stylised godrays: translucent tapered beams pointing from the sun into the meadow.
const rayGroup=new THREE.Group();scene.add(rayGroup);
for(let i=0;i<5;i++){
 const ray=new THREE.Mesh(new THREE.ConeGeometry(.65+i*.14,17+i*1.8,4,1,true),
  new THREE.MeshBasicMaterial({color:i%2?0xffefc2:0xfff6d9,transparent:true,opacity:.055,depthWrite:false,side:THREE.DoubleSide}));
 ray.position.set(-7+i*4,10,-14-i*2.1);ray.rotation.z=.22+i*.045;ray.rotation.x=.15;
 rayGroup.add(ray);
}
// Chunky stepped hills and voxel-like pine trees keep the entire landscape in one pixel-art language.
for (let i = 0; i < 12; i++) {
  const side = i % 2 ? 1 : -1;
  const x = side * (15 + (i % 4) * 5);
  const z = -22 - i * 3.7;
  for (let layer = 0; layer < 4; layer++) {
    const hill = new THREE.Mesh(
      new THREE.BoxGeometry(9 + (i % 4) * 2 - layer * 1.45, 1.15, 7 + (i % 3) * 2 - layer),
      mat(layer % 2 ? '#68876b' : '#55785d')
    );
    hill.position.set(x, -.15 + layer * .72, z);
    scene.add(hill);
  }
}
function makePixelPine(x, z, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(.42*scale, 1.6*scale, .42*scale), mat('#a96b58'));
  trunk.position.y = .8*scale; tree.add(trunk);
  for (let layer=0; layer<4; layer++) {
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry((2.7-layer*.42)*scale, 1.25*scale, (2.2-layer*.32)*scale),
      mat(layer%2 ? '#356171' : '#264957')
    );
    crown.position.set(0, (1.45+layer*.88)*scale, 0);
    tree.add(crown);
  }
  tree.position.set(x, -.45, z);
  tree.rotation.y = (Math.round(x*3+z)%4)*.12;
  scene.add(tree);
  return tree;
}
const swayingTrees=[];
for (let i=0;i<42;i++) {
  const side = i%2 ? 1 : -1;
  const tree=makePixelPine(side*(11+(i%5)*2.2), -7-(i%21)*2.45, .58+(i%4)*.12);
  swayingTrees.push({tree,phase:i*.73,amount:.008+(i%4)*.003});
}
// A blocky moon and a field of crisp, square stars, dimmed during daytime.
const nightSky=new THREE.Group();scene.add(nightSky);
const moon=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.65,.22),new THREE.MeshBasicMaterial({color:0xf1e6c4,transparent:true,opacity:.92}));
moon.position.set(13,18,-29);nightSky.add(moon);
const moonCut=new THREE.Mesh(new THREE.BoxGeometry(1.25,1.25,.25),new THREE.MeshBasicMaterial({color:0x33485b}));
moonCut.position.set(13.55,18.3,-28.82);nightSky.add(moonCut);
const starGeo=new THREE.BufferGeometry(), starPos=[];
for(let i=0;i<110;i++){starPos.push((Math.random()-.5)*64,8+Math.random()*22,-25-Math.random()*35);}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPos,3));
const starMat=new THREE.PointsMaterial({color:0xf5edce,size:.16,sizeAttenuation:false,transparent:true,opacity:0});
const stars=new THREE.Points(starGeo,starMat);nightSky.add(stars);


const bridge = new THREE.Group(); scene.add(bridge);
for(let i=0;i<10;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,3.8),mat(i%2?'#c67868':'#a95e57'));plank.position.set(-2+i*.43,.16,-1);bridge.add(plank);}
for(const x of [-2.15,2.15]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,4.1),mat('#df9279'));rail.position.set(x,.85,-1);bridge.add(rail);for(let z=-2.8;z<.9;z+=.9){const post=new THREE.Mesh(new THREE.BoxGeometry(.18,.95,.18),mat('#df9279'));post.position.set(x,.48,z);bridge.add(post);}}
const track = new THREE.Group();
track.position.set(0, -.32, -19);
scene.add(track);
const trackShape = new THREE.Shape();
trackShape.absellipse(0, 0, 22.2, 12.1, 0, Math.PI * 2, false, 0);
const trackHole = new THREE.Path();
trackHole.absellipse(0, 0, 18.0, 8.7, 0, Math.PI * 2, true, 0);
trackShape.holes.push(trackHole);
const trackMesh = new THREE.Mesh(new THREE.ShapeGeometry(trackShape, 80), mats.track);
trackMesh.rotation.x = -Math.PI / 2;
track.add(trackMesh);
const innerGrass = new THREE.Mesh(new THREE.CircleGeometry(1, 48), mats.darkGrass);
innerGrass.scale.set(17.9, 8.6, 1);
innerGrass.rotation.x = -Math.PI / 2;
innerGrass.position.y = .015;
track.add(innerGrass);
function makeLine(rx, rz, color, tube = .075) {
  const pts = [];
  for (let i = 0; i <= 150; i++) {
    const a = i / 150 * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * rx, .035, Math.sin(a) * rz));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 180, tube, 6, true), mat(color, .8));
  track.add(mesh);
}
makeLine(22.05, 11.95, '#d8d4bd', .09);
makeLine(18.05, 8.75, '#d8d4bd', .075);
for (let i = 0; i < 55; i++) {
  const a = i / 55 * Math.PI * 2;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.3, .025, .13), mat(i % 2 ? '#f5f2dc' : '#353b39'));
  stripe.position.set(Math.cos(a) * 22.1, .055, Math.sin(a) * 12.0);
  stripe.rotation.y = -a;
  track.add(stripe);
}
for (let i = 0; i < 28; i++) {
  const a = i / 28 * Math.PI * 2;
  const tree = makeTree();
  tree.position.set(Math.cos(a) * (27 + (i % 3) * 1.8), -.25, -19 + Math.sin(a) * (15 + (i % 2) * 2));
  tree.scale.setScalar(.8 + (i % 4) * .13);
  scene.add(tree);
}
function makeTree() {
  // Rebuilt as a layered voxel cedar so every tree matches the low-poly world.
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(.34, 1.35, .34), mats.bark);
  trunk.position.y = .58; g.add(trunk);
  for (let j = 0; j < 4; j++) {
    const width = 1.75 - j * .31;
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(width, .78, 1.25 - j * .18),
      j % 2 ? mats.leaf : mats.leaf2
    );
    crown.position.set((j % 2 ? .06 : -.04), .9 + j * .48, j % 2 ? .04 : -.03);
    g.add(crown);
  }
  const highlight = new THREE.Mesh(new THREE.BoxGeometry(.12,.48,.12),mat('#4d7d78'));
  highlight.position.set(-.47,1.9,-.16);g.add(highlight);
  return g;
}

// Small, stylised sports cars circulating the track during the opening.
const racers = [];
function makeCar(color, scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.48, .28, 2.72), mat(color, .24, .28));
  body.position.y = .39; g.add(body);
  const lowerNose = new THREE.Mesh(new THREE.BoxGeometry(1.22,.17,.92),mat(color,.22,.25));
  lowerNose.position.set(0,.32,-1.12);g.add(lowerNose);
  const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.34,.2,.72),mat(color,.24,.3));
  rearDeck.position.set(0,.43,.91);g.add(rearDeck);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.38, .22, .75), mat(color, .25, .28));
  nose.position.set(0, .35, -1.05); g.add(nose);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(.94, .38, 1.12), mat('#18282b', .19, .28));
  cabin.position.set(0, .69, .02); g.add(cabin);
  const windscreen = new THREE.Mesh(new THREE.BoxGeometry(.86,.26,.075),mat('#9bd7dc',.14,.2));
  windscreen.position.set(0,.76,-.48);windscreen.rotation.x=-.24;g.add(windscreen);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(.82,.22,.065),mat('#6caeb7',.18,.24));
  rearGlass.position.set(0,.75,.48);rearGlass.rotation.x=.22;g.add(rearGlass);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(.84, .08, .8), mat(color, .26, .2));
  roof.position.set(0, .96, .08); g.add(roof);
  // Extra silhouette details: front splitter, rear wing, side skirts and pixel windshield.
  const glass = new THREE.Mesh(new THREE.BoxGeometry(.91,.22,.055),mat('#8ac9cf',.18,.22));
  glass.position.set(0,.77,-.49);glass.rotation.x=-.18;g.add(glass);
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.62,.08,.28),mat('#202629',.42,.22));
  splitter.position.set(0,.25,-1.42);g.add(splitter);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(.12,.13,1.65),mat('#202629',.5,.15));
  for(const x of [-.79,.79]){const part=skirt.clone();part.position.set(x,.28,.12);g.add(part);}
  const wingBar = new THREE.Mesh(new THREE.BoxGeometry(1.18,.08,.16),mat('#202629',.4,.25));
  wingBar.position.set(0,.79,1.34);g.add(wingBar);
  for(const x of [-.46,.46]){
    const support=new THREE.Mesh(new THREE.BoxGeometry(.07,.28,.07),mat('#202629'));
    support.position.set(x,.65,1.28);g.add(support);
  }
  for (const x of [-.79, .79]) for (const z of [-.85, .85]) {
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(.2, .42, .42), mat('#242a35', .8));
    wheel.position.set(x, .25, z); g.add(wheel);
    const hub = new THREE.Mesh(new THREE.BoxGeometry(.215, .12, .12), mat('#d5c4a6', .7));
    hub.position.set(x + (x < 0 ? -.015 : .015), .25, z); g.add(hub);
  }
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffe9c0 });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff4e68 });
  for (const x of [-.48, .48]) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(.25, .07, .05), lightMat);
    light.position.set(x, .43, -1.49); g.add(light);
    const tailLight = new THREE.Mesh(new THREE.BoxGeometry(.23,.075,.05),tailMat);
    tailLight.position.set(x,.43,1.47);g.add(tailLight);
  }
  const underglow = new THREE.Mesh(new THREE.BoxGeometry(1.1,.025,1.8),new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:.32}));
  underglow.position.y=.18;g.add(underglow);
  g.scale.setScalar(scale);
  return g;
}
// Pixel racing polish: blocky track markers, roadside signs, and animated exhaust pixels.
const raceDecor = new THREE.Group();
scene.add(raceDecor);
const trackDashMat = new THREE.MeshBasicMaterial({color:0xf3d9a0});
const trackGlowMat = new THREE.MeshBasicMaterial({color:0x6de8e2});
for(let i=0;i<48;i++){
  const a=i/48*Math.PI*2;
  const dash=new THREE.Mesh(new THREE.BoxGeometry(.16,.035,.55),trackDashMat);
  dash.position.set(Math.cos(a)*10.15,.025,-19+Math.sin(a)*4.15);
  dash.rotation.y=-a; raceDecor.add(dash);
}
for(let i=0;i<10;i++){
  const side=i%2===0?-1:1, z=-31+i*2.65;
  const post=new THREE.Mesh(new THREE.BoxGeometry(.16,1.05,.16),mat('#73506f'));
  post.position.set(side*(11.6+(i%3)*.35),.1,z);raceDecor.add(post);
  const board=new THREE.Mesh(new THREE.BoxGeometry(.95,.42,.12),new THREE.MeshStandardMaterial({color:i%2?0x3e7778:0xb75d80,emissive:i%2?0x174a4c:0x4d1d36,emissiveIntensity:.65}));
  board.position.set(post.position.x,.72,z);raceDecor.add(board);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.58,.055,.14),trackGlowMat);
  stripe.position.set(post.position.x,.74,z-.015);raceDecor.add(stripe);
}
const exhaustPixels=[];
for(let i=0;i<4;i++){
  const g=new THREE.Group();
  const puffs=[];
  for(let j=0;j<7;j++){
    const puff=new THREE.Mesh(new THREE.BoxGeometry(.12+j*.025,.1+j*.018,.12+j*.025),new THREE.MeshBasicMaterial({color:j%2?0x8da9b1:0xe1b8a5,transparent:true,opacity:.55}));
    g.add(puff);puffs.push(puff);
  }
  scene.add(g);exhaustPixels.push({group:g,puffs,phase:i*1.7});
}

let driveMode=false, freeCameraMode=false, followedFrog=null;
const driveKeys=new Set();
let freeYaw=0,freePitch=0;
const carColors = ['#e8e5d9', '#d94c35', '#d7a64f', '#263f49'];
for (let i = 0; i < 4; i++) {
  const car = makeCar(carColors[i], i === 3 ? .86 : .95);
  scene.add(car);
  // Larger oval is beyond the opening camera's framing.
  racers.push({ mesh: car, phase: i * Math.PI * .5, speed: .22 + i * .022, radiusX: 19.5, radiusZ: 10.5 });
}

// Pond bed and shoreline.
const pondGroup = new THREE.Group();
scene.add(pondGroup);
const pondRadiusX = 8.1, pondRadiusZ = 5.35;
const fishBoundsX = pondRadiusX - 1.25, fishBoundsZ = pondRadiusZ - 1.15;
function clampFishToPond(x,z){
  const nx=x/fishBoundsX,nz=z/fishBoundsZ,rr=nx*nx+nz*nz;
  if(rr>.78){const scale=Math.sqrt(.78/rr);return {x:x*scale,z:z*scale};}
  return {x,z};
}
const bed = new THREE.Mesh(new THREE.CircleGeometry(1, 96), mat('#b1a88c', .95));
bed.rotation.x = -Math.PI / 2; bed.scale.set(pondRadiusX, pondRadiusZ, 1); bed.position.y = -.44; pondGroup.add(bed);
const rim = new THREE.Mesh(new THREE.TorusGeometry(1, .22, 12, 96), mat('#7d8a70'));
rim.rotation.x = Math.PI / 2; rim.scale.set(pondRadiusX + .08, pondRadiusZ + .08, 1); rim.position.y = -.06; pondGroup.add(rim);
const waterUniforms = {
  uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(-5, -5) }, uRipple: { value: 0 },
  uRain: { value: 0 }, uDay: { value: 1 }, uSunDir: { value: new THREE.Vector3(-.5, 1, .35).normalize() }
};
const waterMaterial = new THREE.ShaderMaterial({
  uniforms: waterUniforms, transparent: false,
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime; uniform vec2 uPointer; uniform float uRipple;
    void main(){
      vUv=uv;
      vec3 p=position;
      float d=distance(uv,uPointer);
      // Stepped vertex displacement: small flat facets read like pixel-art water.
      float ring=sin(floor(d*34.0)*2.0-uTime*5.0)*exp(-d*7.0)*uRipple;
      p.z += ring*0.035;
      p.z += floor(sin(p.x*2.0+uTime*.6)*3.0)*.004 + floor(cos(p.y*2.0-uTime*.5)*3.0)*.004;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }`,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime; uniform vec2 uPointer; uniform float uRipple; uniform float uRain; uniform float uDay; uniform vec3 uSunDir;
    float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    void main(){
      vec2 uv=vUv;
      vec2 cell=floor(uv*vec2(112.0,72.0));
      vec2 p=(cell+.5)/vec2(112.0,72.0);
      float time=floor(uTime*5.0)*.2;
      float lane=floor(p.y*42.0);
      float seed=hash21(vec2(lane,7.0));
      float flow=p.x*15.0+time*(.22+seed*.25)+lane*1.73;
      float seg=floor(flow);
      float segSeed=hash21(vec2(seg,lane));
      float along=fract(flow);
      float wave=(1.0-smoothstep(.62,.94,along))*smoothstep(.02,.16,along)*step(.24,segSeed)*step(.27,hash21(vec2(lane,19.0)));
      float sparkle=step(.94,hash21(floor(p*vec2(37.0,29.0))+floor(time*1.5)));
      float d=distance(p,uPointer);
      float rings=(1.0-smoothstep(.04,.15,abs(fract(d*25.0-time*.55)-.5)))*exp(-d*5.0)*uRipple;
      float rainRing=(1.0-smoothstep(.04,.18,abs(fract(d*47.0-time*1.8)-.5)))*step(.965,hash21(floor(p*vec2(61.0,43.0))))*uRain;
      vec3 deep=vec3(.035,.19,.19), mid=vec3(.075,.34,.31), shallow=vec3(.22,.47,.39), light=vec3(.60,.72,.52);
      float band=floor(clamp(p.y+.08*sin(p.x*5.0+time*.15),0.0,1.0)*4.0)/3.0;
      vec3 col=mix(deep,mid,smoothstep(0.0,.52,band));
      col=mix(col,shallow,smoothstep(.42,.88,band));
      col=mix(col,mid,wave*.45);
      col=mix(col,light,clamp(wave*.48+sparkle*.28+rings*.75+rainRing*.65,0.0,.82));
      float skyGlint=step(.987,hash21(cell+vec2(3.0,11.0)));
      col=mix(col,vec3(.78,.83,.66),skyGlint*(.10+.18*uDay));
      float edge=min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y));
      col=mix(vec3(.075,.16,.14),col,smoothstep(0.0,.045,edge));
      gl_FragColor=vec4(col,1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
});
const water = new THREE.Mesh(new THREE.PlaneGeometry(pondRadiusX * 2, pondRadiusZ * 2, 1, 1), waterMaterial);
water.rotation.x = -Math.PI / 2; water.position.y = -.015; pondGroup.add(water);

// Pebbles and submerged stones.
for (let i = 0; i < 68; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = .25 + Math.random() * .94;
  const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(.12 + Math.random() * .2, 0), mat(['#b5b9a2','#657d70','#d2c8a9'][i % 3]));
  stone.position.set(Math.cos(a) * pondRadiusX * r, -.16 - Math.random() * .16, Math.sin(a) * pondRadiusZ * r);
  stone.scale.y = .45; pondGroup.add(stone);
}

// Lily pads use chunky polygon edges and tiny square pixels instead of smooth discs.
const pads = [];
function createLilyPad(index, x, z) {
  const g = new THREE.Group();
  const points = [
    [-.82,-.08],[-.72,-.42],[-.43,-.69],[-.12,-.78],[.2,-.72],
    [.48,-.54],[.7,-.26],[.82,.02],[.69,.34],[.45,.58],[.12,.76],
    [-.22,.72],[-.52,.53],[-.75,.25],[-.82,-.08]
  ];
  // The V-shaped gap gives each pad a recognizable pixel-art notch.
  const shape = new THREE.Shape();
  points.forEach(([px,pz],i)=>i===0?shape.moveTo(px,pz):shape.lineTo(px,pz));
  shape.lineTo(-.34,-.02); shape.lineTo(-.12,-.12); shape.lineTo(-.82,-.08);
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), index % 2 ? mats.lilyLight : mats.lily);
  mesh.rotation.x = -Math.PI/2; mesh.position.y=.055; g.add(mesh);
  // Raised edge pixels and a blocky central vein.
  const edgeMat = mat('#355f43');
  [[-.48,-.52],[.02,-.68],[.48,-.43],[.65,.12],[.28,.55],[-.35,.48],[-.65,.18]].forEach(([px,pz],i)=>{
    const pixel = new THREE.Mesh(new THREE.BoxGeometry(.16,.035,.12), i%2?mats.lilyLight:edgeMat);
    pixel.position.set(px,.067,pz); g.add(pixel);
  });
  const vein = new THREE.Mesh(new THREE.BoxGeometry(.42,.018,.045), mat('#b0c878'));
  vein.position.set(.12,.071,.04); vein.rotation.y=-.22; g.add(vein);
  const veinBranch = new THREE.Mesh(new THREE.BoxGeometry(.2,.018,.035), mat('#a1bf77'));
  veinBranch.position.set(-.04,.072,-.12); veinBranch.rotation.y=.5; g.add(veinBranch);
  g.position.set(x,0,z); pondGroup.add(g);
  const pad = {group:g,x,z,phase:Math.random()*6,index};
  pads.push(pad);
  return pad;
}
createLilyPad(0, -4.2, -1.9);
createLilyPad(1, 3.8, -2.25);
createLilyPad(2, -3.2, 2.55);
createLilyPad(3, 3.6, 2.25);
createLilyPad(4, .1, -.4);
createLilyPad(5, 1.2, 3.5);
createLilyPad(6, -5.8, .7);

// Water plants near the edges.
for (let i = 0; i < 17; i++) {
  const a = i / 17 * Math.PI * 2;
  const reed = new THREE.Group();
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.8,5), mat('#567e4b'));
  stalk.position.y = .35; reed.add(stalk);
  const tip = new THREE.Mesh(new THREE.CapsuleGeometry(.07,.23,3,6), mat('#745a3e'));
  tip.position.y = .83; reed.add(tip);
  reed.position.set(Math.cos(a) * (pondRadiusX + .5), -.12, Math.sin(a) * (pondRadiusZ + .4));
  scene.add(reed);
}

// Koi fish built from tapered bodies, tails and small fins.
const koi = [];
function makeKoi(index, x, z) {
  const g = new THREE.Group();
  const white = index % 3 === 0 ? mats.koiBlack : mats.koiWhite;
  const patchMat = index % 2 ? mats.koiOrange : mats.koiBlack;
  // Rectangular voxel body, separate colour patches, and a hinged pixel tail.
  // A gently tapered, faceted voxel body reads as a fish rather than a plain box.
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0), white);
  body.scale.set(.43,.25,1.0); body.position.y=.035; g.add(body);
  // Raised orange/black markings follow the curved back in separate pixel-like patches.
  const patch = new THREE.Mesh(new THREE.BoxGeometry(.29,.09,.28), patchMat);
  patch.position.set(0,.205,-.12); g.add(patch);
  const patchRear = new THREE.Mesh(new THREE.BoxGeometry(.22,.075,.17), patchMat);
  patchRear.position.set(0,.16,.22); g.add(patchRear);
  const tailJoint = new THREE.Group();
  tailJoint.position.set(0,.02,.43);g.add(tailJoint);
  const tailUpper = new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.24), patchMat);
  tailUpper.position.set(0,.08,.17);tailUpper.rotation.x=-.18;tailJoint.add(tailUpper);
  const tailLower = new THREE.Mesh(new THREE.BoxGeometry(.28,.07,.24), patchMat);
  tailLower.position.set(0,-.07,.17);tailLower.rotation.x=.18;tailJoint.add(tailLower);
  const dorsal = new THREE.Mesh(new THREE.BoxGeometry(.12,.11,.3),patchMat);
  dorsal.position.set(0,.22,.015);g.add(dorsal);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(.23,.13,.16), white);
  snout.position.set(0,.015,-.39);g.add(snout);
  for (const side of [-1,1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.18,.055,.28), index%2?mats.koiWhite:mats.koiOrange);
    fin.position.set(side*.24,-.04,.08); fin.rotation.y=side*.22; g.add(fin);
  }
  const eyeMat = new THREE.MeshBasicMaterial({color:0x101817});
  for (const side of [-1,1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.055),eyeMat);
    eye.position.set(side*.145,.105,-.36); g.add(eye);
  }
  const safe=clampFishToPond(x,z);
  g.position.set(safe.x,-.035,safe.z); pondGroup.add(g);
  koi.push({group:g,tail:tailJoint,home:new THREE.Vector3(safe.x,0,safe.z),target:new THREE.Vector3(safe.x,0,safe.z),phase:Math.random()*6,speed:.6+Math.random()*.3,scare:0,index});
}
makeKoi(0,-1.5,-1.1); makeKoi(1,1.4,-.9); makeKoi(2,.2,1.8); makeKoi(3,-4.8,.8); makeKoi(4,4.8,.6); makeKoi(5,-.8,3.7); makeKoi(6,2.5,-3.7);

// Frogs sit on pads, blink occasionally, and leap to the nearest available pad.
const frogs = [];
function makeFrog() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.38,.2,.4),mats.frog);
  body.position.y=.19; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.38,.25,.34),mats.frog);
  head.position.set(0,.34,-.12); g.add(head);
  // Small cheek blocks and brighter eye caps make the frog readable at portfolio scale.
  for(const side of [-1,1]){
    const cheek=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.09),mat('#9ad66a'));
    cheek.position.set(side*.2,.3,-.2);g.add(cheek);
  }
  const eyes=[];
  for (const s of [-1,1]) {
    const eyeStem = new THREE.Mesh(new THREE.BoxGeometry(.11,.13,.11),mats.frog);
    eyeStem.position.set(s*.12,.49,-.19); g.add(eyeStem);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.04),mat('#18291d'));
    eye.position.set(s*.12,.51,-.25); g.add(eye); eyes.push(eye);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.2),mats.frogDark);
    leg.position.set(s*.19,.1,.1); g.add(leg);
  }
  scene.add(g);
  return {group:g,eyes,padIndex:Math.floor(Math.random()*pads.length),jump:null,blinkAt:1+Math.random()*4,blinking:0,phase:Math.random()*6,lastPointerHop:-10};
}
frogs.push(makeFrog(),makeFrog(),makeFrog());
function frogOnPad(frog,index) {
  const p=pads[index]; frog.padIndex=index;
  frog.group.position.set(p.x,.04,p.z);
}
frogs.forEach((f,i)=>frogOnPad(f,[0,2,5][i]));
function nearestPad(fromIndex, exclude = new Set()) {
  const from = pads[fromIndex];
  let best=-1,bestD=Infinity;
  pads.forEach((p,i)=>{ if(i===fromIndex||exclude.has(i)) return; const d=(p.x-from.x)**2+(p.z-from.z)**2; if(d<bestD){bestD=d;best=i;} });
  return best;
}
function jumpFrog(frog, destination) {
  if(frog.jump) return;
  const from=frog.group.position.clone();
  const p=pads[destination];
  frog.jump={from,to:new THREE.Vector3(p.x,.04,p.z),t:0,duration:reduceMotion?0.15:.68,destination};
  showToast('THE FROG IS LEADING YOU…');
}
let activeSection = null;

// Shoreline trees around the pond and a distant circuit-side rail.
for (let i = 0; i < 19; i++) {
  const a = i / 19 * Math.PI * 2;
  const tree = makeTree();
  tree.scale.setScalar(.5 + (i % 4) * .12);
  tree.position.set(Math.cos(a) * (pondRadiusX + 4.1), -.25, Math.sin(a) * (pondRadiusZ + 3.5));
  scene.add(tree);
}
const rail = new THREE.Group(); scene.add(rail);
for(let i=0;i<20;i++){
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.65,6),mat('#d6d0b8'));
  post.position.set(-13+i*1.35,-.08,-11.5); rail.add(post);
}
const railBar=new THREE.Mesh(new THREE.BoxGeometry(27,.08,.08),mat('#d6d0b8'));railBar.position.set(0,.18,-11.5);rail.add(railBar);

// Rain is a light particle field that can be turned on without reloading the world.
const rainCount=850;
const rainPositions=new Float32Array(rainCount*3);
for(let i=0;i<rainCount;i++){rainPositions[i*3]=(Math.random()-.5)*45;rainPositions[i*3+1]=Math.random()*22;rainPositions[i*3+2]=(Math.random()-.5)*45;}
const rainGeometry=new THREE.BufferGeometry();
rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
const rainMaterial=new THREE.PointsMaterial({color:0xc8e2e4,size:.045,transparent:true,opacity:0,depthWrite:false});
const rain=new THREE.Points(rainGeometry,rainMaterial);rain.visible=false;scene.add(rain);

// Atmospheric motes / fireflies at night.
const motePositions=new Float32Array(95*3);
for(let i=0;i<95;i++){motePositions[i*3]=(Math.random()-.5)*32;motePositions[i*3+1]=Math.random()*5;motePositions[i*3+2]=(Math.random()-.5)*28;}
const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.BufferAttribute(motePositions,3));
const moteMat=new THREE.PointsMaterial({color:0xd7f6a5,size:.075,transparent:true,opacity:0,blending:THREE.AdditiveBlending});
const motes=new THREE.Points(moteGeo,moteMat);scene.add(motes);
const fireflies=[];
for(let i=0;i<22;i++){
  const glow=new THREE.Mesh(new THREE.BoxGeometry(.075,.075,.075),new THREE.MeshBasicMaterial({color:i%3===0?0xffe6a1:0xc9f3a1,transparent:true,opacity:.75}));
  glow.position.set((Math.random()-.5)*18,.45+Math.random()*2.5,(Math.random()-.5)*13);
  scene.add(glow);
  fireflies.push({mesh:glow,phase:Math.random()*Math.PI*2,speed:.5+Math.random()*1.4,baseY:glow.position.y});
}

let entered=false, reduceMotion=reduceMotionQuery.matches, weatherIndex=0, timeIndex=0, soundOn=false;
let scrollProgress = 0;
const scrollTrack = document.querySelector('#scrollTrack');
function readScrollProgress(){
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  scrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
  entered = scrollProgress > .66;
  const introOpacity = 1 - THREE.MathUtils.smoothstep(scrollProgress, .04, .22);
  intro.style.opacity = String(introOpacity);
  intro.style.pointerEvents = scrollProgress < .16 ? 'auto' : 'none';
  if(scrollProgress > .62){
    pondUI.classList.remove('is-hidden');
    pondUI.style.opacity = String(THREE.MathUtils.smoothstep(scrollProgress, .62, .78));
    pondUI.style.pointerEvents = scrollProgress > .72 ? 'auto' : 'none';
    statusText.textContent = 'POND IN VIEW';
  } else {
    pondUI.classList.add('is-hidden');
    pondUI.style.opacity = '0';
    pondUI.style.pointerEvents = 'none';
    statusText.textContent = scrollProgress > .18 ? 'RACE IN PROGRESS' : 'LOOK UP';
  }
}
window.addEventListener('scroll', readScrollProgress, { passive: true });
readScrollProgress();
const weatherModes=[{name:'CLEAR SKIES',rain:0,fog:.012},{name:'MISTY',rain:0,fog:.032},{name:'LIGHT RAIN',rain:.5,fog:.018},{name:'RAIN SHOWER',rain:1,fog:.025}];
const timeModes=[{name:'DAYLIGHT',day:1,sky:'#8eacb1',fog:'#a6c2bd',sun:'#ffe8bd'},{name:'GOLDEN HOUR',day:.82,sky:'#d4a17a',fog:'#d5b69a',sun:'#ffbd78'},{name:'BLUE HOUR',day:.38,sky:'#334d66',fog:'#536c78',sun:'#a5c9dc'},{name:'NIGHT',day:.13,sky:'#101e32',fog:'#263b4a',sun:'#91a9d9'}];
function applyEnvironment(){
  const w=weatherModes[weatherIndex], t=timeModes[timeIndex];
  waterUniforms.uRain.value=w.rain; waterUniforms.uDay.value=t.day;
  // Keep the fog and sky matched so distant geometry fades seamlessly into mist.
  const mistColor = scrollProgress > .62 ? '#c8d8cf' : t.fog;
  scene.background.set(scrollProgress > .62 ? mistColor : t.sky);
  scene.fog.color.set(scrollProgress > .62 ? mistColor : t.fog);
  scene.fog.near = scrollProgress > .62 ? 5.5 : 8;
  scene.fog.far = scrollProgress > .62 ? 17 : 25;
  sun.color.set(t.sun);sun.intensity=3.2*t.day;hemi.intensity=.45+1.65*t.day;fill.intensity=.25+1.0*t.day;
  rain.visible=w.rain>0;rainMaterial.opacity=.1+w.rain*.55;
  motes.material.opacity=timeIndex===3?.72:timeIndex===2?.18:0;
  stars.material.opacity=[0,.08,.55,.95][timeIndex];
  moon.visible=timeIndex>=2;moonCut.visible=timeIndex>=2;
  weatherLabel.textContent=w.name;clockLabel.textContent=t.name;
  showToast(t.name+' · '+w.name);
}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),1900);}

// Procedural engine ambience. Sound only starts after a visitor explicitly enables it.
let audioCtx=null, masterGain=null, engineNodes=[];
function startAudio(){
  if(audioCtx) return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  audioCtx=new AC();masterGain=audioCtx.createGain();masterGain.gain.value=0;masterGain.connect(audioCtx.destination);
  const low=audioCtx.createOscillator();low.type='sawtooth';
  const lowFilter=audioCtx.createBiquadFilter();lowFilter.type='lowpass';lowFilter.frequency.value=145;
  const lowGain=audioCtx.createGain();lowGain.gain.value=.22;
  low.connect(lowFilter);lowFilter.connect(lowGain);lowGain.connect(masterGain);low.start();
  const high=audioCtx.createOscillator();high.type='triangle';
  const highFilter=audioCtx.createBiquadFilter();highFilter.type='lowpass';highFilter.frequency.value=430;
  const highGain=audioCtx.createGain();highGain.gain.value=.07;
  high.connect(highFilter);highFilter.connect(highGain);highGain.connect(masterGain);high.start();
  engineNodes=[{osc:low,filter:lowFilter,gain:lowGain},{osc:high,filter:highFilter,gain:highGain}];
  schedulePass();
}
function schedulePass(){
  if(!audioCtx||!soundOn)return;
  const delay=5+Math.random()*8;
  setTimeout(()=>{
    if(!audioCtx||!soundOn)return;
    const now=audioCtx.currentTime;
    engineNodes.forEach((n,i)=>{
      const base=i?90:44;
      n.osc.frequency.cancelScheduledValues(now);n.osc.frequency.setValueAtTime(base,now);
      n.osc.frequency.exponentialRampToValueAtTime(base*(2.2+Math.random()*1.4),now+1.4);
      n.osc.frequency.exponentialRampToValueAtTime(base,now+4.5);
      n.filter.frequency.cancelScheduledValues(now);n.filter.frequency.setValueAtTime(i?280:100,now);
      n.filter.frequency.linearRampToValueAtTime(i?1000:360,now+1.3);
      n.filter.frequency.linearRampToValueAtTime(i?280:100,now+4.5);
    });
    // A short, restrained camera tremor when the imagined cars blast past.
    if(entered&&!reduceMotion)screenShakeUntil=performance.now()+440;
    schedulePass();
  },delay*1000);
}
function setSound(on){
  soundOn=on;
  if(on){startAudio();audioCtx?.resume();masterGain?.gain.setTargetAtTime(.42,audioCtx.currentTime,.18);soundLabel.textContent='SOUND ON';soundToggle.classList.add('sound-active');soundNote.classList.add('is-hidden');}
  else {if(audioCtx&&masterGain)masterGain.gain.setTargetAtTime(0,audioCtx.currentTime,.15);soundLabel.textContent='SOUND OFF';soundToggle.classList.remove('sound-active');}
}
soundToggle.addEventListener('click',()=>setSound(!soundOn));
document.addEventListener('pointerdown',()=>{if(!soundOn)soundNote.classList.add('is-hidden')},{once:true});

let screenShakeUntil=0, cameraMode='intro', transitionStart=0, transitionFrom=null;
function enterPond(){
  window.scrollTo({top: Math.round((document.documentElement.scrollHeight - innerHeight) * .3), behavior: reduceMotion ? 'auto' : 'smooth'});
}
enterButton.addEventListener('click',enterPond);

const raycaster=new THREE.Raycaster(), pointerNdc=new THREE.Vector2();
const pointerWorld=new THREE.Vector2(-20,-20);
let pointerActive=false,lastPointerMove=0;
function updatePointer(event){
  pointerNdc.x=(event.clientX/innerWidth)*2-1;pointerNdc.y=-(event.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointerNdc,camera);
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const hit=new THREE.Vector3();
  if(raycaster.ray.intersectPlane(plane,hit)&&((hit.x*hit.x)/(pondRadiusX*pondRadiusX)+(hit.z*hit.z)/(pondRadiusZ*pondRadiusZ))<.94){
    pointerWorld.set(hit.x/(pondRadiusX*2)+.5,hit.z/(pondRadiusZ*2)+.5);
    waterUniforms.uPointer.value.copy(pointerWorld);waterUniforms.uRipple.value=1;pointerActive=true;lastPointerMove=performance.now();
  } else pointerActive=false;
}
renderer.domElement.addEventListener('pointermove',updatePointer);
renderer.domElement.addEventListener('pointerleave',()=>{pointerActive=false;});
renderer.domElement.addEventListener('pointerdown',event=>{
  // Clicking a frog toggles a close follow view; otherwise clicks make pond ripples.
  pointerNdc.x=(event.clientX/innerWidth)*2-1;pointerNdc.y=-(event.clientY/innerHeight)*2+1;
  raycaster.setFromCamera(pointerNdc,camera);
  const frogHits=raycaster.intersectObjects(frogs.map(f=>f.group),true);
  if(frogHits.length){
    let picked=frogs.find(f=>{let n=frogHits[0].object;while(n&&n!==f.group)n=n.parent;return n===f.group;});
    if(picked){followedFrog=followedFrog===picked?null:picked;showToast(followedFrog?'FROG FOLLOW CAMERA · CLICK AGAIN TO EXIT':'FOLLOW CAMERA OFF');return;}
  }
  updatePointer(event);
  if(pointerActive){waterUniforms.uRipple.value=1.8;spawnSplash(pointerWorld.x*pondRadiusX*2-pondRadiusX,pointerWorld.y*pondRadiusZ*2-pondRadiusZ);}
});
function spawnSplash(x,z){
  // Square-edged ring plus tiny block droplets for a pixel-game splash.
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.012,4,12),new THREE.MeshBasicMaterial({color:0xd5e9c9,transparent:true,opacity:.8}));
  ring.rotation.x=Math.PI/2;ring.position.set(x,.025,z);pondGroup.add(ring);
  const droplets=[];
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4, h=.12+(i%3)*.055;
    const bit=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.07),new THREE.MeshBasicMaterial({color:i%2?0xa8d9bd:0xe1e8bd,transparent:true,opacity:.95}));
    bit.position.set(x+Math.cos(a)*.18,.06,z+Math.sin(a)*.18);pondGroup.add(bit);
    droplets.push({mesh:bit,a,h});
  }
  const start=performance.now();
  function animateRing(){
    const t=(performance.now()-start)/700;
    if(t>=1){pondGroup.remove(ring);ring.geometry.dispose();ring.material.dispose();droplets.forEach(d=>{pondGroup.remove(d.mesh);d.mesh.geometry.dispose();d.mesh.material.dispose();});return;}
    ring.scale.setScalar(1+t*8);ring.material.opacity=.8*(1-t);
    droplets.forEach(d=>{d.mesh.position.x=x+Math.cos(d.a)*(.18+t*.6);d.mesh.position.z=z+Math.sin(d.a)*(.18+t*.6);d.mesh.position.y=.06+Math.sin(t*Math.PI)*d.h;d.mesh.material.opacity=1-t;});
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);
}

const sectionContent={
 about:{title:'About <em>me.</em>',text:'Hey, I’m the person behind this little world. I love building thoughtful digital experiences where technology feels playful, alive, and a little unexpected.',chips:['CURIOUS BY NATURE','CREATIVE CODING','ALWAYS LEARNING']},
 projects:{title:'Things I’ve <em>made.</em>',text:'A home for experiments, tools, and ideas turned into working things. Replace these starter entries with real projects as the portfolio takes shape.',chips:['WEB EXPERIENCES','INTERACTIVE 3D','OPEN SOURCE']},
 skills:{title:'Tools of the <em>trade.</em>',text:'A growing set of tools for turning ideas into polished experiences — from the structure of a website to the details that make it feel alive.',chips:['HTML · CSS · JS','THREE.JS','UI / UX','CREATIVE DEVELOPMENT']},
 contact:{title:'Say <em>hello.</em>',text:'Have an idea, a project, or just want to talk about how this world was made? This is where the conversation starts.',chips:['EMAIL: ADD YOUR EMAIL','GITHUB: LAHARILN16-PIXEL']}
};
function openSection(section){
  activeSection=section;const data=sectionContent[section];if(!data)return;
  document.querySelector('#panelTitle').innerHTML=data.title;
  document.querySelector('#panelText').textContent=data.text;
  document.querySelector('#panelExtra').innerHTML=data.chips.map(x=>'<span class="panel-chip">'+x+'</span>').join('');
  panel.classList.add('is-open');panel.setAttribute('aria-hidden','false');
  const clicked=Number(document.querySelector('[data-section="'+section+'"]').dataset.pad);
  const frog=frogs.find(f=>!f.jump);
  if(frog){const occupied=new Set(frogs.map(f=>f.padIndex));occupied.delete(frog.padIndex);let destination=nearestPad(frog.padIndex,occupied);if(destination<0)destination=nearestPad(frog.padIndex);if(destination>=0)jumpFrog(frog,destination);}
}
document.querySelectorAll('.lily-link').forEach(btn=>btn.addEventListener('click',()=>openSection(btn.dataset.section)));
document.querySelector('#closePanel').addEventListener('click',()=>{panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');activeSection=null;});
document.querySelector('#weatherButton').addEventListener('click',()=>{weatherIndex=(weatherIndex+1)%weatherModes.length;applyEnvironment();});
document.querySelector('#timeButton').addEventListener('click',()=>{timeIndex=(timeIndex+1)%timeModes.length;applyEnvironment();});
document.querySelector('#motionButton').addEventListener('click',event=>{reduceMotion=!reduceMotion;event.currentTarget.setAttribute('aria-pressed',String(reduceMotion));event.currentTarget.innerHTML=reduceMotion?'MOTION REDUCED <span>●</span>':'REDUCE MOTION <span>○</span>';showToast(reduceMotion?'REDUCED MOTION ON':'FULL MOTION ON');});
document.querySelector('#zoomInButton').addEventListener('click',()=>{camera.zoom=Math.min(1.65,camera.zoom+.12);camera.updateProjectionMatrix();showToast('VIEW ZOOMED IN');});
document.querySelector('#zoomOutButton').addEventListener('click',()=>{camera.zoom=Math.max(.72,camera.zoom-.12);camera.updateProjectionMatrix();showToast('VIEW ZOOMED OUT');});
document.querySelector('#resetViewButton').addEventListener('click',()=>{
  camera.zoom=1;camera.updateProjectionMatrix();window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'});
  weatherIndex=0;timeIndex=0;applyEnvironment();followedFrog=null;driveMode=false;freeCameraMode=false;driveKeys.clear();freeYaw=0;freePitch=0;
  racers.forEach((r,i)=>{r.phase=i*Math.PI*.5;r.speed=.32+i*.035;});
  document.querySelector('#driveModeButton').textContent='DRIVE';document.querySelector('#driveModeButton').setAttribute('aria-pressed','false');
  document.querySelector('#freeCameraButton').textContent='FREE CAM';document.querySelector('#freeCameraButton').setAttribute('aria-pressed','false');
  showToast('WORLD VIEW RESET');
});
document.querySelector('#driveModeButton').addEventListener('click',event=>{
  driveMode=!driveMode;freeCameraMode=false;followedFrog=null;
  document.querySelector('#freeCameraButton').setAttribute('aria-pressed','false');
  event.currentTarget.setAttribute('aria-pressed',String(driveMode));
  event.currentTarget.textContent=driveMode?'EXIT DRIVE':'DRIVE';
  document.querySelector('#freeCameraButton').textContent='FREE CAM';
  showToast(driveMode?'DRIVE MODE · WASD / ARROWS':'RACE AUTOPILOT RESTORED');
});
document.querySelector('#freeCameraButton').addEventListener('click',event=>{
  freeCameraMode=!freeCameraMode;driveMode=false;followedFrog=null;freeYaw=0;freePitch=0;
  document.querySelector('#driveModeButton').setAttribute('aria-pressed','false');
  document.querySelector('#driveModeButton').textContent='DRIVE';
  event.currentTarget.setAttribute('aria-pressed',String(freeCameraMode));
  event.currentTarget.textContent=freeCameraMode?'EXIT CAM':'FREE CAM';
  showToast(freeCameraMode?'FREE CAMERA · ARROW KEYS':'SCROLL CAMERA RESTORED');
});



// The camera starts by the racing circuit, then glides to a top-down pond view.
const clock=new THREE.Clock();
let elapsed=0;
let rainSplashTimer=.15;
function smoothstep(t){return t*t*(3-2*t);}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;
  // Blend into pale, dense mist as the camera leaves the track and settles above the pond.
  const pondMist = THREE.MathUtils.smoothstep(scrollProgress,.62,.84);
  const mist = new THREE.Color('#c8d8cf');
  const skyTarget = new THREE.Color(timeModes[timeIndex].sky);
  const fogTarget = new THREE.Color(timeModes[timeIndex].fog);
  scene.background.copy(skyTarget).lerp(mist,pondMist);
  scene.fog.color.copy(fogTarget).lerp(mist,pondMist);
  scene.fog.near = THREE.MathUtils.lerp(18,15,pondMist);
  scene.fog.far = THREE.MathUtils.lerp(42,34,pondMist);
  waterUniforms.uTime.value=elapsed;
  swayingTrees.forEach(({tree,phase,amount})=>{tree.rotation.z=Math.sin(elapsed*.7+phase)*amount;tree.rotation.x=Math.cos(elapsed*.53+phase)*amount*.55;});
  stars.visible=timeIndex>=1;stars.rotation.z=Math.sin(elapsed*.025)*.012;
  if(waterUniforms.uRipple.value>0.06)waterUniforms.uRipple.value*=Math.pow(.15,dt);else waterUniforms.uRipple.value=0;
  exhaustPixels.forEach((fx,i)=>{
    const racer=racers[i], car=racer.mesh;
    fx.group.visible=scrollProgress>.16;
    fx.group.position.set(car.position.x,car.position.y+.24,car.position.z+1.55);
    fx.group.rotation.y=car.rotation.y;
    fx.puffs.forEach((p,j)=>{
      const t=(elapsed*1.7+fx.phase+j*.19)%1;
      p.position.set(Math.sin(j*2.4+elapsed*2)*.08,t*.7,.12+t*.75);
      p.scale.setScalar(.55+t*.85);
      p.material.opacity=(1-t)*(.38+.18*Math.sin(elapsed*8+j));
    });
  });
  racers.forEach((r,i)=>{
    const raceActive = scrollProgress > .16;
    r.mesh.visible = raceActive;
    if(raceActive){
      if(driveMode&&i===0){
        if(driveKeys.has('w')||driveKeys.has('arrowup'))r.speed=Math.min(1.15,r.speed+dt*.5);
        else if(driveKeys.has('s')||driveKeys.has('arrowdown'))r.speed=Math.max(.08,r.speed-dt*.7);
        else r.speed=THREE.MathUtils.damp(r.speed,.42,1.4,dt);
        if(driveKeys.has('a')||driveKeys.has('arrowleft'))r.phase+=dt*(r.speed*1.7);
        else if(driveKeys.has('d')||driveKeys.has('arrowright'))r.phase-=dt*(r.speed*1.7);
        else r.phase+=dt*r.speed;
      } else r.phase+=dt*r.speed;
    }
    const a=r.phase;
    r.mesh.position.set(Math.cos(a)*r.radiusX,.02, -19+Math.sin(a)*r.radiusZ);
    // The car's nose points along local -Z. Aim it at the ellipse tangent,
    // accounting for the direction the phase is travelling.
    const direction = (driveMode && i===0 && (driveKeys.has('d')||driveKeys.has('arrowright'))) ? -1 : 1;
    const tangentX = -Math.sin(a)*r.radiusX*direction;
    const tangentZ = Math.cos(a)*r.radiusZ*direction;
    r.mesh.rotation.y = Math.atan2(-tangentX,-tangentZ);
  });
  pads.forEach(p=>{p.group.position.y=Math.sin(elapsed*.9+p.phase)*.035; p.group.rotation.y=Math.sin(elapsed*.4+p.phase)*.035;});
  koi.forEach((fish,i)=>{
    const g=fish.group;
    const px=pointerWorld.x*pondRadiusX*2-pondRadiusX,pz=pointerWorld.y*pondRadiusZ*2-pondRadiusZ;
    const dist=Math.hypot(g.position.x-px,g.position.z-pz);
    if(pointerActive&&dist<4.8){
      // Koi scatter decisively from the cursor, then circle back once it leaves.
      fish.scare=Math.min(1,fish.scare+dt*5.5);
      const dx=g.position.x-px,dz=g.position.z-pz,len=Math.max(.001,Math.hypot(dx,dz));
      const escape=4.2+(3.8-dist)*1.15;
      fish.target.set(
        THREE.MathUtils.clamp(g.position.x+dx/len*escape,-fishBoundsX,fishBoundsX),
        0,
        THREE.MathUtils.clamp(g.position.z+dz/len*escape,-fishBoundsZ,fishBoundsZ)
      );
    } else {
      fish.scare=Math.max(0,fish.scare-dt*.65);
      if(g.position.distanceTo(fish.target)<.45||Math.random()<.004){
        fish.target.set(
          THREE.MathUtils.clamp(fish.home.x+Math.sin(elapsed*.38+fish.phase)*2.1,-fishBoundsX,fishBoundsX),
          0,
          THREE.MathUtils.clamp(fish.home.z+Math.cos(elapsed*.31+fish.phase)*1.45,-fishBoundsZ,fishBoundsZ)
        );
      }
    }
    // Keep every fish inside a safe inset of the elliptical shoreline.
    const safeTarget=clampFishToPond(fish.target.x,fish.target.z);
    fish.target.set(safeTarget.x,0,safeTarget.z);
    const dx=fish.target.x-g.position.x,dz=fish.target.z-g.position.z;
    const remaining=Math.hypot(dx,dz);
    const moveRate=fish.speed*1.35+fish.scare*4.5;
    if(remaining>.04){
      g.position.x += dx/remaining*Math.min(remaining,dt*moveRate);
      g.position.z += dz/remaining*Math.min(remaining,dt*moveRate);
      g.rotation.y=Math.atan2(-dx,-dz);
    }
    const safePosition=clampFishToPond(g.position.x,g.position.z);
    g.position.x=safePosition.x;g.position.z=safePosition.z;
    g.rotation.z=Math.sin(elapsed*3+fish.phase)*.035*(1+fish.scare);
    fish.tail.rotation.y=Math.sin(elapsed*13+fish.phase)*(.28+fish.scare*.28);
  });
  frogs.forEach(f=>{
    f.phase+=dt;
    f.group.rotation.z=Math.sin(elapsed*1.7+f.phase)*.025;
    f.group.position.y=.035+Math.sin(elapsed*1.8+f.phase)*.025;
    // Frogs glance toward the pointer and blink with a tiny pixel-eye squash.
    const px=pointerWorld.x*pondRadiusX*2-pondRadiusX,pz=pointerWorld.y*pondRadiusZ*2-pondRadiusZ;
    const dx=px-f.group.position.x,dz=pz-f.group.position.z;
    const pointerDistance=Math.hypot(dx,dz);
    if(pointerActive&&entered&&!f.jump){
      // They turn to watch the cursor, then hop to a safer lily pad if it gets close.
      f.group.rotation.y=THREE.MathUtils.clamp(Math.atan2(dx,dz),-.9,.9);
      if(pointerDistance<1.65&&elapsed-f.lastPointerHop>1.15){
        const occupied=new Set(frogs.filter(other=>other!==f).map(other=>other.padIndex));
        let destination=-1,bestScore=-Infinity;
        pads.forEach((pad,index)=>{
          if(index===f.padIndex||occupied.has(index))return;
          const away=Math.hypot(pad.x-px,pad.z-pz);
          const distanceFromFrog=Math.hypot(pad.x-f.group.position.x,pad.z-f.group.position.z);
          const score=away-distanceFromFrog*.22;
          if(score>bestScore){bestScore=score;destination=index;}
        });
        if(destination>=0){f.lastPointerHop=elapsed;jumpFrog(f,destination);f.group.rotation.y=Math.atan2(-dx,-dz);}
      }
    } else if(!f.jump) f.group.rotation.y=Math.sin(elapsed*.35+f.phase)*.08;
    f.blinkAt-=dt;
    if(f.blinkAt<=0&&f.blinking<=0)f.blinking=.16;
    if(f.blinking>0){
      f.blinking-=dt;f.eyes.forEach(eye=>eye.scale.y=.12);
      if(f.blinking<=0){f.eyes.forEach(eye=>eye.scale.y=1);f.blinkAt=2.5+Math.random()*4;}
    }
    if(f.jump){
      f.jump.t+=dt;
      const t=Math.min(1,f.jump.t/f.jump.duration),s=smoothstep(t);
      f.group.position.lerpVectors(f.jump.from,f.jump.to,s);
      f.group.position.y+=Math.sin(t*Math.PI)*1.05;
      f.group.rotation.x=Math.sin(t*Math.PI)*.18;
      // A tiny squash on take-off and landing sells the arcade-like leap.
      const squash = Math.sin(t*Math.PI);
      f.group.scale.set(1-.12*squash,1+.2*squash,1-.12*squash);
      if(t>=1){f.padIndex=f.jump.destination;f.group.position.copy(f.jump.to);f.group.scale.set(1,1,1);f.group.rotation.x=0;f.jump=null;spawnSplash(f.group.position.x,f.group.position.z);showToast('A NEW IDEA IS WAITING.');}
    }
  });
  const pos=rainGeometry.attributes.position.array;
  if(rain.visible){for(let i=0;i<rainCount;i++){pos[i*3+1]-=dt*(7+weatherModes[weatherIndex].rain*9);if(pos[i*3+1]<-.2){pos[i*3+1]=12+Math.random()*8;pos[i*3]=(Math.random()-.5)*45;pos[i*3+2]=(Math.random()-.5)*45;}}rainGeometry.attributes.position.needsUpdate=true;
    // Sparse square splash rings only over the pond, to avoid a costly particle storm.
    rainSplashTimer-=dt;
    if(scrollProgress>.62&&weatherModes[weatherIndex].rain>.2&&rainSplashTimer<=0){const x=(Math.random()-.5)*pondRadiusX*1.7,z=(Math.random()-.5)*pondRadiusZ*1.7;spawnSplash(x,z);rainSplashTimer=.22+Math.random()*.28;}
  }
  const mote= moteGeo.attributes.position.array;
  for(let i=0;i<95;i++)mote[i*3+1]=1.2+Math.sin(elapsed*.8+i)*1.6;
  moteGeo.attributes.position.needsUpdate=true;
  fireflies.forEach((f,i)=>{
    f.mesh.position.y=f.baseY+Math.sin(elapsed*f.speed+f.phase)*.28;
    f.mesh.position.x+=Math.sin(elapsed*.7+f.phase)*dt*.12;
    f.mesh.material.opacity=(timeIndex===3?.85:timeIndex===2?.34:.08)+Math.sin(elapsed*2+f.phase)*.12;
    f.mesh.visible=scrollProgress>.48;
  });
  // Scroll is the timeline: sky -> circuit/race -> overhead pond. Each pose blends into the next.
  // 2.5D camera path: an oblique, isometric-inspired angle gives the voxel world
  // clear foreground/midground/background layers without losing the scroll journey.
  // A longer cinematic route: wide sky reveal, low fly-through over the racers,
  // a sweeping side pass, then a gentle orbit-like descent to the pond.
  const keyframes = [
    { p: 0,    pos: new THREE.Vector3(10, 7, 13),     target: new THREE.Vector3(0, 16, -28), fov: 47 },
    { p: .12,  pos: new THREE.Vector3(12, 8, 2),       target: new THREE.Vector3(0, .4, -19),  fov: 52 },
    { p: .27,  pos: new THREE.Vector3(13, 5.2, -12),    target: new THREE.Vector3(0, .4, -19),  fov: 55 },
    { p: .43,  pos: new THREE.Vector3(-12, 5.5, -21),   target: new THREE.Vector3(0, .4, -19),  fov: 54 },
    { p: .57,  pos: new THREE.Vector3(-7, 9, -1),       target: new THREE.Vector3(0, .2, -5),   fov: 49 },
    { p: .72,  pos: new THREE.Vector3(6, 8.5, 10),      target: new THREE.Vector3(0, 0, 0),    fov: 43 },
    // Dive into a close overhead pond composition; the circuit is left behind in the fog.
    { p: .86,  pos: new THREE.Vector3(0, 15.5, 1.8),   target: new THREE.Vector3(0, 0, 0),    fov: 34 },
    { p: 1,    pos: new THREE.Vector3(0, 15.5, 1.8),   target: new THREE.Vector3(0, 0, 0),    fov: 34 }
  ];
  let a=keyframes[0], b=keyframes[keyframes.length-1];
  for(let i=0;i<keyframes.length-1;i++){if(scrollProgress>=keyframes[i].p&&scrollProgress<=keyframes[i+1].p){a=keyframes[i];b=keyframes[i+1];break;}}
  const rawT=THREE.MathUtils.clamp((scrollProgress-a.p)/Math.max(.001,b.p-a.p),0,1);
  const s=reduceMotion?rawT:smoothstep(rawT);
  camera.position.lerpVectors(a.pos,b.pos,s);
  const lookTarget=new THREE.Vector3().lerpVectors(a.target,b.target,s);
  if(freeCameraMode){
    freeYaw+=((driveKeys.has('arrowleft')||driveKeys.has('a'))?1:0)*dt*.8;
    freeYaw-=((driveKeys.has('arrowright')||driveKeys.has('d'))?1:0)*dt*.8;
    freePitch+=((driveKeys.has('arrowup')||driveKeys.has('w'))?1:0)*dt*.45;
    freePitch-=((driveKeys.has('arrowdown')||driveKeys.has('s'))?1:0)*dt*.45;
    freePitch=THREE.MathUtils.clamp(freePitch,-.45,.45);
    lookTarget.x+=Math.sin(freeYaw)*5;lookTarget.z-=Math.cos(freeYaw)*4;lookTarget.y+=freePitch*8;
  }
  if(followedFrog&&scrollProgress>.55){
    const fp=followedFrog.group.position;
    const desired=new THREE.Vector3(fp.x+3,fp.y+2.2,fp.z+4);
    camera.position.lerp(desired,Math.min(1,dt*2.2));
    lookTarget.set(fp.x,fp.y+.2,fp.z);
  }
  // Gentle racing follow-camera sway adds speed without fighting the scroll-driven journey.
  const raceBlend=THREE.MathUtils.smoothstep(scrollProgress,.2,.42)*(1-THREE.MathUtils.smoothstep(scrollProgress,.52,.65));
  if(!reduceMotion&&raceBlend>.001){
    camera.position.x+=Math.sin(elapsed*.72)*.42*raceBlend;
    lookTarget.x+=Math.sin(elapsed*.72+.7)*.24*raceBlend;
    camera.position.y+=Math.sin(elapsed*1.1)*.06*raceBlend;
  }
  const shake=(!reduceMotion&&scrollProgress>.16&&scrollProgress<.63&&performance.now()<screenShakeUntil)?(Math.random()-.5)*.025:0;
  camera.position.x+=shake;
  camera.lookAt(lookTarget);
  camera.fov=THREE.MathUtils.lerp(a.fov,b.fov,s);camera.updateProjectionMatrix();
  renderer.render(scene,camera);
}
animate();

function resize(){
  camera.aspect=innerWidth/innerHeight;
  camera.fov=innerWidth<700?(scrollProgress>.66?49:scrollProgress>.16?57:48):(scrollProgress>.66?43:scrollProgress>.16?55:48);
  camera.updateProjectionMatrix();setPixelResolution();
}
addEventListener('resize',resize);
applyEnvironment();
if(reduceMotionQuery.matches)document.querySelector('#motionButton').setAttribute('aria-pressed','true');
window.addEventListener('keydown',e=>{
  const key=e.key.toLowerCase();
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){
    if(driveMode||freeCameraMode){driveKeys.add(key);e.preventDefault();}
  }
  if(e.key==='Escape'){
    if(photoMode){setPhotoMode(false);return;}
    panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');
    followedFrog=null;driveMode=false;freeCameraMode=false;driveKeys.clear();
    document.querySelector('#driveModeButton').textContent='DRIVE';document.querySelector('#driveModeButton').setAttribute('aria-pressed','false');
    document.querySelector('#freeCameraButton').textContent='FREE CAM';document.querySelector('#freeCameraButton').setAttribute('aria-pressed','false');
  }
});
window.addEventListener('keyup',e=>driveKeys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>driveKeys.clear());
window.addEventListener('keydown',e=>{
  if(driveMode||freeCameraMode)return;
  if(e.key==='ArrowDown'||e.key==='PageDown'){if(scrollProgress<.99){e.preventDefault();window.scrollBy({top:innerHeight*.55,behavior:reduceMotion?'auto':'smooth'});}}
  if(e.key==='ArrowUp'||e.key==='PageUp'){if(scrollProgress>.01){e.preventDefault();window.scrollBy({top:-innerHeight*.55,behavior:reduceMotion?'auto':'smooth'});}}
});


// Photo mode: preserve the live 3D scene while clearing every interface layer.
const photoModeButton = document.querySelector('#photoModeButton');
const photoExit = document.querySelector('#photoExit');
let photoMode = false;
function setPhotoMode(enabled) {
  photoMode = enabled;
  document.body.classList.toggle('photo-mode', enabled);
  photoModeButton?.setAttribute('aria-pressed', String(enabled));
  if (photoExit) photoExit.hidden = !enabled;
  if (photoModeButton) photoModeButton.textContent = enabled ? 'EXIT PHOTO' : 'PHOTO';
  if (enabled) showToast('PHOTO MODE · ESC TO RETURN');
}
photoModeButton?.addEventListener('click', () => setPhotoMode(!photoMode));


// Pixel-art quality switch: 8-bit is chunky, 16-bit is balanced, and 64-bit
// uses the full device viewport for a crisp, high-detail version of the world.
const pixelStyleButton = document.querySelector('#pixelStyleButton');
function applyPixelStyle(style, notify = true) {
  pixelStyle = style;
  document.body.classList.toggle('pixel-8', style === '8');
  setPixelResolution();
  if (pixelStyleButton) {
    pixelStyleButton.textContent = style.toUpperCase() + '-BIT';
    pixelStyleButton.setAttribute('aria-pressed', String(style === '8'));
    pixelStyleButton.title = style === '8'
      ? 'Switch to balanced 16-bit pixel rendering'
      : style === '16' ? 'Switch to crisp full-resolution 64-bit-style rendering'
      : 'Switch to chunkier 8-bit pixel rendering';
  }
  if (notify) showToast(style === '8' ? '8-BIT MODE · CHUNKY PIXELS' : style === '16' ? '16-BIT MODE · FINE PIXELS' : '64-BIT MODE · FULL-RES DETAIL');
}
pixelStyleButton?.addEventListener('click', () => applyPixelStyle(pixelStyle === '8' ? '16' : pixelStyle === '16' ? '64' : '8', true));
applyPixelStyle('64', false);
