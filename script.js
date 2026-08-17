const sections=[...document.querySelectorAll('.article-section[data-title]')];
const desktopToc=document.getElementById('desktopToc');
const mobileToc=document.getElementById('mobileToc');
const progress=document.getElementById('readingProgress');
const mobileMenu=document.getElementById('mobileMenu');
const scrim=document.getElementById('scrim');
const backTop=document.getElementById('backTop');

sections.forEach((section,index)=>{
  const label=`${String(index+1).padStart(2,'0')} · ${section.dataset.title}`;
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
  mobileMenu.setAttribute('aria-hidden','true');
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
scrim.addEventListener('click',closePanels);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanels()});

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
    text:'在混杂模型中，述情障碍与孤独症组别相关，也独立关联情绪加工结果。研究者控制它，是为了比较述情障碍水平相近的人群，估计组别本身还剩下多少关联。这个解释要求混杂变量先于结果出现，而且不能是孤独症影响结果的中间环节。',
    advice:'只有当时间顺序和理论都支持“共同原因或前置变量”时，控制才有清晰含义；否则，统计调整可能把真正的机制一并移除。'
  },
  mediator:{
    title:'如果述情障碍是发展中介',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症相关发展差异</b><i>→</i><b class="alex">述情障碍</b><i>→</i><b>情绪加工结果</b></div><small>述情障碍位于一条真实机制路径上</small></div>',
    text:'在中介模型中，孤独症相关的发展差异先影响述情障碍，述情障碍再与后续情绪加工或心理健康结果相连。控制它会移除这条间接路径，因此组别差异缩小可能正是机制的一部分，而不是“差异被消除了”。',
    advice:'要支持中介解释，需要至少有清楚的时间顺序；横断面间接效应只能提出路径假设，不能证明变量按这个顺序发生。'
  },
  overlap:{
    title:'如果两种量表存在测量重叠',
    graph:'<div class="graph-flow"><div class="nodes"><b>孤独症自评</b><i>←</i><b>一般痛苦 / 回答风格</b><i>→</i><b class="alex">述情障碍自评</b></div><div class="nodes"><b class="alex">述情障碍自评</b><i>↔</i><b>焦虑自评</b></div><small>相关部分来自相似题意或共同方法</small></div>',
    text:'在测量重叠模型中，相关可能来自相似题目、同一报告者或一般心理痛苦，而不一定来自两个稳定构念之间的真实联系。例如，述情障碍和焦虑量表都询问“难以理解或控制自己的感受”，它们自然会共享一部分方差。',
    advice:'多方法、他评、行为和生理指标可以帮助区分构念关联与测量重叠；分析前也应检查题目内容和共同方法方差。'
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
