'use strict';

// Anatomical meshes: BodyParts3D, © DBCLS, CC BY-SA 2.1 JP.
// The lightweight GLB reader below handles the uncompressed triangle meshes
// bundled with this project. Region grouping is an educational approximation.
(() => {
  const canvas=document.getElementById('brain-canvas');
  const stage=document.getElementById('brain-stage');
  const fallback=document.getElementById('brain-fallback');
  const noop={select(){},setIsolation(){}};
  if(!window.THREE||!canvas||!Array.isArray(window.NEURO_MESHES)){fallback.hidden=false;window.NeuroNavBrain=noop;return;}

  try {
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,1,.1,100);
    camera.position.set(0,.13,5.25);camera.lookAt(0,.04,0);
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.08;
    scene.add(new THREE.HemisphereLight(0xffffff,0x9b858e,2.1));
    const key=new THREE.DirectionalLight(0xfff4ea,2.3);key.position.set(-3,5,5);scene.add(key);
    const fill=new THREE.DirectionalLight(0xffdce2,1.3);fill.position.set(4,1,2);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,1.1);rim.position.set(0,3,-5);scene.add(rim);
    const sculpture=new THREE.Group();sculpture.rotation.set(-.10,-.95,-.05);scene.add(sculpture);
    const meshes=[];

    function unpack(part){
      const binary=atob(part.data),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const view=new DataView(bytes.buffer);
      if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2)throw new Error('Invalid GLB mesh: '+part.id);
      const jsonLength=view.getUint32(12,true);
      const json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonLength)));
      const binStart=20+jsonLength+8,primitive=json.meshes[0].primitives[0];
      function accessor(index,kind){const a=json.accessors[index],v=json.bufferViews[a.bufferView],offset=binStart+(v.byteOffset||0)+(a.byteOffset||0);return new kind(bytes.buffer,offset,a.count*(a.type==='VEC3'?3:1));}
      const src=accessor(primitive.attributes.POSITION,Float32Array),normals=accessor(primitive.attributes.NORMAL,Float32Array),indexes=accessor(primitive.indices,Uint16Array);
      const positions=new Float32Array(src.length),normalOut=new Float32Array(normals.length),scale=.014;
      for(let i=0;i<src.length;i+=3){
        positions[i]=(src[i]+.525)*scale;positions[i+1]=(src[i+2]-1547.48)*scale;positions[i+2]=(-src[i+1]-79.67)*scale;
        normalOut[i]=normals[i];normalOut[i+1]=normals[i+2];normalOut[i+2]=-normals[i+1];
      }
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
      geometry.setAttribute('normal',new THREE.BufferAttribute(normalOut,3));
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indexes),1));
      geometry.computeBoundingSphere();
      const material=new THREE.MeshStandardMaterial({color:0xe7b9ac,roughness:.68,metalness:0,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geometry,material);mesh.userData.region=part.region;mesh.userData.anatomyId=part.id;
      const bounds=json.accessors[primitive.attributes.POSITION];
      mesh.userData.hemisphere=(bounds.min[0]+bounds.max[0])>=0?'left':'right';
      sculpture.add(mesh);meshes.push(mesh);
    }
    for(const part of window.NEURO_MESHES)unpack(part);
    if(!meshes.length)throw new Error('No anatomical meshes loaded');

    let selection='overview',isolation=55;
    const selectedColors={left:0xe7b9ac,right:0xe7b9ac,frontal:0xf1a897,parietal:0xcbb0db,temporal:0x9fc9c2,occipital:0xe2b693,cerebellum:0xb7c9a8,brainstem:0xe5ae9d};
    function render(){renderer.render(scene,camera);}
    function paint(){
      for(const mesh of meshes){
        const isCortex=!['cerebellum','brainstem'].includes(mesh.userData.region);
        const chosen=selection===mesh.userData.region||((selection==='left'||selection==='right')&&isCortex&&mesh.userData.hemisphere===selection);
        mesh.material.color.setHex(selection==='overview'?0xe7b9ac:chosen?selectedColors[selection]:0xc9bdba);
        mesh.material.opacity=selection==='overview'||chosen?1:Math.max(.12,1-isolation*.0086);
        mesh.material.transparent=mesh.material.opacity<.999;
        mesh.material.depthWrite=!mesh.material.transparent;
        mesh.material.needsUpdate=true;
      }
      render();
    }
    function resize(){const width=Math.max(1,stage.clientWidth),height=Math.max(1,stage.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);render();}
    if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);else window.addEventListener('resize',resize);
    resize();paint();

    let dragging=false,moved=false,lastX=0,lastY=0;
    canvas.addEventListener('pointerdown',e=>{dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;sculpture.rotation.y+=dx*.01;sculpture.rotation.x=Math.max(-1.2,Math.min(1.2,sculpture.rotation.x+dy*.01));lastX=e.clientX;lastY=e.clientY;render();});
    canvas.addEventListener('pointerup',e=>{
      dragging=false;
      if(moved)return;
      const box=canvas.getBoundingClientRect(),point=new THREE.Vector2((e.clientX-box.left)/box.width*2-1,-((e.clientY-box.top)/box.height)*2+1),ray=new THREE.Raycaster();
      ray.setFromCamera(point,camera);const hit=ray.intersectObjects(meshes,false)[0];
      if(hit)document.dispatchEvent(new CustomEvent('neuronav:select',{detail:hit.object.userData.region}));
    });
    canvas.addEventListener('pointercancel',()=>{dragging=false;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=Math.max(3.3,Math.min(7.6,camera.position.z+e.deltaY*.003));render();},{passive:false});
    function rotate(n){sculpture.rotation.y+=n;render();}
    function zoom(n){camera.position.z=Math.max(3.3,Math.min(7.6,camera.position.z+n));render();}
    document.getElementById('rotate-left').addEventListener('click',()=>rotate(-.35));
    document.getElementById('rotate-right').addEventListener('click',()=>rotate(.35));
    document.getElementById('zoom-in').addEventListener('click',()=>zoom(-.45));
    document.getElementById('zoom-out').addEventListener('click',()=>zoom(.45));
    document.getElementById('reset-view').addEventListener('click',()=>{sculpture.rotation.set(-.10,-.95,-.05);camera.position.z=5.25;render();});
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();rotate(-.18);}else if(e.key==='ArrowRight'){e.preventDefault();rotate(.18);}else if(e.key==='ArrowUp'){e.preventDefault();sculpture.rotation.x=Math.max(-1.2,sculpture.rotation.x-.15);render();}else if(e.key==='ArrowDown'){e.preventDefault();sculpture.rotation.x=Math.min(1.2,sculpture.rotation.x+.15);render();}});
    let spinning=false,frame=0,lastTime=0;
    function animate(time){if(!spinning)return;if(lastTime)sculpture.rotation.y+=(time-lastTime)*.00025;lastTime=time;render();frame=requestAnimationFrame(animate);}
    const spin=document.getElementById('toggle-spin');
    spin.addEventListener('click',()=>{spinning=!spinning;lastTime=0;spin.setAttribute('aria-pressed',String(spinning));spin.setAttribute('aria-label',spinning?'Stop automatic rotation':'Start automatic rotation');spin.textContent=spinning?'Ⅱ':'▶';if(spinning)frame=requestAnimationFrame(animate);else cancelAnimationFrame(frame);});
    window.NeuroNavBrain={
      select(region){selection=Object.hasOwn(selectedColors,region)?region:'overview';if(region==='occipital'||region==='cerebellum')sculpture.rotation.y=2.35;else if(region==='left')sculpture.rotation.y=-1.50;else if(region==='right')sculpture.rotation.y=1.50;else if(region==='temporal'||region==='parietal')sculpture.rotation.y=-1.35;else if(region==='frontal')sculpture.rotation.y=-.35;paint();},
      setIsolation(value){isolation=Math.max(0,Math.min(100,Number(value)||0));paint();}
    };
  }catch(error){
    console.warn('The interactive model is unavailable; showing its anatomical preview.',error);
    fallback.hidden=false;canvas.hidden=true;stage.classList.add('unavailable');
    stage.setAttribute('aria-label','Anatomical brain preview. Interactive controls need WebGL.');
    for(const id of ['rotate-left','rotate-right','zoom-in','zoom-out','reset-view','toggle-spin','isolation']){
      const control=document.getElementById(id);if(control)control.disabled=true;
    }
    window.NeuroNavBrain=noop;
  }
})();
