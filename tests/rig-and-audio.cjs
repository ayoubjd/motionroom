// Native Canvas regression suite; does not substitute for browser interaction tests.
const path=require('path'),os=require('os'),fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {createCanvas,Image}=require('@napi-rs/canvas'),root=path.resolve(__dirname,'..');
global.Image=Image;global.document={createElement:()=>createCanvas(1,1)};
const M=require(path.join(root,'dist/engine.js'));
for(const file of ['motions','rigging','puppet','audio'])vm.runInThisContext(fs.readFileSync(path.join(root,'dist',file+'.js'),'utf8'));
(async()=>{
  const sheet=createCanvas(1600,1050),cx=sheet.getContext('2d');cx.fillStyle='#eeeede';cx.fillRect(0,0,1600,1050);
  let bones=0,row=0;
  for(const [width,view,background]of [[160,'front',false],[420,'front',false],[220,'side',true]]){
    const source=createCanvas(width,350),c=source.getContext('2d');if(background){c.fillStyle='#fff';c.fillRect(0,0,width,350)}
    const original={...M.make('character',width/2,175),view,pose:'custom',rig:{}};M.drawObject(c,original,0);
    const rig=await M.autoRigImage(source.toDataURL('image/png'),view);
    assert.equal(Object.keys(rig.points).length,15);assert.equal(rig.autoRig.backgroundRemoved,background);
    const def={id:'test-'+row,revision:1,motionStrength:.85,views:{[view]:rig}},project={characters:{[def.id]:def},images:{},frames:[]};
    await M.ready(project);
    const o={...M.make('character'),characterId:def.id,characterDef:def,w:width,h:350,view,rig:{}};
    const originalData=JSON.stringify(rig);
    const parts=M.puppet.parts(o);assert.equal(parts.parts.length,10);
    // Generated segments must be complete at both ends, including unseen back limbs.
    for(let i=2;i<10;i++){
      const part=parts.parts[i],ctx=part.image.getContext('2d');
      for(const anchor of [part.sourceA,part.sourceB])assert(ctx.getImageData(Math.round(anchor[0]),Math.round(anchor[1]),1,1).data[3]>240,'missing joint overlap');
    }
    for(const pose of ['idle','walk','run','wave','sit','sleep','jump','dance']){
      o.pose=pose;
      for(let t=0;t<2;t+=.08){const {physical:{base,out}}=M.customSkeleton(o,t);for(const [a,b]of M.bones){assert(Math.abs(Math.hypot(base[b][0]-base[a][0],base[b][1]-base[a][1])-Math.hypot(out[b][0]-out[a][0],out[b][1]-out[a][1]))<1e-8);bones++;}}
    }
    for(let col=0;col<8;col++){
      o.pose=col<4?'walk':'run';o.x=100+col*200;o.y=160+row*350;o.h=280;o.w=280*width/350;
      M.drawObject(cx,o,(col%4)*.26);cx.fillStyle='#234';cx.font='14px Arial';cx.fillText(`${view} ${o.pose} ${((col%4)*.26).toFixed(2)}s`,35+col*200,332+row*350);
    }
    assert.equal(JSON.stringify(rig),originalData,'rendering changed saved reference or joints');
    // The explicit Original PNG mode must preserve the artwork exactly.
    def.animationMode='sprite';const actual=createCanvas(160,350),expected=createCanvas(160,350);
    M.drawCustom(actual.getContext('2d'),o,.4);expected.getContext('2d').drawImage(M.img(rig.src),0,0,160,350);
    assert.deepEqual(actual.getContext('2d').getImageData(0,0,160,350).data,expected.getContext('2d').getImageData(0,0,160,350).data);
    row++;
  }
  fs.writeFileSync(path.join(os.tmpdir(),'motionroom-layered-cycles.png'),sheet.toBuffer('image/png'));
  // A standalone part with known colored anchors must attach at both requested joints.
  const part=createCanvas(80,140),pctx=part.getContext('2d');M.line(pctx,[[40,25],[40,115]],'#338855',18);M.ellipse(pctx,40,25,5,5,'#ff0000');M.ellipse(pctx,40,115,5,5,'#0000ff');
  const destination=createCanvas(300,300),dctx=destination.getContext('2d');M.puppet.drawPart(dctx,{image:part,sourceA:[40,25],sourceB:[40,115]},[80,100],[190,200]);
  const A=dctx.getImageData(80,100,1,1).data,B=dctx.getImageData(190,200,1,1).data;assert(A[0]>240&&A[2]<10);assert(B[2]>240&&B[0]<10);
  const p={frames:[{duration:2,sounds:[{id:'old',assetId:'sfx:rain',offset:1,trim:.5,duration:3,volume:.7}]},{duration:3,sounds:[]}],audioAssets:[]};
  MotionAudio.migrate(p);assert.equal(p.audioClips[0].start,1);assert.equal(p.audioClips[0].duration,1);MotionAudio.migrate(p);assert.equal(p.audioClips.length,1);p.audioClips[0].duration=3;assert.equal(MotionAudio.cues(p)[0].length,3);p.audioTracks[0].muted=true;assert.equal(MotionAudio.cues(p).length,0);
  console.log(`PASS: ${bones} bone-length checks, complete limb endpoints, imported part anchor alignment, immutable references, exact Original PNG mode, legacy audio migration and cross-frame cues.`);
})().catch(e=>{console.error(e);process.exitCode=1});
