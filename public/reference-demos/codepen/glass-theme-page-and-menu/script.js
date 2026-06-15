/* Neon Glass Context UI — All boxes share the same neon-glass shading */
const $menu = document.getElementById('menu');
const $hue1 = document.querySelector('#h1');
const $hue2 = document.querySelector('#h2');
const $glow = document.querySelector('#glow');
const $blur = document.querySelector('#blur');
const $save = document.getElementById('saveTheme');
const $reset = document.getElementById('resetTheme');
const $particlesToggle = document.getElementById('particlesToggle');

const $palette = document.getElementById('palette');
const $palInput = document.getElementById('pal-input');
const $palList = document.getElementById('pal-list');
const $canvas = document.getElementById('bg-canvas');

const state = { open:false, cleanTimer:null, particles:[], parallax:true, grid:false, focus:false };

const cssVar = (k,v)=>document.documentElement.style.setProperty(k,v);
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
const ls = { get:k=>{ try{ return JSON.parse(localStorage.getItem(k)) }catch{ return null } }, set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)) };

function preset(name){
  return ({
    synth:{h1:295,h2:178,glow:.9, blur:14},
    aqua:{h1:188,h2:158,glow:.85, blur:12},
    vio:{h1:262,h2:222,glow:.88, blur:14},
    amber:{h1:38,h2:15,glow:.92, blur:12}
  })[name] || null;
}

function applyTheme({h1,h2,glow,blur},save=false){
  if (typeof h1==='number'){ $hue1.value=h1; cssVar('--hue1', h1) }
  if (typeof h2==='number'){ $hue2.value=h2; cssVar('--hue2', h2) }
  if (typeof glow==='number'){ $glow.value=glow; cssVar('--glow', glow) }
  if (typeof blur==='number'){ $blur.value=blur; cssVar('--blur', `${blur}px`) }
  if (save) ls.set('neonTheme', {h1:+$hue1.value,h2:+$hue2.value,glow:+$glow.value,blur:+$blur.value});
}

function initTheme(){
  const saved = ls.get('neonTheme');
  if (saved) applyTheme(saved);
  else {
    const rand1 = 120 + Math.floor(Math.random()*240);
    const rand2 = rand1 - 80 + (Math.floor(Math.random()*60)-30);
    applyTheme({h1:rand1, h2:rand2, glow:+$glow.value, blur:+$blur.value});
  }
}

function openMenuAt(x,y){
  const box = $menu.getBoundingClientRect();
  const W = innerWidth, H = innerHeight, padX=30, padY=20;
  if (x + box.width >= W - padX) x = W - box.width - padX;
  if (y + box.height >= H - padY) y = H - box.height - padY;
  $menu.style.left = x+'px'; $menu.style.top = y+'px';
  $menu.classList.add('open'); state.open = true; clearTimeout(state.cleanTimer);
}
function closeMenu(clean=true){
  $menu.classList.remove('open'); state.open = false;
  if (clean) state.cleanTimer = setTimeout(()=>{
    $menu.querySelectorAll('li').forEach(li=>li.classList.remove('selected'));
    const input = document.getElementById('menuSearch'); if (input) input.value='';
  },150);
}

document.addEventListener('contextmenu', e=>{
  const inMenu = $menu.contains(e.target);
  e.preventDefault();
  if (!inMenu) openMenuAt(e.clientX, e.clientY);
});
document.addEventListener('pointerdown', e=>{
  const inMenu = $menu.contains(e.target);
  const isSlider = e.target.matches('input[type="range"]');
  if (!inMenu && !isSlider) closeMenu();
  else if (inMenu){
    const li = e.target.closest('li');
    if (li && !li.classList.contains('has-sub')){
      $menu.querySelectorAll('li').forEach(el=>el.classList.remove('selected'));
      li.classList.add('selected'); runAction(li.dataset.action);
    }
  }
});

/* Submenus hover + keyboard a11y */
$menu.addEventListener('pointerenter', e=>{ const li=e.target.closest('.has-sub'); if(li) li.classList.add('open') }, true);
$menu.addEventListener('pointerleave', e=>{ const li=e.target.closest('.has-sub'); if(li) li.classList.remove('open') }, true);
$menu.querySelectorAll('.has-sub').forEach(li=>{
  li.setAttribute('tabindex','0');
  li.addEventListener('keydown', e=>{
    if (e.key==='Enter' || e.key===' '){ e.preventDefault(); li.classList.toggle('open'); li.setAttribute('aria-expanded', li.classList.contains('open')); }
    if (e.key==='Escape'){ li.classList.remove('open'); li.setAttribute('aria-expanded','false'); }
  });
});

/* Shortcuts */
document.addEventListener('keydown', e=>{
  if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openPalette(); return; }
  if (e.key.toLowerCase()==='t'){ pulseTheme(); }
  if (e.key.toLowerCase()==='f'){ toggleFocus(); }

  if (state.open){
    const items=[...$menu.querySelectorAll('.group ul > li:not(.has-sub)')];
    const idx=items.findIndex(el=>el.classList.contains('selected'));
    if (e.key==='ArrowDown'){ e.preventDefault(); selectIndex(items, clamp(idx+1,0,items.length-1)); }
    if (e.key==='ArrowUp'){ e.preventDefault(); selectIndex(items, clamp(idx-1,0,items.length-1)); }
    if (e.key==='Enter'){ e.preventDefault(); (items[idx]||items[0])?.click(); }
    if (e.key==='Escape'){ e.preventDefault(); closeMenu(); }
  } else if ($palette.open && e.key==='Escape'){ $palette.close(); }
});
function selectIndex(list,i){ list.forEach(li=>li.classList.remove('selected')); const el=list[i]; if(!el)return; el.classList.add('selected'); el.scrollIntoView({block:'nearest',behavior:'smooth'}) }

/* Command palette */
const PALETTE_CMDS = [
  { id:'calendar', label:'Open Calendar', hint:'C' },
  { id:'calculator', label:'Calculator', hint:'=' },
  { id:'messages', label:'Messages', hint:'M' },
  { id:'focus', label:'Toggle Focus Mode', hint:'F' },
  { id:'grid', label:'Toggle Subtle Grid' },
  { id:'parallax', label:'Toggle Parallax' },
  { id:'particles', label:'Toggle Particles' },
  { id:'preset-synth', label:'Theme: Synthwave' },
  { id:'preset-aqua', label:'Theme: Aqua Noir' },
  { id:'preset-vio', label:'Theme: Violet Night' },
  { id:'preset-amber', label:'Theme: Amber Glass' }
];
function openPalette(){ if(!$palette.open)$palette.showModal(); $palInput.value=''; renderPalList(PALETTE_CMDS); $palInput.focus() }
function renderPalList(items){
  $palList.innerHTML = items.map((x,i)=>`<li role="option" data-id="${x.id}" class="${i===0?'active':''}"><span>${x.label}</span>${x.hint?`<kbd>${x.hint}</kbd>`:''}</li>`).join('');
}
$palInput.addEventListener('input', e=>{
  const q=e.target.value.toLowerCase().trim();
  renderPalList(PALETTE_CMDS.filter(x=>x.label.toLowerCase().includes(q)));
});
$palList.addEventListener('click', e=>{
  const li=e.target.closest('li'); if(!li) return; runCommandId(li.dataset.id); $palette.close();
});
$palette.addEventListener('keydown', e=>{
  const items=[...$palList.querySelectorAll('li')];
  let idx=items.findIndex(x=>x.classList.contains('active'));
  if(e.key==='ArrowDown'){ e.preventDefault(); idx=clamp(idx+1,0,items.length-1); setActive(items,idx) }
  if(e.key==='ArrowUp'){ e.preventDefault(); idx=clamp(idx-1,0,items.length-1); setActive(items,idx) }
  if(e.key==='Enter'){ e.preventDefault(); items[idx]?.click() }
});
function setActive(items,i){ items.forEach(x=>x.classList.remove('active')); items[i]?.classList.add('active'); items[i]?.scrollIntoView({block:'nearest'}) }

/* Actions */
function runAction(action){ if(!action) return;
  if(action==='calendar') toast('📆 Calendar opened');
  if(action==='calculator') toast('🧮 Calculator opened');
  if(action==='messages') toast('💬 Messages opened');
  closeMenu();
}
function runCommandId(id){
  if(id?.startsWith('preset-')){ const name=id.split('-')[1]; const set=preset(name); if(set) applyTheme(set,true), pulseTheme(); return; }
  if(id==='focus') toggleFocus();
  if(id==='grid') toggleGrid();
  if(id==='parallax') state.parallax=!state.parallax, toast(`Parallax: ${state.parallax?'On':'Off'}`);
  if(id==='particles') toggleParticles();
  if(['calendar','calculator','messages'].includes(id)) runAction(id);
}

/* Theme bindings */
[$hue1,$hue2].forEach(inp=> inp.addEventListener('input', e=>{ cssVar(inp.id==='h1'?'--hue1':'--hue2', e.target.value); $menu.classList.add('open'); }));
$glow.addEventListener('input', e=>{ cssVar('--glow', e.target.value); $menu.classList.add('open'); });
$blur.addEventListener('input', e=>{ cssVar('--blur', `${e.target.value}px`); $menu.classList.add('open'); });
document.querySelectorAll('.chip,[data-preset]').forEach(el=> el.addEventListener('click', ()=>{
  const set = preset(el.dataset.preset); if(set) applyTheme(set,true), pulseTheme();
}));
$save.addEventListener('click', ()=> applyTheme({h1:+$hue1.value,h2:+$hue2.value,glow:+$glow.value,blur:+$blur.value}, true));
$reset.addEventListener('click', ()=>{ localStorage.removeItem('neonTheme'); initTheme(); pulseTheme(); });

/* Search inside menu */
document.getElementById('menuSearch').addEventListener('input', e=>{
  const q=e.target.value.toLowerCase().trim();
  $menu.querySelectorAll('.group ul > li').forEach(li=>{
    if (li.classList.contains('has-sub') || li.classList.contains('has-toggle')) return;
    const label=li.textContent.toLowerCase(); li.style.display = label.includes(q) ? '' : 'none';
  });
});

/* Micro flair */
function pulseTheme(){ if(!window.gsap) return; gsap.fromTo(document.documentElement,{ '--glow': +getComputedStyle(document.documentElement).getPropertyValue('--glow') },{ '--glow': 1, duration:.35, yoyo:true, repeat:1, ease:'power2.out' }) }
function toggleFocus(){ state.focus=!state.focus; document.body.classList.toggle('focus-mode', state.focus); toast(`Focus Mode: ${state.focus?'On':'Off'}`) }
function toggleGrid(){ state.grid=!state.grid; document.body.classList.toggle('show-grid', state.grid); toast(`Grid: ${state.grid?'On':'Off'}`) }

/* Toasts */
let toastTimer;
function toast(msg){
  let el=document.getElementById('toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; Object.assign(el.style,{position:'fixed',left:'50%',bottom:'22px',transform:'translateX(-50%)',padding:'10px 14px',borderRadius:'12px',color:'#fff',zIndex:999,background:'linear-gradient(90deg,#ffffff25,#ffffff10)',border:'1px solid #ffffff3a',backdropFilter:'blur(8px)',boxShadow:'0 10px 30px #0007',pointerEvents:'none'}); document.body.appendChild(el); }
  el.textContent=msg; el.style.opacity='1'; clearTimeout(toastTimer); toastTimer=setTimeout(()=> el.style.opacity='0', 1200);
}

/* Icons */
const ICO_PATHS={ calendar:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25M3 18.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75M7.5 9h9", calc:"M8 6h8v2H8V6Zm10 3H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9Zm-8 3h1.5v1.5H10V12Zm0 3h1.5v1.5H10V15Zm0 3h1.5V19H10v-1Zm3-6h1.5v1.5H13V12Zm0 3h1.5v1.5H13V15Zm0 3h1.5V19H13v-1Zm3-6h1.5v1.5H16V12Zm0 3h1.5v1.5H16V15Z", msg:"M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.99 2.7 3.22 1.13.17 2.27.3 3.42.38.35.03.67.21.86.5L12 21l2.76-4.13c.2-.29.51-.47.86-.5 1.15-.08 2.3-.21 3.42-.38 1.58-.23 2.71-1.62 2.71-3.23V6.74c0-1.6-1.12-3-2.71-3.23A48.4 48.4 0 0 0 12 3a48.5 48.5 0 0 0-7.04.51C3.37 3.75 2.25 5.14 2.25 6.74v6.02Z", theme:"M12 3a9 9 0 1 0 9 9h-6a3 3 0 0 1-3-3V3Z", display:"M4 5h16v10H4V5Zm5 14h6" };
document.querySelectorAll('.ico').forEach(span=>{
  const key=span.dataset.ico; const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('stroke','currentColor'); svg.setAttribute('stroke-width','1.5');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d', ICO_PATHS[key] || ICO_PATHS.calendar); svg.appendChild(path); span.appendChild(svg);
});

/* Background Particles/Bokeh */
const ctx=$canvas.getContext('2d',{alpha:true}); let DPR=Math.min(2,devicePixelRatio||1), W,H;
function resizeCanvas(){ W=$canvas.width=Math.floor(innerWidth*DPR); H=$canvas.height=Math.floor(innerHeight*DPR); $canvas.style.width=innerWidth+'px'; $canvas.style.height=innerHeight+'px' }
resizeCanvas(); addEventListener('resize', resizeCanvas);
const stateParticles = state.particles;
function rr(min,max){ return (Math.random()*(max-min))+min }
function makeParticle(){ const getH=+getComputedStyle(document.documentElement).getPropertyValue('--hue1'); const getH2=+getComputedStyle(document.documentElement).getPropertyValue('--hue2'); const hue=Math.random()<.5?getH:getH2; return{ x:rr(0,W), y:rr(0,H), r:rr(12*DPR,36*DPR), vx:rr(-.15,.15), vy:rr(-.08,.08), hue } }
function seedParticles(n=48){ stateParticles.length=0; for(let i=0;i<n;i++) stateParticles.push(makeParticle()) }
seedParticles();
let mouse={x:W/2,y:H/2}; addEventListener('pointermove',e=>{ mouse.x=e.clientX*DPR; mouse.y=e.clientY*DPR });
function draw(){
  ctx.clearRect(0,0,W,H);
  if (document.body.classList.contains('show-grid')){
    ctx.save(); ctx.globalAlpha=.05; const step=24*DPR; ctx.strokeStyle='#fff'; ctx.lineWidth=1*DPR; ctx.beginPath();
    for(let x=0;x<W;x+=step){ ctx.moveTo(x,0); ctx.lineTo(x,H) }
    for(let y=0;y<H;y+=step){ ctx.moveTo(0,y); ctx.lineTo(W,y) }
    ctx.stroke(); ctx.restore();
  }
  if ($particlesToggle.checked){
    for(const p of stateParticles){
      if (state.parallax){ p.x += (mouse.x - p.x) * 0.0003; p.y += (mouse.y - p.y) * 0.0003; }
      p.x += p.vx; p.y += p.vy;
      if (p.x<-50||p.x>W+50||p.y<-50||p.y>H+50){ const np=makeParticle(); Object.assign(p,np) }
      const grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      const glow = +getComputedStyle(document.documentElement).getPropertyValue('--glow') || .85;
      grd.addColorStop(0, `hsla(${p.hue} 100% 65% / ${0.35*glow})`);
      grd.addColorStop(1, 'hsla(0 0% 0% / 0)');
      ctx.globalCompositeOperation='lighter'; ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}
draw();

function toggleParticles(){ const on = $particlesToggle.checked = !$particlesToggle.checked; toast(`Particles: ${on?'On':'Off'}`) }
document.getElementById('particlesToggle').addEventListener('change', ()=> toast(`Particles: ${$particlesToggle.checked?'On':'Off'}`));

/* Menu search */
document.getElementById('menuSearch').addEventListener('input', e=>{
  const q=e.target.value.toLowerCase().trim();
  $menu.querySelectorAll('.group ul > li').forEach(li=>{
    if (li.classList.contains('has-sub') || li.classList.contains('has-toggle')) return;
    li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* Magnetic tilt for tiles */
document.querySelectorAll('.tile').forEach(tile=>{
  tile.addEventListener('pointermove', e=>{
    const r=tile.getBoundingClientRect(); const x=e.clientX-(r.left+r.width/2); const y=e.clientY-(r.top+r.height/2);
    tile.style.transform = `translateZ(0) perspective(800px) rotateY(${x*0.02}deg) rotateX(${-y*0.02}deg)`;
  });
  tile.addEventListener('pointerleave', ()=> tile.style.transform='');
});

initTheme();
