const slides=[...document.querySelectorAll('.slide')];
const total=slides.length;
const currentPage=document.getElementById('currentPage');
const totalPages=document.getElementById('totalPages');
const progressBar=document.getElementById('progressBar');
const toc=document.getElementById('toc');
const tocNav=document.getElementById('tocNav');
const scrim=document.getElementById('scrim');
const menuButton=document.getElementById('menuButton');
const notesPanel=document.getElementById('notesPanel');
const notesButton=document.getElementById('notesButton');
const notesTitle=document.getElementById('notesTitle');
const notesContent=document.getElementById('notesContent');
const cardsDialog=document.getElementById('cardsDialog');
let current=0;

totalPages.textContent=String(total).padStart(2,'0');
slides.forEach((slide,index)=>{
  const button=document.createElement('button');
  button.type='button';
  button.innerHTML=`<b>${String(index+1).padStart(2,'0')}</b>${slide.dataset.title}`;
  button.addEventListener('click',()=>{goTo(index);closeToc()});
  tocNav.appendChild(button);
});

function getCurrent(){
  const center=window.scrollY+window.innerHeight/2;
  let best=0;
  slides.forEach((slide,index)=>{if(slide.offsetTop<=center)best=index});
  return best;
}

function update(){
  current=getCurrent();
  currentPage.textContent=String(current+1).padStart(2,'0');
  progressBar.style.width=`${((current+1)/total)*100}%`;
  [...tocNav.children].forEach((item,index)=>item.classList.toggle('active',index===current));
  const note=slides[current].querySelector('.speaker-notes');
  notesTitle.textContent=slides[current].dataset.title;
  notesContent.innerHTML=note?note.innerHTML:'本页无讲稿。';
}

function goTo(index){
  const target=Math.max(0,Math.min(total-1,index));
  slides[target].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function openToc(){toc.classList.add('open');toc.setAttribute('aria-hidden','false');menuButton.setAttribute('aria-expanded','true');scrim.hidden=false}
function closeToc(){toc.classList.remove('open');toc.setAttribute('aria-hidden','true');menuButton.setAttribute('aria-expanded','false');scrim.hidden=true}
function toggleNotes(force){
  const open=typeof force==='boolean'?force:!notesPanel.classList.contains('open');
  notesPanel.classList.toggle('open',open);notesPanel.setAttribute('aria-hidden',String(!open));notesButton.setAttribute('aria-pressed',String(open));
}

document.getElementById('prevButton').addEventListener('click',()=>goTo(current-1));
document.getElementById('nextButton').addEventListener('click',()=>goTo(current+1));
document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>goTo(Number(el.dataset.go)-1)));
menuButton.addEventListener('click',openToc);
document.getElementById('tocClose').addEventListener('click',closeToc);
scrim.addEventListener('click',closeToc);
notesButton.addEventListener('click',()=>toggleNotes());
document.getElementById('notesClose').addEventListener('click',()=>toggleNotes(false));
document.getElementById('cardsButton').addEventListener('click',()=>cardsDialog.showModal());
document.getElementById('cardsClose').addEventListener('click',()=>cardsDialog.close());
cardsDialog.addEventListener('click',event=>{if(event.target===cardsDialog)cardsDialog.close()});

document.addEventListener('keydown',event=>{
  if(cardsDialog.open){if(event.key==='Escape')cardsDialog.close();return}
  if(['ArrowRight','ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();goTo(current+1)}
  if(['ArrowLeft','ArrowUp','PageUp'].includes(event.key)){event.preventDefault();goTo(current-1)}
  if(event.key==='Home'){event.preventDefault();goTo(0)}
  if(event.key==='End'){event.preventDefault();goTo(total-1)}
  if(event.key.toLowerCase()==='n')toggleNotes();
  if(event.key.toLowerCase()==='p')window.print();
  if(event.key==='Escape'){closeToc();toggleNotes(false)}
});

let ticking=false;
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{update();ticking=false});ticking=true}},{passive:true});
update();
