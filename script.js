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
  });
});

const causalRoles={
  confounder:{
    title:'如果述情障碍是混杂因素',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症组别</b><i>← 相关 →</i><b class="alex">述情障碍</b></div><div class="nodes"><b class="alex">述情障碍</b><i>→</i><b>情绪加工结果</b></div><small>述情障碍既与分组相关，又独立关联结果</small></div>',
    text:'此时不控制述情障碍，可能把它对结果的贡献错误归给孤独症组别。控制有助于估计“在述情障碍水平相同的情况下”组别与结果的关联。',
    advice:'但前提是有理论和时间证据支持它是组别—结果关系之外的混杂来源。'
  },
  mediator:{
    title:'如果述情障碍是发展中介',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症相关发展差异</b><i>→</i><b class="alex">述情障碍</b><i>→</i><b>情绪加工结果</b></div><small>述情障碍位于一条真实机制路径上</small></div>',
    text:'此时控制述情障碍会删掉孤独症相关发展差异通过述情障碍传递的间接效应。如果目标是估计总效应，这属于过度控制；如果目标是估计不经过述情障碍的直接效应，则可以控制。',
    advice:'“控制后差异消失”可能意味着路径被解释，而不是孤独症与结果毫无关系。'
  },
  overlap:{
    title:'如果两种量表存在测量重叠',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症自评</b><i>←</i><b>一般痛苦 / 回答风格</b><i>→</i><b class="alex">述情障碍自评</b></div><div class="nodes"><b class="alex">述情障碍自评</b><i>↔</i><b>焦虑自评</b></div><small>相关部分来自相似题意或共同方法</small></div>',
    text:'同一时间、同一报告者、相似措辞的问卷可能共享一般心理痛苦或回答风格。把其中一份量表作为协变量，可能只是把共同测量成分移除，而不是识别真实心理机制。',
    advice:'需要多方法、他评、行为或生理指标来判断相关究竟来自构念还是测量。'
  },
  collider:{
    title:'如果述情障碍或样本选择是碰撞变量',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症相关因素</b><i>→</i><b class="alex">被纳入 / 高述情障碍</b><i>←</i><b>心理健康因素</b></div><small>两个原因共同影响被控制的变量</small></div>',
    text:'当两个彼此独立的原因共同影响一个变量时，对这个变量进行控制或只分析某个临床样本，可能人为打开一条统计关联，产生原本不存在的关系。',
    advice:'临床求助样本尤其需要考虑选择偏差；“控制更多变量”并不总是更接近真相。'
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
