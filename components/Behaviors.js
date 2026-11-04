'use client';

import { useEffect } from 'react';

/* 全站的行为层：
   1. 首屏标题逐行上滑入场（一次编排好的入场序列）
   2. 滚动揭示
   3. 跟随光标的扫描光晕
   4. 首屏时钟
   5. 均衡器柱子
   6. 作品行的悬浮预览卡
*/
export default function Behaviors() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. 首屏入场 ---------- */
    const lines = document.querySelectorAll('.hero h1 .line > span');
    if (reduce) {
      lines.forEach((l) => { l.style.transform = 'none'; });
    } else {
      requestAnimationFrame(() => {
        lines.forEach((l, i) => {
          l.style.transition = 'transform 900ms cubic-bezier(0.16,1,0.3,1)';
          l.style.transitionDelay = `${120 + i * 110}ms`;
          l.style.transform = 'translateY(0)';
        });
      });
    }

    /* ---------- 2. 滚动揭示 ---------- */
    const targets = document.querySelectorAll(
      '.sec-head, .work-item, .tl-row, .about-grid > *, .bio p, .mail, .post-row'
    );
    targets.forEach((el) => el.classList.add('reveal'));

    let io = null;
    if (reduce) {
      targets.forEach((el) => el.classList.add('in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );
      targets.forEach((el) => io.observe(el));
    }

    /* ---------- 3. 光标光斑 ---------- */
    const glow = document.getElementById('cglow');
    let raf = null;
    function onMove(e) {
      if (!glow || e.pointerType === 'touch') return;
      const x = e.clientX, y = e.clientY;
      glow.style.opacity = '1';
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.setProperty('--mx', `${x}px`);
          glow.style.setProperty('--my', `${y}px`);
          raf = null;
        });
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true });

    /* ---------- 4. 时钟 ---------- */
    const clock = document.getElementById('clock');
    let timer = null;
    if (clock) {
      const tick = () => {
        const d = new Date();
        const p = (n) => String(n).padStart(2, '0');
        clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      };
      tick();
      timer = setInterval(tick, 1000);
    }

    /* ---------- 5. 均衡器 ---------- */
    const bars = document.querySelector('.bars');
    if (bars && !bars.childElementCount) {
      for (let i = 0; i < 22; i++) {
        const b = document.createElement('i');
        b.style.animationDelay = `${i * 0.07}s`;
        b.style.animationDuration = `${(1.2 + Math.random() * 1.4).toFixed(2)}s`;
        b.style.height = `${20 + Math.random() * 60}%`;
        bars.appendChild(b);
      }
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      if (timer) clearInterval(timer);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
