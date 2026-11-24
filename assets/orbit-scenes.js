/* Decorative WebGL planets. The CSS artwork stays available when WebGL fails. */
(() => {
  if (!window.THREE) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = [];
  const palettes = {
    violet: {base:0xbba0ef, ring:0xf6e9ff, moon:0xc1f8df, glow:0x9c7eff},
    ink:    {base:0x9b80e0, ring:0xf2e8ff, moon:0xbef7dc, glow:0xa081ff},
    rose:   {base:0xf0b9cb, ring:0xffffff, moon:0xc4b1f9, glow:0xe78eb2},
    mint:   {base:0x9ddab7, ring:0xffffff, moon:0xffcfe0, glow:0x7cc99e}
  };

  document.querySelectorAll('[data-orbit-scene]').forEach((container) => {
    const canvas = container.querySelector('.orbit-3d-canvas');
    if (!canvas) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
      camera.position.set(0, .12, 8);
      scene.add(new THREE.HemisphereLight(0xfff8ff, 0x4a3a72, 1.55));
      const key = new THREE.PointLight(0xffffff, 34, 25); key.position.set(-4, 5, 6); scene.add(key);
      const rim = new THREE.PointLight(0xc6a8ff, 24, 22); rim.position.set(4, -2, 3); scene.add(rim);
      const group = new THREE.Group(); scene.add(group);
      const p = palettes[container.dataset.orbitScene] || palettes.violet;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(1.17, 48, 36), new THREE.MeshPhysicalMaterial({color:p.base, metalness:.2, roughness:.25, clearcoat:1, clearcoatRoughness:.15}));
      group.add(orb);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(1.33, 32, 24), new THREE.MeshBasicMaterial({color:p.glow, side:THREE.BackSide, transparent:true, opacity:.13, depthWrite:false})); group.add(halo);
      const inner = new THREE.Group(); inner.rotation.set(1.05,.24,.32); group.add(inner);
      inner.add(new THREE.Mesh(new THREE.TorusGeometry(1.72,.017,8,120),new THREE.MeshBasicMaterial({color:p.ring,transparent:true,opacity:.82})));
      const moon = new THREE.Mesh(new THREE.SphereGeometry(.21,28,20),new THREE.MeshStandardMaterial({color:p.moon,roughness:.3,metalness:.08})); inner.add(moon);
      const outer = new THREE.Group(); outer.rotation.set(.85,-.38,-.38); group.add(outer);
      outer.add(new THREE.Mesh(new THREE.TorusGeometry(2.1,.009,8,120),new THREE.MeshBasicMaterial({color:p.ring,transparent:true,opacity:.55})));
      const moon2 = new THREE.Mesh(new THREE.SphereGeometry(.105,20,16),new THREE.MeshStandardMaterial({color:0xffdce9,roughness:.35}));outer.add(moon2);
      moon.position.set(1.72,0,0); moon2.position.set(-2.1,0,0);
      const dotPositions=[];
      for(let i=0;i<90;i++){dotPositions.push((Math.random()-.5)*15,(Math.random()-.5)*10,-Math.random()*7-3)}
      const stars=new THREE.BufferGeometry();stars.setAttribute('position',new THREE.Float32BufferAttribute(dotPositions,3));
      scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffffff,size:.035,transparent:true,opacity:.75})));
      let pointerX=0,pointerY=0,time=0,visible=true;
      const resize=()=>{
        const box=container.getBoundingClientRect(),w=Math.max(1,box.width),h=Math.max(1,box.height);
        renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
        group.position.x=container.classList.contains('visual') ? Math.min(2.05,Math.max(.6,(w/h-1.3)*1.3)) : 0;
        renderer.render(scene,camera);
      };
      const move=e=>{const b=container.getBoundingClientRect();pointerX=((e.clientX-b.left)/Math.max(b.width,1)-.5)*.3;pointerY=((e.clientY-b.top)/Math.max(b.height,1)-.5)*.22};
      container.addEventListener('pointermove',move,{passive:true});
      container.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0},{passive:true});
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container); else window.addEventListener('resize',resize);
      if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'120px'}).observe(container);
      resize();container.classList.add('has-orbit-3d');
      scenes.push({render(){
        if(!visible)return;
        time+=.012;group.rotation.y+=(pointerX-group.rotation.y)*.04;group.rotation.x+=(pointerY-group.rotation.x)*.04;
        orb.rotation.y+=.002;moon.position.set(Math.cos(time)*1.72,Math.sin(time)*1.72,0);
        moon2.position.set(Math.cos(-time*.68)*2.1,Math.sin(-time*.68)*2.1,0);
        renderer.render(scene,camera);
      }});
    } catch (_) { if (renderer) renderer.dispose(); }
  });
  if(!reduceMotion && scenes.length){let last=0;const tick=now=>{if(!document.hidden&&now-last>32){scenes.forEach(s=>s.render());last=now}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
})();
