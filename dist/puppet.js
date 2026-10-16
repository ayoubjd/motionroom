/* Layered 2D puppets. Every part is a complete rigid image, attached by two anchors.
   Generated limbs are reconstructed, never obtained by nearest-bone pixel ownership. */
(function () {
  'use strict';
  const M = Motion, clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const labels = ['Torso','Head','Left upper arm','Left forearm + hand','Right upper arm','Right forearm + hand','Left thigh','Left shin + foot','Right thigh','Right shin + foot'];
  const effectiveView=o=>o.characterDef.views[o.view]?o.view:o.characterDef.views.front?'front':Object.keys(o.characterDef.views)[0];
  const order = [6,7,2,3,8,9,0,1,4,5];
  let cache = new WeakMap();
  function canvas(w,h) { const c=document.createElement('canvas'); c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c; }
  function geometry(v) { const width=350*v.width/v.height;return {width,points:Object.fromEntries(Object.entries(v.points).map(([k,p])=>[k,[p[0]*width,p[1]*350]]))}; }
  const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
  const length=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
  function pixels(v) { const im=M.img(v.src),cv=canvas(350*v.width/v.height,350),cx=cv.getContext('2d');cx.drawImage(im,0,0,cv.width,350);return {cv,cx,w:cv.width,h:350,data:cx.getImageData(0,0,cv.width,350).data}; }
  function rgba(r,x,y) { x=clamp(Math.round(x),0,r.w-1);y=clamp(Math.round(y),0,r.h-1);const i=(y*r.w+x)*4;return [...r.data.subarray(i,i+4)]; }
  function color(r,x,y,fallback='#637f85') {
    const bins=new Map();for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const p=rgba(r,x+dx,y+dy);if(p[3]<200)continue;const key=p.slice(0,3).map(n=>Math.round(n/16)).join(',');let bin=bins.get(key);if(!bin)bins.set(key,bin={n:0,s:[0,0,0]});bin.n++;for(let k=0;k<3;k++)bin.s[k]+=p[k];}
    const b=[...bins.values()].sort((a,b)=>b.n-a.n)[0];return b?'#'+b.s.map(n=>Math.round(n/b.n).toString(16).padStart(2,'0')).join(''):fallback;
  }
  function rowSpan(r,y,cx) { y=clamp(Math.round(y),0,349);let x=clamp(Math.round(cx),0,r.w-1);if(rgba(r,x,y)[3]<100){for(let d=1;d<r.w/2;d++){if(rgba(r,x-d,y)[3]>100){x-=d;break}if(rgba(r,x+d,y)[3]>100){x+=d;break}}}let l=x,rr=x;while(l>0&&rgba(r,l-1,y)[3]>100)l--;while(rr<r.w-1&&rgba(r,rr+1,y)[3]>100)rr++;return [l,rr]; }
  function makeGenerated(v,view) {
    const {width,points:p}=geometry(v),r=pixels(v),settings=v.partSettings||{},side=view==='side';
    const torsoSpan=rowSpan(r,p.neck[1]+(p.pelvis[1]-p.neck[1])*.35,p.pelvis[0]);
    const torsoWidth=Math.max(12,side?(torsoSpan[1]-torsoSpan[0])*.9:Math.abs(p.rarm0[0]-p.larm0[0]));
    const armWidth=clamp(torsoWidth*(side?.31:.23),7,35),legWidth=clamp(torsoWidth*(side?.38:.28),9,45);
    const shirt=color(r,p.neck[0],p.neck[1]+(p.pelvis[1]-p.neck[1])*.38);
    const skin=color(r,p.head[0],p.head[1]+8,'#efbf98');
    const all=[];
    for(let i=0;i<10;i++) {
      const [a,b]=M.bones[i],A=p[a],B=p[b],L=Math.max(1,length(A,B)),s=settings[i]||{},factor=clamp(s.width??1,.25,3);
      if(i===1) {
        // A single rigid head/neck image. The clip is editable via Cut from source.
        const cv=canvas(width*2,350*2),cx=cv.getContext('2d');cx.scale(2,2);cx.beginPath();cx.rect(0,0,width,p.neck[1]+2);cx.clip();cx.drawImage(r.cv,0,0,width,350);
        all[i]={image:cv,sourceA:[A[0]*2,A[1]*2],sourceB:[B[0]*2,B[1]*2],width:0,color:skin,generated:true};continue;
      }
      if(i===0) {
        const cv=canvas(width*2,350*2),cx=cv.getContext('2d');cx.scale(2,2);
        const center=(p.larm0[0]+p.rarm0[0])/2,half=torsoWidth*.5*factor,top=Math.min(p.larm0[1],p.rarm0[1])-4,bottom=p.pelvis[1]+8,fill=s.color||shirt;
        cx.beginPath();cx.moveTo(center-half+9,top);cx.quadraticCurveTo(center-half,top,center-half,top+12);cx.lineTo(p.pelvis[0]-half*.88,bottom-8);cx.quadraticCurveTo(p.pelvis[0]-half*.88,bottom,p.pelvis[0]-half*.7,bottom);cx.lineTo(p.pelvis[0]+half*.7,bottom);cx.quadraticCurveTo(p.pelvis[0]+half*.88,bottom,p.pelvis[0]+half*.88,bottom-8);cx.lineTo(center+half,top+12);cx.quadraticCurveTo(center+half,top,center+half-9,top);cx.closePath();cx.fillStyle=fill;cx.fill();
        // A complete clean torso prevents a baked-in arm from reappearing during movement.
        // For patterned clothing, the editor accepts an explicit torso cutout or PNG.
        M.line(cx,[[p.neck[0],p.neck[1]-3],[center,top+8]],skin,Math.max(9,half*.33));
        all[i]={image:cv,sourceA:[A[0]*2,A[1]*2],sourceB:[B[0]*2,B[1]*2],width:torsoWidth,color:fill,generated:true};continue;
      }
      const arm=i<6,lower=[3,5,7,9].includes(i),baseWidth=arm?armWidth:legWidth;
      const radius=baseWidth*factor/2,extra=radius+3,w=radius*2+extra*2+(lower&&!arm?radius:0),h=L+extra*2+(lower?radius*.65:0),cv=canvas(w*2,h*2),cx=cv.getContext('2d');cx.scale(2,2);
      const pivot=[extra+radius,extra],tip=[pivot[0],extra+L],mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;
      const fill=s.color||(arm?(lower?skin:shirt):color(r,mx,my,'#455961'));
      M.line(cx,[pivot,tip],fill,radius*2);
      if(lower&&arm) M.ellipse(cx,tip[0],tip[1]+radius*.28,radius*.88,radius*1.1,fill);
      if(lower&&!arm){const footColor=s.color||color(r,B[0],B[1]+5,'#34474b');M.line(cx,[[tip[0]-(side?radius*.4:radius*.6),tip[1]+radius*.2],[tip[0]+(side?radius*1.35:radius*.6),tip[1]+radius*.2]],footColor,radius*.85);}
      // The generated texture is aligned to the bind bone and has solid overlap at both ends.
      all[i]={image:cv,sourceA:pivot.map(n=>n*2),sourceB:tip.map(n=>n*2),width:radius*2,color:fill,generated:true};
    }
    return {parts:all,width,points:p};
  }
  function parts(o) {
    const v=M.viewData(o),d=o.characterDef;if(!v||!M.img(v.src)?.complete)return null;
    const key=(d.revision||0)+':'+effectiveView(o);
    let entry=cache.get(v),built=entry?.key===key?entry.built:null;
    if(!built){built=Array.from({length:10},(_,i)=>v.puppetParts?.[i]).every(Boolean)?{parts:Array(10).fill(null),...geometry(v)}:makeGenerated(v,effectiveView(o));cache.set(v,{key,built});}
    return built;
  }
  function partData(o,i,built=parts(o)) {
    const v=M.viewData(o),custom=v.puppetParts?.[i];
    if(custom){const im=M.img(custom.src);if(im?.complete&&im.naturalWidth)return {image:im,sourceA:custom.pivot.map((v,k)=>v*[im.naturalWidth,im.naturalHeight][k]),sourceB:custom.tip.map((v,k)=>v*[im.naturalWidth,im.naturalHeight][k]),custom:true,scale:custom.scale||1};}
    return built?.parts[i];
  }
  function drawPart(c,part,A,B,scaleFactor=1) {
    if(!part)return;const sourceLength=length(part.sourceA,part.sourceB);if(sourceLength<.01)return;
    const scale=length(A,B)/sourceLength*scaleFactor;
    c.save();c.translate(...A);c.rotate(angle(A,B)-angle(part.sourceA,part.sourceB));c.scale(scale,scale);c.drawImage(part.image,-part.sourceA[0],-part.sourceA[1]);c.restore();
  }
  M.drawCustom=function(c,o,t) {
    const v=M.viewData(o),im=M.img(v?.src);if(!im?.complete||!im.naturalWidth)return;
    if(o.characterDef.animationMode==='sprite') {c.drawImage(im,0,0,160,350);return;}
    const built=parts(o);if(!built)return;const {physical:{out,width}}=M.customSkeleton(o,t);
    c.save();c.scale(160/width,1);
    for(const i of v.partOrder||order){const [a,b]=M.bones[i];drawPart(c,partData(o,i,built),out[a],out[b]);}
    c.restore();
  };
  const baseReady=M.ready;
  M.ready=async function(p){await baseReady(p);const sources=[];for(const ch of Object.values(p.characters||{}))for(const v of Object.values(ch.views||{}))for(const part of Object.values(v.puppetParts||{}))sources.push(part.src);await Promise.all([...new Set(sources)].map(M.imageReady));};
  // Retarget preset directions into the drawing's bind pose. Custom angles remain offsets.
  const oldAngles=M.pngAngles;
  M.pngAngles=function(o,t){
    if(o.characterDef?.animationMode==='sprite')return Object.fromEntries(['body','head','la','le','ra','re','ll','lk','rl','rk'].map(k=>[k,0]));
    if(['custom','idle'].includes(o.pose))return oldAngles(o,t);
    const v=M.viewData(o),{points:p}=geometry(v),strength=clamp(o.characterDef?.motionStrength??.85,.1,1),side=effectiveView(o)==='side';
    let desired=M.poseAngles({...o,rig:{}},t);
    if(['walk','run','tiptoe'].includes(o.pose)){
      const s=Math.sin(t*(o.pose==='run'?10:6)),stride=(o.pose==='run'?42:29)*strength;
      desired={body:o.pose==='run'?7*strength:0,head:0,la:s*(side?stride*.85:10),ra:-s*(side?stride*.85:10),le:side?-10*strength:-4,re:side?-10*strength:4,ll:side?-s*stride:5+Math.max(0,s)*2,rl:side?s*stride:-5-Math.max(0,-s)*2,lk:Math.max(0,s)*(side?stride*1.4:-16),rk:Math.max(0,-s)*(side?stride*1.4:16)};
    }else for(const k of Object.keys(desired))desired[k]*=strength;
    const result={body:desired.body||0,head:desired.head||0};
    for(const [pre,ks]of Object.entries({larm:['la','le'],rarm:['ra','re'],lleg:['ll','lk'],rleg:['rl','rk']})){
      const upper=angle(p[pre+'0'],p[pre+'1'])*180/Math.PI-90,lower=angle(p[pre+'1'],p[pre+'2'])*180/Math.PI-90;
      result[ks[0]]=(desired[ks[0]]||0)-upper;
      result[ks[1]]=(desired[ks[1]]||0)-(lower-upper);
    }
    Object.assign(result,o.rig||{});return result;
  };
  M.puppet={labels,order,geometry,parts,partData,drawPart,clear:()=>{cache=new WeakMap()},canvas};
})();
