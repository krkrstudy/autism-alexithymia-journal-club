const sections=[...document.querySelectorAll('.article-section[data-title]')];
const desktopToc=document.getElementById('desktopToc');
const mobileToc=document.getElementById('mobileToc');
const progress=document.getElementById('readingProgress');
const mobileMenu=document.getElementById('mobileMenu');
const glossary=document.getElementById('glossary');
const scrim=document.getElementById('scrim');
const backTop=document.getElementById('backTop');

sections.forEach((section,index)=>{
  const label=`${String(index).padStart(2,'0')} · ${section.dataset.title}`;
  [desktopToc,mobileToc].forEach(nav=>{
    const link=document.createElement('a');
    link.href=`#${section.id}`;
    link.textContent=label;
    link.dataset.target=section.id;
    link.addEventListener('click',closePanels);
    nav.appendChild(link);
  });
});

function closePanels(){
  mobileMenu.classList.remove('open');
  glossary.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden','true');
  glossary.setAttribute('aria-hidden','true');
  document.getElementById('menuButton').setAttribute('aria-expanded','false');
  scrim.hidden=true;
}

function openPanel(panel){
  closePanels();
  panel.classList.add('open');
  panel.setAttribute('aria-hidden','false');
  scrim.hidden=false;
}

document.getElementById('menuButton').addEventListener('click',()=>{
  openPanel(mobileMenu);
  document.getElementById('menuButton').setAttribute('aria-expanded','true');
});
document.getElementById('menuClose').addEventListener('click',closePanels);
document.getElementById('glossaryButton').addEventListener('click',()=>openPanel(glossary));
document.getElementById('glossaryClose').addEventListener('click',closePanels);
scrim.addEventListener('click',closePanels);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanels()});

document.getElementById('fontButton').addEventListener('click',event=>{
  const active=document.body.classList.toggle('large-type');
  event.currentTarget.setAttribute('aria-pressed',String(active));
  event.currentTarget.textContent=active?'标准字':'大字';
});

document.querySelectorAll('dfn[data-term]').forEach(term=>{
  term.setAttribute('tabindex','0');
  term.setAttribute('role','button');
  term.setAttribute('aria-label',`${term.textContent}，点击查看术语解释`);
  term.addEventListener('click',()=>openPanel(glossary));
  term.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openPanel(glossary)}});
});

document.querySelectorAll('.evidence-filter button').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.evidence-filter button').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    const filter=button.dataset.filter;
    document.querySelectorAll('.evidence-card').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&card.dataset.type!==filter));
    document.querySelectorAll('.evidence-transition').forEach(item=>item.classList.toggle('hidden',filter!=='all'));
  });
});

const causalRoles={
  confounder:{
    title:'如果述情障碍是混杂因素',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症组别</b><i>← 相关 →</i><b class="alex">述情障碍</b></div><div class="nodes"><b class="alex">述情障碍</b><i>→</i><b>情绪加工结果</b></div><small>述情障碍既与分组相关，又独立关联结果</small></div>',
    text:'述情障碍同时与孤独症组别和情绪加工结果相关。将其纳入模型，可以估计述情障碍水平相同时的组别关联。',
    advice:'这种处理需要理论和时间证据支持述情障碍的混杂角色。'
  },
  mediator:{
    title:'如果述情障碍是发展中介',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症相关发展差异</b><i>→</i><b class="alex">述情障碍</b><i>→</i><b>情绪加工结果</b></div><small>述情障碍位于一条真实机制路径上</small></div>',
    text:'述情障碍位于发展路径中时，将其纳入模型会移除这条间接效应。估计总效应应保留该路径；估计直接效应时可以控制。',
    advice:'控制后组别差异缩小，可能表示述情障碍承载了部分发展路径。'
  },
  overlap:{
    title:'如果两种量表存在测量重叠',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症自评</b><i>←</i><b>一般痛苦 / 回答风格</b><i>→</i><b class="alex">述情障碍自评</b></div><div class="nodes"><b class="alex">述情障碍自评</b><i>↔</i><b>焦虑自评</b></div><small>相关部分来自相似题意或共同方法</small></div>',
    text:'同一时间、同一报告者和相似措辞会带来一般心理痛苦或回答风格的共享成分。控制其中一份量表会同时移除这些共享测量成分。',
    advice:'多方法、他评、行为和生理指标可以帮助区分构念关联与测量重叠。'
  }
};

function renderCausal(role){
  const data=causalRoles[role];
  document.getElementById('causalGraph').innerHTML=data.graph;
  document.getElementById('causalTitle').textContent=data.title;
  document.getElementById('causalText').textContent=data.text;
  document.getElementById('causalAdvice').textContent=data.advice;
}

document.querySelectorAll('.causal-controls button').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.causal-controls button').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    renderCausal(button.dataset.role);
  });
});
renderCausal('confounder');

const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if(!visible)return;
  document.querySelectorAll('[data-target]').forEach(link=>link.classList.toggle('active',link.dataset.target===visible.target.id));
},{rootMargin:'-20% 0px -65% 0px',threshold:[0,.15,.4]});
sections.forEach(section=>observer.observe(section));

function updateScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${max>0?(scrollY/max)*100:0}%`;
  backTop.classList.toggle('visible',scrollY>innerHeight);
}
addEventListener('scroll',updateScroll,{passive:true});
backTop.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
updateScroll();
