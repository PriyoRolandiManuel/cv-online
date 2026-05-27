/* =============================================
   BOOT SEQUENCE
   ============================================= */
const bootLines=[
  'PRIYO_OS v2.5.1 [Sistem Informasi Build]',
  'Loading kernel modules... OK',
  'Mounting multimedia.sys... OK',
  'Initializing portfolio.exe...',
  'Loading skills database... OK',
  'Connecting to GKJW.broadcast... OK',
  'Loading project assets... OK',
  'Checking animation engines... OK',
  'Initializing interactive elements... OK',
  'Boot sequence complete. Welcome.'
];
const bootLog=document.getElementById('boot-log');
const bootBar=document.getElementById('boot-bar');
let bl=0;
function nextLine(){
  if(bl>=bootLines.length){endBoot();return;}
  const s=document.createElement('span');
  s.textContent='> '+bootLines[bl];
  s.style.animationDelay=bl*.08+'s';
  bootLog.appendChild(s);
  bootBar.style.width=((bl+1)/bootLines.length*100)+'%';
  bl++;
  setTimeout(nextLine,bl===bootLines.length?600:200);
}
function endBoot(){
  setTimeout(()=>document.getElementById('boot').classList.add('out'),500);
}
setTimeout(nextLine,400);
document.getElementById('boot-skip').addEventListener('click',()=>document.getElementById('boot').classList.add('out'));

/* =============================================
   THEME
   ============================================= */
const html=document.documentElement;
const saved=localStorage.getItem('prm-th')||'dark';
html.setAttribute('data-theme',saved);
setThIcon(saved);
document.getElementById('theme-btn').addEventListener('click',()=>{
  const n=html.getAttribute('data-theme')==='dark'?'light':'dark';
  // Dim overlay — aktif di kedua arah pergantian theme
  const dimEl=document.createElement('div');
  dimEl.style.cssText='position:fixed;inset:0;z-index:99995;pointer-events:none;background:#000;opacity:0;transition:opacity .25s ease';
  document.body.appendChild(dimEl);
  requestAnimationFrame(()=>{
    dimEl.style.opacity='0.55';
    setTimeout(()=>{
      html.setAttribute('data-theme',n);
      localStorage.setItem('prm-th',n);
      setThIcon(n);
      dimEl.style.opacity='0';
      setTimeout(()=>dimEl.remove(),300);
    },250);
  });
});
function setThIcon(t){document.getElementById('th-icon').className=t==='dark'?'fa-solid fa-sun':'fa-solid fa-moon'}

/* =============================================
   CURSOR + TRAIL
   ============================================= */
const cd=document.getElementById('cur-dot');
const cr=document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cd.style.left=mx+'px';cd.style.top=my+'px'});
(function raf(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;cr.style.left=rx+'px';cr.style.top=ry+'px';requestAnimationFrame(raf)})();
document.querySelectorAll('a,button,.pcard,.skill-card,.ach-card,.clink,.soc-btn,.tl-tab').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('c-hover'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('c-hover'));
});

/* CURSOR TRAIL */
const trailCanvas=document.getElementById('cur-trail-canvas');
const tctx=trailCanvas.getContext('2d');
function resizeTrailCanvas(){
  const dpr=window.devicePixelRatio||1;
  trailCanvas.width=window.innerWidth*dpr;
  trailCanvas.height=window.innerHeight*dpr;
  trailCanvas.style.width=window.innerWidth+'px';
  trailCanvas.style.height=window.innerHeight+'px';
  tctx.scale(dpr,dpr);
}
resizeTrailCanvas();
window.addEventListener('resize',resizeTrailCanvas);
const trailPoints=[];
document.addEventListener('mousemove',e=>trailPoints.push({x:e.clientX,y:e.clientY,life:1}));
(function trailLoop(){
  tctx.clearRect(0,0,trailCanvas.width,trailCanvas.height);
  for(let i=trailPoints.length-1;i>=0;i--){
    const p=trailPoints[i];
    p.life-=0.04;
    if(p.life<=0){trailPoints.splice(i,1);continue;}
    tctx.beginPath();tctx.arc(p.x,p.y,3*p.life,0,Math.PI*2);
    tctx.fillStyle=`rgba(0,245,160,${p.life*0.35})`;tctx.fill();
  }
  requestAnimationFrame(trailLoop);
})();

/* =============================================
   STARFIELD CANVAS
   ============================================= */
(function(){
  const sc=document.getElementById('star-canvas');
  const sctx=sc.getContext('2d');
  let stars=[];
  let starOpacity=1;
  let starCurrentOpacity=1;

  function resizeStar(){
    const dpr=window.devicePixelRatio||1;
    sc.width=window.innerWidth*dpr;
    sc.height=window.innerHeight*dpr;
    sc.style.width=window.innerWidth+'px';
    sc.style.height=window.innerHeight+'px';
    sctx.scale(dpr,dpr);
  }
  resizeStar();
  window.addEventListener('resize',()=>{resizeStar();initStars();});

  function initStars(){
    stars=[];
    const w=window.innerWidth,h=window.innerHeight;
    const n=Math.min(160,Math.floor(w*h/8000));
    for(let i=0;i<n;i++) stars.push({
      x:Math.random()*w,
      y:Math.random()*h,
      r:Math.random()*1.2+0.2,
      twinkle:Math.random()*Math.PI*2,
      speed:Math.random()*0.02+0.005,
    });
  }
  initStars();

  function drawStars(){
    const w=window.innerWidth,h=window.innerHeight;
    sctx.clearRect(0,0,w,h);
    if(starCurrentOpacity<=0.01){requestAnimationFrame(drawStars);return;}
    const isDark=document.documentElement.getAttribute('data-theme')!=='light';
    stars.forEach(s=>{
      s.twinkle+=s.speed;
      const alpha=(0.35+0.45*Math.abs(Math.sin(s.twinkle)))*starCurrentOpacity;
      sctx.beginPath();
      sctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      sctx.fillStyle=isDark?`rgba(255,255,255,${alpha})`:`rgba(107,47,255,${alpha*0.6})`;
      sctx.fill();
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  // Smooth fade in/out
  (function fadeLoop(){
    const diff=starOpacity-starCurrentOpacity;
    starCurrentOpacity+=diff*0.06;
    sc.style.opacity='1'; // canvas always present, alpha handled in draw
    requestAnimationFrame(fadeLoop);
  })();

  // Watch scroll: hide stars only when #about is visible
  const aboutEl=document.getElementById('about');
  function checkStarVisibility(){
    if(!aboutEl)return;
    const r=aboutEl.getBoundingClientRect();
    const vh=window.innerHeight;
    // #about dianggap "aktif" jika lebih dari 40% tingginya masuk viewport
    const visible=r.top<vh*0.6&&r.bottom>vh*0.4;
    starOpacity=visible?0:1;
  }
  window.addEventListener('scroll',checkStarVisibility,{passive:true});
  checkStarVisibility();
})();

/* =============================================
   PARTICLE FIELD (FX CANVAS)
   ============================================= */
const fc=document.getElementById('fx-canvas');
const fctx=fc.getContext('2d');
function resizeFxCanvas(){
  const dpr=window.devicePixelRatio||1;
  fc.width=window.innerWidth*dpr;
  fc.height=window.innerHeight*dpr;
  fc.style.width=window.innerWidth+'px';
  fc.style.height=window.innerHeight+'px';
  fctx.scale(dpr,dpr);
}
resizeFxCanvas();
window.addEventListener('resize',()=>{resizeFxCanvas();initParticles()});
let particles=[];
const PARTICLE_COLORS = [
  [107, 47, 255],  // ungu vivid (light mode primary)
  [0,  196, 122],  // hijau vibrant (light mode secondary)
  [107, 47, 255],  // ungu (weight lebih banyak)
  [107, 47, 255],
  [0,  245, 160],  // neon green (dark mode)
];
function initParticles(){
  particles=[];
  const w=window.innerWidth,h=window.innerHeight;
  const n=Math.min(60,Math.floor(w/18));
  for(let i=0;i<n;i++) particles.push({
    x:Math.random()*w,y:Math.random()*h,
    vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
    r:Math.random()*1.5+.5,
    opacity:Math.random()*.55+.18,
    color:PARTICLE_COLORS[Math.floor(Math.random()*PARTICLE_COLORS.length)]
  });
}
initParticles();
function drawParticles(){
  const w=window.innerWidth,h=window.innerHeight;
  fctx.clearRect(0,0,w,h);
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=w;if(p.x>w)p.x=0;
    if(p.y<0)p.y=h;if(p.y>h)p.y=0;
    const [r,g,b]=p.color;
    fctx.beginPath();fctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    fctx.fillStyle=`rgba(${r},${g},${b},${p.opacity})`;fctx.fill();
  });
  // draw connections
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){
        fctx.beginPath();
        fctx.moveTo(particles[i].x,particles[i].y);
        fctx.lineTo(particles[j].x,particles[j].y);
        fctx.strokeStyle=`rgba(0,245,160,${(1-dist/120)*.07})`;
        fctx.lineWidth=.5;fctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* =============================================
   HEADER SCROLL
   ============================================= */
const hdr=document.getElementById('hdr');
const prog=document.getElementById('progress');
const nimBadge=document.querySelector('.nim-badge');
window.addEventListener('scroll',()=>{
  hdr.classList.toggle('scrolled',scrollY>30);
  const pct=(scrollY/(document.body.scrollHeight-window.innerHeight))*100;
  prog.style.width=pct+'%';
  /* NIM badge: fade out ketika mulai scroll melewati hero */
  if(nimBadge){
    const heroEl=document.getElementById('hero');
    const heroBottom=heroEl?heroEl.offsetTop+heroEl.offsetHeight:window.innerHeight;
    const fadeStart=heroBottom*0.55;
    const fadeEnd=heroBottom*0.85;
    if(scrollY<=fadeStart){
      nimBadge.classList.remove('hidden');
    } else if(scrollY>=fadeEnd){
      nimBadge.classList.add('hidden');
    } else {
      /* zona transisi — fade smooth */
      const ratio=(scrollY-fadeStart)/(fadeEnd-fadeStart);
      nimBadge.style.opacity=1-ratio;
      nimBadge.classList.remove('hidden');
    }
  }
},{passive:true});

/* =============================================
   HAMBURGER
   ============================================= */
const ham=document.getElementById('ham');
const mobNav=document.getElementById('mob-nav');
ham.addEventListener('click',()=>{
  ham.classList.toggle('open');
  mobNav.classList.toggle('open');
  document.body.style.overflow=mobNav.classList.contains('open')?'hidden':'';
});
document.querySelectorAll('.mnl').forEach(a=>a.addEventListener('click',()=>{
  ham.classList.remove('open');mobNav.classList.remove('open');document.body.style.overflow='';
}));

/* =============================================
   SCROLL REVEAL
   ============================================= */
const rvObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rvObs.unobserve(e.target)}});
},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>rvObs.observe(el));

/* =============================================
   SKILL BARS
   ============================================= */
const barObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.bar-fill').forEach(b=>b.style.width=b.dataset.w+'%');
      barObs.unobserve(e.target);
    }
  });
},{threshold:.2});
document.querySelectorAll('.skill-card').forEach(c=>barObs.observe(c));

/* =============================================
   COUNTER
   ============================================= */
const ctrObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target,target=+el.dataset.t;
    let cur=0;const step=target/50;
    const t=setInterval(()=>{cur+=step;if(cur>=target){el.textContent=target+'+';clearInterval(t);}else el.textContent=Math.floor(cur);},30);
    ctrObs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(el=>ctrObs.observe(el));

/* =============================================
   TERMINAL ANIMATION
   ============================================= */
const termLines=[
  {cmd:'whoami',out:['priyo_rolandi_manuel'],type:'green'},
  {cmd:'cat about.txt',out:['Mahasiswa S1 Sistem Informasi, UISI','Multimedia Producer | Event Coordinator','Looking for: IT Internship Opportunities'],type:''},
  {cmd:'ls skills/',out:['OBS.exe  VMix.app  PowerBI.db','AutoCAD.dwg  SketchUp.skp  Canva.cloud','VSCode.app  CapCut.mp4  EasyWorship.exe'],type:'purple'},
  {cmd:'cat achievements.log',out:['[MEDAL] Silver - FESPA UBAYA 2024','[MEDAL] Silver - UINSA SCF 2025','[ROLE] Koordinator Multimedia (x2 orgs)'],type:'red'},
  {cmd:'./contact.sh',out:['Email: prolandi77m@gmail.com','Phone: +62 813-5778-7047','GitHub: PriyoRolandiManuel'],type:'green'},
];
const termBody=document.getElementById('term-body');
const termCmd=document.getElementById('term-cmd');
const termCur=document.getElementById('term-cur');
let tIdx=0,typing=false;
function termType(cmd,cb){
  let i=0;termCmd.textContent='';termCur.style.display='inline-block';
  function t(){if(i<cmd.length){termCmd.textContent+=cmd[i++];setTimeout(t,55);}else{termCur.style.display='none';setTimeout(cb,300);}}
  t();
}
function appendOut(lines,type){
  lines.forEach(l=>{
    const s=document.createElement('div');
    s.style.cssText='opacity:0;transition:opacity .3s;margin:.2em 0';
    s.innerHTML=`<span class="t-out ${type}">${l}</span>`;
    termBody.appendChild(s);
    setTimeout(()=>s.style.opacity='1',50);
  });
}
function runTerminal(){
  if(tIdx>=termLines.length){
    // Satu siklus selesai — clear terminal lalu mulai ulang
    tIdx=0;
    setTimeout(()=>{
      termBody.style.opacity='0';
      setTimeout(()=>{
        termBody.innerHTML='';
        termBody.style.opacity='1';
        runTerminal();
      },400);
    },1200);
    return;
  }
  const line=termLines[tIdx++];
  const promptRow=document.createElement('div');
  promptRow.style.marginTop='.8em';
  // Gunakan id unik agar tidak duplikat
  const uid=Date.now()+Math.random().toString(36).slice(2);
  promptRow.innerHTML=`<span class="t-prompt">priyo@portfolio<span style="color:#fff">:</span>~<span style="color:#fff">$</span> </span><span class="t-cmd" id="tc-${uid}"></span><span class="t-cursor" style="display:none" id="tu-${uid}"></span>`;
  termBody.appendChild(promptRow);
  const ncmd=document.getElementById('tc-'+uid);
  const ncur=document.getElementById('tu-'+uid);
  ncur.style.display='inline-block';
  let i=0;
  function t(){if(i<line.cmd.length){ncmd.textContent+=line.cmd[i++];setTimeout(t,60);}else{ncur.style.display='none';appendOut(line.out,line.type);termBody.scrollTop=termBody.scrollHeight;setTimeout(runTerminal,2400);}}
  t();
}
setTimeout(()=>{
  termBody.innerHTML='';
  termBody.style.transition='opacity .4s';
  runTerminal();
},2000);

/* =============================================
   TIMELINE TABS
   ============================================= */
document.querySelectorAll('.tl-tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tl-tab').forEach(b=>b.classList.remove('on'));
    document.querySelectorAll('.tl-panel').forEach(p=>p.classList.remove('on'));
    btn.classList.add('on');
    const panel=document.getElementById('tp-'+btn.dataset.tab);
    panel.classList.add('on');
    panel.querySelectorAll('.tl-item').forEach((el,i)=>{
      el.classList.remove('in');
      setTimeout(()=>{el.classList.add('in')},i*80);
    });
  });
});

/* =============================================
   3D TILT on PORTFOLIO CARDS — desktop only
   ============================================= */
const isTouchDevice = window.matchMedia('(hover:none),(pointer:coarse)').matches;
if(!isTouchDevice){
  document.querySelectorAll('.pcard.tilt').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(800px) rotateY(${x*12}deg) rotateX(${-y*8}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave',()=>{card.style.transform='perspective(800px) rotateY(0) rotateX(0) translateZ(0)'});
  });
}
document.querySelectorAll('.pcard.tilt').forEach(card=>{
  card.addEventListener('click',()=>{
    const href=card.dataset.href;
    if(href&&href!=='#')window.open(href,'_blank','noopener,noreferrer');
    const r=document.createElement('div');
    r.className='ripple-fx';
    r.style.cssText=`width:200px;height:200px;left:calc(50% - 100px);top:calc(50% - 100px)`;
    card.appendChild(r);r.addEventListener('animationend',()=>r.remove());
  });
});

/* =============================================
   SKILL CARD GLOW FOLLOW — desktop only
   ============================================= */
if(!isTouchDevice){
  document.querySelectorAll('.skill-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
  });
}

/* =============================================
   RIPPLE on BUTTONS — mouse + touch
   ============================================= */
document.querySelectorAll('.btn-neon,.btn-solid').forEach(btn=>{
  function doRipple(clientX,clientY){
    const r=document.createElement('div');
    r.className='ripple-fx';
    const rect=btn.getBoundingClientRect();
    const size=Math.max(rect.width,rect.height);
    r.style.cssText=`width:${size}px;height:${size}px;left:${clientX-rect.left-size/2}px;top:${clientY-rect.top-size/2}px`;
    btn.appendChild(r);r.addEventListener('animationend',()=>r.remove());
  }
  btn.addEventListener('click',e=>doRipple(e.clientX,e.clientY));
  btn.addEventListener('touchend',e=>{
    if(e.changedTouches&&e.changedTouches[0]){
      const t=e.changedTouches[0];
      doRipple(t.clientX,t.clientY);
    }
  },{passive:true});
});

/* =============================================
   CONTACT FORM VALIDATION
   ============================================= */
document.getElementById('cf').addEventListener('submit',e=>{
  e.preventDefault();
  let ok=true;
  const fn=document.getElementById('fn'),fe=document.getElementById('fe'),fm=document.getElementById('fm');
  [fn,fe,fm].forEach(f=>{f.classList.remove('err');});
  ['en','ee','em'].forEach(id=>{document.getElementById(id).textContent=''});
  if(!fn.value.trim()){fn.classList.add('err');document.getElementById('en').textContent='Nama wajib diisi.';ok=false;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fe.value.trim())){fe.classList.add('err');document.getElementById('ee').textContent='Email tidak valid.';ok=false;}
  if(fm.value.trim().length<10){fm.classList.add('err');document.getElementById('em').textContent='Pesan terlalu pendek.';ok=false;}
  if(ok){
    document.getElementById('fs').style.display='block';
    e.target.reset();
    setTimeout(()=>document.getElementById('fs').style.display='none',4000);
  }
});

/* =============================================
   PAGE TRANSITIONS
   ============================================= */
const ptOverlay = document.getElementById('page-transition');
const ptLabel   = document.getElementById('pt-label');
const navLabels = {
  '#about':    'About()',
  '#skills':   'Skills()',
  '#timeline': 'Experience()',
  '#portfolio':'Portfolio()',
  '#contact':  'Contact()',
  '#hero':     'Home()'
};

function runPageTransition(targetEl, label) {
  // Enter
  ptLabel.textContent = label || 'Loading...';
  ptOverlay.className = 'enter';
  ptOverlay.style.pointerEvents = 'all';

  setTimeout(() => {
    // Scroll to target while panels cover screen
    targetEl.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, 350);

  setTimeout(() => {
    // Exit
    ptOverlay.className = 'exit';
    setTimeout(() => {
      ptOverlay.className = '';
      ptOverlay.style.pointerEvents = 'none';
    }, 600);
  }, 700);
}

/* =============================================
   SMOOTH SCROLL — with transition
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      const label = navLabels[href] || href.replace('#','') + '()';
      runPageTransition(t, label);
    }
  });
});

/* =============================================
   AUDIO CONTROL WIDGET
   ============================================= */
(function(){
  const audio    = document.getElementById('bg-music');
  const acPlay   = document.getElementById('ac-play');
  const acIcon   = document.getElementById('ac-play-icon');
  const acBars   = document.getElementById('ac-bars');
  const volTrack = document.getElementById('ac-vol-track');
  const volFill  = document.getElementById('ac-vol-fill');
  const volThumb = document.getElementById('ac-vol-thumb');
  if(!audio) return;

  let vol = 0.35;
  let playing = false;
  let dragging = false;

  audio.volume = vol;

  function setVolumeUI(v){
    const pct = Math.round(v * 100);
    volFill.style.height  = pct + '%';
    volThumb.style.bottom = 'calc(' + pct + '% - 6px)';
  }

  function setPlaying(state){
    playing = state;
    if(state){
      acIcon.className = 'fa-solid fa-pause';
      acPlay.classList.remove('muted');
      acBars.classList.remove('paused');
      audio.play().catch(()=>{});
    } else {
      acIcon.className = 'fa-solid fa-play';
      acPlay.classList.add('muted');
      acBars.classList.add('paused');
      audio.pause();
    }
  }

  acPlay.addEventListener('click', () => setPlaying(!playing));

  // Start after first interaction (browser autoplay policy - all platforms)
  let started = false;
  function startMusic(){
    if(started) return;
    started = true;
    // iOS Safari requires the audio context to be resumed after user gesture
    if(audio.readyState === 0){
      audio.load();
    }
    setPlaying(true);
    document.removeEventListener('click', startMusic);
    document.removeEventListener('keydown', startMusic);
    document.removeEventListener('scroll', startMusic);
    document.removeEventListener('touchstart', startMusic);
    document.removeEventListener('touchend', startMusic);
    document.removeEventListener('pointerup', startMusic);
  }
  document.addEventListener('click', startMusic);
  document.addEventListener('keydown', startMusic);
  document.addEventListener('scroll', startMusic, {passive:true});
  document.addEventListener('touchstart', startMusic, {passive:true});
  document.addEventListener('touchend', startMusic, {passive:true});
  document.addEventListener('pointerup', startMusic, {passive:true});

  // Volume drag
  function updateVolFromEvent(e){
    const rect = volTrack.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rel = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    vol = rel;
    audio.volume = vol;
    setVolumeUI(vol);
  }
  volTrack.addEventListener('mousedown', e => { dragging = true; updateVolFromEvent(e); });
  volThumb.addEventListener('mousedown', e => { dragging = true; e.stopPropagation(); });
  window.addEventListener('mousemove', e => { if(dragging) updateVolFromEvent(e); });
  window.addEventListener('mouseup', () => { dragging = false; });
  volTrack.addEventListener('touchstart', e => { dragging = true; updateVolFromEvent(e); }, {passive:true});
  window.addEventListener('touchmove', e => { if(dragging) updateVolFromEvent(e); }, {passive:true});
  window.addEventListener('touchend', () => { dragging = false; });

  setVolumeUI(vol);
  // init bars as paused
  acBars.classList.add('paused');
})();

/* =============================================
   SECTION MERGE TRANSITIONS (SCROLL)
   ============================================= */
(function(){
  // Sections that get merge transitions (in document order)
  const mergeSections = [
    document.querySelector('.ticker'),
    document.getElementById('about'),
    document.getElementById('skills'),
    document.getElementById('timeline'),
    document.getElementById('portfolio'),
    document.getElementById('achievements'),
    document.getElementById('contact'),
  ].filter(Boolean);

  // Only apply hidden state to sections that start below the viewport
  mergeSections.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) {
      el.classList.add('sec-merge-hidden');
    }
  });

  const mergeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.classList.contains('sec-merge-hidden')) {
        // Small stagger so the clip transition feels intentional
        requestAnimationFrame(() => {
          e.target.classList.remove('sec-merge-hidden');
          e.target.classList.add('sec-merge-in');
        });
        mergeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });

  mergeSections.forEach(el => {
    if (el.classList.contains('sec-merge-hidden')) mergeObs.observe(el);
  });
})();

/* =============================================
   PARALLAX — cursor moves particles, hero glitch
   ============================================= */
if(!isTouchDevice){
  document.addEventListener('mousemove',e=>{
    const hexGrid=document.querySelector('.hex-grid');
    if(!hexGrid)return;
    const cx=(e.clientX/window.innerWidth-.5)*20;
    const cy=(e.clientY/window.innerHeight-.5)*20;
    hexGrid.style.transform=`translate(${cx*.3}px,${cy*.3}px)`;
  });
}

/* =============================================
   KONAMI CODE EASTER EGG
   ============================================= */
const konami=[38,38,40,40,37,39,37,39,66,65];
let ki=0;
document.addEventListener('keydown',e=>{
  if(e.keyCode===konami[ki]){ki++;if(ki===konami.length){ki=0;triggerKonami();}}
  else ki=e.keyCode===konami[0]?1:0;
});
function triggerKonami(){
  const ov=document.getElementById('konami-overlay');
  const rain=document.getElementById('konami-rain');
  ov.classList.add('show');
  // Matrix rain effect
  rain.innerHTML='';
  for(let i=0;i<20;i++){
    const col=document.createElement('div');
    col.style.cssText=`position:absolute;left:${i*5}%;top:0;color:var(--c1);font-family:var(--mono);font-size:.7rem;animation:bootLine ${Math.random()*3+2}s ${Math.random()*2}s infinite;opacity:.3`;
    let txt='';
    for(let j=0;j<40;j++)txt+=Math.random()<.5?'1':'0';
    col.textContent=txt;
    rain.appendChild(col);
  }
}
document.getElementById('konami-close').addEventListener('click',()=>document.getElementById('konami-overlay').classList.remove('show'));



/* =============================================
   CARD IMAGES LAZY FADE
   ============================================= */

const imgObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';imgObs.unobserve(e.target);}});
});
document.querySelectorAll('.pcard-visual').forEach(el=>{
  el.style.opacity='0';el.style.transition='opacity .8s ease';
  imgObs.observe(el);
});

/* =============================================
   LIGHT MODE: FORCE DARK THUMBNAIL BACKGROUNDS
   Karena inline style di HTML override CSS,
   kita override via JS saat theme berubah
   ============================================= */
const DARK_THUMBS = [
  'linear-gradient(135deg,#0a0a20,#12002e)',  /* card 1 — deep violet */
  'linear-gradient(135deg,#0d1117,#21262d)',  /* card 2 — dark slate */
  'linear-gradient(135deg,#12002e,#2a0060)',  /* card 3 — deep purple */
  'linear-gradient(135deg,#001a10,#003320)',  /* card 4 — deep green */
  'linear-gradient(135deg,#2a1000,#4a2000)',  /* card 5 — deep amber */
  'linear-gradient(135deg,#00102a,#00204a)',  /* card 6 — deep navy */
];

function applyThumbTheme(){
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.querySelectorAll('.pcard-visual').forEach((el, i) => {
    if(isLight){
      // Di light mode: pakai background gelap dramatis agar sama dengan dark mode
      el.style.background = DARK_THUMBS[i] || DARK_THUMBS[0];
    } else {
      // Di dark mode: kembalikan ke inline style asli dari HTML
      el.style.background = DARK_THUMBS[i] || '';
    }
  });
}

// Jalankan saat load
applyThumbTheme();

// Jalankan tiap kali theme berubah (pantau attribute)
const themeObserver = new MutationObserver(() => applyThumbTheme());
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* =============================================
   YT-STRIP — RED OUTLINE ON CLICK (BOTH THEMES)
   ============================================= */
document.querySelectorAll('.yt-strip').forEach(strip => {
  function triggerFlash(){
    strip.classList.remove('clicked');
    void strip.offsetWidth; // force reflow agar animasi restart
    strip.classList.add('clicked');
    setTimeout(() => strip.classList.remove('clicked'), 600);
  }
  strip.addEventListener('click', triggerFlash);
  strip.addEventListener('touchstart', triggerFlash, { passive: true });
});
