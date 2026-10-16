/* One articulated vector rig, shared by every configurable avatar. */
(function(){'use strict';const M=Motion,E=M.ellipse,L=M.line,R=M.rr,P=M.poly;
const defaults={style:'classic',head:'round',hair:'side',hairColor:'#40342f',skin:'#e7b18b',outfit:'tee',top:'#588f86',bottom:'#344d63',shoes:'#303b47',accessory:'none'};
const options={style:['classic','paper','ink','robot','cat','bear'],head:['round','oval','square'],hair:['side','crop','curly','long','bob','bun','spiky','ponytail','braids','afro','mohawk','wavy','none'],outfit:['none','tee','hoodie','jacket','suit','dress','overalls','striped','jersey','vest','coat','cardigan','polo','dungaree-dress'],accessory:['none','glasses','cap','beanie','scarf','headphones','sunglasses','bow','crown','bandana','earrings','necklace','backpack','tie']};
const palettes={skin:['#f6dcc6','#e7b18b','#cf966e','#ad7553','#82553f','#593e32','#a0bfbd','#d6a8ba'],hairColor:['#242b32','#40342f','#79513a','#c28d50','#e3c883','#b75e42','#dedbd4','#8569ad'],top:['#588f86','#b65b54','#cf9b4c','#4f78aa','#8d6b9c','#e0c8a0','#38404c','#e9e6d9','#d986aa','#79a9b9'],bottom:['#344d63','#424851','#927c63','#5c7060','#9b6976','#d4b99a','#252d37','#6a5b8b'],shoes:['#303b47','#e5ded2','#8d6548','#bb5650','#4e7b78','#d5aa65']};
const presetData=[
['Nora','classic',{hair:'bob',top:'#b65b54',outfit:'jacket',skin:'#ad7553'}],['Leo','classic',{hair:'curly',outfit:'hoodie',top:'#cf9b4c'}],['Aya','classic',{hair:'bun',skin:'#82553f',top:'#8d6b9c',outfit:'overalls'}],['Oliver','classic',{hair:'crop',hairColor:'#c28d50',accessory:'glasses',outfit:'suit'}],['Ruby','classic',{hair:'long',hairColor:'#b75e42',outfit:'dress',top:'#4f78aa'}],['Noah','classic',{hair:'spiky',skin:'#593e32',outfit:'jersey',top:'#79a9b9'}],
['Fern','paper',{hair:'side',hairColor:'#79513a',outfit:'striped',top:'#588f86',bottom:'#927c63'}],['Sunny','paper',{hair:'bun',skin:'#cf966e',outfit:'dress',top:'#cf9b4c'}],['Scout','paper',{hair:'crop',accessory:'cap',outfit:'overalls',top:'#b65b54'}],
['Pip','ink',{hair:'spiky',skin:'#f6dcc6',top:'#e9e6d9',bottom:'#252d37'}],['Dot','ink',{hair:'bob',head:'oval',outfit:'striped',top:'#e9e6d9'}],['Professor','ink',{hair:'none',accessory:'glasses',outfit:'suit',hairColor:'#dedbd4'}],
['Bolt','robot',{head:'square',hair:'none',skin:'#a0bfbd',top:'#4f78aa',outfit:'tee'}],['Nova','robot',{head:'round',hair:'none',skin:'#d6a8ba',top:'#8d6b9c',accessory:'headphones'}],['Rusty','robot',{head:'square',hair:'none',skin:'#cf966e',top:'#cf9b4c'}],
['Mochi','cat',{hair:'none',skin:'#e7b18b',outfit:'hoodie',top:'#8d6b9c'}],['Midnight','cat',{hair:'none',skin:'#593e32',top:'#4f78aa',outfit:'jacket'}],['Maple','bear',{hair:'none',skin:'#ad7553',outfit:'overalls',top:'#588f86'}],['Snow','bear',{hair:'none',skin:'#f6dcc6',outfit:'striped',top:'#b65b54'}]
];
const presets=presetData.map(([name,style,config],i)=>({id:'avatar_preset_'+i,name,avatar:{...defaults,style,...config},views:{},revision:1}));
const clean=input=>{const a={...defaults};for(const k of Object.keys(options))if(options[k].includes(input?.[k]))a[k]=input[k];for(const k of Object.keys(palettes))if(/^#[0-9a-f]{6}$/i.test(input?.[k]))a[k]=input[k];return a};
function render(c,o,t){const a=clean(o.characterDef.avatar),customHead=o.characterDef.heads?.[o.view]||o.characterDef.heads?.front,angles=M.poseAngles(o,t),side=o.view==='side',back=o.view==='back',ink=a.style==='ink'?'#25282a':'#344047',sw=a.style==='ink'?3:0;
const skin=a.skin,hair=a.hairColor,shirt=a.outfit==='none'?skin:a.top,pants=a.outfit==='none'?skin:a.bottom;
function line(pts,col,w){if(sw)L(c,pts,ink,w+sw*2);L(c,pts,col,w)}
function limb(x,y,l1,l2,r1,r2,leg,rear){c.save();c.translate(x,y);c.rotate(M.rad(r1));const width=leg?20:17;line([[0,0],[0,l1]],leg?pants:shirt,width);if(a.style==='robot')E(c,0,l1,11,11,skin,ink,2);c.translate(0,l1);c.rotate(M.rad(r2));line([[0,0],[0,l2]],leg?pants:['hoodie','jacket','suit','striped','coat','cardigan'].includes(a.outfit)?shirt:skin,width-3);if(leg)R(c,side?-7:-12,l2-4,side?30:25,12,4,a.outfit==='none'?skin:a.shoes,sw?ink:null,sw);else E(c,0,l2,7,9,skin,sw?ink:null,sw);c.restore()}
c.save();c.translate(80,130);c.rotate(M.rad(angles.body));c.translate(0,-130);
if(['cat','bear'].includes(a.style)){c.save();L(c,[[-16,214],[-43,234],[-51,210]],skin,12);c.restore()}
if(a.accessory==='backpack'){R(c,side?-44:-48,131,side?32:96,78,13,a.bottom,ink,2)}
limb(side?-5:-21,226,58,58,angles.ll,angles.lk,true,true);limb(side?-6:-40,128,54,50,angles.la,angles.le,false,true);
limb(side?5:21,226,58,58,angles.rl,angles.rk,true,false);
const width=side?50:82;R(c,-width/2,117,width,116,a.style==='robot'?9:18,shirt,sw?ink:null,sw);
if(a.style==='paper'){P(c,[[-width/2+4,127],[-width/2+10,218],[0,232],[-width/2+2,230]],'#00000012');L(c,[[width/2-5,131],[width/2-7,221]],'#ffffff55',2)}
if(a.outfit==='striped'){for(let y=140;y<225;y+=18)L(c,[[-width/2+3,y],[width/2-3,y]],'#ffffff80',6)}
if(a.outfit==='hoodie'){L(c,[[-14,122],[-4,146],[12,122]],skin,5);L(c,[[-8,133],[-8,158]],'#eee6d9',2);L(c,[[8,133],[8,158]],'#eee6d9',2);R(c,-width*.3,180,width*.6,22,7,'#00000020')}
if(['jacket','suit'].includes(a.outfit)){P(c,[[-16,120],[0,162],[17,120]],'#eee6d9');L(c,[[0,163],[0,227]],'#00000050',2);if(a.outfit==='suit')P(c,[[0,132],[-5,141],[0,166],[5,141]],'#a5534e')}
if(a.outfit==='overalls'){R(c,-width*.37,159,width*.74,72,4,pants);L(c,[[-width*.28,121],[-width*.25,175]],pants,9);L(c,[[width*.28,121],[width*.25,175]],pants,9);E(c,-width*.25,164,3,3,'#e6c28a');E(c,width*.25,164,3,3,'#e6c28a')}
if(['dress','dungaree-dress'].includes(a.outfit))P(c,[[-width*.36,167],[width*.36,167],[width*.64,255],[-width*.64,255]],shirt,sw?ink:null,sw);
if(['vest','coat','cardigan'].includes(a.outfit)){const hem=a.outfit==='coat'?262:230;R(c,-width/2,121,width,hem-121,10,shirt);P(c,[[-13,119],[0,163],[13,119]],'#eee6d9');L(c,[[0,158],[0,hem]],a.bottom,3);for(let y=177;y<hem;y+=19)E(c,4,y,2.5,2.5,a.bottom);L(c,[[-width*.38,194],[-width*.13,194]],a.bottom,3)}
if(a.outfit==='polo'){P(c,[[-18,118],[0,136],[-8,143]],'#ffffffaa');P(c,[[18,118],[0,136],[8,143]],'#ffffffaa');L(c,[[0,136],[0,159]],a.bottom,2)}
if(a.outfit==='dungaree-dress'){R(c,-width*.3,149,width*.6,44,4,pants);L(c,[[-width*.24,121],[-width*.24,165]],pants,8);L(c,[[width*.24,121],[width*.24,165]],pants,8)}
if(a.accessory==='tie'&&!back)P(c,[[0,122],[-6,133],[0,178],[6,133]],a.bottom);
if(a.accessory==='necklace'&&!back){L(c,[[-17,120],[-12,142],[0,153],[12,142],[17,120]],'#d6b15c',3);E(c,0,156,5,7,'#d6b15c')}
if(a.outfit==='jersey'&&!back){c.fillStyle='#f4ece0';c.font='bold 29px Arial';c.textAlign='center';c.fillText('07',0,178)}
if(a.style==='robot'){R(c,-width*.28,145,width*.56,36,5,'#293f4b');E(c,-7,161,4,4,'#8be1c4');E(c,7,161,4,4,'#ecc570')}
limb(side?6:40,128,54,50,angles.ra,angles.re,false,false);
line([[0,104],[0,125]],skin,19);
c.save();c.translate(0,113);c.rotate(M.rad(angles.head));c.translate(0,-47);
if(customHead){const im=M.img(customHead.src);if(im?.complete&&im.naturalWidth){const h=100*(customHead.scale||1),w=h*customHead.width/customHead.height;c.save();c.translate(customHead.offsetX||0,customHead.offsetY||0);if(side&&customHead.flip)c.scale(-1,1);if(M.headExpressions)M.headExpressions.draw(c,customHead,o,t,-w/2,47-h,w,h);else c.drawImage(im,-w/2,47-h,w,h);c.restore()}}
else{
const hx=side?5:0,hw=side?32:a.head==='oval'?34:43;
function hairShape(){const col=hair;
 if(['long','wavy','bob'].includes(a.hair)){R(c,side?-34:hx-hw-6,-37,side?29:hw*2+10,a.hair==='bob'?80:110,side?12:25,col)}
 if(a.hair==='ponytail'){E(c,side?-35:-31,-24,15,20,col);R(c,side?-54:-49,-21,23,78,12,col)}
 if(a.hair==='braids'){for(const x of side?[-29]:[-40,40])for(let y=0;y<70;y+=12)E(c,x,y,10,10,col)}
 if(a.hair==='bun')E(c,side?-24:0,-52,19,19,col);
 if(a.hair==='afro')E(c,hx-3,-13,hw+15,57,col,sw?ink:null,sw);
}
hairShape();
if(a.style==='cat'){P(c,[[-36,-20],[-43,-61],[-12,-39]],skin,ink,sw||1);if(!side)P(c,[[16,-39],[40,-62],[38,-12]],skin,ink,sw||1)}
if(a.style==='bear'){E(c,side?-23:-33,-37,18,18,skin,sw?ink:null,sw);if(!side)E(c,33,-37,18,18,skin,sw?ink:null,sw)}
if(a.head==='square')R(c,hx-hw,-43,hw*2,90,17,skin,sw?ink:null,sw);else E(c,hx,0,hw,46,skin,sw?ink:null,sw);
if(side){P(c,[[32,6],[44,17],[32,22]],skin,sw?ink:null,sw)}else{E(c,-43,9,7,12,skin);E(c,43,9,7,12,skin)}
if(a.hair!=='none'&&a.style!=='robot'){
 c.save();c.translate(hx,0);c.scale(hw/43,1);
 if(back){E(c,0,-2,43,45,hair);if(a.hair==='crop')E(c,0,20,30,23,skin)}
 else if(side&&a.hair==='crop'){c.beginPath();c.moveTo(-42,4);c.bezierCurveTo(-48,-45,22,-53,38,-29);c.lineTo(25,-23);c.lineTo(-16,-20);c.lineTo(-22,7);c.closePath();c.fillStyle=hair;c.fill();}
 else if(side){c.beginPath();c.moveTo(-42,10);c.bezierCurveTo(-52,-53,20,-65,40,-30);c.lineTo(33,-19);c.lineTo(12,-24);c.lineTo(2,-10);c.lineTo(-8,-2);c.lineTo(-9,24);c.lineTo(-30,27);c.closePath();c.fillStyle=hair;c.fill();}
 else{c.beginPath();c.moveTo(-43,4);c.bezierCurveTo(-52,-57,18,-65,42,-25);c.lineTo(41,-3);c.lineTo(31,-23);c.bezierCurveTo(12,-6,-5,-44,-30,-13);c.lineTo(-35,6);c.closePath();c.fillStyle=hair;c.fill();}
 if(['curly','afro','wavy'].includes(a.hair)){for(let i=0;i<7;i++)E(c,-36+i*11,-33-Math.sin(i/6*Math.PI)*13,a.hair==='afro'?18:12,14,hair)}
 if(['spiky','mohawk'].includes(a.hair)){P(c,a.hair==='mohawk'?[[-17,-30],[-13,-66],[0,-58],[10,-73],[17,-29]]:[[-42,-27],[-40,-52],[-23,-40],[-13,-66],[0,-46],[18,-62],[26,-40],[39,-46],[40,-25]],hair)}
 c.restore();
}
if(side)E(c,-12,10,8,12,skin,sw?ink:null,sw);
if(a.style==='robot'){L(c,[[0,-46],[0,-62]],ink,3);E(c,0,-63,5,5,shirt);if(!back){R(c,side?11:-28,-11,side?20:56,24,7,'#273b45');const gaze=M.gazeOffset?.(o)||[0,0];const shut=o.eyeState==='closed'||(o.eyeState!=='open'&&(o.pose==='sleep'||o.emotion==='sleepy'));for(const x of side?[22]:[-15,15]){if(shut)L(c,[[x-4,1],[x+4,1]],'#83d5ce',2);else E(c,x+gaze[0],1+gaze[1],4,5,'#83d5ce')}L(c,[[side?14:-14,30],[side?30:14,30]],ink,3)}}else if(!back)M.face(c,o,t,side);
}
if(['glasses','sunglasses'].includes(a.accessory)&&!back){for(const x of side?[22]:[-18,18])R(c,x-12,-3,24,20,6,a.accessory==='sunglasses'?ink:null,ink,3);L(c,side?[[-13,1],[10,4]]:[[-5,5],[5,5]],ink,3)}
if(a.accessory==='cap'){R(c,side?-28:-43,-48,side?65:86,25,11,shirt);L(c,[[side?10:-40,-22],[side?52:40,-22]],shirt,9)}
if(a.accessory==='beanie'){E(c,side?5:0,-35,side?33:43,25,shirt);R(c,side?-28:-43,-27,side?66:86,17,4,shirt);E(c,side?5:0,-65,10,10,shirt)}
if(a.accessory==='headphones'){c.beginPath();c.ellipse(side?2:0,0,side?31:48,48,0,Math.PI,Math.PI*2);c.strokeStyle=ink;c.lineWidth=7;c.stroke();if(!side)R(c,39,-3,12,28,6,shirt);R(c,side?-22:-51,-3,side?20:12,28,6,shirt)}
if(a.accessory==='bow'){const x=side?-20:-27;P(c,[[x,-35],[x-20,-49],[x-18,-24]],shirt);P(c,[[x,-35],[x+19,-48],[x+18,-23]],shirt);E(c,x,-35,5,7,a.bottom)}
if(a.accessory==='crown')P(c,[[-32,-29],[-36,-57],[-17,-44],[0,-65],[17,-44],[36,-57],[32,-29]],'#d6b15c',ink,1);
if(a.accessory==='bandana'){L(c,[[side?-27:-39,-22],[side?32:39,-22]],shirt,12);P(c,[[side?-27:34,-22],[side?-47:51,-3],[side?-31:38,9]],shirt)}
if(a.accessory==='earrings'&&!back){for(const x of side?[-12]:[-43,43])E(c,x,26,5,8,null,'#d6b15c',3)}
c.restore();if(a.accessory==='scarf'){L(c,[[-20,111],[19,115]],a.bottom,13);L(c,[[12,114],[22,154]],a.bottom,12)}c.restore();}
const oldDraw=M.drawCustom,oldJoints=M.customJoints,oldSkeleton=M.customSkeleton,oldAngles=M.pngAngles;
M.drawCustom=(c,o,t)=>o.characterDef?.avatar?render(c,o,t):oldDraw(c,o,t);
M.pngAngles=(o,t)=>o.characterDef?.avatar?M.poseAngles(o,t):oldAngles(o,t);
M.customSkeleton=(o,t)=>{if(!o.characterDef?.avatar)return oldSkeleton(o,t);const a=M.poseAngles(o,t),plain={...o,characterDef:null},base=M.joints({...plain,pose:'custom',rig:{}},0),out=M.joints(plain,t);base.pelvis=[80,226];const r=M.rad(a.body);out.pelvis=[80-Math.sin(r)*96,130+Math.cos(r)*96];const dx=out.head[0]-out.neck[0],dy=out.head[1]-out.neck[1],h=M.rad(a.head);out.head=[out.neck[0]+dx*Math.cos(h)-dy*Math.sin(h),out.neck[1]+dx*Math.sin(h)+dy*Math.cos(h)];return {base,out,a,physical:{base,out,width:160}}};
M.customJoints=(o,t)=>o.characterDef?.avatar?M.customSkeleton(o,t).out:oldJoints(o,t);
async function prepareHead(src,flip=false){await M.imageReady(src);const im=M.img(src);if(!im?.naturalWidth)throw Error('This head image could not load.');const factor=Math.min(1,1024/Math.max(im.naturalWidth,im.naturalHeight)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(im.naturalWidth*factor));cv.height=Math.max(1,Math.round(im.naturalHeight*factor));const c=cv.getContext('2d');c.drawImage(im,0,0,cv.width,cv.height);const data=c.getImageData(0,0,cv.width,cv.height).data;let x0=cv.width,y0=cv.height,x1=-1,y1=-1;for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(data[(y*cv.width+x)*4+3]>16){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}if(x1<0)throw Error('This head image is fully transparent.');const out=document.createElement('canvas');out.width=x1-x0+1;out.height=y1-y0+1;out.getContext('2d').drawImage(c.canvas,x0,y0,out.width,out.height,0,0,out.width,out.height);const head={src:out.toDataURL('image/png'),width:out.width,height:out.height,flip,scale:1,offsetX:0,offsetY:0};await M.imageReady(head.src);return head;}
M.avatar={defaults,options,palettes,presets,clean,render,prepareHead};
})();
