/* Character studio: rig a reference, assemble complete parts, then test the puppet. */
(function(){
  'use strict';
  const M=Motion, P=M.puppet, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let state=null,animation=0;
  const cycle=()=>state?.pose==='run'?Math.PI/5:['walk','tiptoe'].includes(state?.pose)?Math.PI/3:2;
  const view=()=>state?.character.views[state.view];
  const object=()=>({...M.make('character'),characterDef:state.character,characterId:state.character.id,view:state.view,pose:state.pose,rig:{}});
  const dataURL=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Could not read the image.'));r.readAsDataURL(file)});
  async function readImage(file){if(!file)return null;if(!['image/png','image/webp','image/jpeg'].includes(file.type))throw Error('Choose a PNG, WebP or JPEG.');if(file.size>20*1024*1024)throw Error('Choose an image smaller than 20 MB.');const src=await dataURL(file),im=new Image();im.src=src;await im.decode();return {src,width:im.naturalWidth,height:im.naturalHeight};}
  function revised(){state.character.revision=(state.character.revision||0)+1;P.clear();}
  function open(id){
    stop();state={character:id?clone(project.characters[id]):{id:'character_'+Math.random().toString(36).slice(2,10),name:'My character',revision:0,motionStrength:.85,animationMode:'puppet',views:{}},view:'front',joint:'head',part:0,display:'rig',pose:'walk',time:0,playing:false,tool:'joint',polygon:[],anchor:'pivot',busy:false};
    if(!state.character.views.front)state.view=Object.keys(state.character.views)[0]||'front';
    state.character.animationMode||='puppet';
    modal(`<div class="puppet-heading"><div><h2>Character studio <span class="pill">LAYERED PUPPET</span></h2><p>1. Upload a view & place joints. &nbsp; 2. Refine the parts. &nbsp; 3. Test the motion.</p></div><button id="builderCancel">Close</button></div>
    <div class="puppet-layout"><div class="puppet-workbench"><div class="builder-tabs">${['front','back','side'].map(v=>`<button data-builder-view="${v}">${v}</button>`).join('')}</div>
    <div class="puppet-display"><button data-display="rig">Reference & joints</button><button data-display="puppet">Assembled puppet</button><button data-display="part">Selected part</button></div>
    <div class="puppet-canvas-wrap"><canvas id="rigCanvas" width="800" height="640"></canvas><p id="rigCanvasNote"></p></div>
    <div class="puppet-playback"><button id="builderPreviewBtn">▶ Test motion</button><select id="builderPose" aria-label="Preview movement">${['idle','walk','run','wave','sit','sleep','jump','dance','custom'].map(v=>`<option ${v==='walk'?'selected':''}>${v}</option>`).join('')}</select><input id="puppetTime" type="range" min="0" max="2" step="0.01" value="0" aria-label="Motion preview time"><span id="puppetTimeLabel">0.00 s</span></div>
    <div class="puppet-cut-controls" id="cutControls" hidden><button id="finishCut">Use this cutout</button><button id="undoCut">Undo point</button><button id="cancelCut">Cancel cutout</button></div></div>
    <aside class="puppet-controls"><label class="field">Character name<input id="builderName" value="${esc(state.character.name)}"></label>
    <label class="field">Animation method<select id="animationMode"><option value="puppet">Layered puppet · joint animation</option><option value="sprite">Original PNG · move along a path</option></select></label>
    <button id="uploadView" class="primary wide">Upload ${state.view} image</button><input id="builderFile" type="file" accept="image/png,image/webp,image/jpeg" hidden><p id="viewStatus" class="note"></p>
    <details open><summary>Joint placement</summary><div class="row"><button id="builderReset">✦ Auto rig</button><button id="builderCopy">Copy front joints</button></div><div class="jointlist">${Object.entries(M.pointLabels).map(([k,v])=>`<button data-joint="${k}">${v}</button>`).join('')}</div><p class="note">Drag the markers on the reference. Joints do not cut the image; parts attach at these points.</p></details>
    <details open><summary>Separate body parts</summary><label class="field">Part<select id="puppetPart">${P.labels.map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select></label><p id="partStatus" class="note"></p>
    <div class="row"><button id="partUpload">Upload part PNG</button><button id="partCut">Cut from source</button></div><input id="partFile" type="file" accept="image/png,image/webp,image/jpeg" hidden>
    <div id="partOptions"></div><div class="row"><button id="partBack">Send behind</button><button id="partFront">Bring in front</button></div><button id="partReset" class="wide">Use generated part</button>
    <p class="note">Automatic torso and limbs are rebuilt as solid parts using your colors. For the exact clothing or silhouette, upload isolated parts or outline a visible part with Cut from source. Include extra pixels around joints for overlap.</p></details>
    <label class="field">Movement strength<input id="motionStrength" type="range" min="0.1" max="1" step="0.05" value="${state.character.motionStrength??.85}"></label>
    <p class="note">Front/back motion is a forward march. Use a side view for a side-on walk. Hidden artwork cannot be recovered from a flat PNG.</p></aside></div>
    <div class="builder-actions"><p class="note">Your original images stay in the project. Milo remains in the library.</p><button id="builderSave" class="primary">Save character</button></div>`);
    $('#modal').classList.add('puppetDialog');
    $('#animationMode').value=state.character.animationMode;
    $$('[data-builder-view]').forEach(b=>b.onclick=()=>{pause();state.view=b.dataset.builderView;state.tool='joint';state.polygon=[];update()});
    $$('[data-display]').forEach(b=>b.onclick=()=>{state.display=b.dataset.display;if(state.display!=='puppet')pause();state.tool='joint';state.polygon=[];update()});
    $$('[data-joint]').forEach(b=>b.onclick=()=>{pause();state.display='rig';state.tool='joint';state.joint=b.dataset.joint;update()});
    $('#builderCancel').onclick=()=>$('#modal').close();
    $('#uploadView').onclick=()=>{$('#builderFile').value='';$('#builderFile').click()};
    $('#builderFile').onchange=async e=>{
      const currentState=state,currentView=state.view;busy(true);
      try{const image=await readImage(e.target.files[0]);if(!image)return;const auto=await M.autoRigImage(image.src,currentView);if(state!==currentState)return;state.character.views[currentView]={...auto,originalSrc:image.src};revised();await ready();state.display='rig';update();}
      catch(e){toast(e.message)}finally{if(state===currentState)busy(false)}
    };
    $('#builderReset').onclick=async()=>{const v=view();if(!v)return toast('Upload this view first.');const currentState=state;busy(true);try{Object.assign(v,await M.autoRigImage(v.src,state.view));if(state!==currentState)return;revised();state.display='rig';update()}catch(e){toast(e.message)}finally{if(state===currentState)busy(false)}};
    $('#builderCopy').onclick=()=>{if(!view()||!state.character.views.front)return toast('Upload both views first.');pause();view().points=clone(state.character.views.front.points);revised();state.display='rig';update()};
    $('#animationMode').onchange=e=>{state.character.animationMode=e.target.value;state.display='puppet';update()};
    $('#builderPreviewBtn').onclick=()=>{if(!view())return toast('Upload an image first.');if(state.playing){pause();return}state.display='puppet';state.playing=true;state.last=performance.now();update();tick(state.last)};
    $('#builderPose').onchange=e=>{state.pose=e.target.value;state.time=0;state.display='puppet';update()};
    $('#puppetTime').oninput=e=>{pause();state.time=Number(e.target.value);state.display='puppet';update()};
    $('#motionStrength').oninput=e=>{state.character.motionStrength=Number(e.target.value);draw()};
    $('#puppetPart').onchange=e=>{state.part=Number(e.target.value);state.display='part';state.tool='joint';state.polygon=[];pause();update()};
    $('#partUpload').onclick=()=>{if(!view())return toast('Upload the character reference first.');$('#partFile').value='';$('#partFile').click()};
    $('#partFile').onchange=async e=>{const currentState=state,v=view(),i=state.part;busy(true);try{const data=await readImage(e.target.files[0]);if(!data)return;v.puppetParts??={};const anchors=i===0?{pivot:[.5,.9],tip:[.5,.1]}:i===1?{pivot:[.5,.9],tip:[.5,.4]}:{pivot:[.5,.15],tip:[.5,.85]};v.puppetParts[i]={...data,...anchors,scale:1};if(state!==currentState)return;revised();await ready();state.display='part';pause();update()}catch(e){toast(e.message)}finally{if(state===currentState)busy(false)}};
    $('#partCut').onclick=()=>{if(!view())return toast('Upload a reference first.');pause();state.display='rig';state.tool='cut';state.polygon=[];update()};
    $('#finishCut').onclick=finishCut;$('#undoCut').onclick=()=>{state.polygon.pop();draw()};$('#cancelCut').onclick=()=>{state.tool='joint';state.polygon=[];update()};
    $('#partReset').onclick=()=>{if(!view())return;delete view().puppetParts?.[state.part];delete view().partSettings?.[state.part];revised();update()};
    function reorder(top){if(!view())return;view().partOrder=(view().partOrder||P.order).filter(i=>i!==state.part);top?view().partOrder.push(state.part):view().partOrder.unshift(state.part);state.display='puppet';revised();update()}
    $('#partFront').onclick=()=>reorder(true);$('#partBack').onclick=()=>reorder(false);
    $('#builderSave').onclick=()=>{if(state.busy)return;if(!Object.keys(state.character.views).length)return toast('Upload a character view first.');const issue=validateRig(state.character);if(issue)return toast(issue);remember();state.character.name=$('#builderName').value.trim()||'My character';state.character.deformation='layered';state.character.rigVersion=4;revised();project.characters??={};project.characters[state.character.id]=clone(state.character);$('#modal').close();changed();renderLibrary();toast('Layered character saved. Your scenes use the new puppet.')};
    const cv=$('#rigCanvas');cv.onpointerdown=pointerDown;cv.onpointermove=pointerMove;cv.onpointerup=cv.onpointercancel=()=>{if(state)state.drag=null};
    update();ready().then(()=>{if(state)update()});
  }
  function busy(on){if(!state)return;state.busy=on;for(const id of ['builderSave','uploadView','builderReset','partUpload'])$('#'+id).disabled=on;$('#builderSave').textContent=on?'Preparing image…':'Save character';}
  function validateRig(ch){for(const v of Object.values(ch.views))for(const part of Object.values(v.puppetParts||{})){if(Math.hypot((part.pivot[0]-part.tip[0])*part.width,(part.pivot[1]-part.tip[1])*part.height)<1)return 'Separate the Root and End markers on each imported part.';}for(const v of Object.values(ch.views))for(const [a,b]of M.bones){if(!v.points[a]||!v.points[b]||Math.hypot((v.points[a][0]-v.points[b][0])*v.width,(v.points[a][1]-v.points[b][1])*v.height)<1)return 'Separate the '+M.pointLabels[a]+' and '+M.pointLabels[b]+' markers before saving.';}return null;}
  async function ready(){if(state)await M.ready({characters:{[state.character.id]:state.character},images:{},frames:[]})}
  function pause(){cancelAnimationFrame(animation);if(state)state.playing=false;if($('#builderPreviewBtn'))$('#builderPreviewBtn').textContent='▶ Test motion'}
  function tick(now){if(!state?.playing||!$('#modal').open)return;state.time=(state.time+Math.min(.1,(now-state.last)/1000))%cycle();state.last=now;draw();animation=requestAnimationFrame(tick)}
  function fit(w,h){const cv=$('#rigCanvas'),scale=Math.min((cv.width-160)/w,(cv.height-120)/h);return {x:(cv.width-w*scale)/2,y:(cv.height-h*scale)/2,w:w*scale,h:h*scale,scale};}
  function pointer(e,rect){const cv=$('#rigCanvas'),r=cv.getBoundingClientRect();return [((e.clientX-r.left)*cv.width/r.width-rect.x)/rect.w,((e.clientY-r.top)*cv.height/r.height-rect.y)/rect.h]}
  function pointerDown(e){if(!state||!view()||state.busy)return;const cv=$('#rigCanvas');cv.setPointerCapture(e.pointerId);pause();
    if(state.display==='part'){const part=view().puppetParts?.[state.part];if(!part)return;const q=pointer(e,fit(part.width,part.height));state.anchor=['pivot','tip'].find(k=>Math.hypot((part[k][0]-q[0])*part.width,(part[k][1]-q[1])*part.height)<20/fit(part.width,part.height).scale)||state.anchor;state.drag='anchor';part[state.anchor]=q.map(n=>clamp(n,-2,3));revised();updatePartOptions();draw();return}
    if(state.display!=='rig')return;const q=pointer(e,fit(view().width,view().height));if(state.tool==='cut'){state.polygon.push(q.map(n=>clamp(n,0,1)));draw();return}
    const near=Object.keys(view().points).find(k=>Math.hypot((view().points[k][0]-q[0])*fit(view().width,view().height).w,(view().points[k][1]-q[1])*fit(view().width,view().height).h)<15);if(near)state.joint=near;state.drag='joint';view().points[state.joint]=q.map(n=>clamp(n,0,1));revised();update();
  }
  function pointerMove(e){if(!state?.drag)return;const v=view();if(state.drag==='joint')v.points[state.joint]=pointer(e,fit(v.width,v.height)).map(n=>clamp(n,0,1));else{const part=v.puppetParts[state.part];part[state.anchor]=pointer(e,fit(part.width,part.height)).map(n=>clamp(n,-2,3));}revised();draw();}
  async function finishCut(){const v=view();if(!v||state.polygon.length<3)return toast('Click at least 3 points around the part.');const poly=state.polygon,im=M.img(v.src),xs=poly.map(p=>p[0]*v.width),ys=poly.map(p=>p[1]*v.height),x=Math.floor(Math.min(...xs)),y=Math.floor(Math.min(...ys)),w=Math.ceil(Math.max(...xs))-x,h=Math.ceil(Math.max(...ys))-y;if(w<2||h<2)return toast('Draw a larger cutout.');const cv=P.canvas(w,h),cx=cv.getContext('2d');cx.beginPath();poly.forEach((p,i)=>i?cx.lineTo(p[0]*v.width-x,p[1]*v.height-y):cx.moveTo(p[0]*v.width-x,p[1]*v.height-y));cx.closePath();cx.clip();cx.drawImage(im,-x,-y);const [a,b]=M.bones[state.part],anchor=k=>[(v.points[k][0]*v.width-x)/w,(v.points[k][1]*v.height-y)/h];v.puppetParts??={};v.puppetParts[state.part]={src:cv.toDataURL('image/png'),width:w,height:h,pivot:anchor(a),tip:anchor(b),scale:1};state.tool='joint';state.polygon=[];state.display='part';revised();await ready();update();}
  function updatePartOptions(){const v=view(),part=v?.puppetParts?.[state.part],host=$('#partOptions');if(!host)return;
    $('#partStatus').textContent=!v?'Upload a reference to build the parts.':part?'Separate artwork · rigid rotation, no deformation':state.part===1?'Original head · rigid image':'Generated solid part · editable width & color';
    if(part){host.innerHTML=`<p class="note">Place the orange root at the connecting joint, and the blue end at the next joint. The part scales uniformly between them.</p><div class="row"><button data-anchor="pivot" class="${state.anchor==='pivot'?'active':''}">● Root</button><button data-anchor="tip" class="${state.anchor==='tip'?'active':''}">● End</button></div>`;$$('[data-anchor]').forEach(b=>b.onclick=()=>{state.anchor=b.dataset.anchor;state.display='part';update()});}
    else if(v&&state.part!==1){const generated=P.parts(object())?.parts[state.part],settings=v.partSettings?.[state.part]||{};host.innerHTML=`<label class="field">Width<input id="partWidth" type="range" min="0.25" max="3" step="0.05" value="${settings.width||1}"></label><label class="field">Part color<input id="partColor" type="color" value="${settings.color||generated?.color||'#637f85'}"></label>`;for(const [id,key]of [['partWidth','width'],['partColor','color']])$('#'+id).oninput=e=>{v.partSettings??={};v.partSettings[state.part]??={};v.partSettings[state.part][key]=key==='width'?Number(e.target.value):e.target.value;revised();draw()};}
    else host.innerHTML='<p class="note">Use a source cutout or upload to replace this part.</p>';
  }
  function update(){if(!state||!$('#rigCanvas'))return;const v=view();$$('[data-builder-view]').forEach(b=>{b.classList.toggle('active',b.dataset.builderView===state.view);b.textContent=b.dataset.builderView+(state.character.views[b.dataset.builderView]?' ✓':'')});$$('[data-display]').forEach(b=>b.classList.toggle('active',b.dataset.display===state.display));$$('[data-joint]').forEach(b=>b.classList.toggle('active',b.dataset.joint===state.joint));$('#uploadView').textContent='Upload '+state.view+' image';$('#viewStatus').textContent=v?`${v.width} × ${v.height} · ${v.autoRig?.message||'Existing joints preserved.'}`:'No image in this view yet.';$('#builderPreviewBtn').textContent=state.playing?'Ⅱ Pause test':'▶ Test motion';$('#cutControls').hidden=state.tool!=='cut';updatePartOptions();draw();}
  function draw(){if(!state||!$('#rigCanvas'))return;const cv=$('#rigCanvas'),c=cv.getContext('2d'),v=view();c.clearRect(0,0,cv.width,cv.height);$('#puppetTime').max=cycle();$('#puppetTime').value=state.time;$('#puppetTimeLabel').textContent=state.time.toFixed(2)+' s';if(!v){c.fillStyle='#8f9eaa';c.font='20px Arial';c.textAlign='center';c.fillText('Upload a standing character to begin',cv.width/2,cv.height/2);return;}const rect=fit(v.width,v.height),im=M.img(v.src);if(!im?.complete)return;
    if(state.display==='puppet'){const o=object();Object.assign(o,{x:rect.x+rect.w/2,y:rect.y+rect.h/2,w:rect.w,h:rect.h});M.drawObject(c,o,state.time);$('#rigCanvasNote').textContent=state.character.animationMode==='sprite'?'Original artwork — use a path to move it.':'Assembled puppet · '+state.pose+' · complete parts rotate at the joints';return;}
    if(state.display==='part'){const o=object(),built=P.parts(o),data=P.partData(o,state.part,built);if(!data)return;const w=data.image.naturalWidth||data.image.width,h=data.image.naturalHeight||data.image.height,r=fit(w,h);c.drawImage(data.image,r.x,r.y,r.w,r.h);const A=[r.x+data.sourceA[0]*r.scale,r.y+data.sourceA[1]*r.scale],B=[r.x+data.sourceB[0]*r.scale,r.y+data.sourceB[1]*r.scale];M.line(c,[A,B],'#e88962',2);M.ellipse(c,...A,9,9,'#ef9067','#fff',2);M.ellipse(c,...B,9,9,'#529fdb','#fff',2);$('#rigCanvasNote').textContent=P.labels[state.part]+(data.custom?' · drag Root / End markers to align the part':' · generated as a complete part');return;}
    c.drawImage(im,rect.x,rect.y,rect.w,rect.h);const p=k=>[rect.x+v.points[k][0]*rect.w,rect.y+v.points[k][1]*rect.h];M.bones.forEach(([a,b])=>M.line(c,[p(a),p(b)],'#e58f65',2));Object.keys(v.points).forEach(k=>M.ellipse(c,...p(k),k===state.joint?8:5,k===state.joint?8:5,k===state.joint?'#f8b965':'#fff','#905b40',2));
    if(state.tool==='cut'){const points=state.polygon.map(p=>[rect.x+p[0]*rect.w,rect.y+p[1]*rect.h]);if(points.length){M.poly(c,points,'#57b4ac33','#63c5b7',2);points.forEach(p=>M.ellipse(c,...p,4,4,'#63c5b7'));}$('#rigCanvasNote').textContent='Outline '+P.labels[state.part]+' with clicks, then choose Use this cutout.';}else $('#rigCanvasNote').textContent=M.pointLabels[state.joint]+' · drag a marker or click to place the selected joint';
  }
  $('#modal').addEventListener('close',()=>{pause();state=null;$('#modal').classList.remove('puppetDialog')});
  const earlierValidate=validateProject;
  validateProject=function(p){p=earlierValidate(p);for(const ch of Object.values(p.characters||{})){
    if(ch.animationMode&&!['puppet','sprite'].includes(ch.animationMode))throw Error('Unknown character animation method.');
    for(const v of Object.values(ch.views)){
      if(v.partOrder&&(!Array.isArray(v.partOrder)||v.partOrder.length!==10||new Set(v.partOrder).size!==10||v.partOrder.some(i=>!Number.isInteger(i)||i<0||i>9)))throw Error('Invalid character part order.');
      for(const [key,part]of Object.entries(v.puppetParts||{})){
        if(!/^[0-9]$/.test(key)||!part||!/^data:image\/(png|jpeg|webp);base64,/.test(part.src)||!(part.width>0)||!(part.height>0))throw Error('Invalid character part image.');
        for(const anchor of ['pivot','tip'])if(!Array.isArray(part[anchor])||part[anchor].length!==2||part[anchor].some(n=>!Number.isFinite(n)||Math.abs(n)>100))throw Error('Invalid character part anchors.');
        if(Math.hypot((part.pivot[0]-part.tip[0])*part.width,(part.pivot[1]-part.tip[1])*part.height)<.01)throw Error('A body part has coincident anchors.');
      }
      for(const [key,value]of Object.entries(v.partSettings||{})){if(!/^[0-9]$/.test(key)||!value||value.width!==undefined&&(!Number.isFinite(value.width)||value.width<.25||value.width>3)||value.color!==undefined&&!/^#[0-9a-f]{6}$/i.test(value.color))throw Error('Invalid character part settings.');}
    }
  }return p;};
  window.CharacterBuilder={open,validateRig};
})();
