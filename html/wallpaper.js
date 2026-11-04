/* MZ Framework — procedural wallpaper, offline / FiveM CEF compatible. */
(() => {
 'use strict';
 const cfg = (window.MZ_LOADING_CONFIG || {}).visuals || {};
 if(cfg.wallpaper === false) return;
 const canvas = document.getElementById('mz-live-wallpaper');
 if (!canvas) return;
 const ctx = canvas.getContext('2d', { alpha:false });
 if(!ctx) return;
 const reduce = cfg.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
 const quality = Math.max(.4, Math.min(1.5, Number(cfg.wallpaperQuality)||1));
 let W=0,H=0,dpr=1,particles=[],t=0,last=0,frame=0;
 const pointer={x:-9999,y:-9999,targetX:-9999,targetY:-9999,active:false,pulse:0};
 const rand=(a,b)=>a+Math.random()*(b-a);
 function resize(){
   W=window.innerWidth;H=window.innerHeight;
   dpr=Math.min(window.devicePixelRatio||1,1.5);
   canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const count=Math.min(115,Math.max(32,Math.floor(W*H/13000*quality)));
   particles=Array.from({length:count},()=>({x:rand(0,W),y:rand(0,H),vx:rand(-.18,.18),vy:rand(-.14,.14),r:rand(.7,2),phase:rand(0,6.28)}));
 }
 function glow(x,y,r,color){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 function draw(now){
   const dt=Math.min(2,(now-(last||now))/16.67);last=now;
   t+=dt*.012;
   pointer.x+=(pointer.targetX-pointer.x)*.075;
   pointer.y+=(pointer.targetY-pointer.y)*.075;
   ctx.fillStyle='#030b16';ctx.fillRect(0,0,W,H);
   // Moving blue aurora light wells.
   glow(W*(.27+.065*Math.sin(t*.43)),H*(.48+.12*Math.cos(t*.24)),Math.max(W,H)*.61,'rgba(0,100,205,.21)');
   glow(W*(.72+.08*Math.cos(t*.37)),H*(.36+.16*Math.sin(t*.3)),Math.max(W,H)*.45,'rgba(0,180,247,.15)');
   glow(W*(.52+.1*Math.sin(t*.19)),H*.92,Math.max(W,H)*.38,'rgba(15,62,170,.19)');
   // Flowing curved luminous strands: no bitmap/background image.
   const step=9;
   for(let line=0;line<19;line++){
     const baseline=H*(.14+line*.051);
     ctx.beginPath();
     for(let x=-20;x<=W+20;x+=step){
       const nx=x/W;
       const wave=Math.sin(nx*7.3 + t*.66 + line*.27)*19 + Math.sin(nx*15.4-t*.31+line*.37)*9;
       const bend=Math.sin(nx*3.15+t*.3+line*.13)*20;
       let y=baseline+wave+bend;
       if(pointer.active){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy);if(dist<260)y+=Math.sin((260-dist)/260*Math.PI)*(-dy/(dist||1))*65;}
       if(x===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);
     }
     ctx.strokeStyle=`rgba(${line%4===0?'63,207,255':'26,132,232'},${.027+(line%5)*.009})`;
     ctx.lineWidth=line%5===0?1.3:.7;ctx.stroke();
   }
   // Particles in foreground, with proximity link lines and cursor repulsion.
   const maxDist=115;
   for(let i=0;i<particles.length;i++){
     const p=particles[i];
     if(!reduce){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;}
     let x=p.x,y=p.y;
     if(pointer.active){let dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy);if(d<195 && d>0){const push=(1-d/195)**2*47;x+=dx/d*push;y+=dy/d*push;}}
     p.drawX=x;p.drawY=y;
     ctx.fillStyle=`rgba(110,220,255,${.2+.33*(.5+.5*Math.sin(t*2+p.phase))})`;
     ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
     for(let j=Math.max(0,i-11);j<i;j++){
       const q=particles[j],dd=Math.hypot(x-q.drawX,y-q.drawY);
       if(dd<maxDist){ctx.strokeStyle=`rgba(55,157,255,${(1-dd/maxDist)*.12})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(q.drawX,q.drawY);ctx.stroke();}
     }
   }
   // Cursor creates a living halo and expands a soft pulse.
   if(pointer.active){
     glow(pointer.x,pointer.y,230,'rgba(34,188,255,.16)');
     ctx.beginPath();ctx.arc(pointer.x,pointer.y,58+8*Math.sin(t*2),0,Math.PI*2);
     ctx.strokeStyle='rgba(95,215,255,.14)';ctx.lineWidth=.8;ctx.stroke();
     if(pointer.pulse>0){const r=(1-pointer.pulse)*215+18;ctx.beginPath();ctx.arc(pointer.x,pointer.y,r,0,Math.PI*2);ctx.strokeStyle=`rgba(105,222,255,${pointer.pulse*.24})`;ctx.stroke();pointer.pulse=Math.max(0,pointer.pulse-dt*.018);}
   }
   if(!reduce)frame=requestAnimationFrame(draw);
 }
 window.addEventListener('pointermove',e=>{pointer.targetX=e.clientX;pointer.targetY=e.clientY;if(!pointer.active){pointer.x=e.clientX;pointer.y=e.clientY;}pointer.active=true;},{passive:true});
 window.addEventListener('pointerdown',()=>pointer.pulse=1,{passive:true});
 window.addEventListener('blur',()=>pointer.active=false);
 document.addEventListener('mouseleave',()=>pointer.active=false);
 window.addEventListener('resize',resize,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!frame){last=0;frame=requestAnimationFrame(draw);}});
 resize();frame=requestAnimationFrame(draw);
})();
