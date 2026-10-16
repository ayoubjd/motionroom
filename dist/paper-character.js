/* Shared body and the user's unchanged front / side / back head artwork. */
(function(){'use strict';let pending;const M=Motion;
async function prepare(sources){const heads={};for(const view of ['front','side','back'])heads[view]=await M.avatar.prepareHead(sources[view],view==='side');const ch={id:'paper_boy_original',name:'Paper boy',revision:2,views:{},avatar:M.avatar.clean({style:'classic',hair:'none',skin:'#cf966e',top:'#e0c8a0',bottom:'#927c63',outfit:'tee'}),heads};await M.ready({characters:{paper:ch},frames:[]});return ch}
function migrate(p,ch){const previous=p.characters?.paper_boy_original;if(!previous||previous.avatar)return false;p.characters.paper_boy_original=JSON.parse(JSON.stringify(ch));for(const f of p.frames)for(const o of f.objects)if(o.characterId===ch.id){o.w=o.h*160/350;o.rig={}}return true}
M.paperCharacter={prepare,migrate,load(){return pending||(pending=fetch('characters/paper-heads.json?v=6').then(r=>{if(!r.ok)throw Error('Head images could not load.');return r.json()}).then(prepare).catch(e=>{pending=null;throw e}))}};
const ready=M.ready;M.ready=async p=>{if(p.characters?.paper_boy_original&&!p.characters.paper_boy_original.avatar)migrate(p,await M.paperCharacter.load());await ready(p)};
})();
