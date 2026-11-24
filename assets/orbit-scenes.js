/* Shared, decorative 3D artwork. A CSS scene remains visible without WebGL. */
(() => {
  if (!window.THREE) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [];
  const palette = {violet:0xbca8ee, mint:0xa4dec1, rose:0xe3b8dd, ink:0x8975b8};
  document.querySelectorAll('[data-orbit-scene]').forEach((container) => {
    const canvas = container.querySelector('.orbit-3d-canvas');
    if (!canvas) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, .1, 30);
      camera.position.set(0, .2, 7.5);
      scene.add(new THREE.HemisphereLight(0xf7edff, 0x574b80, 1.5));
      const key = new THREE.PointLight(0xffffff, 32, 20); key.position.set(-4, 5, 5); scene.add(key);
      const rim = new THREE.PointLight(0xb9a4ff, 20, 20); rim.position.set(4, -2, 2); scene.add(rim);
      const group = new THREE.Group(); scene.add(group);
      const color = palette[container.dataset.orbitScene] || palette.violet;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1.22, 56, 40), new THREE.MeshPhysicalMaterial({color, metalness:.22, roughness:.28, clearcoat:1, clearcoatRoughness:.23}));
      group.add(orb);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(1.34, 40, 32), new THREE.MeshBasicMaterial({color:0xe5dcff, side:THREE.BackSide, transparent:true, opacity:.10, depthWrite:false})); group.add(halo);
      const ringMaterial = new THREE.MeshBasicMaterial({color:0xf2eaff, transparent:true, opacity:.7});
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.83,.012,10,140), ringMaterial); ring.rotation.set(1.15,.16,.38); group.add(ring);
      const second = new THREE.Mesh(new THREE.TorusGeometry(2.12,.007,8,140), new THREE.MeshBasicMaterial({color:0xd4c8ff,transparent:true,opacity:.46})); second.rotation.set(.95,-.3,-.45); group.add(second);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(.20,28,24), new THREE.MeshStandardMaterial({color:0xd8ffc4,roughness:.3,metalness:.08})); moon.position.set(1.8,.25,.5);group.add(moon);
      const moon2 = new THREE.Mesh(new THREE.SphereGeometry(.085,20,16), new THREE.MeshStandardMaterial({color:0xffd4db,roughness:.4})); moon2.position.set(-1.8,-.3,-.5);group.add(moon2);
      const dotPositions=[]; for(let i=0;i<70;i++){dotPositions.push((Math.random()-.5)*12,(Math.random()-.5)*8,-Math.random()*7-2)}
      const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(dotPositions,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.8})));
      let pointerX=0,pointerY=0,time=0,visible=true;
      const resize=()=>{const box=container.getBoundingClientRect(),w=Math.max(1,box.width),h=Math.max(1,box.height);renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=w/h<1.2?8.4:7.5;camera.updateProjectionMatrix();renderer.render(scene,camera)};
      const move=e=>{const b=container.getBoundingClientRect();pointerX=((e.clientX-b.left)/Math.max(b.width,1)-.5)*.24;pointerY=((e.clientY-b.top)/Math.max(b.height,1)-.5)*.2};
      container.addEventListener('pointermove',move,{passive:true});
      container.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0},{passive:true});
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container); else window.addEventListener('resize',resize);
      if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'100px'}).observe(container);
      resize();container.classList.add('has-orbit-3d');
      scenes.push({render(){if(!visible)return;time+=.006;group.rotation.y+=(pointerX-group.rotation.y)*.04;group.rotation.x+=(pointerY-group.rotation.x)*.04;orb.rotation.y+=.0015;ring.rotation.z+=.0012;moon.position.set(Math.cos(time)*1.8,Math.sin(time)*.55,Math.sin(time)*.9);moon2.position.set(Math.cos(-time*.7)*2.05,Math.sin(-time*.7)*.35,Math.sin(-time*.7)*.6);renderer.render(scene,camera)}});
    } catch (_) { if (renderer) renderer.dispose(); }
  });
  if(!reduceMotion && scenes.length){const tick=()=>{if(!document.hidden)scenes.forEach(s=>s.render());requestAnimationFrame(tick)};requestAnimationFrame(tick)}
})();
