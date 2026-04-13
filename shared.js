// PawSafe shared: dark mode + badge tracking + notifications
(function(){
  // DARK MODE
  const saved = localStorage.getItem('pawsafe-theme');
  if(saved==='dark') document.documentElement.classList.add('dark');
  window.toggleTheme = function(){
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('pawsafe-theme', document.documentElement.classList.contains('dark')?'dark':'light');
  };

  // BADGE METADATA
  const BADGE_INFO = {
    quiz:       {title:'Q&A Scholar',       icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'},
    prevention: {title:'Prevention Pro',    icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>'},
    sort:       {title:'Habit Sorter',      icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M6 12h12"/><path d="M9 18h6"/></svg>'},
    myth:       {title:'Myth Buster',       icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>'},
    hazard:     {title:'Hazard Hunter',     icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'},
    flash:      {title:'Flashcard Student', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'}
  };

  // Inject notification CSS only (page animations are now in each HTML file)
  const style = document.createElement('style');
  style.textContent = `
    /* === BADGE TOAST === */
    #paw-toast-wrap{position:fixed;top:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.8rem;pointer-events:none}
    .paw-toast{background:#2a3025;color:#f1e9da;padding:1rem 1.3rem;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;align-items:center;gap:.9rem;min-width:280px;max-width:340px;border-left:4px solid #63a46c;transform:translateX(400px);opacity:0;transition:all .5s cubic-bezier(.2,.9,.3,1.3);pointer-events:auto;font-family:'Inter',sans-serif}
    .paw-toast.show{transform:translateX(0);opacity:1}
    .paw-toast.hide{transform:translateX(400px);opacity:0}
    .paw-toast-icon{flex-shrink:0;width:44px;height:44px;background:#63a46c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#f1e9da;animation:paw-pulse 1.5s ease-out}
    .paw-toast-text{flex:1;line-height:1.3}
    .paw-toast-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.15em;color:#8bb088;margin-bottom:.15rem;font-weight:600}
    .paw-toast-title{font-family:'Fraunces',serif;font-size:1.05rem;font-weight:600}
    @media(max-width:600px){#paw-toast-wrap{top:.8rem;right:.8rem;left:.8rem}.paw-toast{min-width:0;max-width:none}}
  `;
  document.head.appendChild(style);

  // Scroll-reveal observer
  document.addEventListener('DOMContentLoaded', function(){
    // Auto-tag common content blocks for reveal
    const selectors = '.features .card, .feature-grid > *, .stats > .stat, .cards > .rcard, .audience > .aud, .badges > .badge, .questions, .case, .hotline, .toc, .article, .section, .bins, .qcard, .board';
    document.querySelectorAll(selectors).forEach(function(el){
      // Skip elements inside the hero which already animate via CSS
      if(el.closest('.hero')) return;
      el.classList.add('paw-reveal');
    });
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },{threshold:.12, rootMargin:'0px 0px -40px 0px'});
      document.querySelectorAll('.paw-reveal').forEach(function(el){ io.observe(el); });
    } else {
      // Fallback: just show everything
      document.querySelectorAll('.paw-reveal').forEach(function(el){ el.classList.add('in'); });
    }
  });

  function ensureWrap(){
    let w = document.getElementById('paw-toast-wrap');
    if(!w){
      w = document.createElement('div');
      w.id = 'paw-toast-wrap';
      document.body.appendChild(w);
    }
    return w;
  }

  // SOUND: synthesize a two-note chime using Web Audio (no file needed)
  function playBadgeSound(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ctx = new AC();
      const now = ctx.currentTime;
      [{f:659.25,t:0},{f:987.77,t:.12}].forEach(n=>{
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = n.f;
        gain.gain.setValueAtTime(0, now+n.t);
        gain.gain.linearRampToValueAtTime(.18, now+n.t+.02);
        gain.gain.exponentialRampToValueAtTime(.001, now+n.t+.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now+n.t);
        osc.stop(now+n.t+.5);
      });
      setTimeout(()=>ctx.close(), 1000);
    }catch(e){}
  }

  function showBadgeToast(id){
    const info = BADGE_INFO[id] || {title:id, icon:''};
    const wrap = ensureWrap();
    const toast = document.createElement('div');
    toast.className = 'paw-toast';
    toast.innerHTML = '<div class="paw-toast-icon">'+info.icon+'</div><div class="paw-toast-text"><div class="paw-toast-label">Badge Earned</div><div class="paw-toast-title">'+info.title+'</div></div>';
    wrap.appendChild(toast);
    requestAnimationFrame(()=>{ requestAnimationFrame(()=>toast.classList.add('show')); });
    playBadgeSound();
    setTimeout(()=>{
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(()=>toast.remove(), 600);
    }, 4000);
  }

  // BADGES
  window.PawBadges = {
    earn: function(id){
      const b = JSON.parse(localStorage.getItem('pawsafe-badges')||'[]');
      if(!b.includes(id)){
        b.push(id);
        localStorage.setItem('pawsafe-badges', JSON.stringify(b));
        if(document.body) showBadgeToast(id);
        else document.addEventListener('DOMContentLoaded',()=>showBadgeToast(id));
      }
    },
    has: function(id){
      const b = JSON.parse(localStorage.getItem('pawsafe-badges')||'[]');
      return b.includes(id);
    },
    all: function(){ return JSON.parse(localStorage.getItem('pawsafe-badges')||'[]'); },
    reset: function(){ localStorage.removeItem('pawsafe-badges'); }
  };

  // Theme button is now placed directly in each page's HTML to avoid layout shift

  // PAGE TRANSITIONS: slide content out/in while nav stays fixed
  const pageStyle = document.createElement('style');
  pageStyle.textContent = `
    html{overflow-y:scroll;scrollbar-gutter:stable}
    html,body{overflow-x:hidden}
    nav{transform:none !important;animation:none !important;transition:none !important;will-change:auto !important}
    nav *{animation:none !important}
    .paw-page-content{
      animation: paw-slide-in .5s cubic-bezier(.2,.8,.3,1) both;
      will-change:transform,opacity
    }
    body.paw-leaving .paw-page-content{
      animation: paw-slide-out .35s cubic-bezier(.5,0,.75,0) both
    }
    @keyframes paw-slide-in{
      from{opacity:0;transform:translate3d(40px,0,0)}
      to{opacity:1;transform:translate3d(0,0,0)}
    }
    @keyframes paw-slide-out{
      from{opacity:1;transform:translate3d(0,0,0)}
      to{opacity:0;transform:translate3d(-40px,0,0)}
    }
    @media(prefers-reduced-motion:reduce){
      .paw-page-content,body.paw-leaving .paw-page-content{animation:none}
    }
  `;
  document.head.appendChild(pageStyle);

  // Wrap everything below nav in a transition container (once, on load)
  document.addEventListener('DOMContentLoaded',function(){
    const nav = document.querySelector('nav');
    if(!nav || document.querySelector('.paw-page-content')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'paw-page-content';
    // Move all siblings after nav into the wrapper (skip scripts and toast wrap)
    let node = nav.nextSibling;
    const toMove = [];
    while(node){
      if(node.nodeType===1 && node.tagName!=='SCRIPT' && node.id!=='paw-toast-wrap'){
        toMove.push(node);
      }
      node = node.nextSibling;
    }
    toMove.forEach(n=>wrapper.appendChild(n));
    nav.parentNode.insertBefore(wrapper, nav.nextSibling);
  });

  // Intercept nav clicks for smooth transitions
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('nav a[href]').forEach(link=>{
      link.addEventListener('click',function(e){
        const href = link.getAttribute('href');
        if(!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target==='_blank') return;
        if(!href.endsWith('.html')) return;
        const current = location.pathname.split('/').pop() || 'index.html';
        if(href === current) { e.preventDefault(); return; }
        e.preventDefault();
        document.body.classList.add('paw-leaving');
        setTimeout(()=>{ window.location.href = href; }, 340);
      });
    });
  });
})();
