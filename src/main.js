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
scene.background = new THREE.Color('#d98cae');
scene.fog = new THREE.Fog('#c78aa9', 0.009);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 250);
camera.position.set(0, 2, 8);
camera.lookAt(0, 17, -22);
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(Math.max(320,Math.floor(innerWidth/3)),Math.max(180,Math.floor(innerHeight/3)),false);
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
mats.grass = mat('#66865b');
mats.darkGrass = mat('#354f59');
mats.track = mat('#48465a', .85);
mats.trackEdge = mat('#e2d7b5', .7);
mats.rock = mat('#a16b91');
mats.stone = mat('#c0a0a0');
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
mats.bark = mat('#a95e57');
mats.leaf = mat('#264957');
mats.leaf2 = mat('#356171');


function pixelMountain(x,z,w,h,colors){
 const g=new THREE.Group();
 for(let i=0;i<7;i++){const f=1-i/7;const m=new THREE.Mesh(new THREE.BoxGeometry(w*f,h/7+.12,3.5),mat(colors[i%colors.length]));m.position.y=-h*.35+i*h/7;g.add(m);}
 g.position.set(x,0,z);scene.add(g);
 if(h>15)for(let k=0;k<4;k++){const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.12,1.2,3.6),mat('#f0dfd7'));cap.position.set(x-w*.13+k*w*.09,h*.43,z);scene.add(cap);}
}
for(let i=0;i<14;i++){const x=-38+i*5.8;pixelMountain(x,-48-(i%3)*3,13+(i%4)*2,17+(i%5)*3,['#70527f','#a16b91','#d7859a']);pixelMountain(x+2,-40-(i%4)*2,9+(i%3)*2,10+(i%4)*2,['#875783','#bd7895','#d78a9c']);}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), mats.grass);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -.58;
scene.add(ground);

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
for (let i=0;i<42;i++) {
  const side = i%2 ? 1 : -1;
  makePixelPine(side*(11+(i%5)*2.2), -7-(i%21)*2.45, .58+(i%4)*.12);
}


const bridge = new THREE.Group(); scene.add(bridge);
for(let i=0;i<10;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,3.8),mat(i%2?'#c67868':'#a95e57'));plank.position.set(-2+i*.43,.16,-1);bridge.add(plank);}
for(const x of [-2.15,2.15]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.18,.22,4.1),mat('#df9279'));rail.position.set(x,.85,-1);bridge.add(rail);for(let z=-2.8;z<.9;z+=.9){const post=new THREE.Mesh(new THREE.BoxGeometry(.18,.95,.18),mat('#df9279'));post.position.set(x,.48,z);bridge.add(post);}}
const track = new THREE.Group();
track.position.set(0, -.32, -19);
scene.add(track);
const trackShape = new THREE.Shape();
trackShape.absellipse(0, 0, 13.5, 6.3, 0, Math.PI * 2, false, 0);
const trackHole = new THREE.Path();
trackHole.absellipse(0, 0, 9.2, 3.2, 0, Math.PI * 2, true, 0);
trackShape.holes.push(trackHole);
const trackMesh = new THREE.Mesh(new THREE.ShapeGeometry(trackShape, 80), mats.track);
trackMesh.rotation.x = -Math.PI / 2;
track.add(trackMesh);
const innerGrass = new THREE.Mesh(new THREE.CircleGeometry(1, 48), mats.darkGrass);
innerGrass.scale.set(9.1, 3.1, 1);
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
makeLine(13.35, 6.2, '#d8d4bd', .09);
makeLine(9.25, 3.25, '#d8d4bd', .075);
for (let i = 0; i < 55; i++) {
  const a = i / 55 * Math.PI * 2;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(.3, .025, .13), mat(i % 2 ? '#f5f2dc' : '#353b39'));
  stripe.position.set(Math.cos(a) * 13.4, .055, Math.sin(a) * 6.25);
  stripe.rotation.y = -a;
  track.add(stripe);
}
for (let i = 0; i < 28; i++) {
  const a = i / 28 * Math.PI * 2;
  const tree = makeTree();
  tree.position.set(Math.cos(a) * (18 + (i % 3) * 1.5), -.25, -19 + Math.sin(a) * (10 + (i % 2) * 2));
  tree.scale.setScalar(.8 + (i % 4) * .13);
  scene.add(tree);
}
function makeTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, 1.6, 7), mats.bark);
  trunk.position.y = .55; g.add(trunk);
  for (let j = 0; j < 3; j++) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(.7 + j * .14, 1), j % 2 ? mats.leaf : mats.leaf2);
    crown.position.set((j - 1) * .25, 1.25 + j * .42, (j % 2) * .18);
    crown.scale.set(1.1, 1.2, 1);
    g.add(crown);
  }
  return g;
}

// Small, stylised sports cars circulating the track during the opening.
const racers = [];
function makeCar(color, scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, .34, 2.9), mat(color, .26, .36));
  body.position.y = .42; g.add(body);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.38, .22, .75), mat(color, .25, .28));
  nose.position.set(0, .35, -1.05); g.add(nose);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.02, .4, 1.15), mat('#18282b', .19, .28));
  cabin.position.set(0, .72, .05); g.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(.84, .08, .8), mat(color, .26, .2));
  roof.position.set(0, .96, .08); g.add(roof);
  for (const x of [-.79, .79]) for (const z of [-.85, .85]) {
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(.2, .42, .42), mat('#242a35', .8));
    wheel.position.set(x, .25, z); g.add(wheel);
    const hub = new THREE.Mesh(new THREE.BoxGeometry(.215, .12, .12), mat('#d5c4a6', .7));
    hub.position.set(x + (x < 0 ? -.015 : .015), .25, z); g.add(hub);
  }
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffe9c0 });
  for (const x of [-.48, .48]) {
    const light = new THREE.Mesh(new THREE.BoxGeometry(.25, .07, .05), lightMat);
    light.position.set(x, .43, -1.49); g.add(light);
  }
  g.scale.setScalar(scale);
  return g;
}
const carColors = ['#e8e5d9', '#d94c35', '#d7a64f', '#263f49'];
for (let i = 0; i < 4; i++) {
  const car = makeCar(carColors[i], i === 3 ? .86 : .95);
  scene.add(car);
  racers.push({ mesh: car, phase: i * Math.PI * .5, speed: .32 + i * .035, radiusX: 11.3, radiusZ: 4.8 });
}

// Pond bed and shoreline.
const pondGroup = new THREE.Group();
scene.add(pondGroup);
const pondRadiusX = 8.1, pondRadiusZ = 5.35;
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
    void main(){
      vec2 p=vUv;
      // Coarse grid quantization gives the pond visible square pixels.
      vec2 cell=floor(p*64.0)/64.0;
      float wave=sin(cell.x*32.0+floor(uTime*4.0)*.12)*cos(cell.y*28.0-floor(uTime*3.0)*.12);
      float d=distance(cell,uPointer);
      float rings=sin(floor(d*54.0)*6.28318-floor(uTime*5.0))*exp(-d*10.0)*uRipple;
      float rainWave=step(.84,fract(cell.x*91.0+cell.y*57.0-floor(uTime*5.0)*.13))*uRain;
      float shimmer=wave*.055+rings*.16+rainWave*.12;
      vec3 deep=vec3(.035,.22,.22); vec3 shallow=vec3(.31,.52,.40);
      float band=floor(clamp(cell.y+shimmer,0.0,1.0)*6.0)/6.0;
      vec3 col=mix(deep,shallow,band);
      float skyReflection=step(.88,fract(sin(floor(cell.x*18.0)+floor(cell.y*13.0)+floor(uTime*.5))*43758.5));
      col=mix(col,vec3(.76,.81,.64),skyReflection*(.10+.22*uDay));
      float edge=min(min(p.x,1.0-p.x),min(p.y,1.0-p.y));
      col=mix(vec3(.10,.20,.17),col,smoothstep(0.0,.055,edge));
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
  const body = new THREE.Mesh(new THREE.BoxGeometry(.43,.25,.92), white);
  body.position.y=.04; g.add(body);
  const patch = new THREE.Mesh(new THREE.BoxGeometry(.34,.13,.29), patchMat);
  patch.position.set(0,.17,-.12); g.add(patch);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(.22,.1,.34), patchMat);
  tail.position.set(0,.03,.59); g.add(tail);
  for (const side of [-1,1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.18,.055,.28), index%2?mats.koiWhite:mats.koiOrange);
    fin.position.set(side*.24,-.04,.08); fin.rotation.y=side*.22; g.add(fin);
  }
  const eyeMat = new THREE.MeshBasicMaterial({color:0x101817});
  for (const side of [-1,1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.055),eyeMat);
    eye.position.set(side*.17,.1,-.32); g.add(eye);
  }
  g.position.set(x,-.035,z); pondGroup.add(g);
  koi.push({group:g,home:new THREE.Vector3(x,0,z),target:new THREE.Vector3(x,0,z),phase:Math.random()*6,speed:.45+Math.random()*.38,scare:0,index});
}
makeKoi(0,-1.5,-1.1); makeKoi(1,1.4,-.9); makeKoi(2,.2,1.8); makeKoi(3,-4.8,.8); makeKoi(4,4.8,.6); makeKoi(5,-.8,3.7); makeKoi(6,2.5,-3.7);

// Frogs sit on pads, blink occasionally, and leap to the nearest available pad.
const frogs = [];
function makeFrog() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(.38,.2,.4),mats.frog);
  body.position.y=.19; g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.34,.24,.3),mats.frog);
  head.position.set(0,.34,-.12); g.add(head);
  for (const s of [-1,1]) {
    const eyeStem = new THREE.Mesh(new THREE.BoxGeometry(.11,.13,.11),mats.frog);
    eyeStem.position.set(s*.12,.49,-.19); g.add(eyeStem);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(.055,.055,.04),mat('#18291d'));
    eye.position.set(s*.12,.51,-.25); g.add(eye);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.2),mats.frogDark);
    leg.position.set(s*.19,.1,.1); g.add(leg);
  }
  scene.add(g);
  return {group:g,padIndex:Math.floor(Math.random()*pads.length),jump:null,blinkAt:Math.random()*5,phase:Math.random()*6};
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
  scene.background.set(t.sky);scene.fog.color.set(t.fog);scene.fog.density=w.fog;
  sun.color.set(t.sun);sun.intensity=3.2*t.day;hemi.intensity=.45+1.65*t.day;fill.intensity=.25+1.0*t.day;
  rain.visible=w.rain>0;rainMaterial.opacity=.1+w.rain*.55;
  motes.material.opacity=timeIndex===3?.72:timeIndex===2?.18:0;
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
  if(raycaster.ray.intersectPlane(plane,hit)&&Math.abs(hit.x)<pondRadiusX&&Math.abs(hit.z)<pondRadiusZ){
    pointerWorld.set(hit.x/(pondRadiusX*2)+.5,hit.z/(pondRadiusZ*2)+.5);
    waterUniforms.uPointer.value.copy(pointerWorld);waterUniforms.uRipple.value=1;pointerActive=true;lastPointerMove=performance.now();
  } else pointerActive=false;
}
renderer.domElement.addEventListener('pointermove',updatePointer);
renderer.domElement.addEventListener('pointerleave',()=>{pointerActive=false;});
renderer.domElement.addEventListener('pointerdown',event=>{
  updatePointer(event);
  if(pointerActive){waterUniforms.uRipple.value=1.8;spawnSplash(pointerWorld.x*pondRadiusX*2-pondRadiusX,pointerWorld.y*pondRadiusZ*2-pondRadiusZ);}
});
function spawnSplash(x,z){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.012,5,40),new THREE.MeshBasicMaterial({color:0xd5e9c9,transparent:true,opacity:.8}));
  ring.rotation.x=Math.PI/2;ring.position.set(x,.025,z);pondGroup.add(ring);
  const start=performance.now();
  function animateRing(){const t=(performance.now()-start)/700;if(t>=1){pondGroup.remove(ring);ring.geometry.dispose();ring.material.dispose();return;}ring.scale.setScalar(1+t*8);ring.material.opacity=.8*(1-t);requestAnimationFrame(animateRing);}
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

// The camera starts by the racing circuit, then glides to a top-down pond view.
const clock=new THREE.Clock();
let elapsed=0;
function smoothstep(t){return t*t*(3-2*t);}
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;
  waterUniforms.uTime.value=elapsed;
  if(waterUniforms.uRipple.value>0.06)waterUniforms.uRipple.value*=Math.pow(.15,dt);else waterUniforms.uRipple.value=0;
  racers.forEach((r,i)=>{
    const raceActive = scrollProgress > .16;
    r.mesh.visible = raceActive;
    if(raceActive) r.phase+=dt*r.speed;
    const a=r.phase;
    r.mesh.position.set(Math.cos(a)*r.radiusX,.02, -19+Math.sin(a)*r.radiusZ);
    r.mesh.rotation.y=-Math.atan2(Math.cos(a)*r.radiusZ,-Math.sin(a)*r.radiusX);
  });
  pads.forEach(p=>{p.group.position.y=Math.sin(elapsed*.9+p.phase)*.035; p.group.rotation.y=Math.sin(elapsed*.4+p.phase)*.035;});
  koi.forEach((fish,i)=>{
    const g=fish.group;
    const px=pointerWorld.x*pondRadiusX*2-pondRadiusX,pz=pointerWorld.y*pondRadiusZ*2-pondRadiusZ;
    const dist=Math.hypot(g.position.x-px,g.position.z-pz);
    if(pointerActive&&entered&&dist<3.1){
      fish.scare=Math.min(1,fish.scare+dt*2.4);
      const dx=g.position.x-px,dz=g.position.z-pz,len=Math.max(.001,Math.hypot(dx,dz));
      fish.target.set(THREE.MathUtils.clamp(g.position.x+dx/len*2.8,-pondRadiusX+.7,pondRadiusX-.7),0,THREE.MathUtils.clamp(g.position.z+dz/len*2.5,-pondRadiusZ+.7,pondRadiusZ-.7));
    } else {
      fish.scare=Math.max(0,fish.scare-dt*.45);
      if(g.position.distanceTo(fish.target)<.45||Math.random()<.004){fish.target.set(THREE.MathUtils.clamp(fish.home.x+Math.sin(elapsed*.28+fish.phase)*2.4,-pondRadiusX+.6,pondRadiusX-.6),0,THREE.MathUtils.clamp(fish.home.z+Math.cos(elapsed*.22+fish.phase)*1.7,-pondRadiusZ+.6,pondRadiusZ-.6));}
    }
    const target=new THREE.Vector3(fish.target.x,-.035,fish.target.z);
    g.position.lerp(target,Math.min(1,dt*fish.speed*(1+fish.scare*3)));
    const dx=fish.target.x-g.position.x,dz=fish.target.z-g.position.z;
    if(Math.hypot(dx,dz)>.05)g.rotation.y=Math.atan2(dx,dz);
    g.rotation.z=Math.sin(elapsed*3+fish.phase)*.035*(1+fish.scare);
    g.children[2].rotation.z=Math.sin(elapsed*10+fish.phase)*.24;
  });
  frogs.forEach(f=>{
    f.phase+=dt;
    f.group.rotation.z=Math.sin(elapsed*1.7+f.phase)*.025;
    f.group.position.y=.035+Math.sin(elapsed*1.8+f.phase)*.025;
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
  if(rain.visible){for(let i=0;i<rainCount;i++){pos[i*3+1]-=dt*(7+weatherModes[weatherIndex].rain*9);if(pos[i*3+1]<-.2){pos[i*3+1]=12+Math.random()*8;pos[i*3]=(Math.random()-.5)*45;pos[i*3+2]=(Math.random()-.5)*45;}}rainGeometry.attributes.position.needsUpdate=true;}
  const mote= moteGeo.attributes.position.array;
  for(let i=0;i<95;i++)mote[i*3+1]=1.2+Math.sin(elapsed*.8+i)*1.6;
  moteGeo.attributes.position.needsUpdate=true;
  // Scroll is the timeline: sky -> circuit/race -> overhead pond. Each pose blends into the next.
  const keyframes = [
    { p: 0,    pos: new THREE.Vector3(0, 2, 8),    target: new THREE.Vector3(0, 17, -22), fov: 48 },
    { p: .18,  pos: new THREE.Vector3(0, 5, 5),    target: new THREE.Vector3(0, 0, -19),  fov: 55 },
    { p: .42,  pos: new THREE.Vector3(0, 3.4, -7), target: new THREE.Vector3(0, 0, -19),  fov: 61 },
    { p: .64,  pos: new THREE.Vector3(0, 9, -4),   target: new THREE.Vector3(0, 0, -2),   fov: 53 },
    { p: 1,    pos: new THREE.Vector3(0, 17.5, 0), target: new THREE.Vector3(0, 0, 0),    fov: 43 }
  ];
  let a=keyframes[0], b=keyframes[keyframes.length-1];
  for(let i=0;i<keyframes.length-1;i++){if(scrollProgress>=keyframes[i].p&&scrollProgress<=keyframes[i+1].p){a=keyframes[i];b=keyframes[i+1];break;}}
  const rawT=THREE.MathUtils.clamp((scrollProgress-a.p)/Math.max(.001,b.p-a.p),0,1);
  const s=reduceMotion?rawT:smoothstep(rawT);
  camera.position.lerpVectors(a.pos,b.pos,s);
  const lookTarget=new THREE.Vector3().lerpVectors(a.target,b.target,s);
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
  camera.updateProjectionMatrix();renderer.setSize(Math.max(320,Math.floor(innerWidth/3)),Math.max(180,Math.floor(innerHeight/3)),false);
}
addEventListener('resize',resize);
applyEnvironment();
if(reduceMotionQuery.matches)document.querySelector('#motionButton').setAttribute('aria-pressed','true');
window.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.classList.remove('is-open');panel.setAttribute('aria-hidden','true');}});
window.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='PageDown'){if(scrollProgress<.99){e.preventDefault();window.scrollBy({top:innerHeight*.55,behavior:reduceMotion?'auto':'smooth'});}}if(e.key==='ArrowUp'||e.key==='PageUp'){if(scrollProgress>.01){e.preventDefault();window.scrollBy({top:-innerHeight*.55,behavior:reduceMotion?'auto':'smooth'});}}});
