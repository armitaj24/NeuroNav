'use strict';

// A deliberately stylised teaching illustration. Lobe boundaries are approximate.
(() => {
  const canvas = document.getElementById('brain-canvas');
  const stage = document.getElementById('brain-stage');
  const fallback = document.getElementById('brain-fallback');
  const noop = { select() {} };
  if (!window.THREE || !canvas) { fallback.hidden = false; window.NeuroNavBrain = noop; return; }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5.25);
    camera.lookAt(0, -0.08, 0);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    scene.add(new THREE.HemisphereLight(0xf5efff, 0x4c3f72, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.5); key.position.set(3, 5, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9ef4e3, 1.5); rim.position.set(-4, 1, -5); scene.add(rim);
    const pink = new THREE.PointLight(0xffb0dd, 16, 14); pink.position.set(1, 2, 4); scene.add(pink);

    const sculpture = new THREE.Group();
    sculpture.rotation.set(-0.12, -0.78, -0.10);
    scene.add(sculpture);

    const palette = { frontal:0xefb4c8, parietal:0xc8b5f7, temporal:0x8fcfc9, occipital:0xedc399, cerebellum:0xb4daa4, brainstem:0xe5ad9d };
    const dark = new THREE.Color(0x554d74);
    const surfaces = [];
    const folds = [];

    function point(theta, longitudinal, side, extra = 0) {
      const s = Math.sin(longitudinal), cross = Math.cos(longitudinal);
      const ripple = 1 + 0.018 * Math.sin(theta * 15 + 1.6 * Math.sin(longitudinal * 5)) + 0.007 * Math.sin(theta * 33 - longitudinal * 9);
      let x = side * (0.035 + (0.70 + extra) * Math.sin(theta) * cross * ripple);
      let y = (0.80 + extra) * Math.cos(theta) * cross * ripple + 0.12;
      let z = (1.13 + extra) * s;
      if (y < -0.40) y = -0.40 + (y + 0.40) * 0.60;
      // The tapered back and fuller front make the silhouette less spherical.
      x *= 1 - 0.12 * Math.max(0, -s);
      y += 0.035 * Math.sin(longitudinal * 2);
      return new THREE.Vector3(x, y, z);
    }
    function regionAt(y, z) {
      if (z > 0.33) return 'frontal';
      if (z < -0.73) return 'occipital';
      if (y < -0.12) return 'temporal';
      return 'parietal';
    }
    function hemisphere(side) {
      const across = 68, along = 94, positions = [], indices = [], regions = [], colors = [];
      for (let i = 0; i <= across; i++) {
        const theta = Math.PI * i / across;
        for (let j = 0; j <= along; j++) {
          const long = -Math.PI / 2 + Math.PI * j / along;
          const p = point(theta, long, side);
          positions.push(p.x, p.y, p.z); regions.push(regionAt(p.y, p.z)); colors.push(1, 1, 1);
        }
      }
      for (let i = 0; i < across; i++) for (let j = 0; j < along; j++) {
        const a = i * (along + 1) + j, b = a + along + 1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices); geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ vertexColors:true, roughness:.50, metalness:.02, side:THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat); mesh.userData.regions = regions; mesh.userData.part = 'cortex';
      sculpture.add(mesh); surfaces.push(mesh);
      // Raised curving ribbons follow the outer surface, suggesting cortical folds.
      for (let band = 1; band <= 17; band++) {
        const points = [];
        for (let j = 0; j <= 85; j++) {
          const l = -1.40 + j / 85 * 2.80;
          const base = Math.PI * band / 18;
          const wave = 0.052 * Math.sin(l * 7.5 + band * 1.17) + 0.024 * Math.sin(l * 15 - band * .81);
          points.push(point(Math.max(.025, Math.min(Math.PI - .025, base + wave)), l, side, .010));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, .012, 5, false), new THREE.MeshStandardMaterial({color:0x67577f,roughness:.7,transparent:true,opacity:.55}));
        sculpture.add(line); folds.push(line);
      }
    }
    hemisphere(-1); hemisphere(1);

    const cerebellum = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({color:palette.cerebellum, roughness:.58}));
    cerebellum.position.set(0,-.55,-.71); cerebellum.scale.set(.59,.38,.44); cerebellum.userData.part='cerebellum'; sculpture.add(cerebellum);
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(.16,.55,8,20), new THREE.MeshStandardMaterial({color:palette.brainstem,roughness:.58}));
    stem.position.set(0,-.79,-.43); stem.rotation.x=-.26; stem.userData.part='brainstem'; sculpture.add(stem);
    for(let i=0;i<13;i++){
      const y=-.87+i*.045, points=[];
      for(let j=0;j<=55;j++){
        const a=-Math.PI/2+j/55*Math.PI, width=.54*Math.sqrt(Math.max(.05,1-Math.pow((y+.55)/.42,2)));
        points.push(new THREE.Vector3(Math.sin(a)*width,y+.008*Math.sin(a*8+i),-.71+Math.cos(a)*.43));
      }
      const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),65,.008,4,false),new THREE.MeshStandardMaterial({color:0x708b73,transparent:true,opacity:.6,roughness:.75})); sculpture.add(m); folds.push(m);
    }

    let selection='overview';
    function paint() {
      for(const mesh of surfaces){
        const attr=mesh.geometry.getAttribute('color');
        mesh.userData.regions.forEach((region,i)=>{
          const color=new THREE.Color(palette[region]);
          if(selection!=='overview' && selection!==region) color.lerp(dark,.62);
          attr.setXYZ(i,color.r,color.g,color.b);
        });
        attr.needsUpdate=true;
      }
      for(const [mesh, part] of [[cerebellum,'cerebellum'],[stem,'brainstem']]){
        mesh.material.color.setHex(palette[part]);
        if(selection!=='overview' && selection!==part) mesh.material.color.lerp(dark,.65);
      }
      for(const line of folds) line.material.opacity=selection==='overview'?.55:.40;
      render();
    }
    function render(){ renderer.render(scene,camera); }
    function resize(){const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);render();}
    if(window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize',resize);
    resize(); paint();

    let dragging=false, moved=false, lastX=0, lastY=0;
    canvas.addEventListener('pointerdown',e=>{dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;sculpture.rotation.y+=dx*.01;sculpture.rotation.x=Math.max(-1.2,Math.min(1.2,sculpture.rotation.x+dy*.01));lastX=e.clientX;lastY=e.clientY;render();});
    canvas.addEventListener('pointerup',()=>{dragging=false;});
    canvas.addEventListener('pointercancel',()=>{dragging=false;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(3.6,Math.min(7.4,camera.position.z+e.deltaY*.003));render();},{passive:false});
    function rotate(amount){sculpture.rotation.y+=amount;render();}
    document.getElementById('rotate-left').addEventListener('click',()=>rotate(-.35));
    document.getElementById('rotate-right').addEventListener('click',()=>rotate(.35));
    document.getElementById('reset-view').addEventListener('click',()=>{sculpture.rotation.set(-.12,-.78,-.10);camera.position.z=5.25;render();});
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();rotate(-.18);}else if(e.key==='ArrowRight'){e.preventDefault();rotate(.18);}else if(e.key==='ArrowUp'){e.preventDefault();sculpture.rotation.x=Math.max(-1.2,sculpture.rotation.x-.15);render();}else if(e.key==='ArrowDown'){e.preventDefault();sculpture.rotation.x=Math.min(1.2,sculpture.rotation.x+.15);render();}});
    let spinning=false,frame=0,lastTime=0;
    function animate(time){if(!spinning)return;if(lastTime)sculpture.rotation.y+=(time-lastTime)*.00025;lastTime=time;render();frame=requestAnimationFrame(animate);}
    const spin=document.getElementById('toggle-spin');
    spin.addEventListener('click',()=>{spinning=!spinning;lastTime=0;spin.setAttribute('aria-pressed',String(spinning));spin.setAttribute('aria-label',spinning?'Stop automatic rotation':'Start automatic rotation');spin.textContent=spinning?'Ⅱ':'▶';if(spinning)frame=requestAnimationFrame(animate);else cancelAnimationFrame(frame);});
    window.NeuroNavBrain={select(region){selection=palette[region]?region:'overview';if(region==='occipital'||region==='cerebellum')sculpture.rotation.y=2.35;else if(region==='temporal'||region==='parietal')sculpture.rotation.y=-1.35;else if(region==='frontal')sculpture.rotation.y=-.35;paint();}};
  } catch(error) {
    console.warn('The 3D model could not be displayed.',error);
    fallback.hidden=false; canvas.hidden=true; window.NeuroNavBrain=noop;
  }
})();
