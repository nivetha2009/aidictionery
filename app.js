// Recommendation engine, state, rendering and event handlers
const S={q:'',res:null,f:{budget:'Any',exp:'Any',pri:'Any',cat:'Any'},cmp:[],hist:[],page:'home',load:false,err:'',ef:'Any',es:''};
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function recommend(q,f){q=q.toLowerCase();const ch=new Set(Object.keys(CS).filter(c=>CS[c].some(w=>q.includes(w))));
let list=TOOLS.map(t=>{const hits=t.k.filter(k=>q.includes(k));let s=hits.length*3;t.c.forEach(c=>ch.has(c)&&(s+=2));return{t,hits,s}}).filter(x=>x.s>0),general=false;
if(!list.length){general=true;list=TOOLS.filter(t=>t.g).map(t=>({t,hits:[],s:1}))}
list=list.filter(x=>(f.budget=='Any'||x.t.p==f.budget)&&(f.cat=='Any'||x.t.c.includes(f.cat)));
const L={Beginner:1,Intermediate:2,Advanced:3}[f.exp]||3,pi={'Ease of Use':0,Speed:1,Quality:2,'Advanced Features':3}[f.pri];
list.forEach(x=>{if(pi!=null)x.s*=1+.12*(x.t.m[pi]-3);x.s*=1-.15*Math.max(0,x.t.l-L)});
list.sort((a,b)=>b.s-a.s);const mx=list.length?list[0].s:1;list.forEach(x=>x.rel=Math.max(35,Math.round(35+63*x.s/mx)));
return{list,general}}
function go(p){S.page=p;render();scrollTo(0,0)}
function setQ(v){S.q=v}function ex(i){S.q=EX[i];render();run()}
function cat(c){S.q=c;S.f.cat=c;render();run()}
function setF(k,v){S.f[k]=v;if(S.res)S.res=recommend(S.q,S.f);render()}
function run(){const q=($('#q')?$('#q').value:S.q).trim();S.q=q;S.err='';
if(!q){S.err='Please describe a task first, for example “Summarise a research paper”.';render();return}
if(q.length<3){S.err='That is too short. Add a few more words about your task.';render();return}
S.load=true;S.res=null;render();$('#res').scrollIntoView({behavior:'smooth'});
setTimeout(()=>{try{S.res=recommend(q,S.f);S.hist=[q,...S.hist.filter(h=>h!=q)].slice(0,6)}catch(e){S.err='Something went wrong. Please try again.'}S.load=false;render()},650)}
function tog(n){const i=S.cmp.indexOf(n);if(i>-1)S.cmp.splice(i,1);else if(S.cmp.length>=3){alert('You can compare up to three tools. Remove one first.');return}else S.cmp.push(n);render()}
function clr(){S.hist=[];render()}
function dots(n){return '●'.repeat(n)+'○'.repeat(5-n)}
function card(t,x){x=x||{};const on=S.cmp.includes(t.n);return `<article class="tool"><h3>${esc(t.n)}<span>${x.b?`<span class="tag b">${x.b}</span> `:''}<span class="tag">${t.p}</span></span></h3>
${x.rel?`<div><div class="mu" style="font-size:12px;font-weight:700;margin-bottom:3px">Match ${x.rel}%</div><div class="bar"><b style="width:${x.rel}%"></b></div></div>`:''}
<p>${esc(t.pu)}</p>${x.rel?`<p class="mu"><b>Why it fits:</b> ${x.hits&&x.hits.length?`matches “${esc(x.hits.slice(0,3).join(', '))}” and is built for ${esc(t.c.slice(0,2).join(' & ').toLowerCase())}.`:'a solid general-purpose option when no specialised tool matches.'}</p>`:''}
<ul>${t.f.map(f=>`<li>${esc(f)}</li>`).join('')}</ul><div class="pc"><div style="color:var(--ok)">＋ ${esc(t.pr)}</div><div style="color:#d6336c">－ ${esc(t.co)}</div></div>
<div class="mu" style="font-size:12.5px">Ease ${dots(t.m[0])} · Experience: ${['','Beginner','Intermediate','Advanced'][t.l]}</div>
<div class="row"><a class="g" href="${t.u}" target="_blank" rel="noopener">Official site ↗</a><button class="g ${on?'on':''}" onclick="tog('${t.n}')">${on?'✓ Added':'+ Compare'}</button></div></article>`}
function sel(k,l,o){return `<label>${l}<select onchange="setF('${k}',this.value)">${['Any',...o].map(v=>`<option ${S.f[k]==v?'selected':''}>${v}</option>`).join('')}</select></label>`}
function results(){if(S.load)return '<div class="sp" role="status" aria-label="Loading"></div><p class="mu" style="text-align:center">Matching your task against the catalogue…</p>';
if(!S.res)return '';const{list,general}=S.res;const top=list.slice(0,5),alt=list.slice(5,8);
const free=top.find(x=>x.t.p=='Free'||x.t.p=='Freemium');
let h=`<h2>Recommendations for “${esc(S.q)}”</h2><div class="fl">${sel('budget','Budget',['Free','Freemium','Paid'])}${sel('exp','Experience',['Beginner','Intermediate','Advanced'])}${sel('pri','Priority',['Speed','Quality','Ease of Use','Advanced Features'])}${sel('cat','Category',Object.keys(CS))}</div>`;
if(general)h+='<p class="mu">No close keyword match, so these are versatile general-purpose assistants. Try adding more detail.</p>';
if(!top.length)return h+'<div class="empty">No tools match these filters. Try relaxing the budget or category filter.</div>';
h+=`<div class="grid">${top.map((x,i)=>card(x.t,{rel:x.rel,hits:x.hits,b:i==0?'Best overall':(free&&x==free?'Best free':'')})).join('')}</div>`;
if(free&&top[0]!=free&&false)h+='';
if(alt.length)h+=`<h2>Alternatives</h2><div class="grid">${alt.map(x=>card(x.t,{rel:x.rel,hits:x.hits})).join('')}</div>`;return h}
const pages={
home(){return `<section class="hero"><h1>Find the Right <span>AI</span> for Every Task.</h1><p>Describe what you want to get done and TaskPilot AI matches it to the most suitable AI tools from a curated catalogue, ranked by fit.</p>
<div class="box"><textarea id="q" placeholder="e.g. Turn my lecture PDF into a quiz…" oninput="setQ(this.value)" onkeydown="if(event.key=='Enter'&&(event.ctrlKey||event.metaKey))run()">${esc(S.q)}</textarea><div style="text-align:right"><button class="btn" onclick="run()">Find the Best AI Tools</button></div>${S.err?`<div class="err" role="alert">${esc(S.err)}</div>`:''}</div>
<div class="chips">${EX.map((e,i)=>`<span class="chip" onclick="ex(${i})">${e}</span>`).join('')}</div></section>
<div id="res">${results()}</div>
${S.hist.length?`<h2>Recent searches <button class="g" onclick="clr()" style="margin-left:8px">Clear history</button></h2><div class="chips" style="justify-content:flex-start">${S.hist.map(h=>`<span class="chip" onclick="S.q=this.textContent;render();run()">${esc(h)}</span>`).join('')}</div>`:''}
<h2>Popular task categories</h2><div class="cats">${Object.keys(CS).map(c=>`<div class="cat" onclick="cat('${c}')"><i>${ICON[c]}</i>${c}</div>`).join('')}</div>`},
explore(){const l=TOOLS.filter(t=>(S.ef=='Any'||t.c.includes(S.ef))&&(t.n+t.pu+t.k.join(' ')).toLowerCase().includes(S.es.toLowerCase()));
return `<h2>Explore Tools</h2><div class="fl"><label>Search<input type="text" id="es" value="${esc(S.es)}" placeholder="Tool or keyword" oninput="S.es=this.value;render();$('#es').focus();$('#es').setSelectionRange(S.es.length,S.es.length)"></label><label>Category<select onchange="S.ef=this.value;render()">${['Any',...Object.keys(CS)].map(v=>`<option ${S.ef==v?'selected':''}>${v}</option>`).join('')}</select></label></div>
${l.length?`<div class="grid">${l.map(t=>card(t)).join('')}</div>`:'<div class="empty">No tools found. Try a different keyword or category.</div>'}`},
compare(){const c=S.cmp.map(n=>TOOLS.find(t=>t.n==n));if(!c.length)return `<h2>Compare Tools</h2><div class="empty">Nothing to compare yet. Use “+ Compare” on up to three tools in <a href="#" onclick="go('explore');return false" style="color:var(--ac)">Explore Tools</a> or in your results.</div>`;
const r=(l,f)=>`<tr><th>${l}</th>${c.map(t=>`<td>${f(t)}</td>`).join('')}</tr>`;
return `<h2>Compare Tools</h2><div class="tbl"><table><tr><th></th>${c.map(t=>`<th style="color:var(--tx);font-size:17px">${esc(t.n)}<br><button class="g" onclick="tog('${t.n}')">Remove</button></th>`).join('')}</tr>
${r('Main purpose',t=>esc(t.pu))}${r('Useful features',t=>'<ul>'+t.f.map(f=>`<li>${esc(f)}</li>`).join('')+'</ul>')}${r('Pricing',t=>`<span class="tag">${t.p}</span>`)}${r('Ease of use',t=>dots(t.m[0]))}${r('Best for',t=>esc(t.c.join(', ')))}${r('Strengths',t=>esc(t.pr))}${r('Limitations',t=>esc(t.co))}${r('Website',t=>`<a class="g" href="${t.u}" target="_blank" rel="noopener">Visit ↗</a>`)}</table></div>`},
about(){return `<h2>About TaskPilot AI</h2><div class="box" style="max-width:720px;margin:0"><p>TaskPilot AI helps you choose an AI tool by describing the job instead of browsing hundreds of products.</p><p><b>How it works:</b> your text is matched against keywords and categories for ${TOOLS.length} real tools. Your filters then narrow or re-rank the list. It runs entirely in your browser, with no live AI model and no API key.</p><p><b>Please note:</b> pricing categories are general (Free, Freemium, Paid) and tools change often. Always confirm details on the official site.</p><button class="btn" onclick="go('home')">Try it now</button></div>`}};
function render(){$('#app').innerHTML=pages[S.page]();document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.p==S.page));
$('#tray').innerHTML=S.cmp.length&&S.page!='compare'?`<div class="tray">${S.cmp.length}/3 selected <button onclick="go('compare')">Compare</button></div>`:''}
render();
