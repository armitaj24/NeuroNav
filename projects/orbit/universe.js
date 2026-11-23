(() => {
  const canvas = document.getElementById('universe');
  if (!canvas || !window.THREE) return;
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, .3, 10);
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    const world = new THREE.Group(); scene.add(world);
    scene.add(new THREE.AmbientLight(0xd7d5ff, .9));
    const light = new THREE.PointLight(0xe5dcff, 65, 35); light.position.set(-4, 5, 8); scene.add(light);
    const sphere = (radius, color, roughness=.45) => new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 36), new THREE.MeshStandardMaterial({color, roughness, metalness:.12}));
    const planet = sphere(1.58, 0x7462a5); world.add(planet);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.68, 48, 36), new THREE.MeshBasicMaterial({color:0xa998f5, transparent:true, opacity:.075, side:THREE.BackSide})); world.add(atmosphere);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.18, .013, 8, 120), new THREE.MeshBasicMaterial({color:0xaaa4d6, transparent:true, opacity:.6})); ring.rotation.set(1.1,.25,.15); world.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.65, .007, 8, 140), new THREE.MeshBasicMaterial({color:0xcec3ff, transparent:true, opacity:.3})); ring2.rotation.set(1.1,.25,.15); world.add(ring2);
    const moon = sphere(.24, 0xd6ffc2, .65); moon.position.set(2.25,.62,.72); world.add(moon);
    const moon2 = sphere(.105, 0xf4c2b3); moon2.position.set(-2.18,-.68,-.6); world.add(moon2);
    const orbitLines = new THREE.Group(); scene.add(orbitLines);
    const pts = []; for(let i=0;i<360;i++){let x=(Math.random()-.5)*25,y=(Math.random()-.5)*16,z=-Math.random()*15-2;pts.push(x,y,z)}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    scene.add(new THREE.Points(geometry,new THREE.PointsMaterial({color:0xd9d4ff,size:.025,transparent:true,opacity:.8})));
    let tx=0,ty=0; const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function resize(){const box=canvas.parentElement.getBoundingClientRect();const w=Math.max(1,box.width),h=Math.max(1,box.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();world.position.x=w<650?.7:1.25;renderer.render(scene,camera)}
    window.addEventListener('resize',resize);resize();canvas.parentElement.classList.add('webgl-ready');
    if(!reduced){window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.18;ty=(e.clientY/innerHeight-.5)*.16},{passive:true});let t=0;const frame=()=>{t+=.006;world.rotation.y+=(tx-world.rotation.y)*.025;world.rotation.x+=(ty-world.rotation.x)*.025;planet.rotation.y+=.001;moon.position.x=Math.cos(t)*2.25;moon.position.z=Math.sin(t)*1.0;ring.rotation.z+=.0008;renderer.render(scene,camera);requestAnimationFrame(frame)};requestAnimationFrame(frame)}
  } catch(e) { /* The dimensional CSS artwork remains visible when WebGL is unavailable. */ }
})();
